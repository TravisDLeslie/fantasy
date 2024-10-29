// components/TeamPointsList.js
import React from "react";
import {
    FaArrowLeft,
    FaArrowRight,
    FaChartLine,
    FaInfoCircle,
  } from "react-icons/fa";

const TeamPointsList = ({ players, selectedWeek, onPrevWeek, onNextWeek }) => {
  return (
    <div className="col-span-1 bg-[#252942] mt-6 p-4 rounded-md shadow-md text-white relative">
      {/* Navigation Arrows */}
      <div className="absolute top-4 right-4 flex space-x-2">
        <button
          onClick={onPrevWeek}
          className={`text-white bg-transparent hover:text-[#01F5BF] focus:outline-none ${
            selectedWeek === 1 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label="Previous Week"
          disabled={selectedWeek === 1}
        >
          <FaArrowLeft size={20} />
        </button>
        <button
          onClick={onNextWeek}
          className={`text-white bg-transparent hover:text-[#01F5BF] focus:outline-none ${
            selectedWeek === 17 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label="Next Week"
          disabled={selectedWeek === 17}
        >
          <FaArrowRight size={20} />
        </button>
      </div>

      <h2 className="text-lg font-bold mb-4">
        Team Points - Week {selectedWeek}
      </h2>
      <ul>
        {players.map(
          ({ id, name, position, points, teamAbbr, text }) => (
            <li
              key={id}
              className="flex text-sm justify-between items-center mb-2 pb-2 border-b border-gray-700"
            >
              <div>
                <span className={`font-normal text-[#fff]`}>{name}</span>{" "}
                <span className={`text-xs ${text}`}>
                  ({position} 
                    <span className="ml-1 text-[#bbb]">
                   - {teamAbbr})
                   </span>
                </span>
              </div>
              <div className="text-white font-bold">{points} pts</div>
            </li>
          )
        )}
      </ul>
    </div>
  );
};

export default TeamPointsList;
