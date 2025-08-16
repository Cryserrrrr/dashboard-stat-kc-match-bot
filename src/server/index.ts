import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import session from "express-session";
import { RedisStore } from "connect-redis";
import { createClient } from "redis";
import jwt from "jsonwebtoken";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Redis client setup with fallback
let redisClient: any = null;
let redisStore: any = null;

try {
  console.log("🔧 Initializing Redis client...");
  console.log(
    "🔧 Redis URL:",
    process.env.REDIS_URL || "redis://localhost:6379"
  );

  redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
  });

  redisClient.on("error", (err: any) => {
    console.error("❌ Redis error:", err);
  });

  redisClient.on("connect", () => {
    console.log("✅ Redis connected successfully");
  });

  redisClient.on("ready", () => {
    console.log("✅ Redis ready");
  });

  redisClient.on("end", () => {
    console.log("🔌 Redis connection ended");
  });

  redisClient
    .connect()
    .then(() => {
      console.log("✅ Redis connection established");
    })
    .catch((err: any) => {
      console.error("❌ Redis connection failed:", err);
      redisClient = null;
    });

  redisStore = new RedisStore({
    client: redisClient,
    prefix: "dashboard:",
  });

  console.log("✅ Redis store initialized");
} catch (error) {
  console.error("❌ Redis setup failed:", error);
  redisClient = null;
  redisStore = null;
}

app.use(
  cors({
    origin: process.env.BASE_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Cookie",
    ],
    exposedHeaders: ["Set-Cookie"],
  })
);
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "../../dist")));

const sessionConfig = {
  store: redisStore || undefined,
  secret: process.env.JWT_SECRET || "fallback-secret",
  resave: true,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: (process.env.NODE_ENV === "production" ? "none" : "lax") as
      | "none"
      | "lax",
    domain: process.env.NODE_ENV === "production" ? "cryser.fr" : undefined,
    path: "/",
  },
  name: "dashboard_session",
};

console.log("🔧 Session config:", {
  store: redisStore ? "Redis" : "Memory",
  secret: process.env.JWT_SECRET ? "Set" : "Fallback",
  resave: sessionConfig.resave,
  saveUninitialized: sessionConfig.saveUninitialized,
  cookie: sessionConfig.cookie,
  nodeEnv: process.env.NODE_ENV,
});

app.use(session(sessionConfig));

const requireAuth = (req: any, res: any, next: any) => {
  console.log("🔒 RequireAuth middleware");
  console.log("🔒 Session ID:", req.sessionID);
  console.log("🔒 Session exists:", !!req.session);
  console.log("🔒 User in session:", (req.session as any).user);

  const user = (req.session as any).user;

  if (!user) {
    console.log("❌ No user found in session");
    return res.status(401).json({ error: "Authentication required" });
  }

  console.log("✅ User authenticated:", user.username);
  next();
};
app.get("/api/health", (_req, res) => {
  return res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/debug/session", (req, res) => {
  return res.json({
    sessionID: req.sessionID,
    sessionData: req.session,
    hasUser: !!(req.session as any).user,
    user: (req.session as any).user,
    redisAvailable: !!redisClient,
    nodeEnv: process.env.NODE_ENV,
    baseUrl: process.env.BASE_URL,
    cookies: req.headers.cookie,
    origin: req.headers.origin,
    referer: req.headers.referer,
    sessionCookie: req.cookies?.dashboard_session,
    allCookies: req.cookies,
    usedCode: (req.session as any).usedCode,
  });
});

app.get("/api/debug/test-session", (req, res) => {
  console.log("🧪 Test session request");
  console.log("🧪 Session ID:", req.sessionID);

  (req.session as any).testData = {
    timestamp: new Date().toISOString(),
    random: Math.random(),
  };

  req.session.save((err) => {
    if (err) {
      console.error("❌ Test session save failed:", err);
      return res.json({
        error: "Failed to save session",
        details: err.message,
      });
    }

    console.log("✅ Test session saved successfully");
    return res.json({
      success: true,
      testData: (req.session as any).testData,
      sessionID: req.sessionID,
      cookies: req.cookies,
      sessionCookie: req.cookies?.dashboard_session,
    });
  });
});

app.get("/api/debug/redis", async (_req, res) => {
  console.log("🔍 Redis debug request");

  try {
    if (!redisClient) {
      console.log("❌ Redis client not available");
      return res.json({
        available: false,
        error: "Redis client not initialized",
      });
    }

    console.log("🔍 Testing Redis connection...");
    const testKey = "test:connection";
    const testValue = new Date().toISOString();

    await redisClient.set(testKey, testValue);
    const retrievedValue = await redisClient.get(testKey);
    await redisClient.del(testKey);

    console.log("✅ Redis test successful");
    return res.json({
      available: true,
      test: "successful",
      setValue: testValue,
      retrievedValue: retrievedValue,
      match: testValue === retrievedValue,
    });
  } catch (error) {
    console.error("❌ Redis test failed:", error);
    return res.json({
      available: false,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

app.get("/api/stats", requireAuth, async (_req, res) => {
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
      take: 6,
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

    return res.json({
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
    return res.status(500).json({ error: "Failed to fetch stats" });
  }
});

app.get("/api/servers", requireAuth, async (_req, res) => {
  try {
    const servers = await prisma.guildSettings.findMany({
      orderBy: { joinedAt: "desc" },
    });
    return res.json(servers);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch servers" });
  }
});

app.get("/api/matches", requireAuth, async (req, res) => {
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

    return res.json({
      matches,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch matches" });
  }
});

app.get("/api/command-stats", requireAuth, async (req, res) => {
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

    return res.json({
      commands,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch command stats" });
  }
});

app.get("/api/tickets", requireAuth, async (req, res) => {
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

    return res.json({
      tickets,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch tickets" });
  }
});

app.get("/api/team-popularity", requireAuth, async (_req, res) => {
  try {
    const teamPopularity = await prisma.teamPopularity.findMany({
      orderBy: { usageCount: "desc" },
    });
    return res.json(teamPopularity);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch team popularity" });
  }
});

app.get("/api/performance-metrics", requireAuth, async (req, res) => {
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

    return res.json({
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
    return res
      .status(500)
      .json({ error: "Failed to fetch performance metrics" });
  }
});

app.post("/api/auth/callback", async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ error: "Authorization code is required" });
    }

    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = process.env.DISCORD_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return res.status(500).json({ error: "Server configuration error" });
    }

    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code: code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      return res
        .status(400)
        .json({ error: "Failed to authenticate with Discord" });
    }

    const tokenData = (await tokenResponse.json()) as any;

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      return res
        .status(400)
        .json({ error: "Failed to fetch user information" });
    }

    const userData = (await userResponse.json()) as any;

    const authorizedUserIds =
      process.env.AUTHORIZED_USER_IDS?.split(",").map((id) => id.trim()) || [];

    if (
      authorizedUserIds.length > 0 &&
      !authorizedUserIds.includes(userData.id)
    ) {
      return res
        .status(403)
        .json({ error: "Access denied. User not authorized." });
    }

    const token = jwt.sign(
      {
        id: userData.id,
        username: userData.username,
        avatar: userData.avatar,
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "24h" }
    );

    (req.session as any).user = {
      id: userData.id,
      username: userData.username,
      avatar: userData.avatar,
    };

    return res.json({
      success: true,
      user: {
        id: userData.id,
        username: userData.username,
        avatar: userData.avatar,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({ error: "Authentication failed" });
  }
});

app.get("/auth/callback", async (req, res) => {
  console.log("🔐 Auth callback started");
  console.log("🔐 Session ID:", req.sessionID);
  console.log("🔐 Cookies:", req.cookies);
  console.log("🔐 Headers:", {
    origin: req.headers.origin,
    referer: req.headers.referer,
    cookie: req.headers.cookie,
  });

  try {
    const { code, error } = req.query;
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";

    console.log("🔐 Query params:", { code: !!code, error });

    if (error) {
      console.log("❌ Auth error:", error);
      return res.redirect(`${baseUrl}/auth/callback?error=${error}`);
    }

    if ((req.session as any).user) {
      console.log("✅ User already authenticated, redirecting to dashboard");
      return res.redirect(`${baseUrl}/`);
    }

    if (!code) {
      console.log("❌ No authorization code");
      return res.redirect(`${baseUrl}/auth/callback?error=no_code`);
    }

    if ((req.session as any).usedCode === code) {
      console.log("❌ Authorization code already used");
      return res.redirect(`${baseUrl}/auth/callback?error=code_already_used`);
    }

    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    const redirectUri = process.env.DISCORD_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return res.redirect(`${baseUrl}/auth/callback?error=config_error`);
    }

    const tokenResponse = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "authorization_code",
        code: code as string,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      return res.redirect(
        `${baseUrl}/auth/callback?error=token_exchange_failed`
      );
    }

    const tokenData = (await tokenResponse.json()) as any;

    const userResponse = await fetch("https://discord.com/api/users/@me", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      return res.redirect(`${baseUrl}/auth/callback?error=user_fetch_failed`);
    }

    const userData = (await userResponse.json()) as any;

    const authorizedUserIds =
      process.env.AUTHORIZED_USER_IDS?.split(",").map((id) => id.trim()) || [];

    if (
      authorizedUserIds.length > 0 &&
      !authorizedUserIds.includes(userData.id)
    ) {
      return res.redirect(`${baseUrl}/auth/callback?error=unauthorized`);
    }

    console.log("✅ User authenticated:", {
      id: userData.id,
      username: userData.username,
    });

    (req.session as any).usedCode = code;
    (req.session as any).user = {
      id: userData.id,
      username: userData.username,
      avatar: userData.avatar,
    };

    console.log("🔐 Session before save:", {
      sessionID: req.sessionID,
      hasUser: !!(req.session as any).user,
      user: (req.session as any).user,
    });

    // Force session save and wait for completion
    await new Promise<void>((resolve, reject) => {
      req.session.save((err) => {
        if (err) {
          console.error("❌ Session save failed:", err);
          reject(err);
        } else {
          console.log("✅ Session saved successfully");
          console.log("🔐 Session after save:", {
            sessionID: req.sessionID,
            hasUser: !!(req.session as any).user,
          });
          resolve();
        }
      });
    });

    if (process.env.NODE_ENV === "production") {
      console.log("🔧 Setting production cookie");
      res.cookie("dashboard_session", req.sessionID, {
        secure: true,
        httpOnly: true,
        sameSite: "none",
        domain: "cryser.fr",
        path: "/",
        maxAge: 24 * 60 * 60 * 1000,
      });
      console.log("✅ Production cookie set");
    }

    console.log("🔄 Redirecting to:", `${baseUrl}/`);
    return res.redirect(`${baseUrl}/`);
  } catch (error) {
    const baseUrl = process.env.BASE_URL || "http://localhost:3000";
    return res.redirect(`${baseUrl}/auth/callback?error=auth_failed`);
  }
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  console.log("🔍 Auth/me request");
  console.log("🔍 Session ID:", req.sessionID);
  console.log("🔍 Cookies:", req.cookies);
  console.log("🔍 Session exists:", !!req.session);
  console.log("🔍 Session keys:", req.session ? Object.keys(req.session) : []);
  console.log("🔍 User in session:", (req.session as any).user);

  try {
    const user = (req.session as any).user;

    if (!user) {
      console.log("❌ No user in session");
      return res.status(401).json({
        error: "Not authenticated",
        debug: {
          sessionID: req.sessionID,
          hasSession: !!req.session,
          sessionKeys: req.session ? Object.keys(req.session) : [],
          cookies: req.cookies,
        },
      });
    }

    console.log("✅ User found:", user);
    return res.json(user);
  } catch (error) {
    console.error("❌ Auth/me error:", error);
    return res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.post("/api/auth/logout", requireAuth, (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      return res.json({ success: true });
    });
    return;
  } catch (error) {
    return res.status(500).json({ error: "Failed to logout" });
  }
});

app.post("/api/auth/clear-session", (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to clear session" });
      }
      res.clearCookie("dashboard_session");
      return res.json({ success: true, message: "Session cleared" });
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to clear session" });
  }
});

app.get("/api/tickets/:ticketId", requireAuth, async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    return res.json(ticket);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch ticket" });
  }
});

app.patch("/api/tickets/:ticketId/status", requireAuth, async (req, res) => {
  try {
    const ticketId = req.params.ticketId;
    const { status } = req.body;

    const ticket = await prisma.ticket.update({
      where: { id: ticketId },
      data: { status },
    });

    return res.json(ticket);
  } catch (error) {
    return res.status(500).json({ error: "Failed to update ticket status" });
  }
});

app.post("/api/tickets/:ticketId/respond", requireAuth, async (_req, res) => {
  try {
    return res.json({ success: true, message: "Response added successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to add ticket response" });
  }
});

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Not found" });
  }
  return res.sendFile(path.join(__dirname, "../../dist/index.html"));
});

app.listen(PORT, () => {
  console.log("🚀 Server started on port", PORT);
  console.log("🌍 Environment:", process.env.NODE_ENV || "development");
  console.log("🔧 Base URL:", process.env.BASE_URL || "http://localhost:3000");
  console.log("🔧 Redis available:", !!redisClient);
  console.log("🔧 Session store:", redisStore ? "Redis" : "Memory");
});
