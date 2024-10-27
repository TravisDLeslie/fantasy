import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaChartLine,
  FaInfoCircle,
} from "react-icons/fa";
import {
  getLeagueRosters,
  getLeagueUsers,
  getPlayersMetadata,
  getLeagueMatchups,
  getNFLState,
} from "../api/sleeperApi";
import PlayerWeeklyStats from "./PlayerWeeklyStats";
import PlayerChart from "./PlayerChart";
import teamAbbreviations from "../utils/teamAbbreviations";
import { useDefensePoints } from "../hooks/useDefensePoints";
import useTeamByeWeeks from "../hooks/useTeamByeWeeks";

// Import Swiper components and modules
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

// Custom Swiper Arrows
const CustomNextButton = React.forwardRef((_, ref) => (
  <button
    ref={ref}
    className="swiper-button-react-next absolute right-2 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-[#01F5BF]"
  >
    <FaArrowRight size={24} />
  </button>
));

const CustomPrevButton = React.forwardRef((_, ref) => (
  <button
    ref={ref}
    className="swiper-button-react-prev absolute left-2 top-1/2 transform -translate-y-1/2 z-10 text-white hover:text-[#01F5BF]"
  >
    <FaArrowLeft size={24} />
  </button>
));



const positionStyles = {
  QB: { text: "text-[#FC2B6D]", bg: "bg-[#252942]", border: "rounded-md" },
  RB: { text: "text-[#20CEB8]", bg: "bg-[#252942]", border: "rounded-md" },
  WR: { text: "text-[#56C9F8]", bg: "bg-[#252942]", border: "rounded-md" },
  TE: { text: "text-[#FEAE58]", bg: "bg-[#252942]", border: "rounded-md" },
  K: { text: "text-[#C96CFF]", bg: "bg-[#252942]", border: "rounded-md" },
  DEF: { text: "text-[#BF755D]", bg: "bg-[#252942]", border: "rounded-md" },
  FLEX: { text: "text-pink-900", bg: "bg-[#252942]", border: "rounded-md" },
};

const getPositionStyles = (position) =>
  positionStyles[position] || {
    text: "text-gray-900",
    bg: "bg-gray-300",
    border: "rounded",
  };

const TeamDetails = ({ leagueId }) => {
  const { rosterId } = useParams();
  const location = useLocation();
  const { teamName, defensePoints } = location.state || {};

  const { getDefensePoints } = useDefensePoints();
  const { getTeamByeWeek } = useTeamByeWeeks();

  const [roster, setRoster] = useState(null);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null); // Current team's owner
  const [playersMetadata, setPlayersMetadata] = useState({});
  const [playerPoints, setPlayerPoints] = useState({});
  const [playerSchedules, setPlayerSchedules] = useState({});
  const [teamMatchups, setTeamMatchups] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [infoModalPlayer, setInfoModalPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const prevButtonRef = useRef(null);
  const nextButtonRef = useRef(null);


  const fetchRosterData = useCallback(async () => {
    try {
      const [rosters, metadata, nflState, usersData] = await Promise.all([
        getLeagueRosters(leagueId),
        getPlayersMetadata(),
        getNFLState(),
        getLeagueUsers(leagueId),
      ]);

      setCurrentWeek(nflState.week || 1);
      setUsers(usersData);

      const team = rosters.find((r) => r.roster_id === parseInt(rosterId));
      if (!team) throw new Error(`Team with roster ID ${rosterId} not found`);

      setRoster(team);

      // Define user (current team's owner)
      const owner = usersData.find((u) => u.user_id === team.owner_id);
      setUser(owner);

      setPlayersMetadata(metadata);

      const allMatchups = await fetchAllMatchups(leagueId);

      const { totalPoints, weeklyPoints, schedules } =
        processMatchups(allMatchups);

      setPlayerPoints({ totalPoints, weeklyPoints });
      setPlayerSchedules(schedules);

      // Process team matchups
      const teamMatchupsData = processTeamMatchups(
        allMatchups,
        rosterId,
        rosters,
        usersData,
        currentWeek // Pass currentWeek here
      );
      setTeamMatchups(teamMatchupsData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load team roster. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [leagueId, rosterId, currentWeek]);

  useEffect(() => {
    fetchRosterData();
  }, [fetchRosterData]);

  const fetchAllMatchups = async (leagueId) => {
    const weeks = Array.from({ length: 17 }, (_, i) => i + 1);
    const matchups = await Promise.all(
      weeks.map((week) => getLeagueMatchups(leagueId, week))
    );
    return matchups;
  };

  const processMatchups = (allMatchups) => {
    const totalPoints = {};
    const weeklyPoints = {};
    const schedules = {};
    const processed = new Set();

    allMatchups.forEach((matchups, week) => {
      matchups.forEach((matchup) => {
        const points = matchup.players_points || {};
        const opponentId = matchup.matchup_id;

        Object.entries(points).forEach(([playerId, weekPoints]) => {
          const key = `${playerId}-${week}`;

          if (!processed.has(key)) {
            totalPoints[playerId] = (totalPoints[playerId] || 0) + weekPoints;
            if (!weeklyPoints[playerId]) weeklyPoints[playerId] = {};
            weeklyPoints[playerId][week + 1] = weekPoints;

            if (!schedules[playerId]) schedules[playerId] = {};
            schedules[playerId][week + 1] = opponentId;

            processed.add(key);
          }
        });
      });
    });

    return { totalPoints, weeklyPoints, schedules };
  };

  const processTeamMatchups = (
    allMatchups,
    rosterId,
    rosters,
    users,
    currentWeek
  ) => {
    const matchups = [];

    allMatchups.forEach((weeklyMatchups, index) => {
      const week = index + 1;
      const teamMatchup = weeklyMatchups.find(
        (matchup) => matchup.roster_id === parseInt(rosterId)
      );

      if (teamMatchup) {
        const opponentMatchup = weeklyMatchups.find(
          (m) =>
            m.matchup_id === teamMatchup.matchup_id &&
            m.roster_id !== teamMatchup.roster_id
        );

        const opponentRoster = opponentMatchup
          ? rosters.find((r) => r.roster_id === opponentMatchup.roster_id)
          : null;

        const opponentUser = opponentRoster
          ? users.find((u) => u.user_id === opponentRoster.owner_id)
          : null;

        const result = determineMatchupResult(
          teamMatchup,
          opponentMatchup,
          week,
          currentWeek
        );

        matchups.push({
          week,
          points: teamMatchup.points || 0,
          opponentPoints: opponentMatchup?.points || 0,
          opponentName: opponentUser?.display_name || "Bye",
          opponentAvatar: opponentUser?.avatar || null,
          result,
        });
      }
    });

    return matchups;
  };

  const determineMatchupResult = (
    teamMatchup,
    opponentMatchup,
    week,
    currentWeek
  ) => {
    if (week === currentWeek) {
      return "In Progress";
    } else if (
      teamMatchup.points !== null &&
      teamMatchup.points !== undefined &&
      opponentMatchup?.points !== null &&
      opponentMatchup?.points !== undefined
    ) {
      if (teamMatchup.points > opponentMatchup.points) return "W";
      if (teamMatchup.points < opponentMatchup.points) return "L";
      return "T";
    } else {
      return "Scheduled";
    }
  };

  const getInitialSlideIndex = (matchups, currentWeek) => {
    const inProgressIndex = matchups.findIndex((m) => m.week === currentWeek);
    return inProgressIndex !== -1 ? inProgressIndex : 0; // Default to the first slide
  };

  const getResultColorClass = (result) => {
    switch (result) {
      case "W":
        return "text-[#01F5BF]"; // Greenish color for win
      case "L":
        return "text-[#EC5556]"; // Red color for loss
      case "T":
        return "text-[#F5C542]"; // Yellow color for tie
      case "In Progress":
        return "text-[#FFA500]"; // Orange color for in-progress matchups
      default:
        return "text-white";
    }
  };

  const handlePlayerSelect = (playerId, playerName, teamAbbr, position) => {
    const byeWeek = getTeamByeWeek(teamAbbr);
    setSelectedPlayer({
      id: playerId,
      name: playerName,
      position,
      teamAbbr,
      weeklyPoints: playerPoints.weeklyPoints[playerId] || {},
      byeWeek,
    });
  };

  const handleInfoClick = (playerId, playerName, position, teamAbbr) => {
    const byeWeek = getTeamByeWeek(teamAbbr);
    setInfoModalPlayer({
      playerName,
      position,
      teamAbbr,
      weeklyPoints: playerPoints.weeklyPoints[playerId] || {},
      byeWeek,
      schedule: playerSchedules[playerId] || {},
    });
  };

  const closeModal = () => {
    setSelectedPlayer(null);
    setInfoModalPlayer(null);
  };

  if (loading)
    return (
      <div className="text-center text-white text-xl mt-10">
        Loading your wack roster...
      </div>
    );
  if (error)
    return (
      <div className="text-center text-xl mt-10 text-red-500">{error}</div>
    );

  const sortedPlayers = roster?.players
    ?.map((playerId) => {
      const isDefense = isNaN(playerId);
      const playerData = playersMetadata[playerId] || {};
      const playerName = isDefense
        ? teamAbbreviations[playerId] || `Unknown Team (ID: ${playerId})`
        : `${playerData.first_name || "Unknown"} ${
            playerData.last_name || "Player"
          }`;

      const position = playerData?.position || "N/A";
      const rawPoints = isDefense
        ? getDefensePoints(playerId, rosterId, defensePoints)
        : playerPoints.totalPoints[playerId] || 0;

      const teamAbbr = isDefense ? playerId : playerData.team;
      const { text, bg, border } = getPositionStyles(position);

      return {
        id: playerId,
        name: playerName,
        position,
        points: rawPoints.toFixed(2),
        teamAbbr,
        text,
        bg,
        border,
      };
    })
    .sort((a, b) => b.points - a.points);

    return (
      <div className="container bg-[#15182D] mx-auto p-6">
        <Link to="/" className="text-[#BCC3FF] hover:underline">
          ← Back to League
        </Link>
        <h1 className="text-3xl text-white font-bold mb-8 mt-4">
        {user?.display_name || "Your Team"}
</h1>
    
        {/* Matchup Carousel */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Left Column - Swiper Component */}
          <div className="col-span-1 relative">
            {/* Custom Navigation Buttons */}
            <CustomPrevButton ref={prevButtonRef} />
        <CustomNextButton ref={nextButtonRef} />

    
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={10}
              slidesPerView={1}
              centeredSlides={true}
              navigation={{
                nextEl: ".swiper-button-react-next",
                prevEl: ".swiper-button-react-prev",
              }}
              onSwiper={(swiper) => {
                swiper.params.navigation.prevEl = prevButtonRef.current;
                swiper.params.navigation.nextEl = nextButtonRef.current;
                swiper.navigation.init();
                swiper.navigation.update();
              }}
              pagination={{ clickable: true }}
              initialSlide={getInitialSlideIndex(teamMatchups, currentWeek)}
            >
              {teamMatchups.map((matchup, index) => {
                const userTeamLogo = user?.avatar
                  ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}`
                  : "https://via.placeholder.com/64?text=Team";
    
                const opponentTeamLogo = matchup.opponentAvatar
                  ? `https://sleepercdn.com/avatars/thumbs/${matchup.opponentAvatar}`
                  : "https://via.placeholder.com/64?text=Opponent";
    
                return (
                  <SwiperSlide key={index}>
                    <div className="bg-[#1E2235] p-4 rounded-md shadow-md text-white">
                      <div className="flex flex-col items-center">
                        <span className="text-lg font-bold mb-2">
                          Week {matchup.week}
                        </span>
    
                        <div className="flex items-center justify-center w-full">
                          <div className="flex flex-col items-center w-1/2">
                            <img
                              src={userTeamLogo}
                              alt="Your Team"
                              className="w-12 h-12 mb-1 rounded-full"
                            />
                            <span className="font-medium text-sm">
                              {user?.display_name || "Your Team"}
                            </span>
                            <span className="text-xl font-bold mt-1">
                              {matchup.points.toFixed(2)} pts
                            </span>
                          </div>
    
                          <div className="mx-2 text-gray-400 font-semibold text-sm">
                            VS
                          </div>
    
                          <div className="flex flex-col items-center w-1/2">
                            <img
                              src={opponentTeamLogo}
                              alt={matchup.opponentName}
                              className="w-12 h-12 mb-1 rounded-full"
                            />
                            <span className="font-medium text-sm">
                              {matchup.opponentName}
                            </span>
                            <span className="text-xl font-bold mt-1">
                              {matchup.opponentPoints.toFixed(2)} pts
                            </span>
                          </div>
                        </div>
    
                        <span
                          className={`mt-4 text-lg font-semibold ${getResultColorClass(
                            matchup.result
                          )}`}
                        >
                          {matchup.result}
                        </span>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
    
          {/* Center Column - Placeholder for Component 2 */}
          <div className="col-span-1 bg-[#252942] p-4 rounded-md shadow-md text-white">
            <h2 className="text-lg font-bold">Component 2</h2>
            <p className="mt-2">
              This is a placeholder for your second component.
            </p>
          </div>
    
          {/* Right Column - Placeholder for Component 3 */}
          <div className="col-span-1 bg-[#252942] p-4 rounded-md shadow-md text-white">
            <h2 className="text-lg font-bold">Component 3</h2>
            <p className="mt-2">
              This is a placeholder for your third component.
            </p>
          </div>
        </div>
    
        {/* Player Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {sortedPlayers.map(({ id, name, position, points, teamAbbr, text, bg, border }) => (
            <div key={id} className={`p-4 ${bg} ${border} shadow-md rounded-md`}>
              <div className="flex items-center justify-between">
                <span className={`font-semibold text-sm md:text-base ${text}`}>
                  {name}
                </span>
                <span className="text-white text-sm md:text-base">
                  {points} Pts
                </span>
              </div>
              <div className="mt-2 text-xs md:text-base text-[#bbb]">
                <span>{position}</span> - <span>({teamAbbr})</span>
              </div>
              <div className="mt-4 flex justify-between">
                <FaInfoCircle
                  className="text-blue-400 cursor-pointer hover:text-blue-300"
                  onClick={() => handleInfoClick(id, name, position, teamAbbr)}
                />
                <FaChartLine
                  className="text-[#01F5BF] cursor-pointer hover:text-[#019977]"
                  onClick={() => handlePlayerSelect(id, name, teamAbbr, position)}
                />
              </div>
            </div>
          ))}
        </div>
    
        {selectedPlayer && (
          <PlayerChart {...selectedPlayer} onClose={closeModal} />
        )}
    
        {infoModalPlayer && (
          <PlayerWeeklyStats {...infoModalPlayer} onClose={closeModal} />
        )}
      </div>
    );
  };
  
  export default TeamDetails;
