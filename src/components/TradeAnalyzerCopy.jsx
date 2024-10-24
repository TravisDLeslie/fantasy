import React, { useEffect, useState, useRef } from "react";
import { FaSync, FaSearch } from "react-icons/fa";

const TradeAnalyzer = ({ players, onClose, positionAverages = {} }) => {
  const [givingPlayers, setGivingPlayers] = useState([]);
  const [gettingPlayers, setGettingPlayers] = useState([]);
  const [givingSearch, setGivingSearch] = useState("");
  const [gettingSearch, setGettingSearch] = useState("");
  const [filteredPlayers, setFilteredPlayers] = useState(players); // Unified search pool
  const [activeSection, setActiveSection] = useState("giving");
  const [tradeResult, setTradeResult] = useState(null);

  const modalRef = useRef(); // Detect outside click

  const positionStyles = {
    QB: { text: "text-[#FC2B6D]", bg: "bg-[#323655]", border: "rounded-md" },
    RB: { text: "text-[#20CEB8]", bg: "bg-[#323655]", border: "rounded-md" },
    WR: { text: "text-[#56C9F8]", bg: "bg-[#323655]", border: "rounded-md" },
    TE: { text: "text-[#FEAE58]", bg: "bg-[#323655]", border: "rounded-md" },
    K: { text: "text-[#C96CFF]", bg: "bg-[#323655]", border: "rounded-md" },
    DEF: { text: "text-[#BF755D]", bg: "bg-[#323655]", border: "rounded-md" },
  };

  const calculateRankDifference = (avgPoints, position, positionAverages) => {
    const leagueAvg = parseFloat(positionAverages[position] || "0.00");
    const rankDifference = (avgPoints - leagueAvg).toFixed(2);
    const rankLabel =
      rankDifference > 0 ? `+${rankDifference}` : rankDifference;

    return { rankDifference, rankLabel, leagueAvg };
  };

  const getPositionStyles = (position) =>
    positionStyles[position] || { text: "text-gray-900", bg: "bg-gray-300" };

  const getRankDifference = (player) => {
    const leagueAvg = positionAverages?.[player.position] || 0;
    const rankDifference = (player.avgPoints - leagueAvg).toFixed(2);
    const rankLabel =
      rankDifference > 0 ? `+${rankDifference}` : rankDifference;
    return { rankDifference, rankLabel };
  };

  const calculateDifference = (player) => {
    const leagueAvg = positionAverages?.[player.position] || 0;
    return (player.avgPoints - leagueAvg).toFixed(2);
  };

  useEffect(() => {
    setFilteredPlayers(players); // Reset the search pool
  }, [players]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleSearch = (query) => {
    const filtered = players.filter((player) =>
      player.name.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredPlayers(filtered);
  };

  const handleSelectPlayer = (player) => {
    if (activeSection === "giving") {
      setGivingPlayers((prev) => [...prev, player]);
    } else {
      setGettingPlayers((prev) => [...prev, player]);
    }
  };

  const handleAnalyzeTrade = () => {
    const totalGivingAvg = givingPlayers.reduce(
      (acc, player) => acc + parseFloat(player.avgPoints),
      0
    );
    const totalGettingAvg = gettingPlayers.reduce(
      (acc, player) => acc + parseFloat(player.avgPoints),
      0
    );

    const result = {
      giving: totalGivingAvg.toFixed(2),
      getting: totalGettingAvg.toFixed(2),
      tradeBalance:
        totalGettingAvg - totalGivingAvg > 0 ? "Positive" : "Negative",
    };

    setTradeResult(result);
  };

  const handleRefreshSection = (type) => {
    if (type === "giving") setGivingPlayers([]);
    else setGettingPlayers([]);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
      <div
        ref={modalRef}
        className="bg-[#252942] p-8 rounded shadow-lg max-w-3xl w-full"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-white text-2xl font-bold">Trade Analyzer</h2>
          <button onClick={onClose} className="text-white hover:text-gray-400">
            ✕
          </button>
        </div>

        <div className="flex space-x-8 mb-8">
          {/* Giving Section */}
          <div
            className={`w-1/2 bg-[#3B3F5E] p-4 opacity-50 rounded ${
              activeSection === "giving" ? "border-4 opacity-100 border-[#FEAE58]" : ""
            }`}
            onClick={() => setActiveSection("giving")}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[#01F5BF] text-lg font-semibold">Giving</h3>
              <FaSync
                className="text-white cursor-pointer hover:text-[#019977]"
                onClick={() => setGivingPlayers([])}
              />
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {givingPlayers.map((player) => {
                const { text, bg } = getPositionStyles(player.position);

                return (
                  <div key={player.id} className="text-white text-sm space-y-1">
                    {player.name} ({player.teamAbbr}) -{" "}
                    <span className={`px-2 py-1 ${text} ${bg} rounded-md`}>
                      {player.position}
                    </span>{" "}
                    - {player.avgPoints} Avg Pts{" "}
                    <div className="">
                      <span className="text-sm text-gray-300">
                        Position (Avg: {player.leagueAvg})
                      </span>
                      <span
                        className={`ml-2 font-semibold ${
                          player.rankDifference >= 0
                            ? "text-green-400"
                            : "text-red-500"
                        }`}
                      >
                        {player.rankLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Getting Section */}
          <div
            className={`w-1/2 bg-[#3B3F5E] opacity-50 p-4 rounded ${
              activeSection === "getting" ? "border-4 opacity-100 border-[#FEAE58]" : ""
            }`}
            onClick={() => setActiveSection("getting")}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-[#01F5BF] text-lg font-semibold">Getting</h3>
              <FaSync
                className="text-white cursor-pointer hover:text-[#019977]"
                onClick={() => setGettingPlayers([])}
              />
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {gettingPlayers.map((player) => {
                const { text, bg } = getPositionStyles(player.position);

                return (
                  <div key={player.id} className="text-white text-sm space-y-1">
                    {player.name} ({player.teamAbbr}) -{" "}
                    <span className={`px-2 py-1 ${text} ${bg} rounded-md`}>
                      {player.position}
                    </span>{" "}
                    - {player.avgPoints} Avg Pts{" "}
                    <div className="">
                      <span className="text-sm text-gray-200">
                        Position (Avg: {player.leagueAvg})
                      </span>
                      <span
                        className={`ml-2 font-semibold ${
                          player.rankDifference >= 0
                            ? "text-green-400"
                            : "text-red-500"
                        }`}
                      >
                        {player.rankLabel}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Player Search */}
        <div className="relative mb-4">
          <FaSearch className="absolute top-3 left-3 text-gray-400" />
          <input
            type="text"
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search players..."
            className="w-full p-2 pl-10 rounded"
          />
        </div>

        <div className="mt-4 max-h-40 overflow-y-auto space-y-2">
          {filteredPlayers.map((player) => (
            <div
              key={player.id}
              className="cursor-pointer hover:bg-gray-700 p-2 rounded text-white"
              onClick={() => handleSelectPlayer(player)}
            >
              {player.name} ({player.teamAbbr}) -{" "}
              <span
                className={`px-2 py-1 ${
                  getPositionStyles(player.position).bg
                } rounded-md`}
              >
                {player.position}
              </span>{" "}
              - {player.avgPoints} Avg Pts
            </div>
          ))}
        </div>

        <button
          onClick={handleAnalyzeTrade}
          className="w-full bg-[#01F5BF] hover:bg-[#019977] text-[#15182D] py-2 rounded font-bold mt-4"
        >
          Analyze Trade
        </button>

        <button
          onClick={onClose}
          className="p-4 mt-4 bg-red-500 hover:bg-red-600 text-white rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default TradeAnalyzer;
