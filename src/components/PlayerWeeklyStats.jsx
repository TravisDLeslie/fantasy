// src/components/PlayerWeeklyStats.jsx

import React, { useEffect, useState } from 'react';
import { getPlayerMatchupStats, getSchedule } from '../api/sleeperApi';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const now = new Date();
  const currentWeek = Math.min(
    Math.ceil(
      (now - new Date(now.getFullYear(), 8, 7)) / (7 * 24 * 60 * 60 * 1000)
    ),
    17
  );

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch the NFL schedule
        const schedule = await getSchedule('2024'); // Use the current season
        console.log('Schedule:', schedule); // For debugging

        const allStats = {};
        for (let week = 1; week <= currentWeek; week++) {
          const weekStats = await getPlayerMatchupStats('2024', week);

          // Find the game for the player's team in this week
          const game = schedule.find(
            (game) =>
              game.week === week &&
              (game.home_team === teamAbbr || game.away_team === teamAbbr)
          );

          // Determine the opponent team
          let opponentTeam = 'N/A';
          if (game) {
            opponentTeam =
              game.home_team === teamAbbr ? game.away_team : game.home_team;
          }

          if (weekStats[playerId]) {
            allStats[week] = {
              stats: weekStats[playerId],
              opponentTeam,
            };
          } else {
            allStats[week] = {
              stats: {},
              opponentTeam,
            };
          }
        }
        setDetailedStats(allStats);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to fetch stats.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [playerId, currentWeek, teamAbbr]);

  const getWeekLabel = (week) => {
    if (week === parseInt(byeWeek)) return `Week ${week}: Bye Week`;
    const points = weeklyPoints[week];
    return points === 0 || points === undefined
      ? `Week ${week}: Inactive`
      : `Week ${week}: ${points.toFixed(2)} pts`;
  };

  if (loading)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-[#15182D] p-4 md:p-8 rounded shadow-lg max-w-xl w-full">
          <div className="text-white text-center text-xl mb-4">
            Loading stats...
          </div>
        </div>
      </div>
    );
  if (error)
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-[#15182D] p-4 md:p-8 rounded shadow-lg max-w-xl w-full">
          <div className="text-red-500 text-center text-xl mb-4">{error}</div>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
          >
            Close
          </button>
        </div>
      </div>
    );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#15182D] p-4 md:p-8 rounded shadow-lg max-w-xl w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white hover:text-red-500"
        >
          ✕
        </button>
        <h2 className="text-white text-center text-xl mb-4">
          {playerName} ({teamAbbr}) - Total Points:{' '}
          {Object.values(weeklyPoints)
            .reduce((a, b) => a + (b || 0), 0)
            .toFixed(2)}
        </h2>
        <ul className="bg-[#202538] rounded-md max-h-80 overflow-y-auto p-4">
          {Array.from({ length: currentWeek }, (_, i) => {
            const week = i + 1;
            const weekData = detailedStats[week] || {};
            const stats = weekData.stats || {};
            const opponentTeam = weekData.opponentTeam || 'N/A';

            return (
              <li
                key={week}
                className="text-white text-sm py-2 border-b border-gray-700"
              >
                <div className="flex justify-between">
                  <span>{getWeekLabel(week)}</span>
                  <span>vs {opponentTeam}</span>
                </div>
                {Object.keys(stats).length > 0 && (
                  <div className="text-gray-400 text-xs mt-1">
                    {/* Display relevant stats */}
                    {position === 'QB' && (
                      <>
                        <p>Passing Yards: {stats.pass_yd || 0}</p>
                        <p>Passing TDs: {stats.pass_td || 0}</p>
                        <p>Interceptions: {stats.int || 0}</p>
                        <p>Rushing Yards: {stats.rush_yd || 0}</p>
                        <p>Rushing TDs: {stats.rush_td || 0}</p>
                      </>
                    )}
                    {position === 'RB' && (
                      <>
                        <p>Rushing Yards: {stats.rush_yd || 0}</p>
                        <p>Rushing TDs: {stats.rush_td || 0}</p>
                        <p>Receptions: {stats.rec || 0}</p>
                        <p>Receiving Yards: {stats.rec_yd || 0}</p>
                        <p>Receiving TDs: {stats.rec_td || 0}</p>
                      </>
                    )}
                    {position === 'WR' && (
                      <>
                        <p>Receptions: {stats.rec || 0}</p>
                        <p>Receiving Yards: {stats.rec_yd || 0}</p>
                        <p>Receiving TDs: {stats.rec_td || 0}</p>
                        <p>Rushing Yards: {stats.rush_yd || 0}</p>
                        <p>Rushing TDs: {stats.rush_td || 0}</p>
                      </>
                    )}
                    {position === 'TE' && (
                      <>
                        <p>Receptions: {stats.rec || 0}</p>
                        <p>Receiving Yards: {stats.rec_yd || 0}</p>
                        <p>Receiving TDs: {stats.rec_td || 0}</p>
                      </>
                    )}
                    {position === 'K' && (
                      <>
                        <p>Field Goals Made: {stats.fg || 0}</p>
                        <p>Extra Points Made: {stats.xp || 0}</p>
                      </>
                    )}
                    {position === 'DEF' && (
                      <>
                        <p>Sacks: {stats.def_sack || 0}</p>
                        <p>Interceptions: {stats.def_int || 0}</p>
                        <p>Fumble Recoveries: {stats.def_fum_rec || 0}</p>
                        <p>Touchdowns: {stats.def_td || 0}</p>
                      </>
                    )}
                    {/* Add more positions and stats as needed */}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default PlayerWeeklyStats;
