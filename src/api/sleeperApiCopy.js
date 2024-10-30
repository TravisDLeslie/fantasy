// src/api/sleeperAPI.js
import axios from "axios";

const BASE_URL = "https://api.sleeper.app";

/**
 * Fetch league information by league ID to get scoring settings.
 * @param {string} leagueId - The ID of the league.
 */
export const getLeagueInfo = async (leagueId) => {
  try {
    console.log(`Fetching league info from URL: ${BASE_URL}/league/${leagueId}`);
    const response = await axios.get(`${BASE_URL}/league/${leagueId}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      // Server responded with a status outside of the 2xx range
      console.error("Error fetching league info - Response data:", error.response.data);
      console.error("Status:", error.response.status);
      console.error("Headers:", error.response.headers);
    } else if (error.request) {
      // Request was made but no response was received
      console.error("Error fetching league info - No response received:", error.request);
    } else {
      // Something else happened
      console.error("Error fetching league info - Setup problem:", error.message);
    }
    throw error; // Re-throw the error after logging details
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
    console.error("Error fetching league users:", error);
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
    console.error("Error fetching league rosters:", error);
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
    console.error("Error fetching players metadata:", error);
    throw error;
  }
};

/**
 * Fetch cumulative stats for all players this season.
 * @param {string} season - The year of the season (e.g., '2024').
 */
export const getPlayerStats = async (season = "2024", player) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/stats/nfl/player/${player}/regular/${season}?grouping=season`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching player stats:", error);
    throw error;
  }
};

export const getWeeklyPlayerStats_ = async (season = "2024", player) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/stats/nfl/player/${player}?season_type=regular&season=${season}&grouping=week`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching weekly player stats:", error);
    throw error;
  }
};

