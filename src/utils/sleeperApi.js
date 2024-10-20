// utils/sleeperApi.js
export const fetchLeagueData = async (leagueId) => {
    const leagueInfo = await fetch(`https://api.sleeper.app/v1/league/${leagueId}`).then((res) =>
      res.json()
    );
  
    const users = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`).then((res) =>
      res.json()
    );
  
    const rosters = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`).then((res) =>
      res.json()
    );
  
    return { leagueInfo, users, rosters };
  };
  