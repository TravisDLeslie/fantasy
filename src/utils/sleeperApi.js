import { useState, useEffect } from 'react';
import { getAllLeagueMatchups } from '../api/sleeperApi';

const usePlayerTotalPoints = (leagueId) => {
  const [playerPoints, setPlayerPoints] = useState({ weeklyPoints: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerPoints = async () => {
      try {
        const weeklyPoints = {};
        const processed = new Set();

        console.log('Fetching all matchups for league:', leagueId);

        const allMatchups = await getAllLeagueMatchups(leagueId);

        console.log('All matchups fetched:', allMatchups);

        allMatchups.forEach((matchups, week) => {
          matchups.forEach((matchup) => {
            const { players = [], players_points = {} } = matchup;

            // Combine both players and starters to ensure all points are captured
            players.forEach((playerId) => {
              const key = `${playerId}-${week + 1}`;

              if (!processed.has(key)) {
                if (!weeklyPoints[playerId]) weeklyPoints[playerId] = {};

                // Record points or set default to 0 if no points available
                weeklyPoints[playerId][week + 1] = players_points[playerId] || 0;
                processed.add(key);
              }
            });
          });
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
