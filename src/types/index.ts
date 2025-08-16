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
