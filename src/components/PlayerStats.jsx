import React, { useEffect, useState } from 'react';
import { getLeagueMatchups } from '../api/sleeperApi'; // Adjust the import path as necessary

const PlayerStats = ({ playerId, leagueId }) => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPlayerStats = async () => {
      try {
        const allMatchups = await Promise.all(
          Array.from({ length: 17 }, (_, i) => getLeagueMatchups(leagueId, i + 1))
        );

        const playerStats = [];

        // Loop through each week's matchup to collect the player's stats
        allMatchups.forEach((matchups, week) => {
          matchups.forEach((matchup) => {
            if (matchup.players_points && matchup.players_stats[playerId]) {
              playerStats.push({
                week: week + 1,
                points: matchup.players_points[playerId] || 0,
                stats: matchup.players_stats[playerId], // Raw stats for the player
              });
            }
          });
        });

        setStats(playerStats);
      } catch (err) {
        console.error('Error fetching player stats:', err);
        setError('Failed to load player stats. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerStats();
  }, [playerId, leagueId]);

  if (loading) return <div className="text-center text-white mt-4">Loading stats...</div>;
  if (error) return <div className="text-center text-red-500 mt-4">{error}</div>;

  return (
    <div className="bg-[#15182D] p-4 rounded-md shadow-md">
      <h2 className="text-lg font-semibold text-white mb-4">Player Stats</h2>
      <ul className="space-y-2">
        {stats.map(({ week, points, stats }) => (
          <li key={week} className="border-b border-gray-700 pb-2">
            <div className="flex justify-between text-white">
              <span>Week {week}</span>
              <span>{points} Pts</span>
            </div>
            <div className="text-sm text-gray-400 mt-1">
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span>{key}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlayerStats;
