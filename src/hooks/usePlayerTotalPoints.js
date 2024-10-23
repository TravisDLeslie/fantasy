import { useState, useEffect } from 'react';
import { getAllLeagueMatchups, getWeeklyPlayerStats } from '../api/sleeperApi';

const usePlayerTotalPoints = (leagueId, season = '2024') => {
  const [playerPoints, setPlayerPoints] = useState({}); // Store player points and weekly data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerPoints = async () => {
      try {
        const weeklyPoints = {}; // Stores total and weekly points per player
        const processed = new Set(); // Track processed players to avoid duplication

        console.log('Fetching all matchups for league:', leagueId);
        const allMatchups = await getAllLeagueMatchups(leagueId);

        console.log('Fetching weekly player stats...');
        const allWeeklyStats = await getWeeklyPlayerStats(season);

        console.log('Processing matchups and player stats...');

        // Process each week of matchups
        allMatchups.forEach((matchups, weekIndex) => {
          matchups.forEach((matchup) => {
            const { players = [], players_points = {} } = matchup;

            players.forEach((playerId) => {
              const key = `${playerId}-${weekIndex + 1}`;

              if (!processed.has(key)) {
                if (!weeklyPoints[playerId]) {
                  weeklyPoints[playerId] = { totalPoints: 0, weeklyPoints: {} };
                }

                // Get points from matchup or fallback to weekly player stats
                const weekPoints =
                  players_points[playerId] || allWeeklyStats[playerId]?.[weekIndex + 1]?.fantasy_points || 0;

                // Store points
                weeklyPoints[playerId].totalPoints += weekPoints;
                weeklyPoints[playerId].weeklyPoints[weekIndex + 1] = weekPoints;

                processed.add(key);
              }
            });
          });
        });

        console.log('Aggregated Player Points:', weeklyPoints);
        setPlayerPoints(weeklyPoints);
      } catch (err) {
        console.error('Error fetching player points:', err);
        setError('Failed to fetch player points.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerPoints();
  }, [leagueId, season]);

  return { playerPoints, loading, error };
};

export default usePlayerTotalPoints;
