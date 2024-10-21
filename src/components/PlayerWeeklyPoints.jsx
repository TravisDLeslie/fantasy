import React, { useEffect, useState } from 'react';
import manualDefensePoints from '../utils/manualDefensePoints'; 
import { getLeagueInfo } from '../api/sleeperApi'; 

const PlayerWeeklyPoints = ({ playerId, leagueId, weeklyPoints = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentWeek, setCurrentWeek] = useState(null); // Set default to null

  // Fetch current week from the Sleeper API
  useEffect(() => {
    const fetchCurrentWeek = async () => {
      try {
        const leagueInfo = await getLeagueInfo(leagueId);
        console.log('Fetched Current Week:', leagueInfo.settings.current_week); // Debugging
        setCurrentWeek(leagueInfo.settings.current_week); // Set the correct current week
      } catch (error) {
        console.error('Error fetching current week:', error);
      }
    };

    fetchCurrentWeek();
  }, [leagueId]);

  const toggleDropdown = () => setIsOpen(!isOpen);

  // Helper to get points for a week (with manual fallback)
  const getWeekPoints = (week) => {
    const apiPoints = weeklyPoints[week];
    const manualPoints = manualDefensePoints[playerId]?.[week] ?? 0;
    return apiPoints !== undefined ? apiPoints : manualPoints;
  };

  return (
    <div className="mt-1">
      <button
        className="text-base text-[#BCC3FF] hover:underline"
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
              ? 'text-white font-semibold'
              : 'text-white';

            return (
              <li key={week} className={`text-lg ${weekClass}`}>
                Week {week}: <span className={`text-lg ml-4 ${pointsClass}`}>
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