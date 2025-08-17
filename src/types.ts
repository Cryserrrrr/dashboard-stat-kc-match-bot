export interface Match {
  id: string;
  kcTeam: string;
  kcId: string;
  opponent: string;
  opponentImage?: string;
  leagueName: string;
  leagueImage?: string;
  serieName: string;
  tournamentName: string;
  tournamentId?: string;
  hasBracket: boolean;
  numberOfGames: number;
  beginAt: string;
  status: string;
  score?: string;
  createdAt: string;
}

export interface GuildSettings {
  guildId: string;
  name: string;
  memberCount: number;
  channelId: string;
  pingRoles: string[];
  filteredTeams: string[];
  enablePreMatchNotifications: boolean;
  enableScoreNotifications: boolean;
  joinedAt: string;
  updatedAt: string;
}

export interface CommandStat {
  id: string;
  guildId: string;
  commandName: string;
  userId: string;
  username: string;
  teamArg?: string;
  executedAt: string;
}

export interface Ticket {
  id: string;
  guildId: string;
  userId: string;
  username: string;
  type: "BUG" | "IMPROVEMENT";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  description?: string;
  answer?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PerformanceMetric {
  id: string;
  guildId?: string;
  commandName: string;
  responseTime: number;
  success: boolean;
  errorMessage?: string;
  executedAt: string;
}

export interface TeamPopularity {
  id: string;
  teamId: string;
  teamName: string;
  usageCount: number;
  lastUsed: string;
}

export interface DashboardStats {
  totalServers: number;
  totalMatches: number;
  totalMembers: number;
  matchesByStatus: { name: string; value: number }[];
  matchesByKcTeam: { name: string; value: number }[];
  configStats: {
    preMatchNotificationsEnabled: number;
    scoreNotificationsEnabled: number;
    serversWithFilteredTeams: number;
  };
  recentMatches: Match[];
  commandStats: {
    totalCommands: number;
    mostUsedCommand: string;
    averageResponseTime: number;
    successRate: number;
  };
  teamPopularity: TeamPopularity[];
  performanceMetrics: {
    averageResponseTime: number;
    successRate: number;
    totalErrors: number;
  };
  tickets: {
    total: number;
    open: number;
    resolved: number;
  };
}

export interface MatchesResponse {
  matches: Match[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CommandStatsResponse {
  commands: CommandStat[];
  total: number;
  page: number;
  totalPages: number;
}

export interface TicketsResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  totalPages: number;
}
