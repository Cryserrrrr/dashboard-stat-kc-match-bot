import { useState, useEffect } from "react";
import { api } from "../services/api";
import { DashboardStats } from "../types";
import { StatCard } from "./StatCard";
import { Chart } from "./Chart";
import {
  Users,
  Gamepad2,
  Settings,
  Clock,
  CheckCircle,
  AlertCircle,
  Command,
  Ticket,
  Target,
} from "lucide-react";

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await api.getStats();
        setStats(data);
        setError(null);
      } catch (err) {
        setError("Error fetching stats");
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive statistics and insights about your Discord bot
          </p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Servers"
            value={stats.totalServers.toString()}
            icon={Users}
            description="Discord servers using the bot"
          />
          <StatCard
            title="Total Members"
            value={stats.totalMembers.toLocaleString()}
            icon={Users}
            description="Total members across all servers"
          />
          <StatCard
            title="Total Matches"
            value={stats.totalMatches.toString()}
            icon={Gamepad2}
            description="Matches tracked in database"
          />
          <StatCard
            title="Total Commands"
            value={stats.commandStats.totalCommands.toLocaleString()}
            icon={Command}
            description="Commands executed by users"
          />
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Success Rate"
            value={`${stats.performanceMetrics.successRate.toFixed(1)}%`}
            icon={CheckCircle}
            description="Command execution success rate"
            trend={{ value: 12.5, isPositive: true }}
          />
          <StatCard
            title="Avg Response Time"
            value={`${stats.performanceMetrics.averageResponseTime}ms`}
            icon={Clock}
            description="Average command response time"
          />
          <StatCard
            title="Total Errors"
            value={stats.performanceMetrics.totalErrors.toString()}
            icon={AlertCircle}
            description="Total command execution errors"
          />
        </div>

        {/* Configuration Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Pre-match Notifications"
            value={stats.configStats.preMatchNotificationsEnabled.toString()}
            icon={Settings}
            description="Servers with pre-match notifications enabled"
          />
          <StatCard
            title="Score Notifications"
            value={stats.configStats.scoreNotificationsEnabled.toString()}
            icon={Settings}
            description="Servers with score notifications enabled"
          />
          <StatCard
            title="Filtered Teams"
            value={stats.configStats.serversWithFilteredTeams.toString()}
            icon={Target}
            description="Servers with team filters configured"
          />
        </div>

        {/* Ticket Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Tickets"
            value={stats.tickets.total.toString()}
            icon={Ticket}
            description="Total support tickets created"
          />
          <StatCard
            title="Open Tickets"
            value={stats.tickets.open.toString()}
            icon={AlertCircle}
            description="Tickets awaiting resolution"
          />
          <StatCard
            title="Resolved Tickets"
            value={stats.tickets.resolved.toString()}
            icon={CheckCircle}
            description="Successfully resolved tickets"
          />
        </div>

        {/* Team Popularity Chart */}
        <div className="mb-8">
          <Chart
            type="bar"
            data={stats.teamPopularity.map((team) => ({
              name: team.teamName,
              value: team.usageCount,
            }))}
            title="Team Popularity"
            height={300}
          />
        </div>
      </div>
    </div>
  );
}
