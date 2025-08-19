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
  channelId: string;
  pingRoles: string[];
  filteredTeams: string[];
  enablePreMatchNotifications: boolean;
  enableScoreNotifications: boolean;
  enableUpdateNotifications: boolean;
}

export interface DashboardStats {
  totalServers: number;
  servers: GuildSettings[];
  totalMatches: number;
  matchesByStatus: Array<{
    status: string;
    _count: {
      status: number;
    };
  }>;
  configStats: {
    preMatchNotificationsEnabled: number;
    scoreNotificationsEnabled: number;
    updateNotificationsEnabled: number;
    serversWithFilteredTeams: number;
    totalFilteredTeams: number;
  };
  recentMatches: Match[];
  matchesByKcTeam: Array<{
    kcTeam: string;
    _count: {
      kcTeam: number;
    };
  }>;
  tickets: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
  };

  commandStats: {
    totalCommands: number;
    mostUsedCommand: string;
    averageResponseTime: number;
    successRate: number;
  };
  performanceMetrics: {
    averageResponseTime: number;
    successRate: number;
    totalErrors: number;
  };
}

export interface MatchesResponse {
  matches: Match[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
