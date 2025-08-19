import { useState, useEffect } from "react";
import { api } from "../services/api";
import { CommandStat } from "../types";
import { User, Trophy, Command, Clock, TrendingUp } from "lucide-react";

interface UserStats {
  userId: string;
  username: string;
  totalCommands: number;
  uniqueCommands: Set<string>;
  mostUsedCommand: string;
  lastActivity: string;
  servers: Set<string>;
}

export function UsersPage() {
  const [commands, setCommands] = useState<CommandStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCommands, setTotalCommands] = useState(0);
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Calculate user statistics
  const userStats = commands.reduce((acc, command) => {
    const userId = command.userId;
    if (!acc[userId]) {
      acc[userId] = {
        userId,
        username: command.username,
        totalCommands: 0,
        uniqueCommands: new Set(),
        mostUsedCommand: "",
        lastActivity: command.executedAt,
        servers: new Set(),
      };
    }

    acc[userId].totalCommands++;
    acc[userId].uniqueCommands.add(command.commandName);
    acc[userId].servers.add(command.guildId);

    if (new Date(command.executedAt) > new Date(acc[userId].lastActivity)) {
      acc[userId].lastActivity = command.executedAt;
    }

    return acc;
  }, {} as Record<string, UserStats>);

  const userRankings = Object.values(userStats)
    .map((user) => {
      const commandCounts = commands
        .filter((cmd) => cmd.userId === user.userId)
        .reduce((acc, cmd) => {
          acc[cmd.commandName] = (acc[cmd.commandName] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

      const mostUsed = Object.entries(commandCounts).sort(
        ([, a], [, b]) => b - a
      )[0];

      return {
        ...user,
        uniqueCommands: user.uniqueCommands.size,
        mostUsedCommand: mostUsed ? mostUsed[0] : "N/A",
        serverCount: user.servers.size,
      };
    })
    .sort((a, b) => b.totalCommands - a.totalCommands)
    .filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userId.includes(searchTerm)
    );

  useEffect(() => {
    const fetchCommands = async () => {
      try {
        setLoading(true);
        const data = await api.getCommandStats(currentPage);
        setCommands(data.commands);
        setTotalPages(data.totalPages);
        setTotalCommands(data.total);
        setError(null);
      } catch (err) {
        setError("Failed to load user stats");
        console.error("Error fetching user stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommands();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRankColor = (index: number) => {
    if (index === 0) return "bg-yellow-500";
    if (index === 1) return "bg-gray-400";
    if (index === 2) return "bg-orange-500";
    return "bg-blue-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-brand-dark">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-light"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-brand-dark">
        <div className="text-center animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error
          </h2>
          <p className="text-gray-600 dark:text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-brand-dark transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 animate-slide-down">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            User Rankings
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Top users by command usage and activity
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white dark:bg-brand-card rounded-lg shadow-sm border border-gray-200 dark:border-0 p-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total Users
                </h3>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {userRankings.length}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-brand-card rounded-lg shadow-sm border border-gray-200 dark:border-0 p-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total Commands
                </h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {totalCommands.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Command className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-brand-card rounded-lg shadow-sm border border-gray-200 dark:border-0 p-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Top User
                </h3>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {userRankings.length > 0 ? userRankings[0].username : "N/A"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {userRankings.length > 0
                    ? `${userRankings[0].totalCommands} commands`
                    : ""}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-brand-card rounded-lg shadow-sm border border-gray-200 dark:border-0 p-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Avg Commands/User
                </h3>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                  {userRankings.length > 0
                    ? Math.round(totalCommands / userRankings.length)
                    : 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-brand-card rounded-lg shadow-sm border border-gray-200 dark:border-0 p-6 mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Search Users
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by username or user ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-brand-card text-gray-900 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* User Rankings */}
        <div className="bg-white dark:bg-brand-card rounded-lg shadow-sm border border-gray-200 dark:border-0 p-6 animate-fade-in">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Top Users by Command Usage
          </h2>
          {userRankings.length === 0 ? (
            <p className="text-gray-500 dark:text-white text-center py-8">
              {searchTerm
                ? "No users found matching your search"
                : "No user activity data available"}
            </p>
          ) : (
            <>
              <div className="space-y-4">
                {userRankings.map((user, index) => (
                  <div
                    key={user.userId}
                    className="flex items-center justify-between p-6 bg-gray-50 dark:bg-brand-card rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg ${getRankColor(
                          index
                        )}`}
                      >
                        {index + 1}
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                            {user.username}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-300">
                            <span className="font-mono">{user.userId}</span>
                            <span>•</span>
                            <span>{user.serverCount} servers</span>
                            <span>•</span>
                            <span>{user.uniqueCommands} unique commands</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {user.totalCommands.toLocaleString()}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                          total commands
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          /{user.mostUsedCommand}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                          most used
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-gray-400 dark:text-gray-400 mr-1" />
                          <span className="text-sm text-gray-500 dark:text-gray-300">
                            {formatDate(user.lastActivity)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-400">
                          last activity
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    Showing page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
