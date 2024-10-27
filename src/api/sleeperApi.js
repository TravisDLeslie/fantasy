import axios from 'axios';

const BASE_URL = 'https://api.sleeper.app/v1';

/**
 * Helper function to fetch data with error handling.
 */
const fetchData = async (url, fallback = {}) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return fallback;
  }
};

/** Fetch league information */
export const getLeagueInfo = (leagueId) =>
  fetchData(`${BASE_URL}/league/${leagueId}`);

/** Fetch all NFL players metadata */
export const getAllPlayers = () =>
  fetchData(`${BASE_URL}/players/nfl`);

/** Fetch league users (owners) */
export const getLeagueUsers = (leagueId) =>
  fetchData(`${BASE_URL}/league/${leagueId}/users`);

/** Fetch league rosters */
export const getLeagueRosters = (leagueId) =>
  fetchData(`${BASE_URL}/league/${leagueId}/rosters`);

/** Fetch player metadata */
export const getPlayersMetadata = () =>
  fetchData(`${BASE_URL}/players/nfl`);

/** Fetch season cumulative stats */
export const getPlayerStats = (season = '2024') =>
  fetchData(`${BASE_URL}/stats/nfl/regular/${season}?grouping=season`);

/** Fetch weekly player stats and flatten them */
export const getWeeklyPlayerStats = async (season = '2024') => {
  const data = await fetchData(`${BASE_URL}/stats/nfl/regular/${season}?grouping=week`, {});

  const formattedStats = {};
  Object.entries(data).forEach(([playerId, stats]) => {
    formattedStats[playerId] = stats.reduce((acc, weekStats) => {
      acc[weekStats.week] = weekStats.points || 0;
      return acc;
    }, {});
  });

  return formattedStats;
};

/** Fetch matchups for a specific week */
export const getLeagueMatchups = async (leagueId, week) => {
  const response = await fetch(
    `https://api.sleeper.app/v1/league/${leagueId}/matchups/${week}`
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch matchups for week ${week}`);
  }
  return await response.json();
};

/** Fetch and aggregate player points for a league */
export const getAllPlayerPoints = async (leagueId) => {
  try {
    // Fetch all 17 weeks of matchups in parallel
    const allMatchups = await Promise.all(
      Array.from({ length: 17 }, (_, i) =>
        fetchData(`${BASE_URL}/league/${leagueId}/matchups/${i + 1}`, [])
      )
    );

    // Fetch all NFL players (including free agents)
    const allPlayers = await getAllPlayers();

    console.log('Fetched all matchups:', allMatchups);

    // Initialize player points object
    const playerPoints = {};

    // Process all matchups
    allMatchups.forEach((weekMatchups, weekIndex) => {
      weekMatchups.forEach(({ players = [], players_points = {} }) => {
        players.forEach((playerId) => {
          if (!playerPoints[playerId]) {
            playerPoints[playerId] = { totalPoints: 0, weeklyPoints: {} };
          }
          const weekPoints = players_points[playerId] || 0;
          playerPoints[playerId].totalPoints += weekPoints;
          playerPoints[playerId].weeklyPoints[weekIndex + 1] = weekPoints;
        });
      });
    });

    // Ensure free agents with no matchups are included
    Object.keys(allPlayers).forEach((playerId) => {
      if (!playerPoints[playerId]) {
        playerPoints[playerId] = { totalPoints: 0, weeklyPoints: {} };
      }
    });

    console.log('Aggregated player points:', playerPoints);
    return playerPoints;
  } catch (error) {
    console.error('Error fetching player points:', error);
    throw new Error('Failed to fetch player points.');
  }
};

/** Fetch detailed stats for a specific player matchup */
export const getPlayerMatchupStats = async (season, week) => {
  try {
    const data = await fetchData(`${BASE_URL}/stats/nfl/${season}/${week}`, {});
    console.log(`Week ${week} stats:`, data);

    if (!data || Object.keys(data).length === 0) {
      console.warn(`No stats found for season ${season}, week ${week}.`);
      return {};
    }

    return data;
  } catch (error) {
    console.error(`Error fetching stats for season ${season}, week ${week}:`, error);
    return {}; // Return an empty object to avoid breaking the app
  }
};

/** Fetch NFL schedule for all teams (if available) */
export const getSchedule = async (season = '2024') => {
  const data = await fetchData(`${BASE_URL}/nfl/schedule/${season}`, []);
  console.log('Fetched NFL Schedule:', data); // For debugging
  return data;
};


export const getNFLState = async () => {
  const response = await fetch('https://api.sleeper.app/v1/state/nfl');
  if (!response.ok) {
    throw new Error('Failed to fetch NFL state');
  }
  return await response.json();
};
