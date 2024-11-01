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


//** Fetch and aggregate player points for the entire season */
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
export const getSchedule = async (seasonType = 'regular', season = '2024') => {
  const url = `https://api.sleeper.com/schedule/nfl/${seasonType}/${season}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch schedule: ${response.statusText}`);
    }
    const data = await response.json();
    console.log('Fetched NFL Schedule:', data); // For debugging
    return data;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return []; // Return an empty array to prevent breaking the app
  }
};



export const getNFLState = async () => {
  const response = await fetch('https://api.sleeper.app/v1/state/nfl');
  if (!response.ok) {
    throw new Error('Failed to fetch NFL state');
  }
  return await response.json();
};


export const getPlayerStatsForWeek = async (week) => {
  try {
    const response = await axios.get(`https://api.sleeper.app/v1/stats/nfl/regular/${week}`);
    console.log('Raw Stats Response:', response.data); // Log the raw data
    return response.data;
  } catch (error) {
    console.error(`Error fetching player stats for week ${week}:`, error);
    return {};
  }
};

export const getAllPlayersStatsForWeek = async (week) => {
  try {
    const players = await getAllPlayers();
    const stats = await getPlayerStatsForWeek(week);

    console.log('Player Stats:', stats); // Inspect the structure

    return Object.keys(stats).map((playerId) => ({
      id: playerId,
      name: players[playerId]?.full_name || 'Unknown',
      position: players[playerId]?.position || 'N/A',
      team: players[playerId]?.team || 'N/A',
      stdPoints: stats[playerId]?.points?.standard || 0, // Adjust if necessary
      halfPprPoints: stats[playerId]?.points?.half_ppr || 0, // Adjust if necessary
      pprPoints: stats[playerId]?.points?.ppr || 0, // Adjust if necessary
    }));
  } catch (error) {
    console.error('Error fetching player stats for week:', error);
    return [];
  }
};



export const getStatsForPlayers = async (playerIds = [], season = '2024', week) => {
  try {
    if (!Array.isArray(playerIds)) {
      console.error('playerIds must be an array');
      return [];  // Return an empty array if playerIds is not an array
    }

    const stats = await Promise.all(
      playerIds.map(async (playerId) => {
        const response = await axios.get(
          `${BASE_URL}/stats/nfl/player/${playerId}?season=${season}&season_type=regular&grouping=week`
        );
        console.log(`Stats for player ${playerId}:`, response.data[week] || {});
        return { playerId, stats: response.data[week] || {} };
      })
    );

    return stats;
  } catch (error) {
    console.error(`Error fetching stats for players:`, error);
    return [];
  }
};

export const fetchLeagueScoringSettings = async (leagueId) => {
  try {
    const response = await axios.get(`https://api.sleeper.app/v1/league/${leagueId}`);
    console.log("Raw Scoring Settings Response:", response.data); // Confirm the structure and values
    return response.data.scoring_settings; 
  } catch (error) {
    console.error("Error fetching league scoring settings:", error);
    return null;
  }
};
