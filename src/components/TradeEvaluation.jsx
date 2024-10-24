import React from "react";

const TradeEvaluation = ({ givingPlayers, gettingPlayers, onClose }) => {
  const calculateTradeRank = (players) => {
    const totalRank = players.reduce((acc, player) => acc + player.rank, 0);
    const avgRank = (totalRank / players.length).toFixed(2);
    return { totalRank, avgRank };
  };

  const givingStats = calculateTradeRank(givingPlayers);
  const gettingStats = calculateTradeRank(gettingPlayers);

  const tradeBalance = (gettingStats.avgRank - givingStats.avgRank).toFixed(2);

  let resultMessage;
  let givingHighlight = "";
  let gettingHighlight = "";

  if (parseFloat(tradeBalance) > 0) {
    resultMessage = "The 'Getting' side has better value!";
    gettingHighlight = "font-bold text-green-400";
  } else if (parseFloat(tradeBalance) < 0) {
    resultMessage = "The 'Giving' side has better value!";
    givingHighlight = "font-bold text-green-400";
  } else {
    resultMessage = "The trade is evenly balanced.";
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
      <div className="bg-[#252942] p-8 rounded shadow-lg max-w-lg w-full">
        <h2 className="text-white text-2xl font-bold mb-4">Trade Evaluation</h2>

        <div className="text-center text-white mb-4">
          <p className="text-lg font-bold mb-2">{resultMessage}</p>
          <p className="text-sm text-gray-300">
            Trade Balance:{" "}
            <span
              className={`font-semibold ${
                tradeBalance >= 0 ? "text-green-400" : "text-red-500"
              }`}
            >
              {tradeBalance}
            </span>
          </p>
        </div>

        <div className="flex justify-between mb-6">
          <div className={`w-1/2 text-center ${givingHighlight}`}>
            <h3 className="text-lg mb-2">Giving Side</h3>
            <p>Avg Rank: {givingStats.avgRank}</p>
            <p>Total Rank: {givingStats.totalRank}</p>
          </div>
          <div className={`w-1/2 text-center ${gettingHighlight}`}>
            <h3 className="text-lg mb-2">Getting Side</h3>
            <p>Avg Rank: {gettingStats.avgRank}</p>
            <p>Total Rank: {gettingStats.totalRank}</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-[#01F5BF] hover:bg-[#019977] text-[#15182D] py-2 rounded font-bold"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default TradeEvaluation;
