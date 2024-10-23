import { useState, useEffect } from 'react';
import { getLeagueMatchups } from '../api/sleeperApi';

const usePlayerTotalPoints = (leagueId) => {
  const [playerPoints, setPlayerPoints] = useState({ weeklyPoints: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerPoints = async () => {
      try {
        const weeklyPoints = {};
        const processed = new Set();

        console.log('Fetching matchups for league:', leagueId);

        // Fetch matchups for all 17 weeks
        const allMatchups = await Promise.all(
          Array.from({ length: 17 }, (_, i) =>
            getLeagueMatchups(leagueId, i + 1).catch(() => null)
          )
        );

        console.log('All matchups fetched:', allMatchups);

        // Process each matchup to calculate player points per week
        allMatchups.forEach((matchups, week) => {
          if (matchups) {
            matchups.forEach((matchup) => {
              const { players = [], starters = [], players_points = {} } = matchup;

              // Combine both starters and players to ensure we capture all player IDs
              const allPlayerIds = new Set([...players, ...starters]);

              // Loop through all players to ensure every player's points are captured
              allPlayerIds.forEach((playerId) => {
                const key = `${playerId}-${week + 1}`;

                if (!processed.has(key)) {
                  if (!weeklyPoints[playerId]) weeklyPoints[playerId] = {};

                  // Record points, even if the player has 0 or is inactive
                  const points = players_points[playerId] || 0;
                  weeklyPoints[playerId][week + 1] = points;
                  processed.add(key);
                }
              });
            });
          } else {
            console.warn(`No matchups found for week ${week + 1}`);
          }
        });

        console.log('Processed weekly points:', weeklyPoints);

        setPlayerPoints({ weeklyPoints });
      } catch (err) {
        console.error('Error fetching player points:', err);
        setError('Failed to fetch player points.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerPoints();
  }, [leagueId]);

  return { playerPoints, loading, error };
};

export default usePlayerTotalPoints;
