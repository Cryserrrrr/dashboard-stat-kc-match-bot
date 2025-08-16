import {
  DashboardStats,
  GuildSettings,
  MatchesResponse,
  CommandStatsResponse,
  TicketsResponse,
  TeamPopularity,
  Ticket,
} from "../types";

const API_BASE = "/api";

export const api = {
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/health`);
      return response.ok;
    } catch {
      return false;
    }
  },

  async getStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE}/stats`);
    if (!response.ok) {
      throw new Error("Failed to fetch stats");
    }
    return response.json();
  },

  async getServers(): Promise<GuildSettings[]> {
    const response = await fetch(`${API_BASE}/servers`);
    if (!response.ok) {
      throw new Error("Failed to fetch servers");
    }
    return response.json();
  },

  async getMatches(
    page: number = 1,
    status?: string,
    kcTeam?: string
  ): Promise<MatchesResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    if (status) params.append("status", status);
    if (kcTeam) params.append("kcTeam", kcTeam);

    const response = await fetch(`${API_BASE}/matches?${params}`);
    if (!response.ok) {
      throw new Error("Failed to fetch matches");
    }
    return response.json();
  },

  async getCommandStats(
    page: number = 1,
    guildId?: string
  ): Promise<CommandStatsResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    if (guildId) params.append("guildId", guildId);

    const response = await fetch(`${API_BASE}/command-stats?${params}`);
    if (!response.ok) {
      throw new Error("Failed to fetch command stats");
    }
    return response.json();
  },

  async getTickets(
    page: number = 1,
    status?: string,
    guildId?: string
  ): Promise<TicketsResponse> {
    const params = new URLSearchParams();
    params.append("page", page.toString());
    if (status) params.append("status", status);
    if (guildId) params.append("guildId", guildId);

    const response = await fetch(`${API_BASE}/tickets?${params}`);
    if (!response.ok) {
      throw new Error("Failed to fetch tickets");
    }
    return response.json();
  },

  async getTeamPopularity(): Promise<TeamPopularity[]> {
    const response = await fetch(`${API_BASE}/team-popularity`);
    if (!response.ok) {
      throw new Error("Failed to fetch team popularity");
    }
    return response.json();
  },

  async getPerformanceMetrics(guildId?: string): Promise<any> {
    const params = new URLSearchParams();
    if (guildId) params.append("guildId", guildId);

    const response = await fetch(`${API_BASE}/performance-metrics?${params}`);
    if (!response.ok) {
      throw new Error("Failed to fetch performance metrics");
    }
    return response.json();
  },

  async getTicketById(ticketId: string): Promise<Ticket> {
    const response = await fetch(`${API_BASE}/tickets/${ticketId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch ticket");
    }
    return response.json();
  },

  async updateTicketStatus(ticketId: string, status: string): Promise<Ticket> {
    const response = await fetch(`${API_BASE}/tickets/${ticketId}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      throw new Error("Failed to update ticket status");
    }
    return response.json();
  },

  async addTicketResponse(ticketId: string, response: string): Promise<any> {
    const apiResponse = await fetch(`${API_BASE}/tickets/${ticketId}/respond`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ response }),
    });
    if (!apiResponse.ok) {
      throw new Error("Failed to add ticket response");
    }
    return apiResponse.json();
  },

  async getCurrentUser(): Promise<any> {
    const response = await fetch(`${API_BASE}/auth/me`, {
      credentials: "include",
    });
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Not authenticated");
      }
      throw new Error(`Failed to get user: ${response.status}`);
    }
    return response.json();
  },

  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    if (!response.ok) {
      throw new Error("Failed to logout");
    }
  },
};
