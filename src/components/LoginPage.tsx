import { MessageCircle } from "lucide-react";

export function LoginPage() {
  const handleDiscordLogin = () => {
    const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_DISCORD_REDIRECT_URI;

    const scope = "identify";

    const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&response_type=code&scope=${scope}`;

    window.location.href = authUrl;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Dashboard Access
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in with Discord to access the dashboard
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="space-y-6">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Authentication Required
              </h3>
              <p className="text-sm text-gray-500">
                Only authorized users can access this dashboard. Please sign in
                with your Discord account.
              </p>
            </div>

            <button
              onClick={handleDiscordLogin}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              Sign in with Discord
            </button>

            <div className="text-center">
              <p className="text-xs text-gray-400">
                By signing in, you agree to our terms of service and privacy
                policy.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
