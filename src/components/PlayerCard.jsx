// src/components/PlayerCard.js

import React from "react";
import PropTypes from "prop-types";
import { FaInfoCircle, FaChartLine } from "react-icons/fa";

/**
 * PlayerCard Component
 * 
 * Displays individual player information, including name, position, points, and team.
 * Provides icons to view more information or a performance chart.
 * 
 * @param {Object} props - Component props.
 * @param {Object} props.player - Player data.
 * @param {Function} props.onInfoClick - Callback for info icon click.
 * @param {Function} props.onChartClick - Callback for chart icon click.
 * @param {boolean} props.isOnRoster - Indicates if the player is on a roster.
 */
const PlayerCard = ({ player, onInfoClick, onChartClick, isOnRoster }) => {
  const { id, name, position, points, teamAbbr, text, bg, border } = player;

  return (
    <div className={`p-4 ${bg} ${border} shadow-md rounded-md relative`}>
      {isOnRoster && (
        <span className="absolute top-2 right-2 bg-green-500 text-white text-xs px-1 rounded">
          On Roster
        </span>
      )}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-xs text-[#fff]">{name}</span>
        <span className="text-white font-bold text-xs">{points} Pts</span>
      </div>
      <div className="mt-2 text-xs md:text-xs text-[#bbb]">
        <span className={`${text} ${bg}`}>{position}</span> - <span>({teamAbbr || "N/A"})</span>
      </div>
      <div className="mt-4 flex justify-between">
        <FaInfoCircle
          className="text-blue-400 cursor-pointer hover:text-blue-300"
          onClick={onInfoClick}
          aria-label={`More info about ${name}`}
        />
        <FaChartLine
          className="text-[#01F5BF] cursor-pointer hover:text-[#019977]"
          onClick={onChartClick}
          aria-label={`View chart for ${name}`}
        />
      </div>
    </div>
  );
};

// Define PropTypes for type checking
PlayerCard.propTypes = {
  player: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    position: PropTypes.string.isRequired,
    points: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    teamAbbr: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    bg: PropTypes.string.isRequired,
    border: PropTypes.string.isRequired,
  }).isRequired,
  onInfoClick: PropTypes.func.isRequired,
  onChartClick: PropTypes.func.isRequired,
  isOnRoster: PropTypes.bool,
};

// Default props
PlayerCard.defaultProps = {
  player: {
    points: 0,
  },
  isOnRoster: false,
};

// Export memoized component to prevent unnecessary re-renders
export default React.memo(PlayerCard);
