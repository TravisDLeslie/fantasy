// src/components/LeagueAwards.jsx
import React from "react";

const awards = [
  { place: "1st Place", description: "🏆 Championship Belt & $1500 Cash Prize" },
  { place: "2nd Place", description: "🥈 $300 Cash Prize" },
  { place: "3rd Place", description: "🥉 $150 Cash Prize" },
  { place: "Consolation Bracket", description: "1/2 Off Entry to Next Season" },
  { place: "Last Place", description: "🚗 Custom License Plate 'Worst Manager'" },
];

const LeagueAwards = ({ sortedRosters, users }) => {
  /*
  // Helper function to get the user's display name
  const getUserDisplay = (roster) => {
    const user = users.find((u) => u.user_id === roster.owner_id);
    return user?.display_name || "Unknown Owner";
  };
  */

  return (
    <div className="max-w-lg mx-auto bg-[#252942] p-5 rounded-lg shadow-lg">
      <h2 className="text-xl text-center text-white font-semibold mb-4">
        🏅 League Awards
      </h2>
      <ul className="space-y-3">
        {awards.map((award, index) => {
          let roster;
          // Determine which roster to display based on the award position
          if (award.place === "Last Place") {
            roster = sortedRosters[sortedRosters.length - 1]; // Last in the list
          } else {
            roster = sortedRosters[index]; // 1st, 2nd, 3rd, Consolation
          }

          /*
          const userName = roster ? getUserDisplay(roster) : "TBD";
          */

          return (
            <li
              key={award.place}
              className="flex justify-between items-center bg-[#323655] p-3 rounded-md shadow-sm"
            >
              <span className="text-sm font-semibold text-[#FEAE58]">
                {award.place}:
              </span>
              <span className="text-white tex">
                {/* {userName} - */} {award.description}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LeagueAwards;
