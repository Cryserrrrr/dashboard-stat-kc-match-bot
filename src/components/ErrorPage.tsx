import { useEffect } from "react";
import { XCircle } from "lucide-react";

export function ErrorPage() {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");

    if (!error) {
      window.location.href = "/";
      return;
    }
  }, []);

  const getErrorMessage = (error: string) => {
    switch (error) {
      case "no_code":
        return "No authorization code received.";
      case "config_error":
        return "Server configuration error.";
      case "token_exchange_failed":
        return "Failed to authenticate with Discord.";
      case "user_fetch_failed":
        return "Failed to fetch user information.";
      case "unauthorized":
        return "Access denied. You are not authorized to access this dashboard.";
      case "auth_failed":
        return "Authentication failed. Please try again.";
      case "code_already_used":
        return "Authorization code already used. Please try logging in again.";
      default:
        return "Authentication failed. Please try again.";
    }
  };

  const isUnauthorizedError = (error: string) => {
    return error === "unauthorized";
  };

  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get("error") || "";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {isUnauthorizedError(error)
                ? "Access Denied"
                : "Authentication Failed"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {getErrorMessage(error)}
            </p>
            {!isUnauthorizedError(error) && (
              <button
                onClick={() => (window.location.href = "/")}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
