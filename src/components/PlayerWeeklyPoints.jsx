import React, { useState } from 'react';
import manualDefensePoints from '../utils/manualDefensePoints'; // Import manual defense points

const PlayerWeeklyPoints = ({ playerId, weeklyPoints = {} }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Get the current week dynamically
  const getCurrentWeek = () => {
    const now = new Date();
    const firstSunday = new Date(now.getFullYear(), 8, 7 - (new Date(now.getFullYear(), 8, 7).getDay())); // 2nd Sunday of September
    const weekDifference = Math.ceil((now - firstSunday) / (7 * 24 * 60 * 60 * 1000)); // Week number
    return Math.min(weekDifference, 17); // Cap at 17 weeks
  };

  const currentWeek = getCurrentWeek();

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Helper to determine the points for a specific week
  const getWeekPoints = (week) => {
    const apiPoints = weeklyPoints[week]; // API points
    const manualPoints = manualDefensePoints[playerId]?.[week] ?? 0; // Manual fallback
    return apiPoints !== undefined ? apiPoints : manualPoints;
  };

  return (
    <div className="mt-1">
      <button
        className="text-base text-blue-500 hover:underline"
        onClick={toggleDropdown}
      >
        {isOpen ? 'Hide Weekly Points' : 'Show Weekly Points'}
      </button>

      {isOpen && (
        <ul className="ml-4 mt-2">
          {Array.from({ length: 17 }, (_, i) => i + 1).map((week) => {
            const isCurrentWeek = week === currentWeek;
            const weekClass = isCurrentWeek 
              ? 'underline text-blue-800 font-semibold'
              : 'text-zinc-500';
            const pointsClass = isCurrentWeek 
              ? 'text-blue-800 font-semibold' 
              : 'text-zinc-800';

            return (
              <li key={week} className={`text-lg ${weekClass}`}>
                Week {week}: <span className={`text-lg ${pointsClass}`}>
                  {getWeekPoints(week).toFixed(2)} Points
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default PlayerWeeklyPoints;
