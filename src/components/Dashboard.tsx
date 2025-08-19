import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { DashboardStats, CommandStat } from "../types";
import { StatCard } from "./StatCard";
import { Chart } from "./Chart";
import { teamOptions } from "../utils/teams";
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [commands, setCommands] = useState<CommandStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, commandsData] = await Promise.all([
          api.getStats(),
          api.getCommandStats(1),
        ]);
        setStats(statsData);
        setCommands(commandsData.commands);
        setError(null);
      } catch (err) {
        setError("Error fetching data");
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-brand-900">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-brand-900">
        <div className="text-center animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  const generateTeamUsageByDay = () => {
    const daysOfWeek = [
      "Lundi",
      "Mardi",
      "Mercredi",
      "Jeudi",
      "Vendredi",
      "Samedi",
      "Dimanche",
    ];
    const teamUsage: { [key: string]: { [key: string]: number } } = {};

    daysOfWeek.forEach((day) => {
      teamUsage[day] = {};
      teamOptions.forEach((team) => {
        teamUsage[day][team.name] = 0;
      });
    });

    const now = new Date();
    const startOfCurrentWeek = new Date(now);
    startOfCurrentWeek.setDate(now.getDate() - now.getDay() + 1);
    startOfCurrentWeek.setHours(0, 0, 0, 0);

    const startOfSelectedWeek = new Date(startOfCurrentWeek);
    startOfSelectedWeek.setDate(
      startOfCurrentWeek.getDate() + selectedWeek * 7
    );

    commands.forEach((command) => {
      if (command.teamArg) {
        const team = teamOptions.find((t) => t.id === command.teamArg);
        if (team) {
          const commandDate = new Date(command.executedAt);

          const endOfSelectedWeek = new Date(startOfSelectedWeek);
          endOfSelectedWeek.setDate(startOfSelectedWeek.getDate() + 6);
          endOfSelectedWeek.setHours(23, 59, 59, 999);

          if (
            commandDate >= startOfSelectedWeek &&
            commandDate <= endOfSelectedWeek
          ) {
            const dayIndex = commandDate.getDay();
            const dayName = daysOfWeek[dayIndex === 0 ? 6 : dayIndex - 1];

            if (teamUsage[dayName]) {
              teamUsage[dayName][team.name] =
                (teamUsage[dayName][team.name] || 0) + 1;
            }
          }
        }
      }
    });

    return daysOfWeek.map((day) => ({
      name: day,
      ...teamUsage[day],
    }));
  };

  const getWeekTitle = () => {
    const now = new Date();
    const startOfCurrentWeek = new Date(now);
    startOfCurrentWeek.setDate(now.getDate() - now.getDay() + 1);

    const startOfSelectedWeek = new Date(startOfCurrentWeek);
    startOfSelectedWeek.setDate(
      startOfCurrentWeek.getDate() + selectedWeek * 7
    );

    const endOfSelectedWeek = new Date(startOfSelectedWeek);
    endOfSelectedWeek.setDate(startOfSelectedWeek.getDate() + 6);

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      });
    };

    if (selectedWeek === 0) {
      return "Cette semaine";
    } else if (selectedWeek === -1) {
      return "Semaine précédente";
    } else if (selectedWeek === 1) {
      return "Semaine prochaine";
    } else {
      return `${formatDate(startOfSelectedWeek)} - ${formatDate(
        endOfSelectedWeek
      )}`;
    }
  };

  const getTeamColors = () => {
    const chartData = generateTeamUsageByDay();
    if (chartData.length === 0) return [];

    const teamKeys = Object.keys(chartData[0]).filter((key) => key !== "name");

    return teamKeys.map((teamName) => {
      const team = teamOptions.find((t) => t.name === teamName);
      return team ? team.color : "#588157";
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start animate-slide-down">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard Overview
            </h1>
          </div>
          {(stats.tickets.open > 0 || stats.tickets.inProgress > 0) && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigate("/tickets")}
                className="bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-2 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors cursor-pointer animate-bounce-in"
              >
                <div className="flex items-center space-x-2">
                  <Ticket className="h-5 w-5 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    {stats.tickets.open + (stats.tickets.inProgress || 0)}{" "}
                    active tickets
                  </span>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Servers"
            value={stats.totalServers.toString()}
            icon={Users}
          />
          <StatCard
            title="Total Members"
            value={stats.totalMembers.toLocaleString()}
            icon={Users}
          />
          <StatCard
            title="Total Matches"
            value={stats.totalMatches.toString()}
            icon={Gamepad2}
          />
          <StatCard
            title="Total Commands"
            value={stats.commandStats.totalCommands.toLocaleString()}
            icon={Command}
          />
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Success Rate"
            value={`${stats.performanceMetrics.successRate.toFixed(1)}%`}
            icon={CheckCircle}
          />
          <StatCard
            title="Avg Response Time"
            value={`${stats.performanceMetrics.averageResponseTime}ms`}
            icon={Clock}
          />
          <StatCard
            title="Total Errors"
            value={stats.performanceMetrics.totalErrors.toString()}
            icon={AlertCircle}
          />
        </div>

        {/* Configuration Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Pre-match Notifications"
            value={stats.configStats.preMatchNotificationsEnabled.toString()}
            icon={Settings}
          />
          <StatCard
            title="Score Notifications"
            value={stats.configStats.scoreNotificationsEnabled.toString()}
            icon={Settings}
          />
          <StatCard
            title="Update Notifications"
            value={stats.configStats.updateNotificationsEnabled.toString()}
            icon={Settings}
          />
          <StatCard
            title="Filtered Teams"
            value={stats.configStats.serversWithFilteredTeams.toString()}
            icon={Target}
          />
        </div>

        {/* Team Usage by Day Chart */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Utilisation des équipes par jour
            </h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {getWeekTitle()}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setSelectedWeek(selectedWeek - 1)}
                  className="p-2 rounded-lg bg-white dark:bg-brand-card border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Semaine précédente"
                >
                  <ChevronLeft className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
                <button
                  onClick={() => setSelectedWeek(0)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    selectedWeek === 0
                      ? "bg-brand-light text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  Aujourd'hui
                </button>
                <button
                  onClick={() => setSelectedWeek(selectedWeek + 1)}
                  className="p-2 rounded-lg bg-white dark:bg-brand-card border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Semaine suivante"
                >
                  <ChevronRight className="h-4 w-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            </div>
          </div>
          <Chart
            type="line"
            data={generateTeamUsageByDay()}
            title=""
            height={300}
            colors={getTeamColors()}
          />
        </div>
      </div>
    </div>
  );
}
