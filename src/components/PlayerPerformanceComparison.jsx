import React, { useEffect, useState } from 'react';
import { FaSync } from 'react-icons/fa'; // Optional refresh icon
import { getLeagueRosters, getPlayersMetadata } from '../api/sleeperApi';

// Position styling
const positionStyles = {
  QB: { text: 'text-[#FC2B6D]', bg: 'bg-[#323655]', border: 'rounded-md' },
  RB: { text: 'text-[#20CEB8]', bg: 'bg-[#323655]', border: 'rounded-md' },
  WR: { text: 'text-[#56C9F8]', bg: 'bg-[#323655]', border: 'rounded-md' },
  TE: { text: 'text-[#FEAE58]', bg: 'bg-[#323655]', border: 'rounded-md' },
  K: { text: 'text-[#C96CFF]', bg: 'bg-[#323655]', border: 'rounded-md' },
  DEF: { text: 'text-[#BF755D]', bg: 'bg-[#323655]', border: 'rounded-md' },
};

const getPositionStyles = (position) =>
  positionStyles[position] || { text: 'text-gray-900', bg: 'bg-gray-300', border: 'rounded' };

const PlayerPerformanceComparison = ({ leagueId }) => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [positionAverages, setPositionAverages] = useState({});

  // Helper: Calculate average points for a given position across the league
  const calculatePositionAverages = (players) => {
    const totals = {}; // { QB: { totalPoints: 0, count: 0 }, ... }

    players.forEach((player) => {
      const { position, avgPoints } = player;
      if (!totals[position]) totals[position] = { totalPoints: 0, count: 0 };

      totals[position].totalPoints += parseFloat(avgPoints);
      totals[position].count += 1;
    });

    const averages = {};
    Object.entries(totals).forEach(([position, { totalPoints, count }]) => {
      averages[position] = count > 0 ? (totalPoints / count).toFixed(2) : '0.00';
    });

    return averages;
  };

  const fetchPlayerData = async () => {
    try {
      setLoading(true);
      const [rosters, metadata] = await Promise.all([
        getLeagueRosters(leagueId),
        getPlayersMetadata(),
      ]);

      const allPlayers = [];
      rosters.forEach((roster) =>
        roster.players.forEach((playerId) => {
          const playerInfo = metadata[playerId] || {};
          const avgPoints = playerInfo.avg_points || '0.00'; // Assuming API gives avg_points

          allPlayers.push({
            id: playerId,
            name: `${playerInfo.first_name || 'Unknown'} ${playerInfo.last_name || 'Player'}`,
            position: playerInfo.position || 'N/A',
            avgPoints,
          });
        })
      );

      // Calculate average points per position
      const averages = calculatePositionAverages(allPlayers);
      setPositionAverages(averages);
      setPlayers(allPlayers);
    } catch (err) {
      console.error('Error fetching player data:', err);
      setError('Failed to load player data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlayerData();
  }, [leagueId]);

  if (loading) return <div className="text-center text-white text-xl mt-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl text-white font-bold">Player Performance Comparison</h1>
        <button
          onClick={fetchPlayerData}
          className="text-[#15182D] bg-[#01F5BF] hover:bg-[#019977] px-3 py-2 rounded-full shadow"
        >
          <FaSync className="inline-block mr-1" /> Refresh
        </button>
      </div>

      <ul className="bg-[#252942] p-12 rounded shadow-md max-h-screen overflow-y-auto space-y-4">
        {players.map((player) => {
          const { text, bg, border } = getPositionStyles(player.position);
          const leagueAvg = positionAverages[player.position] || '0.00';
          const rankDifference = (player.avgPoints - leagueAvg).toFixed(2);
          const rankLabel = rankDifference > 0 ? `+${rankDifference}` : rankDifference;

          return (
            <li key={player.id} className={`border-b border-gray-300 py-2 flex justify-between ${border}`}>
              <div className={`flex items-center ${text}`}>
                <span className={`px-2 py-1 ${bg} rounded-md mr-2`}>{player.position}</span>
                <span className="text-white">{player.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-white font-semibold">{player.avgPoints} Avg Pts</span>
                <span className={`font-semibold ${rankDifference >= 0 ? 'text-green-400' : 'text-red-500'}`}>
                  {rankLabel}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PlayerPerformanceComparison;
