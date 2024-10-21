import { useState, useEffect } from 'react';
import { getLeagueMatchups } from '../api/sleeperApi';

const usePlayerTotalPoints = (leagueId) => {
  const [playerPoints, setPlayerPoints] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerPoints = async () => {
      try {
        const totalPoints = {};
        const weeklyPoints = {};
        const processed = new Set();

        const allMatchups = await Promise.all(
          Array.from({ length: 18 }, (_, i) => getLeagueMatchups(leagueId, i + 1))
        );

        allMatchups.forEach((matchups, week) => {
          matchups.forEach((matchup) => {
            const points = matchup.players_points || {};
            Object.entries(points).forEach(([playerId, weekPoints]) => {
              if (!processed.has(`${playerId}-${week}`)) {
                totalPoints[playerId] = (totalPoints[playerId] || 0) + weekPoints;
                if (!weeklyPoints[playerId]) weeklyPoints[playerId] = {};
                weeklyPoints[playerId][week + 1] = weekPoints;
                processed.add(`${playerId}-${week}`);
              }
            });
          });
        });

        setPlayerPoints({ totalPoints, weeklyPoints });
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
