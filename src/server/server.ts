import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../../dist")));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/stats", async (_req, res) => {
  try {
    const totalServers = await prisma.guildSettings.count();
    const totalMatches = await prisma.match.count();

    const servers = await prisma.guildSettings.findMany({
      select: { memberCount: true },
    });
    const totalMembers = servers.reduce(
      (sum: number, server: any) => sum + server.memberCount,
      0
    );

    const matchesByStatus = await prisma.match.groupBy({
      by: ["status"],
      _count: { status: true },
    });

    const matchesByKcTeam = await prisma.match.groupBy({
      by: ["kcTeam"],
      _count: { kcTeam: true },
    });

    const preMatchNotificationsEnabled = await prisma.guildSettings.count({
      where: { enablePreMatchNotifications: true },
    });

    const scoreNotificationsEnabled = await prisma.guildSettings.count({
      where: { enableScoreNotifications: true },
    });

    const serversWithFilteredTeams = await prisma.guildSettings.count({
      where: {
        filteredTeams: { isEmpty: false },
      },
    });

    const recentMatches = await prisma.match.findMany({
      orderBy: { beginAt: "desc" },
      take: 5,
    });

    const mostUsedCommand = await prisma.commandStat.groupBy({
      by: ["commandName"],
      _count: { commandName: true },
      orderBy: { _count: { commandName: "desc" } },
      take: 1,
    });

    const performanceMetrics = await prisma.performanceMetric.aggregate({
      _avg: { responseTime: true },
      _count: { id: true },
    });

    const successfulCommands = await prisma.performanceMetric.count({
      where: { success: true },
    });

    const totalCommands = performanceMetrics._count.id;
    const successRate =
      totalCommands > 0 ? (successfulCommands / totalCommands) * 100 : 0;

    const teamPopularity = await prisma.teamPopularity.findMany({
      orderBy: { usageCount: "desc" },
      take: 10,
    });

    const ticketStats = await prisma.ticket.aggregate({
      _count: { id: true },
    });

    const openTickets = await prisma.ticket.count({
      where: { status: "OPEN" },
    });

    const resolvedTickets = await prisma.ticket.count({
      where: { status: "RESOLVED" },
    });

    res.json({
      totalServers,
      totalMatches,
      totalMembers,
      matchesByStatus: matchesByStatus.map((item: any) => ({
        name: item.status,
        value: item._count.status,
      })),
      matchesByKcTeam: matchesByKcTeam.map((item: any) => ({
        name: item.kcTeam,
        value: item._count.kcTeam,
      })),
      configStats: {
        preMatchNotificationsEnabled,
        scoreNotificationsEnabled,
        serversWithFilteredTeams,
      },
      recentMatches,
      commandStats: {
        totalCommands,
        mostUsedCommand: mostUsedCommand[0]?.commandName || "N/A",
        averageResponseTime: performanceMetrics._avg.responseTime || 0,
        successRate: Math.round(successRate * 100) / 100,
      },
      teamPopularity,
      performanceMetrics: {
        averageResponseTime:
          Math.round((performanceMetrics._avg.responseTime || 0) * 100) / 100,
        successRate: Math.round(successRate * 100) / 100,
        totalErrors: totalCommands - successfulCommands,
      },
      tickets: {
        total: ticketStats._count.id,
        open: openTickets,
        resolved: resolvedTickets,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.get("/api/servers", async (_req, res) => {
  try {
    const servers = await prisma.guildSettings.findMany({
      orderBy: { joinedAt: "desc" },
    });
    res.json(servers);
  } catch (error) {
    console.error("Error fetching servers:", error);
    res.status(500).json({ error: "Failed to fetch servers" });
  }
});

app.get("/api/matches", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 12;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.kcTeam) where.kcTeam = req.query.kcTeam;

    const [matches, total] = await Promise.all([
      prisma.match.findMany({
        where,
        orderBy: { beginAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.match.count({ where }),
    ]);

    res.json({
      matches,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching matches:", error);
    res.status(500).json({ error: "Failed to fetch matches" });
  }
});

app.get("/api/command-stats", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (req.query.guildId) where.guildId = req.query.guildId;

    const [commands, total] = await Promise.all([
      prisma.commandStat.findMany({
        where,
        orderBy: { executedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.commandStat.count({ where }),
    ]);

    res.json({
      commands,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching command stats:", error);
    res.status(500).json({ error: "Failed to fetch command stats" });
  }
});

app.get("/api/tickets", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (req.query.status) where.status = req.query.status;
    if (req.query.guildId) where.guildId = req.query.guildId;

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.ticket.count({ where }),
    ]);

    res.json({
      tickets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

app.get("/api/team-popularity", async (_req, res) => {
  try {
    const teamPopularity = await prisma.teamPopularity.findMany({
      orderBy: { usageCount: "desc" },
    });
    res.json(teamPopularity);
  } catch (error) {
    console.error("Error fetching team popularity:", error);
    res.status(500).json({ error: "Failed to fetch team popularity" });
  }
});

app.get("/api/performance-metrics", async (req, res) => {
  try {
    const where: any = {};
    if (req.query.guildId) where.guildId = req.query.guildId;

    const metrics = await prisma.performanceMetric.findMany({
      where,
      orderBy: { executedAt: "desc" },
      take: 100,
    });

    const aggregated = await prisma.performanceMetric.aggregate({
      where,
      _avg: { responseTime: true },
      _count: { id: true },
    });

    const successful = await prisma.performanceMetric.count({
      where: { ...where, success: true },
    });

    res.json({
      metrics,
      summary: {
        averageResponseTime:
          Math.round((aggregated._avg.responseTime || 0) * 100) / 100,
        totalCommands: aggregated._count.id,
        successRate:
          aggregated._count.id > 0
            ? (successful / aggregated._count.id) * 100
            : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    res.status(500).json({ error: "Failed to fetch performance metrics" });
  }
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(__dirname, "../../dist/index.html"));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
