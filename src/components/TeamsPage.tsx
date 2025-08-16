import { useState, useEffect } from "react";
import { api } from "../services/api";

interface TeamFilterCount {
  teamId: string;
  teamName: string;
  count: number;
  servers: string[];
}

// Team data from the bot
const teamOptions = [
  {
    id: "134078",
    name: "KC (LEC)",
    description: "Équipe principale League of Legends",
  },
  {
    id: "128268",
    name: "KCB (LFL)",
    description: "Équipe académique League of Legends",
  },
  {
    id: "136080",
    name: "KCBS (LFL2)",
    description: "Équipe LFL2 League of Legends",
  },
  {
    id: "130922",
    name: "KC Valorant",
    description: "Équipe principale Valorant",
  },
  {
    id: "132777",
    name: "KCGC Valorant",
    description: "Équipe féminine Valorant",
  },
  {
    id: "136165",
    name: "KCBS Valorant",
    description: "Équipe KCBS Valorant",
  },
  {
    id: "129570",
    name: "KC Rocket League",
    description: "Équipe Rocket League",
  },
];

// Helper function to get team name by ID
const getTeamName = (teamId: string): string => {
  const team = teamOptions.find((t) => t.id === teamId);
  return team ? team.name : teamId;
};

export function TeamsPage() {
  const [teams, setTeams] = useState<TeamFilterCount[]>([]);
  const [totalServers, setTotalServers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const servers = await api.getServers();
        const totalServersCount = servers.length;

        // Count how many times each team is filtered
        const teamCounts: { [key: string]: TeamFilterCount } = {};

        servers.forEach((server) => {
          server.filteredTeams.forEach((teamId) => {
            if (!teamCounts[teamId]) {
              teamCounts[teamId] = {
                teamId,
                teamName: getTeamName(teamId),
                count: 0,
                servers: [],
              };
            }
            teamCounts[teamId].count++;
            teamCounts[teamId].servers.push(server.guildId);
          });
        });

        // Convert to array and sort by count (most filtered first)
        const teamsArray = Object.values(teamCounts).sort(
          (a, b) => b.count - a.count
        );
        setTeams(teamsArray);
        setTotalServers(totalServersCount);
        setError(null);
      } catch (err) {
        setError("Failed to load teams");
        console.error("Error fetching teams:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Teams Management</h1>
          <p className="text-gray-600 mt-2">
            View the most filtered teams across all servers
          </p>
        </div>

        {/* Teams List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Most Filtered Teams
          </h2>

          {teams.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No teams are currently being filtered
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rank
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Filter Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Servers Using This Filter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Percentage of Servers
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teams.map((team, index) => (
                    <tr key={team.teamId} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {team.teamName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                        {team.teamId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {team.count} servers
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        <div className="flex flex-wrap gap-1">
                          {team.servers.slice(0, 3).map((serverId) => (
                            <span
                              key={serverId}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {serverId.slice(0, 8)}...
                            </span>
                          ))}
                          {team.servers.length > 3 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                              +{team.servers.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {totalServers > 0
                          ? ((team.count / totalServers) * 100).toFixed(1)
                          : "0.0"}
                        %
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {teams.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Total Teams Filtered
              </h3>
              <p className="text-3xl font-bold text-blue-600">{teams.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Most Filtered Team
              </h3>
              <p className="text-sm font-semibold text-gray-600">
                {teams[0]?.teamName}
              </p>
              <p className="text-2xl font-bold text-green-600">
                {teams[0]?.count} servers
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Average Filter Count
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {totalServers > 0
                  ? (
                      teams.reduce((sum, team) => sum + team.count, 0) /
                      totalServers
                    ).toFixed(1)
                  : "0.0"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// TeamsSection component for embedding in other pages
export function TeamsSection() {
  const [teams, setTeams] = useState<TeamFilterCount[]>([]);
  const [totalServers, setTotalServers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const servers = await api.getServers();
        const totalServersCount = servers.length;

        // Count how many times each team is filtered
        const teamCounts: { [key: string]: TeamFilterCount } = {};

        servers.forEach((server) => {
          server.filteredTeams.forEach((teamId) => {
            if (!teamCounts[teamId]) {
              teamCounts[teamId] = {
                teamId,
                teamName: getTeamName(teamId),
                count: 0,
                servers: [],
              };
            }
            teamCounts[teamId].count++;
            teamCounts[teamId].servers.push(server.guildId);
          });
        });

        // Convert to array and sort by count (most filtered first)
        const teamsArray = Object.values(teamCounts).sort(
          (a, b) => b.count - a.count
        );
        setTeams(teamsArray);
        setTotalServers(totalServersCount);
        setError(null);
      } catch (err) {
        setError("Failed to load teams");
        console.error("Error fetching teams:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Most Filtered Teams
      </h2>

      {teams.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          No teams are currently being filtered
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Team ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Filter Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Servers Using This Filter
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage of Servers
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teams.map((team, index) => (
                <tr key={team.teamId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {team.teamName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-500">
                    {team.teamId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {team.count} servers
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="flex flex-wrap gap-1">
                      {team.servers.slice(0, 3).map((serverId) => (
                        <span
                          key={serverId}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {serverId.slice(0, 8)}...
                        </span>
                      ))}
                      {team.servers.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                          +{team.servers.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {totalServers > 0
                      ? ((team.count / totalServers) * 100).toFixed(1)
                      : "0.0"}
                    %
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary Stats */}
      {teams.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Total Teams Filtered
            </h3>
            <p className="text-2xl font-bold text-blue-600">{teams.length}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Most Filtered Team
            </h3>
            <p className="text-sm font-semibold text-gray-600">
              {teams[0]?.teamName}
            </p>
            <p className="text-xl font-bold text-green-600">
              {teams[0]?.count} servers
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-1">
              Average Filter Count
            </h3>
            <p className="text-2xl font-bold text-purple-600">
              {totalServers > 0
                ? (
                    teams.reduce((sum, team) => sum + team.count, 0) /
                    totalServers
                  ).toFixed(1)
                : "0.0"}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
