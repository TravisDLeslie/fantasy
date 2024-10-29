// src/hooks/usePlayerTotalPoints.js

import { useState, useEffect, useCallback } from 'react';
import { 
  getLeagueMatchups, 
  getWeeklyPlayerStats, 
  getPlayersMetadata,
  getLeagueRosters
} from '../api/sleeperApi'; 

/**
 * Custom hook to fetch and aggregate player points per week.
 * Includes all players, whether they're on rosters or not.
 * 
 * @param {string} leagueId - The ID of the Sleeper league.
 * @param {string} season - The season year (default is '2024').
 * @param {number} maxRetries - Maximum number of retry attempts (default is 3).
 * @returns {Object} - Contains allPlayerPoints, rosterPlayerPoints, loading status, and error message.
 */
const usePlayerTotalPoints = (leagueId, season = '2024', maxRetries = 3) => {
  const [allPlayerPoints, setAllPlayerPoints] = useState({}); // All players' points and weekly data
  const [rosterPlayerPoints, setRosterPlayerPoints] = useState({}); // Only roster players' points
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch matchups for all weeks
   */
  const fetchAllMatchups = useCallback(async () => {
    try {
      const totalWeeks = 18; // Adjust based on league settings
      const allMatchups = await Promise.all(
        Array.from({ length: totalWeeks }, (_, i) => getLeagueMatchups(leagueId, i + 1))
      );
      return allMatchups; // Array of matchups per week
    } catch (err) {
      console.error('Error fetching matchups:', err);
      throw new Error('Failed to fetch league matchups.');
    }
  }, [leagueId]);

  /**
   * Fetch all rosters in the league
   */
  const fetchAllRosters = useCallback(async () => {
    try {
      const rosters = await getLeagueRosters(leagueId);
      return rosters; // Array of roster objects
    } catch (err) {
      console.error('Error fetching rosters:', err);
      throw new Error('Failed to fetch league rosters.');
    }
  }, [leagueId]);

  /**
   * Fetch all players' metadata
   */
  const fetchAllPlayers = useCallback(async () => {
    try {
      const playersMetadata = await getPlayersMetadata();
      return playersMetadata; // Object: { playerId: metadata, ... }
    } catch (err) {
      console.error('Error fetching players metadata:', err);
      throw new Error('Failed to fetch players metadata.');
    }
  }, []);

  /**
   * Fetch weekly player stats
   */
  const fetchWeeklyStats = useCallback(async () => {
    try {
      const weeklyStats = await getWeeklyPlayerStats(season);
      return weeklyStats; // Object: { playerId: { week: stats, ... }, ... }
    } catch (err) {
      console.error('Error fetching weekly player stats:', err);
      throw new Error('Failed to fetch weekly player stats.');
    }
  }, [season]);

  /**
   * Aggregate points for all players
   */
  const aggregateAllPlayerPoints = (weeklyStats, playersMetadata) => {
    const pointsData = {};

    // Process Weekly Stats: Sum fantasy points for each player across all weeks
    Object.entries(weeklyStats).forEach(([playerId, weeks]) => {
      const playerIdStr = String(playerId);
      if (!pointsData[playerIdStr]) {
        pointsData[playerIdStr] = { totalPoints: 0, weeklyPoints: {} };
      }

      Object.entries(weeks).forEach(([week, stats]) => {
        const weekNumber = parseInt(week, 10);
        const fantasyPoints = stats.fantasy_points || 0;

        pointsData[playerIdStr].totalPoints += fantasyPoints;
        pointsData[playerIdStr].weeklyPoints[weekNumber] = fantasyPoints;
      });
    });

    // Ensure all players from metadata are included, even if they have no points
    Object.keys(playersMetadata).forEach((playerId) => {
      const playerIdStr = String(playerId);
      if (!pointsData[playerIdStr]) {
        pointsData[playerIdStr] = { totalPoints: 0, weeklyPoints: {} };
      }
    });

    console.log('Aggregated All Player Points:', pointsData);
    return pointsData;
  };

  /**
   * Aggregate points for roster players
   */
  const aggregateRosterPlayerPoints = (allMatchups, allRosters, allPlayerPoints) => {
    const rosterSet = new Set();

    // Collect players from all matchups
    allMatchups.forEach((weeklyMatchups) => {
      weeklyMatchups.forEach((matchup) => {
        if (matchup.players && Array.isArray(matchup.players)) {
          matchup.players.forEach((playerId) => rosterSet.add(String(playerId)));
        }
      });
    });

    // Additionally, collect players from all current rosters to ensure inclusion
    allRosters.forEach((roster) => {
      if (roster.players && Array.isArray(roster.players)) {
        roster.players.forEach((playerId) => rosterSet.add(String(playerId)));
      }
    });

    console.log('All Roster Players:', Array.from(rosterSet));

    // Now, extract points for roster players
    const rosterPoints = {};
    rosterSet.forEach((playerId) => {
      if (allPlayerPoints[playerId]) {
        rosterPoints[playerId] = allPlayerPoints[playerId];
      }
    });

    console.log('Aggregated Roster Player Points:', rosterPoints);
    return rosterPoints;
  };

  /**
   * Retry fetching data with exponential backoff
   */
  const retryFetch = async (fetchFunction, retriesLeft, delay) => {
    try {
      await fetchFunction();
    } catch (err) {
      if (retriesLeft === 0) {
        setError('Failed to fetch player points after multiple attempts.');
        setLoading(false);
      } else {
        console.warn(`Retrying fetch in ${delay}ms... (${retriesLeft} retries left)`);
        setTimeout(() => {
          retryFetch(fetchFunction, retriesLeft - 1, delay * 2); // Exponential backoff
        }, delay);
      }
    }
  };

  /**
   * Fetch all data and aggregate points
   */
  const fetchData = useCallback(async () => {
    try {
      console.log('Fetching all matchups, rosters, player stats, and players metadata...');

      // Fetch all data concurrently
      const [allMatchups, weeklyStats, playersMetadata, allRosters] = await Promise.all([
        fetchAllMatchups(),
        fetchWeeklyStats(),
        fetchAllPlayers(),
        fetchAllRosters(),
      ]);

      // Aggregate points for all players
      const aggregatedAllPlayerPoints = aggregateAllPlayerPoints(weeklyStats, playersMetadata);
      setAllPlayerPoints(aggregatedAllPlayerPoints);

      // Aggregate points for roster players
      const aggregatedRosterPoints = aggregateRosterPlayerPoints(allMatchups, allRosters, aggregatedAllPlayerPoints);
      setRosterPlayerPoints(aggregatedRosterPoints);
    } catch (err) {
      console.error('Error fetching player points:', err);
      setError('Failed to fetch player points. Retrying...');
      retryFetch(fetchData, maxRetries - 1, 1000); // Initial delay 1 second
    } finally {
      setLoading(false);
    }
  }, [fetchAllMatchups, fetchWeeklyStats, fetchAllPlayers, fetchAllRosters, maxRetries]);

  // Fetch data when leagueId or season changes
  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueId, season]);

  return { allPlayerPoints, rosterPlayerPoints, loading, error };
};

export default usePlayerTotalPoints;
