import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { CheckCircle, XCircle } from "lucide-react";

export function AuthCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const { checkAuth } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const error = urlParams.get("error");
      const success = urlParams.get("success");
      const token = urlParams.get("token");

      if (error) {
        setStatus("error");
        setMessage(getErrorMessage(error));
        return;
      }

      if (success === "true" && token) {
        await checkAuth();
        setStatus("success");
        setMessage("Authentication successful! Redirecting...");

        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
        return;
      }

      // If we have success=true but no token, it means we were redirected from server
      if (success === "true") {
        await checkAuth();
        setStatus("success");
        setMessage("Authentication successful! Redirecting...");

        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
        return;
      }

      if (!code) {
        setStatus("error");
        setMessage("No authorization code received.");
        return;
      }

      try {
        const response = await fetch("/api/auth/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to authenticate");
        }

        await checkAuth();
        setStatus("success");
        setMessage("Authentication successful! Redirecting...");

        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } catch (error) {
        setStatus("error");
        setMessage("Authentication failed. Please try again.");
      }
    };

    handleCallback();
  }, [checkAuth]);

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
      default:
        return "Authentication failed. Please try again.";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="text-center">
            {status === "loading" && (
              <>
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Authenticating...
                </h3>
                <p className="text-sm text-gray-500">
                  Please wait while we verify your Discord account.
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Success!
                </h3>
                <p className="text-sm text-gray-500">{message}</p>
              </>
            )}

            {status === "error" && (
              <>
                <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Authentication Failed
                </h3>
                <p className="text-sm text-gray-500 mb-4">{message}</p>
                <button
                  onClick={() => (window.location.href = "/")}
                  className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
