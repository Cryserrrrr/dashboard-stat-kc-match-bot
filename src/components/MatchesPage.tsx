import { useState, useEffect } from "react";
import { api } from "../services/api";
import { Match } from "../types";
import { MatchCard } from "./MatchCard";
import { Calendar, Filter, Search } from "lucide-react";

interface MatchesResponse {
  matches: Match[];
  total: number;
  page: number;
  totalPages: number;
}

export function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMatches, setTotalMatches] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [kcTeamFilter, setKcTeamFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        const data: MatchesResponse = await api.getMatches(
          currentPage,
          statusFilter,
          kcTeamFilter
        );
        setMatches(data.matches);
        setTotalPages(data.totalPages);
        setTotalMatches(data.total);
        setError(null);
      } catch (err) {
        setError("Failed to load matches");
        console.error("Error fetching matches:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [currentPage, statusFilter, kcTeamFilter]);

  const filteredMatches = matches.filter((match) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      match.kcTeam.toLowerCase().includes(searchLower) ||
      match.opponent.toLowerCase().includes(searchLower) ||
      match.leagueName.toLowerCase().includes(searchLower) ||
      match.tournamentName.toLowerCase().includes(searchLower) ||
      (match.score && match.score.toLowerCase().includes(searchLower))
    );
  });

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const clearFilters = () => {
    setStatusFilter("");
    setKcTeamFilter("");
    setSearchTerm("");
    setCurrentPage(1);
  };

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
          <h1 className="text-3xl font-bold text-gray-900">Recent Matches</h1>
          <p className="text-gray-600 mt-2">
            View and filter all matches from the database
          </p>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-lg font-semibold text-gray-900">
                Total Matches: {totalMatches}
              </h2>
            </div>
          </div>
        </div>

        {/* Recent Matches Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Recent Matches
          </h2>
          {matches.slice(0, 6).length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No recent matches found
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.slice(0, 6).map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search matches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="pre-announced">Pre-announced</option>
              <option value="live">Live</option>
              <option value="finished">Finished</option>
              <option value="announced">Announced</option>
            </select>

            {/* KC Team Filter */}
            <select
              value={kcTeamFilter}
              onChange={(e) => setKcTeamFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All KC Teams</option>
              <option value="KC">KC (LEC)</option>
              <option value="KCB">KCB (LFL)</option>
              <option value="KCBS">KCBS (LFL2)</option>
              <option value="KC Valorant">KC Valorant</option>
              <option value="KCGC Valorant">KCGC Valorant</option>
              <option value="KCBS Valorant">KCBS Valorant</option>
              <option value="KC Rocket League">KC Rocket League</option>
            </select>

            {/* Results per page */}
            <div className="text-sm text-gray-500 flex items-center">
              <Filter className="h-4 w-4 mr-1" />
              Showing {filteredMatches.length} of {totalMatches} matches
            </div>
          </div>
        </div>

        {/* All Matches Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            All Matches
          </h2>

          {filteredMatches.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No matches found
              </h3>
              <p className="text-gray-500">
                {searchTerm || statusFilter || kcTeamFilter
                  ? "Try adjusting your filters"
                  : "No matches in the database"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMatches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    Showing page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page =
                        Math.max(1, Math.min(totalPages - 4, currentPage - 2)) +
                        i;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 py-2 text-sm font-medium rounded-md ${
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
