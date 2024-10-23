import React, { useEffect, useState } from 'react';
import { getPlayerMatchupStats } from '../api/sleeperApi';

const PlayerMatchupStats = ({ playerId, season = '2024', onClose }) => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const allWeeksStats = {};
        // Fetch stats for all 17 weeks
        for (let week = 1; week <= 17; week++) {
          const weekStats = await getPlayerMatchupStats(season, week);
          if (weekStats[playerId]) {
            allWeeksStats[week] = weekStats[playerId];
          }
        }
        setStats(allWeeksStats);
      } catch (err) {
        console.error('Error fetching player stats:', err);
        setError('Failed to fetch player stats.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [playerId, season]);

  if (loading) return <div>Loading player stats...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-[#15182D] p-6 rounded shadow-lg max-w-xl w-full">
        <h2 className="text-2xl text-white mb-4">Player Stats</h2>
        <button onClick={onClose} className="text-white mb-4">
          Close
        </button>
        <ul className="p-4 bg-[#202538] rounded-md max-h-80 overflow-y-auto">
          {Object.entries(stats).map(([week, stat]) => (
            <li key={week} className="text-white py-2 border-b border-gray-700">
              <h3 className="font-bold">Week {week}</h3>
              <p>Yards: {stat.yds || 0}</p>
              <p>Touchdowns: {stat.tds || 0}</p>
              <p>Receptions: {stat.rec || 0}</p>
              <p>Fumbles: {stat.fum || 0}</p>
              <p>Interceptions: {stat.int || 0}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlayerMatchupStats;
