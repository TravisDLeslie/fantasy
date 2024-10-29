// src/hooks/usePlayerTotalPoints.js

import { useState, useEffect } from 'react';
import { getLeagueMatchups, getWeeklyPlayerStats, getPlayersMetadata } from '../api/sleeperApi'; 

/**
 * Custom hook to fetch and aggregate player points per week.
 * Ensures data is fetched correctly by retrying if needed.
 */
const usePlayerTotalPoints = (leagueId, season = '2024') => {
  const [playerPoints, setPlayerPoints] = useState({}); // Store player points and weekly data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentRosterPlayers, setCurrentRosterPlayers] = useState(new Set()); // To store current roster player IDs

  // Helper: Fetch matchups for all weeks
  const fetchAllMatchups = async () => {
    try {
      const allMatchups = await Promise.all(
        Array.from({ length: 18 }, (_, i) => getLeagueMatchups(leagueId, i + 1))
      );
      return allMatchups;
    } catch (err) {
      console.error('Error fetching matchups:', err);
      throw new Error('Failed to fetch league matchups.');
    }
  };

  // Helper: Fetch all players' metadata
  const fetchAllPlayers = async () => {
    try {
      const playersMetadata = await getPlayersMetadata();
      return playersMetadata;
    } catch (err) {
      console.error('Error fetching players metadata:', err);
      throw new Error('Failed to fetch players metadata.');
    }
  };

  // Fetch all matchups and player stats
  const fetchData = async () => {
    try {
      console.log('Fetching all matchups, player stats, and players metadata...');

      const [allMatchups, allWeeklyStats, allPlayersMetadata] = await Promise.all([
        fetchAllMatchups(),
        getWeeklyPlayerStats(season),
        fetchAllPlayers(),
      ]);

      // Determine current roster players (from the latest week's matchups)
      const latestWeekMatchups = allMatchups[allMatchups.length - 1]; // Assuming last week is the latest
      const currentRosterSet = new Set();
      latestWeekMatchups.forEach(matchup => {
        matchup.players.forEach(playerId => currentRosterSet.add(playerId));
      });
      setCurrentRosterPlayers(currentRosterSet);

      // Aggregate points
      const aggregatedData = aggregatePlayerPoints(allWeeklyStats, allPlayersMetadata);
      setPlayerPoints(aggregatedData);
    } catch (err) {
      console.error('Error fetching player points:', err);
      setError('Failed to fetch player points. Retrying...');
      retryFetch();
    } finally {
      setLoading(false);
    }
  };

  // Retry fetching after a delay in case of errors
  const retryFetch = () => {
    setTimeout(() => {
      console.log('Retrying fetch...');
      fetchData();
    }, 3000);
  };

  /**
   * Aggregate all weekly stats to sum fantasy points per player.
   * Ensures all players have their total season points included.
   */
  const aggregatePlayerPoints = (weeklyStats, playersMetadata) => {
    const pointsData = {};

    // Process Weekly Stats: Sum fantasy points for each player across all weeks
    Object.entries(weeklyStats).forEach(([playerId, weeks]) => {
      if (!pointsData[playerId]) {
        pointsData[playerId] = { totalPoints: 0, weeklyPoints: {} };
      }

      Object.entries(weeks).forEach(([week, stats]) => {
        const weekNumber = parseInt(week, 10);
        const fantasyPoints = stats.fantasy_points || 0;

        pointsData[playerId].totalPoints += fantasyPoints;
        pointsData[playerId].weeklyPoints[weekNumber] = fantasyPoints;
      });
    });

    // Ensure all players from metadata are included, even if they have no points
    Object.keys(playersMetadata).forEach((playerId) => {
      if (!pointsData[playerId]) {
        pointsData[playerId] = { totalPoints: 0, weeklyPoints: {} };
      }
    });

    console.log('Aggregated Player Points:', pointsData);
    return pointsData;
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leagueId, season]);

  return { playerPoints, loading, error, currentRosterPlayers };
};

export default usePlayerTotalPoints;
