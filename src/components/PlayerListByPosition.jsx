import React, { useEffect, useState } from 'react';

const positionLabels = ['All', 'QB', 'RB', 'WR', 'TE', 'K', 'DEF', 'FLEX'];

const PlayerListByPosition = ({ rosters, onClose }) => {
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [positionFilter, setPositionFilter] = useState('All');

  // Calculate average points for each player
  const calculateAveragePoints = (player) => {
    const points = Object.values(player.points || {});
    const totalPoints = points.reduce((acc, curr) => acc + curr, 0);
    return points.length > 0 ? (totalPoints / points.length).toFixed(2) : '0.00';
  };

  // Extract and flatten all players from the rosters
  useEffect(() => {
    const allPlayers = rosters.flatMap((roster) =>
      roster.players.map((player) => ({
        id: player.player_id,
        name: `${player.first_name} ${player.last_name}`,
        position: player.position,
        points: player.weekly_points,
        avgPoints: calculateAveragePoints(player),
      }))
    );
    setFilteredPlayers(allPlayers);
  }, [rosters]);

  // Filter players based on the selected position
  const handlePositionChange = (position) => {
    setPositionFilter(position);
    if (position === 'All') {
      setFilteredPlayers((prev) => [...prev]); // Reset to all players
    } else {
      setFilteredPlayers((prev) =>
        prev.filter((player) => player.position === position)
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-md shadow-lg max-w-3xl w-full">
        <div className="flex justify-between mb-4">
          <h2 className="text-2xl font-bold">Players by Position</h2>
          <button onClick={onClose} className="text-red-500 hover:underline">
            Close
          </button>
        </div>

        <div className="mb-4 flex space-x-4">
          {positionLabels.map((position) => (
            <button
              key={position}
              className={`px-4 py-2 rounded ${
                positionFilter === position ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
              onClick={() => handlePositionChange(position)}
            >
              {position}
            </button>
          ))}
        </div>

        <ul className="max-h-80 overflow-y-auto">
          {filteredPlayers.map((player) => (
            <li
              key={player.id}
              className="border-b border-gray-300 py-2 flex justify-between"
            >
              <span>
                {player.name} ({player.position})
              </span>
              <span>{player.avgPoints} Avg Pts</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PlayerListByPosition;
