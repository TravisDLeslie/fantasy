import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getLeagueInfo,
  getLeagueUsers,
  getLeagueRosters,
  getLeagueMatchups,
  getNFLState,
} from "../api/sleeperApi";
import AwardsModal from "../components/AwardsModal";

const LeaguePage = ({ leagueId }) => {
  const [leagueInfo, setLeagueInfo] = useState(null);
  const [users, setUsers] = useState([]);
  const [rosters, setRosters] = useState([]);
  const [matchupsByRoster, setMatchupsByRoster] = useState({});
  const [pointsForAgainst, setPointsForAgainst] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAwardsOpen, setIsAwardsOpen] = useState(false);
  const [openRosterId, setOpenRosterId] = useState(null);
  const [sortOption, setSortOption] = useState("winLoss"); // Default sorting option

  const getResultColorClass = (result) => {
    switch (result) {
      case "W":
        return "text-[#01F5BF]";
      case "L":
        return "text-[#EC5556]";
      case "T":
        return "text-[#F5C542]";
      case "In Progress":
        return "text-[#FFA500]"; // Orange color for In Progress
      default:
        return "";
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [info, userData, rosterData, nflState] = await Promise.all([
          getLeagueInfo(leagueId),
          getLeagueUsers(leagueId),
          getLeagueRosters(leagueId),
          getNFLState(),
        ]);

        setLeagueInfo(info);
        setUsers(userData);
        setRosters(rosterData);

        let currentWeek = nflState.week || 1;

        // Create a mapping from roster_id to team and owner names
        const rosterIdToTeamInfo = {};
        rosterData.forEach((roster) => {
          const user = userData.find((u) => u.user_id === roster.owner_id);
          const teamName = getTeamName(roster, user);
          rosterIdToTeamInfo[roster.roster_id] = {
            teamName,
            ownerName: user?.display_name || "Unknown Owner",
          };
        });

        // Fetch matchups up to the current week
        const matchupPromises = [];
        const totalWeeks = info.settings.playoff_week_start
          ? info.settings.playoff_week_start - 1
          : 13;

        for (let week = 1; week <= currentWeek; week++) {
          matchupPromises.push(getLeagueMatchups(leagueId, week));
        }

        const matchupData = await Promise.all(matchupPromises);

        // Process matchup data
        const matchupsByRoster = {};
        matchupData.forEach((weeklyMatchups, index) => {
          const week = index + 1;
          weeklyMatchups.forEach((matchup) => {
            const rosterId = matchup.roster_id;
            if (!matchupsByRoster[rosterId]) {
              matchupsByRoster[rosterId] = [];
            }

            // Find opponent matchup
            const opponentMatchup = weeklyMatchups.find(
              (m) =>
                m.matchup_id === matchup.matchup_id &&
                m.roster_id !== matchup.roster_id
            );

            const opponentRosterId = opponentMatchup
              ? opponentMatchup.roster_id
              : null;
            const opponentPoints =
              opponentMatchup && opponentMatchup.points !== undefined
                ? opponentMatchup.points
                : null;

            // Get opponent info
            const opponentInfo = opponentRosterId
              ? rosterIdToTeamInfo[opponentRosterId]
              : { teamName: "Bye", ownerName: "" };

            let result = "Scheduled";

            // Determine the status and result
            const matchupPoints =
              matchup.points !== undefined ? matchup.points : null;

            if (week === currentWeek) {
              // For the current week, set result as "In Progress"
              result = "In Progress";
            } else if (
              opponentPoints !== null &&
              opponentPoints !== undefined &&
              matchupPoints !== null &&
              matchupPoints !== undefined
            ) {
              if (matchupPoints > opponentPoints) {
                result = "W";
              } else if (matchupPoints < opponentPoints) {
                result = "L";
              } else {
                result = "T";
              }
            } else {
              result = "Scheduled";
            }

            matchupsByRoster[rosterId].push({
              week,
              points: matchupPoints,
              opponent_points: opponentPoints,
              result,
              opponentTeamName: opponentInfo.teamName,
              opponentOwnerName: opponentInfo.ownerName,
            });
          });
        });

        // Calculate PF and PA for each roster
        const pointsForAgainstByRosterId = {};

        Object.keys(matchupsByRoster).forEach((rosterId) => {
          const matchups = matchupsByRoster[rosterId];
          let totalPF = 0;
          let totalPA = 0;

          matchups.forEach((matchup) => {
            if (matchup.points !== null && matchup.points !== undefined) {
              totalPF += matchup.points;
            }
            if (
              matchup.opponent_points !== null &&
              matchup.opponent_points !== undefined
            ) {
              totalPA += matchup.opponent_points;
            }
          });

          pointsForAgainstByRosterId[rosterId] = {
            PF: totalPF,
            PA: totalPA,
          };
        });

        setMatchupsByRoster(matchupsByRoster);
        setPointsForAgainst(pointsForAgainstByRosterId);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching league data:", err);
        setError("Failed to load league data. Please try again.");
        setLoading(false);
      }
    };

    fetchData();
  }, [leagueId]);

  // Function to get the team name
  const getTeamName = (roster, user) =>
    roster.settings.team_name || user?.metadata?.team_name || "Unnamed Team";

  // Function to handle sorting based on selected criteria
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const getSortedRosters = () => {
    return [...rosters].sort((a, b) => {
      switch (sortOption) {
        case "mostPF":
          return (
            (pointsForAgainst[b.roster_id]?.PF || 0) -
            (pointsForAgainst[a.roster_id]?.PF || 0)
          );
        case "mostPA":
          return (
            (pointsForAgainst[b.roster_id]?.PA || 0) -
            (pointsForAgainst[a.roster_id]?.PA || 0)
          );
        case "winLoss":
          if (b.settings.wins !== a.settings.wins) {
            return b.settings.wins - a.settings.wins;
          }
          return a.settings.losses - b.settings.losses;
        case "leagueStandings":
        default:
          // First sort by Wins
          if (b.settings.wins !== a.settings.wins) {
            return b.settings.wins - a.settings.wins;
          }
          // Then sort by Losses (lower losses are better)
          if (a.settings.losses !== b.settings.losses) {
            return a.settings.losses - b.settings.losses;
          }
          // Finally, sort by Points For (PF) in descending order
          return (
            (pointsForAgainst[b.roster_id]?.PF || 0) -
            (pointsForAgainst[a.roster_id]?.PF || 0)
          );
      }
    });
  };
  

  if (loading) {
    return (
      <div className="text-center text-white text-xl mt-10">
        Kindly hold on until I finish a cup of coffee...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-xl mt-10 text-red-500">{error}</div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#15182D] p-6">
      {/* League Title */}
      <h1 className="text-2xl md:text-4xl font-bold text-center text-white mb-2">
        {leagueInfo.name} ({leagueInfo.season})
      </h1>
      <h2 className="text-center text-white mb-8">Where the neggin is real!</h2>

     

      {/* Centered View Awards Button */}
      <div className="flex items-center justify-center h-12 mb-10">
        <button
          onClick={() => setIsAwardsOpen(true)}
          className="bg-[#252942] text-white px-6 py-3 rounded-full shadow-lg hover:bg-[#e69f45] transition"
        >
          🏅 View Awards
        </button>
      </div>

       {/* Filter Controls */}
       <div className="mb-6">
        <label className="text-white mr-4">Sort By:</label>
        <select
          value={sortOption}
          onChange={handleSortChange}
          className="bg-[#252942] text-white p-2 rounded-md"
        >
          <option value="leagueStandings">League Standings</option>
          <option value="winLoss">Win / Loss Record</option>
          <option value="mostPF">Most Points For (PF)</option>
          <option value="mostPA">Most Points Against (PA)</option>
        </select>
      </div>

      {/* User List */}
      <div className="w-full max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {getSortedRosters().map((roster) => {
            const user = users.find((u) => u.user_id === roster.owner_id);
            const teamName = getTeamName(roster, user);

            return (
              <div
                key={roster.roster_id}
                className="bg-[#252942] hover:bg-[#3B3F5E] items-center p-6 shadow-lg rounded-lg hover:shadow-xl transition"
              >
                {/* Wrap the user info in a Link */}
                <Link
                  to={`/team/${roster.roster_id}`}
                  className="flex items-center justify-center space-x-4 p-2"
                >
                  {/* Avatar */}
                  <img
                    src={
                      user?.avatar
                        ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}`
                        : "https://via.placeholder.com/64?text=User"
                    }
                    alt={user?.display_name || "Unknown User"}
                    className="w-16 h-16 rounded-full mr-2"
                  />

                  {/* User Info */}
                  <div className="text-left md:text-left">
                    <h2 className="text-lg md:text-xl font-semibold text-white">
                      {user?.display_name || "Unknown Owner"}
                    </h2>
                    <p className="text-md text-gray-300">{teamName}</p>
                    <p className="text-sm">
                      <span className="text-gray-400">Wins:</span>{" "}
                      <span className="text-white">{roster.settings.wins}</span>{" "}
                      <span className="text-zinc-400"> | </span>
                      <span className="text-gray-400">Losses:</span>{" "}
                      <span className="text-white">
                        {roster.settings.losses}
                      </span>
                    </p>
                    <div className="mt-1">
                      <p className="text-xs">
                        <span className="text-gray-400">PF:</span>{" "}
                        <span className="text-white">
                          {pointsForAgainst[roster.roster_id]
                            ? pointsForAgainst[roster.roster_id].PF.toFixed(2)
                            : "0.00"}
                        </span>{" "}
                        <span className="text-zinc-400"> | </span>
                        <span className="text-gray-400">PA:</span>{" "}
                        <span className="text-white">
                          {pointsForAgainst[roster.roster_id]
                            ? pointsForAgainst[roster.roster_id].PA.toFixed(2)
                            : "0.00"}
                        </span>
                      </p>
                    </div>
                  </div>
                </Link>
                {/* Dropdown Toggle */}
                <div className="flex justify-center">
                  <button
                    onClick={() =>
                      setOpenRosterId(
                        openRosterId === roster.roster_id
                          ? null
                          : roster.roster_id
                      )
                    }
                    className="text-sm text-blue-500 hover:underline mt-2"
                  >
                    {openRosterId === roster.roster_id
                      ? "Hide Matchups"
                      : "Show Matchups"}
                  </button>
                </div>

                {/* Dropdown Content */}
                {openRosterId === roster.roster_id && (
                  <div className="mt-4">
                    {matchupsByRoster[roster.roster_id]?.map((matchup) => (
                      <div
                        key={matchup.week}
                        className="text-white text-xs flex flex-col mb-4 p-4 bg-[#1e2235] rounded-md"
                      >
                        <div className="mb-2">
                          <span className="font-light text-[#bbb]">
                            Week {matchup.week}:
                          </span>{" "}
                          <span
                            className={`font-semibold ${getResultColorClass(
                              matchup.result
                            )}`}
                          >
                            {matchup.result}
                          </span>
                        </div>
                        <div>
                          (
                          <span className="font-semibold">
                            {matchup.points !== null &&
                            matchup.points !== undefined
                              ? matchup.points.toFixed(2)
                              : "-"}
                          </span>
                          ) vs.{" "}
                          <span className="font-light text-[#bbb]">
                            {matchup.opponentTeamName}
                          </span>{" "}
                          (
                          <span className="font-semibold">
                            {matchup.opponent_points !== null &&
                            matchup.opponent_points !== undefined
                              ? matchup.opponent_points.toFixed(2)
                              : "-"}
                          </span>
                          )
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Awards Modal */}
      <AwardsModal
        isOpen={isAwardsOpen}
        onClose={() => setIsAwardsOpen(false)}
        sortedRosters={getSortedRosters()}
        users={users}
      />
    </div>
  );
};

export default LeaguePage;
