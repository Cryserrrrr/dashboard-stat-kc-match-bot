// Team data from the bot
export const teamOptions = [
  {
    id: "134078",
    name: "KC (LEC)",
    description: "Équipe principale League of Legends",
    color: "#1ea3cf",
  },
  {
    id: "128268",
    name: "KCB (LFL)",
    description: "Équipe académique League of Legends",
    color: "#f07855",
  },
  {
    id: "136080",
    name: "KCBS (LFL2)",
    description: "Équipe LFL2 League of Legends",
    color: "#de2db8",
  },
  {
    id: "130922",
    name: "KC Valorant",
    description: "Équipe principale Valorant",
    color: "#d13639",
  },
  {
    id: "132777",
    name: "KCGC Valorant",
    description: "Équipe féminine Valorant",
    color: "#de9602",
  },
  {
    id: "136165",
    name: "KCBS Valorant",
    description: "Équipe KCBS Valorant",
    color: "#ffd34e",
  },
  {
    id: "129570",
    name: "KC Rocket League",
    description: "Équipe Rocket League",
    color: "#39b3ce",
  },
];

export const getTeamName = (teamId: string): string => {
  const team = teamOptions.find((t) => t.id === teamId);
  return team ? team.name : teamId;
};

export const getTeamById = (teamId: string) => {
  return teamOptions.find((t) => t.id === teamId);
};

export const getTeamByName = (teamName: string) => {
  return teamOptions.find((t) => t.name === teamName);
};
