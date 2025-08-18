// Team data from the bot
export const teamOptions = [
  {
    id: "134078",
    name: "KC (LEC)",
    description: "Équipe principale League of Legends",
  },
  {
    id: "128268",
    name: "KCB (LFL)",
    description: "Équipe académique League of Legends",
  },
  {
    id: "136080",
    name: "KCBS (LFL2)",
    description: "Équipe LFL2 League of Legends",
  },
  {
    id: "130922",
    name: "KC Valorant",
    description: "Équipe principale Valorant",
  },
  {
    id: "132777",
    name: "KCGC Valorant",
    description: "Équipe féminine Valorant",
  },
  {
    id: "136165",
    name: "KCBS Valorant",
    description: "Équipe KCBS Valorant",
  },
  {
    id: "129570",
    name: "KC Rocket League",
    description: "Équipe Rocket League",
  },
];

// Helper function to get team name by ID
export const getTeamName = (teamId: string): string => {
  const team = teamOptions.find((t) => t.id === teamId);
  return team ? team.name : teamId;
};

// Helper function to get team by ID
export const getTeamById = (teamId: string) => {
  return teamOptions.find((t) => t.id === teamId);
};

// Helper function to get team by name
export const getTeamByName = (teamName: string) => {
  return teamOptions.find((t) => t.name === teamName);
};
