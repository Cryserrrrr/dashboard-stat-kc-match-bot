import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { CheckCircle } from "lucide-react";

export function AuthCallback() {
  const [status, setStatus] = useState<"loading" | "success">("loading");
  const [message, setMessage] = useState("");
  const { checkAuth } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (!code) {
        window.location.href = "/error?error=no_code";
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
          window.location.href = "/error?error=auth_failed";
          return;
        }

        await checkAuth();
        setStatus("success");
        setMessage("Authentication successful! Redirecting...");

        setTimeout(() => {
          window.location.href = "/";
        }, 1500);
      } catch (error) {
        window.location.href = "/error?error=auth_failed";
      }
    };

    handleCallback();
  }, [checkAuth]);

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
          </div>
        </div>
      </div>
    </div>
  );
}
