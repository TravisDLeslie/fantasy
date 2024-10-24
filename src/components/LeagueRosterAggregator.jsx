import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaChartLine, FaSync, FaSearch } from "react-icons/fa";
import {
  getLeagueRosters,
  getPlayersMetadata,
  getLeagueMatchups,
  getLeagueUsers,
} from "../api/sleeperApi";
import useTeamByeWeeks from "../hooks/useTeamByeWeeks"; // Import the hook
import PlayerChart from "./PlayerChart"; // Modal for detailed stats
import TradeAnalyzer from "./TradeAnalyzer"; // Import the TradeAnalyzer

// Helper: Calculate the current week of the season
const getCurrentWeek = () => {
  const seasonStart = new Date(new Date().getFullYear(), 8, 7); // NFL Season starts around Sep 7
  const now = new Date();
  const diffInDays = Math.floor((now - seasonStart) / (1000 * 60 * 60 * 24));
  return Math.min(Math.ceil(diffInDays / 7), 17); // Ensure week doesn't exceed 17
};

const positionStyles = {
  QB: { text: "text-[#FC2B6D]", bg: "bg-[#323655]", border: "rounded-md" },
  RB: { text: "text-[#20CEB8]", bg: "bg-[#323655]", border: "rounded-md" },
  WR: { text: "text-[#56C9F8]", bg: "bg-[#323655]", border: "rounded-md" },
  TE: { text: "text-[#FEAE58]", bg: "bg-[#323655]", border: "rounded-md" },
  K: { text: "text-[#C96CFF]", bg: "bg-[#323655]", border: "rounded-md" },
  DEF: { text: "text-[#BF755D]", bg: "bg-[#323655]", border: "rounded-md" },
  FLEX: { text: "text-pink-900", bg: "bg-[#323655]", border: "rounded-md" },
};

const getPositionStyles = (position) =>
  positionStyles[position] || {
    text: "text-gray-900",
    bg: "bg-gray-300",
    border: "rounded",
  };

const LeagueRosterAggregator = ({ leagueId }) => {
  const { getTeamByeWeek } = useTeamByeWeeks(); // Use the hook to fetch bye week data
  const currentWeek = getCurrentWeek(); // Calculate the current week

  const [players, setPlayers] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [positionFilter, setPositionFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [positionAverages, setPositionAverages] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [isTradeAnalyzerOpen, setTradeAnalyzerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); // Add search query state

  const [users, setUsers] = useState([]); // Store league users

  const calculateAveragePoints = (weeklyPoints) => {
    const validPoints = Object.values(weeklyPoints).filter((pts) => pts > 0);
    const totalPoints = validPoints.reduce((acc, pts) => acc + pts, 0);
    return validPoints.length
      ? (totalPoints / validPoints.length).toFixed(2)
      : "0.00";
  };

  const calculateGamesStats = (weeklyPoints, teamAbbr) => {
    const gamesPlayed = Object.values(weeklyPoints).filter(
      (pts) => pts > 0
    ).length;

    const byeWeek = getTeamByeWeek(teamAbbr); // Retrieve the bye week
    const totalGamesPossible =
      byeWeek && byeWeek <= currentWeek
        ? currentWeek - 1 // Subtract 1 if bye week has already occurred
        : currentWeek;

    return { gamesPlayed, totalGamesPossible };
  };

  const calculateLeagueAveragePosition = (leagueAverage, players) => {
    if (!players || players.length === 0) return 0;

    const maxAvg = Math.max(...players.map((p) => parseFloat(p.avgPoints)));
    const minAvg = Math.min(...players.map((p) => parseFloat(p.avgPoints)));

    // Normalize the league average within the min and max range
    const normalizedPosition =
      ((leagueAverage - minAvg) / (maxAvg - minAvg)) * 100;

    return normalizedPosition;
  };

  const calculateRankDifference = (avgPoints, position, positionAverages) => {
    const leagueAvg = parseFloat(positionAverages[position] || "0.00");
    const rankDifference = (avgPoints - leagueAvg).toFixed(2);
    const rankLabel =
      rankDifference > 0 ? `+${rankDifference}` : rankDifference;

    return { rankDifference, rankLabel, leagueAvg };
  };

  const calculatePositionAverages = (players) => {
    const totals = {};
    players.forEach(({ position, avgPoints }) => {
      if (!totals[position]) totals[position] = { totalPoints: 0, count: 0 };
      totals[position].totalPoints += parseFloat(avgPoints);
      totals[position].count += 1;
    });

    const averages = {};
    Object.entries(totals).forEach(([position, { totalPoints, count }]) => {
      averages[position] =
        count > 0 ? (totalPoints / count).toFixed(2) : "0.00";
    });

    return averages;
  };

  const fetchLeagueData = async () => {
    try {
      setLoading(true);
      const [rosters, metadata, usersData] = await Promise.all([
        getLeagueRosters(leagueId),
        getPlayersMetadata(),
        getLeagueUsers(leagueId),
      ]);

      const allPlayers = [];
      const processed = new Set();

      const allMatchups = await Promise.all(
        Array.from({ length: currentWeek }, (_, i) =>
          getLeagueMatchups(leagueId, i + 1)
        )
      );

      allMatchups.forEach((matchups, week) => {
        matchups.forEach((matchup) => {
          const points = matchup.players_points || {};
          Object.entries(points).forEach(([playerId, weekPoints]) => {
            if (!processed.has(`${playerId}-${week}`)) {
              if (!metadata[playerId].weekly_points)
                metadata[playerId].weekly_points = {};
              metadata[playerId].weekly_points[week + 1] = weekPoints;
              processed.add(`${playerId}-${week}`);
            }
          });
        });
      });

      rosters.forEach((roster) =>
        roster.players.forEach((playerId) => {
          const playerInfo = metadata[playerId] || {};
          const weeklyPoints = playerInfo.weekly_points || {};
          const avgPoints = calculateAveragePoints(weeklyPoints);

          const user = usersData.find((u) => u.user_id === roster.owner_id); // Find owner

          const { gamesPlayed, totalGamesPossible } = calculateGamesStats(
            weeklyPoints,
            playerInfo.team
          );

          const { rankDifference, rankLabel, leagueAvg } =
            calculateRankDifference(
              avgPoints,
              playerInfo.position,
              positionAverages
            );

          allPlayers.push({
            id: playerId,
            name: `${playerInfo.first_name || "Unknown"} ${
              playerInfo.last_name || "Player"
            }`,
            position: playerInfo.position || "N/A",
            points: Object.values(weeklyPoints)
              .reduce((acc, pts) => acc + pts, 0)
              .toFixed(2),
            avgPoints,
            owner: user?.display_name || "Unknown Owner", // Store owner name
            gamesPlayed,
            totalGamesPossible,
            weeklyPoints,
            teamAbbr: playerInfo.team || "N/A",
            rankDifference,
            rankLabel,
            leagueAvg,
          });
        })
      );

      const sortedPlayers = allPlayers.sort(
        (a, b) => b.avgPoints - a.avgPoints
      );

      setPlayers(sortedPlayers);
      setFilteredPlayers(sortedPlayers);
      setPositionAverages(calculatePositionAverages(sortedPlayers));
    } catch (err) {
      console.error("Error fetching league data:", err);
      setError("Failed to load league data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchLeagueData();
  }, [leagueId, isAuthenticated]);

  const handlePositionChange = (position) => {
    setPositionFilter(position);
    setFilteredPlayers(
      position === "All"
        ? players
        : players.filter((player) => player.position === position)
    );
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const handleRefresh = () => {
    setPositionFilter("All");
    setSearchQuery(""); // Reset the search bar on refresh    // Reset to "All" when refreshing
    fetchLeagueData();
  };

  const handleChartClick = (player) => setSelectedPlayer(player);
  const closeChart = () => setSelectedPlayer(null);

  const handlePinSubmit = () => {
    if (pinInput === "8520") {
      setIsAuthenticated(true);
    } else {
      alert("Incorrect PIN!");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
        <div className="bg-[#252942] p-8 rounded shadow-lg">
          <h2 className="text-white text-2xl font-bold mb-4">Enter PIN</h2>
          <input
            type="password"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-full p-2 rounded mb-4"
            placeholder="Enter PIN"
          />
          <button
            onClick={handlePinSubmit}
            className="w-full bg-[#01F5BF] hover:bg-[#019977] text-[#15182D] py-2 rounded"
          >
            Submit
          </button>
        </div>
      </div>
    );
  }

  const openTradeAnalyzer = () => setTradeAnalyzerOpen(true);
  const closeTradeAnalyzer = () => setTradeAnalyzerOpen(false);

  if (loading)
    return (
      <div className="text-center text-white text-xl mt-10">
        Loading league data...
      </div>
    );
  if (error)
    return <div className="text-center text-red-500 mt-10">{error}</div>;

  const leagueAverage =
    positionFilter !== "All" ? positionAverages[positionFilter] : null;

  const renderedPositions = new Set(); // Declare the Set here to track rendered positions

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <Link
          to="/"
          className="text-[#BCC3FF] hover:underline text-base md:text-lg"
        >
          ← Back to League
        </Link>

        <div className="space-x-6">
          <button
            onClick={handleRefresh}
            className="text-[#15182D] text-xs font-semibold md:text-sm bg-[#01F5BF] hover:bg-[#019977] px-3 py-2 rounded-full shadow"
          >
            <FaSync className="inline-block mr-1" /> Refresh
          </button>
          {/* Trade Analyzer Button */}
          <button
            onClick={openTradeAnalyzer}
            className="mt-2 text-xs md:text-sm font-semibold text-[#15182D] bg-[#FEAE58] hover:bg-[#019977] px-3 py-2 rounded-full shadow"
          >
            Trade Analyzer
          </button>
        </div>
      </div>
      <div className="text-center mt-8 md:mt-1 mb-8">
        <h1
          className={`text-xl md:text-3xl font-bold mb-1 ${
            getPositionStyles(positionFilter)?.text
          }`}
        >
          {positionFilter} Players
        </h1>

        {leagueAverage && (
          <div className="text-[#bbb]">
            <span>avg across league is: </span>
            <span className="text-white">{leagueAverage}</span>
          </div>
        )}
      </div>

      <div className="mb-12 flex justify-center">
        <div className="overflow-x-auto w-full">
          <div className="flex justify-start space-x-4 w-max">
            {["All", ...Object.keys(positionStyles)].map((position) => {
              const { bg, text } = getPositionStyles(position);

              return (
                <button
                  key={position}
                  className={`px-4 py-2 rounded ${
                    positionFilter === position
                      ? `${bg} ${text}`
                      : "bg-gray-700 opacity-20 text-white"
                  }`}
                  onClick={() => handlePositionChange(position)}
                >
                  {position}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <ul className="relative max-h-screen overflow-y-auto bg-[#252942] rounded p-6 md:p-12 space-y-4 shadow-md">
        {filteredPlayers.map((player, index) => {
          const { text, bg, border } = getPositionStyles(player.position);

          // Call the helper function to get rank difference details
          const { rankDifference, rankLabel, leagueAvg } =
            calculateRankDifference(
              player.avgPoints,
              player.position,
              positionAverages
            );

          const nextPlayerAvg =
            index + 1 < filteredPlayers.length
              ? filteredPlayers[index + 1].avgPoints
              : null;

          const shouldInsertAverageLine =
            !renderedPositions.has(player.position) &&
            (nextPlayerAvg === null || leagueAvg > nextPlayerAvg) &&
            leagueAvg <= player.avgPoints;

          if (shouldInsertAverageLine) {
            renderedPositions.add(player.position);
          }

          return (
            <React.Fragment key={player.id}>
              {/* Player Card */}
              <li
                className={`border-b border-gray-300 py-4 px-8 md:px-2 w-full flex flex-col md:flex-row mx-auto justify-between items-start md:items-center ${border} space-y-4 md:space-y-auto`}
              >
                {/* Player Info */}
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-12">
                  <span className={`flex items-center ${text}`}>
                    <span className={`px-2 py-1 ${bg} rounded-md mr-2`}>
                      {player.position}
                    </span>

                    <div className="flex flex-row md:flex-row items-start md:items-center space-x-2">
                      <span className="text-white font-semibold">
                        {player.name}
                      </span>
                      <span className="text-[#C0C0C0] font-normal">
                        -{" "}
                        <span className="text-[#bbb]">{player.points} pts</span>
                        <span className="ml-2 text-[#8189C7] font-light">
                          ({player.owner})
                        </span>
                      </span>
                    </div>
                  </span>

                  {/* Player Stats */}
                  <div className="flex flex-col md:flex-row items-start md:items-center space-y-2 md:space-y-0 md:space-x-12">
                    <span className="text-gray-500">
                      Played{" "}
                      <span className="text-[#BCC3FF] font-semibold">
                        {player.gamesPlayed}
                      </span>{" "}
                      out of{" "}
                      <span className="text-[#fff] font-bold">
                        {player.totalGamesPossible}
                      </span>{" "}
                      games
                    </span>
                  <div className="flex flex-row space-x-6">
                    <span className="font-semibold text-white">
                      {player.avgPoints} Avg Pts
                    </span>

                    <span
                      className={`font-semibold ${
                        rankDifference >= 0 ? "text-green-400" : "text-red-500"
                      }`}
                    >
                      {rankLabel}{" "}
                      <span className="ml-1 text-gray-400 text-xs font-normal">
                        {rankDifference >= 0
                          ? "Above league avg"
                          : "Below league avg"}
                      </span>
                    </span>
                    </div>
                    <div className="justify-left mt-2 md:mt-0">
                    <FaChartLine
                      className="text-[#01F5BF] cursor-pointer hover:text-[#019977] w-12"
                      onClick={() => handleChartClick(player)}
                    />
                    </div>
                  </div>
                </div>
              </li>

              {shouldInsertAverageLine && (
                <div className="relative">
                  <hr className="w-full border-t-[2px] border-[#FEAE58] my-2" />
                  <span className="absolute left-1/2 transform -translate-x-1/2 -mt-1 text-[#FEAE58] font-bold text-sm">
                    League Avg: {leagueAvg}
                  </span>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </ul>

      {isTradeAnalyzerOpen && (
        <TradeAnalyzer players={players} onClose={closeTradeAnalyzer} />
      )}

      {selectedPlayer && (
        <PlayerChart
          playerName={selectedPlayer.name}
          position={selectedPlayer.position}
          teamAbbr={selectedPlayer.teamAbbr}
          weeklyPoints={selectedPlayer.weeklyPoints}
          onClose={closeChart}
        />
      )}
    </div>
  );
};

export default LeagueRosterAggregator;
