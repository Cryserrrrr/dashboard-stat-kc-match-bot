import { useState, useEffect } from "react";
import { api } from "../services/api";
import { CommandStat } from "../types";
import { Command, Clock, User, Hash, TrendingUp } from "lucide-react";
import { getTeamName } from "../utils/teams";

export function CommandsPage() {
  const [commands, setCommands] = useState<CommandStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCommands, setTotalCommands] = useState(0);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const commandUsageStats = commands.reduce((acc, command) => {
    const cmdName = command.commandName;
    if (!acc[cmdName]) {
      acc[cmdName] = { count: 0, users: new Set() };
    }
    acc[cmdName].count++;
    acc[cmdName].users.add(command.userId);
    return acc;
  }, {} as Record<string, { count: number; users: Set<string> }>);

  const topCommands = Object.entries(commandUsageStats)
    .map(([name, stats]) => ({
      name,
      count: stats.count,
      uniqueUsers: stats.users.size,
      percentage: ((stats.count / totalCommands) * 100).toFixed(1),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

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
        setError("Failed to load command stats");
        console.error("Error fetching command stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCommands();
  }, [currentPage]);

  const filteredCommands = commands.filter(
    (command) =>
      command.commandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      command.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (command.teamArg &&
        command.teamArg.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
            Command Statistics
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Track command usage and user interactions
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white dark:bg-brand-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Total Commands
                </h3>
                <p className="text-3xl font-bold text-brand-600 dark:text-brand-300">
                  {totalCommands.toLocaleString()}
                </p>
              </div>
              <div className="h-12 w-12 bg-brand-100 dark:bg-brand-700 rounded-xl flex items-center justify-center">
                <Command className="h-6 w-6 text-brand-600 dark:text-brand-300" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-brand-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Unique Commands
                </h3>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {Object.keys(commandUsageStats).length}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-brand-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Most Used Command
                </h3>
                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {topCommands.length > 0 ? `/${topCommands[0].name}` : "N/A"}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {topCommands.length > 0 ? `${topCommands[0].count} uses` : ""}
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center">
                <Command className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Top Commands Ranking */}
        <div className="bg-white dark:bg-brand-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 mb-6 animate-fade-in">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Top 10 Most Used Commands
          </h2>
          {topCommands.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No command usage data available
            </p>
          ) : (
            <div className="space-y-4">
              {topCommands.map((cmd, index) => (
                <div
                  key={cmd.name}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-brand-card rounded-lg border border-gray-200 dark:border-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0
                          ? "bg-yellow-500"
                          : index === 1
                          ? "bg-gray-400"
                          : index === 2
                          ? "bg-orange-500"
                          : "bg-brand-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        /{cmd.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {cmd.uniqueUsers} unique users
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {cmd.count.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {cmd.percentage}% of total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="bg-white dark:bg-brand-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 mb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Search Commands
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by command name, username, or team..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-brand-500 focus:border-brand-500 dark:bg-brand-card dark:text-white dark:placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Commands Table */}
        <div className="bg-white dark:bg-brand-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-6 animate-fade-in">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
            Recent Commands
          </h2>
          {filteredCommands.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              {searchTerm
                ? "No commands found matching your search"
                : "No commands executed yet"}
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                  <thead className="bg-gray-50 dark:bg-gray-600">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                        Command
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                        Team Argument
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                        Server ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                        Executed At
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-brand-card divide-y divide-gray-200 dark:divide-gray-600">
                    {filteredCommands.map((command) => (
                      <tr
                        key={command.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Command className="h-4 w-4 text-brand-500 dark:text-brand-300 mr-2" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              /{command.commandName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="h-4 w-4 text-gray-400 dark:text-brand-400 mr-2" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {command.username}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                            {command.userId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {command.teamArg ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800">
                              {getTeamName(command.teamArg)}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              -
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Hash className="h-4 w-4 text-gray-400 dark:text-gray-400 mr-2" />
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                              {command.guildId}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-gray-400 dark:text-gray-400 mr-2" />
                            <span className="text-sm text-gray-900 dark:text-white">
                              {formatDate(command.executedAt)}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
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
                      className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
