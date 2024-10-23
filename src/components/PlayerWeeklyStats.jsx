import React from 'react';

const positionStyles = {
  QB: { text: 'text-[#FC2B6D]', bg: 'bg-[#323655]', border: 'rounded-md' },
  RB: { text: 'text-[#20CEB8]', bg: 'bg-[#323655]', border: 'rounded-md' },
  WR: { text: 'text-[#56C9F8]', bg: 'bg-[#323655]', border: 'rounded-md' },
  TE: { text: 'text-[#FEAE58]', bg: 'bg-[#323655]', border: 'rounded-md' },
  K: { text: 'text-[#C96CFF]', bg: 'bg-[#323655]', border: 'rounded-md' },
  DEF: { text: 'text-[#BF755D]', bg: 'bg-[#323655]', border: 'rounded-md' },
  FLEX: { text: 'text-pink-900', bg: 'bg-[#323655]', border: 'rounded-md' },
};

const getPositionStyles = (position) =>
  positionStyles[position] || { text: 'text-gray-900', bg: 'bg-gray-300', border: 'rounded' };

const PlayerWeeklyStats = ({ playerName, position, teamAbbr, weeklyPoints = {}, byeWeek, onClose }) => {
  const now = new Date();
  const currentWeek = Math.min(
    Math.ceil((now - new Date(now.getFullYear(), 8, 7)) / (7 * 24 * 60 * 60 * 1000)),
    17
  );

  const { text, bg, border } = getPositionStyles(position);

  // Helper function to generate week labels
  const getWeekLabel = (week) => {
    // If the week is the player's bye week, prioritize this label
    if (week === parseInt(byeWeek)) {
      return `Week ${week}: Bye Week`;
    }

    // Handle inactive weeks (points = 0 or undefined)
    const points = weeklyPoints[week];
    if (points === 0 || points === undefined) {
      return `Week ${week}: Inactive`;
    }

    // Otherwise, display the points for the week
    return `Week ${week}: ${points.toFixed(2)} pts`;
  };

  const validPoints = Object.values(weeklyPoints).filter((points) => points !== 0 && points !== undefined);
  const totalPoints = validPoints.reduce((total, pts) => total + pts, 0);
  const avgPoints = validPoints.length > 0 ? (totalPoints / validPoints.length).toFixed(2) : '0.00';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-[#15182D] p-4 md:p-8 rounded shadow-lg max-w-xl w-full">
        <h2 className="flex flex-col items-center text-center text-gray-200 font-regular mb-4 mt-2">
          <span>
            {playerName} - <span className="text-sm text-white font-semibold">{totalPoints.toFixed(2)} Pts</span>
          </span>
          <div className="flex items-center">
            <span className={`text-xs ${text} ${bg} ${border} px-2 py-1 mt-2`}>{position}</span>
            <span className="text-xs ml-2 text-gray-300 mt-1">- for ({teamAbbr})</span>
          </div>
        </h2>

        <ul className="p-4 bg-[#202538] rounded-md max-h-80 overflow-y-auto">
          {Array.from({ length: currentWeek }, (_, i) => {
            const week = i + 1;
            return (
              <li key={week} className="text-white text-sm py-2 border-b border-gray-700">
                {getWeekLabel(week)}
              </li>
            );
          })}
        </ul>

        <div className="mt-4">
          <p className="text-gray-400 text-sm">Average Points: {avgPoints} pts</p>
        </div>

        <button onClick={onClose} className="mt-4 px-4 py-2 bg-red-500 text-white rounded">
          Close
        </button>
      </div>
    </div>
  );
};

export default PlayerWeeklyStats;
