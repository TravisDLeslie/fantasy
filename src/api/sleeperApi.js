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
/** Fetch player stats for a specific week and season */
export const getPlayerStats = async (season, week) => {
  try {
    const response = await fetch(`https://api.sleeper.app/v1/stats/nfl/regular/${season}/${week}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch player stats for week ${week}`);
    }
    const data = await response.json();
    return data; // Returns an object with player IDs as keys and their stats as values
  } catch (error) {
    console.error(`Error fetching player stats for week ${week}:`, error);
    return {}; // Return an empty object in case of error to prevent crashes
  }
};

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
  try {
    const response = await axios.get(`${BASE_URL}/league/${leagueId}/matchups/${week}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch matchups for week ${week}:`, error);
    return null; // Return null or an empty array to avoid breaking the loop
  }
};


/** Fetch and aggregate player points for a league */
export const getAllPlayerPoints = async (leagueId, season = '2024') => {
  try {
    // Define the number of weeks (adjust if necessary)
    const totalWeeks = 17; // Example for a 17-week season

    // Fetch all matchups for each week in parallel (for roster info)
    const allMatchups = await Promise.all(
      Array.from({ length: totalWeeks }, (_, i) =>
        getLeagueMatchups(leagueId, i + 1)
      )
    );

    // Fetch all NFL players (including free agents)
    const allPlayers = await getAllPlayers();

    // Fetch all weekly player stats
    const allWeeklyStats = await getWeeklyPlayerStats(season);

    console.log('Fetched all matchups:', allMatchups);
    console.log('Fetched all weekly player stats:', allWeeklyStats);

    // Initialize player points object
    const playerPoints = {};

    // Process Weekly Stats: Sum points from weekly stats
    Object.entries(allWeeklyStats).forEach(([playerId, stats]) => {
      if (!playerPoints[playerId]) {
        playerPoints[playerId] = { totalPoints: 0, weeklyPoints: {} };
      }

      Object.entries(stats.weeklyPoints).forEach(([week, points]) => {
        const weekNumber = parseInt(week, 10);
        playerPoints[playerId].totalPoints += points;
        playerPoints[playerId].weeklyPoints[weekNumber] = points;
      });
    });

    // Ensure all players from metadata are included, even if they have no points
    Object.keys(allPlayers).forEach((playerId) => {
      const playerIdStr = String(playerId);
      if (!playerPoints[playerIdStr]) {
        playerPoints[playerIdStr] = { totalPoints: 0, weeklyPoints: {} };
      }
    });

    console.log('Aggregated player points:', playerPoints);
    return playerPoints;
  } catch (error) {
    console.error('Error fetching player points:', error);
    throw new Error('Failed to fetch player points.');
  }
};

const fetchAllPlayers = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/players/nfl`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all players:', error);
    throw error;
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
/** Fetch NFL schedule for all teams */
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

