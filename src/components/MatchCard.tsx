import { Match } from "../types";
import { cn } from "../utils/cn";

interface MatchCardProps {
  match: Match;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "finished":
      return "bg-green-100 text-green-800";
    case "live":
      return "bg-red-100 text-red-800";
    case "scheduled":
      return "bg-blue-100 text-blue-800";
    case "pre-announced":
      return "bg-yellow-100 text-yellow-800";
    default:
      return "bg-gray-100 text-gray-800";
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-gray-900">{match.kcTeam}</span>
            <span className="text-gray-500">vs</span>
            <span className="font-semibold text-gray-900">
              {match.opponent}
            </span>
          </div>
        </div>
        <span
          className={cn(
            "px-2 py-1 rounded-full text-xs font-medium",
            getStatusColor(match.status)
          )}
        >
          {match.status}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Tournament:</span>
          <span className="font-medium text-gray-900">
            {match.tournamentName}
          </span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">League:</span>
          <span className="font-medium text-gray-900">{match.leagueName}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Date:</span>
          <span className="font-medium text-gray-900">
            {formatDate(match.beginAt)}
          </span>
        </div>

        {match.score && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Score:</span>
            <span className="font-bold text-lg text-gray-900">
              {match.score}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Games:</span>
          <span className="font-medium text-gray-900">
            {match.numberOfGames}
          </span>
        </div>
      </div>
    </div>
  );
}
