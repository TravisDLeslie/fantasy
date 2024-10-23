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
      const response = await axios.get(
        `https://api.sleeper.app/v1/stats/nfl/regular/${season}?grouping=week`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching weekly player stats:', error);
      throw error;
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
        console.warn(`No matchups found for week ${week}. Returning empty array.`);
        return [];
      }
  
      return response.data;
    } catch (error) {
      console.error(`Error fetching matchups for week ${week}:`, error);
      return []; // Ensure we return an empty array to prevent breaking the loop
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