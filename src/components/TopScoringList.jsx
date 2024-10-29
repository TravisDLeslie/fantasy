// components/TopScoringList.js
import React from "react";
import { getPositionStyles } from "../utils/positionStyles";

const TopScoringList = ({ weeks, title }) => {
  return (
    <div className="flex-1">
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <ul>
        {weeks.map(({ week, player }) => (
          <li
            key={week}
            className="flex text-sm justify-between items-center mb-2 pb-2 border-b border-gray-700"
          >
            <div>
              <span className="font-light text-[#bbb] text-sm">Week {week}</span>{" "}
              {player && (
                <>
                  <span className={`ml-2 font-semibold text-xs text-[#fff] `}>
                    {player.name}
                  </span>{" "}
                  <span className={`text-xs ml-4 ${player.text}`}>
                    ({player.position} - <span>{player.teamAbbr})
                    </span>
                  </span>
                </>
              )}
            </div>
            <div className="text-white ml-2 text-xs font-semibold">
              {player ? `${player.points} pts` : "N/A"}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TopScoringList;
