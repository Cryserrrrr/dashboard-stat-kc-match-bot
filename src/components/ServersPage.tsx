import { useState, useEffect } from "react";
import { api } from "../services/api";
import { GuildSettings } from "../types";
import { TeamsSection } from "./TeamsPage";
import { Users, Calendar, Hash, Bell, Target } from "lucide-react";

export function ServersPage() {
  const [servers, setServers] = useState<GuildSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServers = async () => {
      try {
        setLoading(true);
        const data = await api.getServers();
        setServers(data);
        setError(null);
      } catch (err) {
        setError("Failed to load servers");
        console.error("Error fetching servers:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchServers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Server Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your Discord server configurations
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Server Configurations
          </h2>
          {servers.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No servers configured
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Server Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Channel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notifications
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filtered Teams
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ping Roles
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {servers.map((server) => (
                    <tr key={server.guildId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {server.name || "Unknown Server"}
                            </div>
                            <div className="text-sm text-gray-500">
                              {server.memberCount.toLocaleString()} members
                            </div>
                            <div className="text-xs text-gray-400 font-mono">
                              {server.guildId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Hash className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900 font-mono">
                            {server.channelId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="flex items-center">
                            <Bell
                              className={`h-4 w-4 mr-2 ${
                                server.enablePreMatchNotifications
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            />
                            <span
                              className={`text-sm ${
                                server.enablePreMatchNotifications
                                  ? "text-green-700"
                                  : "text-red-700"
                              }`}
                            >
                              Pre-match{" "}
                              {server.enablePreMatchNotifications
                                ? "Enabled"
                                : "Disabled"}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Bell
                              className={`h-4 w-4 mr-2 ${
                                server.enableScoreNotifications
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            />
                            <span
                              className={`text-sm ${
                                server.enableScoreNotifications
                                  ? "text-green-700"
                                  : "text-red-700"
                              }`}
                            >
                              Score{" "}
                              {server.enableScoreNotifications
                                ? "Enabled"
                                : "Disabled"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Target className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {server.filteredTeams.length} teams
                          </span>
                        </div>
                        {server.filteredTeams.length > 0 && (
                          <div className="mt-1">
                            <div className="flex flex-wrap gap-1">
                              {server.filteredTeams
                                .slice(0, 2)
                                .map((teamId) => (
                                  <span
                                    key={teamId}
                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                                  >
                                    {teamId}
                                  </span>
                                ))}
                              {server.filteredTeams.length > 2 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                                  +{server.filteredTeams.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {server.pingRoles.length} roles
                        </div>
                        {server.pingRoles.length > 0 && (
                          <div className="mt-1">
                            <div className="flex flex-wrap gap-1">
                              {server.pingRoles.slice(0, 2).map((roleId) => (
                                <span
                                  key={roleId}
                                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                                >
                                  {roleId.slice(0, 8)}...
                                </span>
                              ))}
                              {server.pingRoles.length > 2 && (
                                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-600">
                                  +{server.pingRoles.length - 2} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm text-gray-900">
                            {formatDate(server.joinedAt)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Teams Section */}
        <TeamsSection />
      </div>
    </div>
  );
}
