// src/hooks/usePlayerSearch.js
import { useState, useEffect } from "react";

const positionStyles = {
  QB: { text: "text-[#FC2B6D]", bg: "bg-[#323655]", border: "rounded-md" },
  RB: { text: "text-[#20CEB8]", bg: "bg-[#323655]", border: "rounded-md" },
  WR: { text: "text-[#56C9F8]", bg: "bg-[#323655]", border: "rounded-md" },
  TE: { text: "text-[#FEAE58]", bg: "bg-[#323655]", border: "rounded-md" },
  K: { text: "text-[#C96CFF]", bg: "bg-[#323655]", border: "rounded-md" },
  DEF: { text: "text-[#BF755D]", bg: "bg-[#323655]", border: "rounded-md" },
};

const getPositionStyles = (position) =>
  positionStyles[position] || {
    text: "text-gray-900",
    bg: "bg-gray-300",
    border: "rounded",
  };

const usePlayerSearch = (players) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPlayers, setFilteredPlayers] = useState(players);

  useEffect(() => {
    const query = searchQuery.toLowerCase();

    const results = players
      .filter((player) => player.name.toLowerCase().includes(query))
      .map((player) => ({
        ...player,
        styles: getPositionStyles(player.position), // Assign styles here
      }));

    setFilteredPlayers(results);
  }, [searchQuery, players]);

  return { searchQuery, setSearchQuery, filteredPlayers };
};

export default usePlayerSearch;
