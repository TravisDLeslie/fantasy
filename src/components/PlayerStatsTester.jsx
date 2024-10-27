import React from 'react';
import usePlayerTotalPoints from '../hooks/usePlayerTotalPoints'; // Import the custom hook

const PlayerStatsTester = ({ leagueId }) => {
  const { playerPoints, loading, error } = usePlayerTotalPoints(leagueId); // Use the hook

  if (loading) return <div>Loading player stats...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6 bg-gray-800 text-white">
      <h1 className="text-2xl font-bold mb-4">Player Weekly Stats Tester</h1>

      <div className="mt-4">
        <h2 className="text-xl font-bold mb-4">Weekly Stats by Player</h2>
        {Object.entries(playerPoints).map(([playerId, { totalPoints, weeklyPoints }]) => (
          <div key={playerId} className="mb-4">
            <h3 className="text-lg font-semibold">Player ID: {playerId}</h3>
            <p>Total Points: {totalPoints.toFixed(2)} pts</p>
            <ul className="ml-4">
              {Object.entries(weeklyPoints).map(([week, points]) => (
                <li key={week}>
                  <strong>Week {week}:</strong> {points} Pts
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerStatsTester;
