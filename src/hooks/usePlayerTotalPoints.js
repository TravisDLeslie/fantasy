import { useState, useEffect } from 'react';
import { getLeagueMatchups, getWeeklyPlayerStats } from '../api/sleeperApi'; 

/**
 * Custom hook to fetch and aggregate player points per week.
 * Ensures data is fetched correctly by retrying if needed.
 */
const usePlayerTotalPoints = (leagueId, season = '2024') => {
  const [playerPoints, setPlayerPoints] = useState({}); // Store player points and weekly data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // Fetch all matchups and player stats
  const fetchData = async () => {
    try {
      console.log('Fetching all matchups and player stats...');

      const [allMatchups, allWeeklyStats] = await Promise.all([
        fetchAllMatchups(),
        getWeeklyPlayerStats(season),
      ]);

      const aggregatedData = processMatchupsAndStats(allMatchups, allWeeklyStats);
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

  // Process both matchups and weekly stats to aggregate points
  const processMatchupsAndStats = (matchups, weeklyStats) => {
    const pointsData = {}; // Store total points and weekly breakdown
    const processed = new Set(); // Track processed player-week pairs

    matchups.forEach((weekMatchups, weekIndex) => {
      weekMatchups.forEach(({ players = [], players_points = {} }) => {
        players.forEach((playerId) => {
          const key = `${playerId}-${weekIndex + 1}`;

          if (!processed.has(key)) {
            if (!pointsData[playerId]) {
              pointsData[playerId] = { totalPoints: 0, weeklyPoints: {} };
            }

            const matchupPoints = players_points[playerId] || 0;
            const statPoints = weeklyStats[playerId]?.[weekIndex + 1]?.fantasy_points || 0;

            // Use the higher value between matchup and stat points
            const finalPoints = Math.max(matchupPoints, statPoints);

            pointsData[playerId].totalPoints += finalPoints;
            pointsData[playerId].weeklyPoints[weekIndex + 1] = finalPoints;

            processed.add(key);
          }
        });
      });
    });

    console.log('Aggregated Player Points:', pointsData);
    return pointsData;
  };

  useEffect(() => {
    fetchData();
  }, [leagueId, season]);

  return { playerPoints, loading, error };
};

export default usePlayerTotalPoints;
