import React, { useEffect, useState } from 'react';
import { getPlayerMatchupStats, getSchedule } from '../api/sleeperApi'; // Import API

const PlayerWeeklyStats = ({
  playerId,
  playerName,
  position,
  teamAbbr,
  weeklyPoints = {},
  byeWeek,
  onClose,
}) => {
  const [detailedStats, setDetailedStats] = useState({});
  const [schedule, setSchedule] = useState([]); // Store NFL schedule
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const now = new Date();
  const currentWeek = Math.min(
    Math.ceil((now - new Date(now.getFullYear(), 8, 7)) / (7 * 24 * 60 * 60 * 1000)),
    18
  );

  // Fetch schedule and player stats when the component loads
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [allWeeksStats, nflSchedule] = await Promise.all([
          Promise.all(
            Array.from({ length: currentWeek }, (_, i) =>
              getPlayerMatchupStats('2024', i + 1)
            )
          ),
          getSchedule('2024'),
        ]);

        const statsByWeek = allWeeksStats.reduce((acc, weekStats, index) => {
          if (weekStats[playerId]) {
            acc[index + 1] = weekStats[playerId]; // Store stats by week
          }
          return acc;
        }, {});

        setDetailedStats(statsByWeek);
        setSchedule(nflSchedule); // Save the schedule data
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch detailed stats.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [playerId, currentWeek]);

  // Helper: Get opponent and location from schedule data
  const getOpponentLabel = (teamAbbr, week) => {
    const matchup = schedule.find(
      (game) => game.week === week && (game.home_team === teamAbbr || game.away_team === teamAbbr)
    );
    if (!matchup) return 'Unknown Opponent';
    const opponent = matchup.home_team === teamAbbr ? matchup.away_team : matchup.home_team;
    const location = matchup.home_team === teamAbbr ? 'vs' : '@';
    return `${location} ${opponent}`;
  };

  const getWeekLabel = (week, stats) => {
    if (week === parseInt(byeWeek)) return `Week ${week}: Bye Week`;

    const points = weeklyPoints[week] || 0;
    const opponentLabel = getOpponentLabel(teamAbbr, week);

    return points === 0 || points === undefined
      ? `Week ${week}: Inactive (${opponentLabel})`
      : `Week ${week}: ${points.toFixed(2)} pts (${opponentLabel})`;
  };

  const totalPoints = Object.values(weeklyPoints).reduce(
    (total, points) => total + (points || 0),
    0
  );

  if (loading) return <div>Loading stats...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-[#15182D] p-4 md:p-8 rounded shadow-lg max-w-xl w-full">
        <h2 className="text-white text-center text-xl mb-2">
          {playerName} - <span className="text-gray-300">{position}</span>
        </h2>

        <p className="text-center text-sm text-gray-400 mb-4">Team: {teamAbbr}</p>

        <p className="text-gray-400 text-center mb-4">
          Total Points: <span className="text-white font-semibold">{totalPoints.toFixed(2)} pts</span>
        </p>

        <ul className="bg-[#202538] rounded-md max-h-80 overflow-y-auto p-4">
          {Array.from({ length: currentWeek }, (_, i) => {
            const week = i + 1;
            const stats = detailedStats[week] || {};

            return (
              <li
                key={week}
                className="text-white text-sm py-2 border-b border-gray-700"
              >
                <div>{getWeekLabel(week, stats)}</div>
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

        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PlayerWeeklyStats;
