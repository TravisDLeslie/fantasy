import React, { useEffect, useState } from 'react';
import { getPlayerMatchupStats } from '../api/sleeperApi'; // Import API

const PlayerWeeklyStats = ({ playerId, playerName, position, teamAbbr, weeklyPoints = {}, byeWeek, onClose }) => {
  const [detailedStats, setDetailedStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const now = new Date();
  const currentWeek = Math.min(
    Math.ceil((now - new Date(now.getFullYear(), 8, 7)) / (7 * 24 * 60 * 60 * 1000)),
    17
  );

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const allStats = {};
        for (let week = 1; week <= currentWeek; week++) {
          const weekStats = await getPlayerMatchupStats('2024', week);

          if (weekStats[playerId]) {
            allStats[week] = weekStats[playerId]; // Store stats by week
          }
        }
        setDetailedStats(allStats);
      } catch (err) {
        console.error('Error fetching detailed stats:', err);
        setError('Failed to fetch detailed stats.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [playerId, currentWeek]);

  const getWeekLabel = (week) => {
    if (week === parseInt(byeWeek)) return `Week ${week}: Bye Week`;
    const points = weeklyPoints[week];
    return points === 0 || points === undefined
      ? `Week ${week}: Inactive`
      : `Week ${week}: ${points.toFixed(2)} pts`;
  };

  if (loading) return <div>Loading stats...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-[#15182D] p-4 md:p-8 rounded shadow-lg max-w-xl w-full">
        <h2 className="text-white text-center text-xl mb-4">
          {playerName} - Total Points: {Object.values(weeklyPoints).reduce((a, b) => a + (b || 0), 0).toFixed(2)}
        </h2>
        <ul className="bg-[#202538] rounded-md max-h-80 overflow-y-auto p-4">
          {Array.from({ length: currentWeek }, (_, i) => {
            const week = i + 1;
            const stats = detailedStats[week] || {};

            return (
              <li key={week} className="text-white text-sm py-2 border-b border-gray-700">
                <div>{getWeekLabel(week)}</div>
                {Object.keys(stats).length > 0 && (
                  <div className="text-gray-400 text-xs mt-1">
                    <p>Yards: {stats.yds || 0}</p>
                    <p>Touchdowns: {stats.tds || 0}</p>
                    <p>Receptions: {stats.rec || 0}</p>
                    <p>Fumbles: {stats.fum || 0}</p>
                    <p>Interceptions: {stats.int || 0}</p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
        <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">Close</button>
      </div>
    </div>
  );
};

export default PlayerWeeklyStats;
