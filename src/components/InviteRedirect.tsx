import { useEffect } from "react";

export const InviteRedirect = () => {
  useEffect(() => {
    const discordInviteUrl =
      "https://discord.com/oauth2/authorize?client_id=1399421859694510140&permissions=414733297856&integration_type=0&scope=bot+applications.commands";
    window.location.href = discordInviteUrl;
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Discord...</p>
      </div>
    </div>
  );
};
