// src/api/sleeperAPI.js
import axios from 'axios';

const BASE_URL = 'https://api.sleeper.app/v1';

/**
 * Fetch league information by league ID.
 * @param {string} leagueId - The ID of the league.
 */
export const getLeagueInfo = async (leagueId) => {
  try {
    const response = await axios.get(`${BASE_URL}/league/${leagueId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching league info:', error);
    throw error;
  }
};

/**
 * Fetch users (owners) in the league.
 * @param {string} leagueId - The ID of the league.
 */
export const getLeagueUsers = async (leagueId) => {
  try {
    const response = await axios.get(`${BASE_URL}/league/${leagueId}/users`);
    return response.data;
  } catch (error) {
    console.error('Error fetching league users:', error);
    throw error;
  }
};

/**
 * Fetch rosters in the league.
 * @param {string} leagueId - The ID of the league.
 */
export const getLeagueRosters = async (leagueId) => {
  try {
    const response = await axios.get(`${BASE_URL}/league/${leagueId}/rosters`);
    return response.data;
  } catch (error) {
    console.error('Error fetching league rosters:', error);
    throw error;
  }
};

/**
 * Fetch metadata for all NFL players.
 * This will return a large object where the key is the player ID.
 */
export const getPlayersMetadata = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/players/nfl`);
    return response.data;
  } catch (error) {
    console.error('Error fetching players metadata:', error);
    throw error;
  }
};


/**
 * Fetch cumulative stats for all players this season.
 * @param {string} season - The year of the season (e.g., '2024').
 */
export const getPlayerStats = async (season = '2024') => {
    try {
      const response = await axios.get(`${BASE_URL}/stats/nfl/regular/${season}?grouping=season`);
      return response.data;
    } catch (error) {
      console.error('Error fetching player stats:', error);
      throw error;
    }
  };

  export const getWeeklyPlayerStats = async (season = '2024') => {
    try {
      const response = await axios.get(`${BASE_URL}/stats/nfl/regular/${season}?grouping=week`);
      const data = response.data;
  
      // Flatten the data for easy access: { playerId: { week: points } }
      const formattedStats = {};
      Object.entries(data).forEach(([playerId, stats]) => {
        formattedStats[playerId] = stats.reduce((acc, weekStats) => {
          acc[weekStats.week] = weekStats.points || 0;
          return acc;
        }, {});
      });
  
      return formattedStats;
    } catch (error) {
      console.error('Error fetching weekly player stats:', error);
      return {};
    }
  };
  


  /**
 * Fetch weekly matchups for a league.
 */
  export const getLeagueMatchups = async (leagueId, week) => {
    try {
      const response = await axios.get(`${BASE_URL}/league/${leagueId}/matchups/${week}`);
      console.log(`Week ${week} Matchups Response:`, response.data);
  
      if (!response.data || response.data.length === 0) {
        console.warn(`No matchups found for week ${week}. Returning empty matchups.`);
        return []; // Ensure we return an empty array for consistency
      }
      return response.data;
    } catch (error) {
      console.error(`Error fetching matchups for week ${week}:`, error);
      return []; // Return empty array on error to avoid breaking the loop
    }
  };
  

  export const getWeekStats = async (season, week) => {
    try {
      const response = await fetch(
        `https://api.sleeper.app/v1/stats/nfl/${season}/${week}`
      );
      if (!response.ok) throw new Error('Failed to fetch stats');
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching week stats:', error);
      return {};
    }
  };


  /**
 * Fetch and aggregate total points for all players in a league.
 * @param {string} leagueId - The ID of the league.
 * @returns {object} An object with player points and their weekly breakdown.
 */
export const getAllPlayerPoints = async (leagueId) => {
  try {
    // Fetch all 17 weeks of matchups in parallel
    const allMatchups = await Promise.all(
      Array.from({ length: 17 }, (_, i) =>
        axios.get(`${BASE_URL}/league/${leagueId}/matchups/${i + 1}`).then((res) => res.data).catch(() => [])
      )
    );

    console.log('Fetched all matchups:', allMatchups);

    // Initialize an object to store player points
    const playerPoints = {};

    // Iterate through each week's matchups
    allMatchups.forEach((weekMatchups, weekIndex) => {
      weekMatchups.forEach((matchup) => {
        const { players = [], players_points = {} } = matchup;

        // Process each player in the matchup
        players.forEach((playerId) => {
          // Initialize player entry if not already present
          if (!playerPoints[playerId]) {
            playerPoints[playerId] = { totalPoints: 0, weeklyPoints: {} };
          }

          // Get the player's points for the current week or default to 0
          const weekPoints = players_points[playerId] || 0;

          // Accumulate total points and store the weekly breakdown
          playerPoints[playerId].totalPoints += weekPoints;
          playerPoints[playerId].weeklyPoints[weekIndex + 1] = weekPoints;
        });
      });
    });

    console.log('Aggregated player points:', playerPoints);

    return playerPoints;
  } catch (error) {
    console.error('Error fetching player points:', error);
    throw new Error('Failed to fetch player points.');
  }
};


export const getPlayerMatchupStats = async (season, week) => {
  try {
    const response = await axios.get(`${BASE_URL}/stats/nfl/${season}/${week}`);
    console.log(`Week ${week} stats:`, response.data); // Log the full response
    return response.data;
  } catch (error) {
    console.error(`Error fetching stats for week ${week}:`, error);
    return {};
  }
};
