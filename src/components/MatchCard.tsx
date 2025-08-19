import { Match } from "../types";
import { cn } from "../utils/cn";

interface MatchCardProps {
  match: Match;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "finished":
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800";
    case "live":
    case "running":
      return "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800";
    case "scheduled":
    case "not_started":
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800";
    case "pre-announced":
    case "announced":
      return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800";
    case "canceled":
      return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600";
    default:
      return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600";
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function MatchCard({ match }: MatchCardProps) {
  return (
    <div className="bg-white dark:bg-brand-card rounded-xl shadow-sm border border-gray-200 dark:border-gray-600 p-4 transition-all duration-300 animate-fade-in">
      {/* Match Title - Single Line */}
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white text-lg truncate">
          {match.kcTeam} vs {match.opponent}
        </h3>
      </div>

      {/* Match Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">Tournament:</span>
          <span className="font-medium text-gray-900 dark:text-white truncate ml-2">
            {match.tournamentName}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">League:</span>
          <span className="font-medium text-gray-900 dark:text-white truncate ml-2">
            {match.leagueName}
          </span>
        </div>

        {match.score && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">Score:</span>
            <span className="font-bold text-lg text-brand-light dark:text-gray-300">
              {match.score}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-300">Games:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {match.numberOfGames}
          </span>
        </div>
      </div>

      {/* Status and Date Bar - Bottom */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-600">
        <span
          className={cn(
            "px-3 py-1 rounded-full text-xs font-medium border",
            getStatusColor(match.status)
          )}
        >
          {match.status.replace("_", " ").toUpperCase()}
        </span>
        <span className="text-xs text-gray-500 dark:text-white">
          {formatDate(match.beginAt)}
        </span>
      </div>
    </div>
  );
}
