import React from "react";

const awards = [
    { 
      place: "1st: 🏆", 
      description: "Championship Belt & $1500 Cash Prize", 
      color: "text-yellow-400",
      text: "text-sm"
    },
    { 
      place: "2nd: 🥈", 
      description: "$400 Cash Prize", 
      color: "text-gray-100" ,
      text: "text-sm"
    },
    { 
      place: "3rd: 🥉", 
      description: "$200 Cash Prize", 
      color: "text-orange-400" ,
      text: "text-base"
    },
    { 
      place: "Consolation:", 
      description: "1/2 Off Entry to Next Season", 
      color: "text-[#bbb]" ,
      text: "text-base"
    },
    { 
      place: "Last 😩", 
      description: "The License Plates", 
      drink: "Everyone's Favorite Drink up to $4", 
      color: "text-[#fff]" ,
      text: "text-xs"
    },
  ];

const AwardsModal = ({ isOpen, onClose, sortedRosters, users }) => {
  if (!isOpen) return null; // Don't render the modal if it's not open

  const getUserDisplay = (roster) => {
    const user = users.find((u) => u.user_id === roster.owner_id);
    return user?.display_name || "Unknown Owner";
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-[#252942] p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h2 className="text-xl text-center text-white font-semibold mb-4">
          🏅 League Awards
        </h2>
        <ul className="space-y-3">
          {awards.map((award, index) => {
            let roster;
            if (award.place === "Last Place") {
              roster = sortedRosters[sortedRosters.length - 1];
            } else {
              roster = sortedRosters[index];
            }

            const userName = roster ? getUserDisplay(roster) : "TBD";

            return (
                <li
                key={award.place}
                className="flex font-semibold text-sm justify-between items-center bg-[#323655] p-5 rounded-md shadow-sm"
              >
                <span className={`text-sm font-semibold ${award.color} `}>
                  {award.place}
                </span>
                <div className="flex space-x-2 text-center">
            {award.place === "Last 😩" ? (
              <>
                <span className={`text-white font-light text-left leading-5 ${award.text}`}>1. {award.description}</span>
                <span className={`text-white font-light text-left leading-5 ${award.text}`}>2. {award.drink}</span>
              </>
            ) : (
              <span className="text-white">{award.description}</span>
            )}
            </div>
              </li>
            );
          })}
        </ul>
        <button
          onClick={onClose}
          className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-md"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AwardsModal;
