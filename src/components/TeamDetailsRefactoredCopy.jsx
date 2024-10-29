// components/TeamDetails.js
import React, { useState, useRef } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import useRosterData from "../hooks/useRosterData";
import useTopScoringPlayers from "../hooks/useTopScoringPlayers";
import PlayerCard from "./PlayerCard";
import TopScoringList from "./TopScoringList";
import TeamPointsList from "./TeamPointsList";
import { getPositionStyles } from "../utils/positionStyles";
import teamAbbreviations from "../utils/teamAbbreviations";
import PlayerWeeklyStats from "./PlayerWeeklyStats";
import PlayerChart from "./PlayerChart";
import { useDefensePoints } from "../hooks/useDefensePoints";
import useTeamByeWeeks from "../hooks/useTeamByeWeeks";
import usePlayerTotalPoints from "../hooks/usePlayerTotalPoints";

const TeamDetails = ({ leagueId }) => {
  const { rosterId } = useParams();
  const location = useLocation();
  const { teamName, defensePoints } = location.state || {};

  const { getDefensePoints } = useDefensePoints();
  const { getTeamByeWeek } = useTeamByeWeeks();

  const {
    roster,
    users,
    user,
    playersMetadata,
    playerPoints,
    playerSchedules,
    teamMatchups,
    currentWeek,
    loading,
    error,
  } = useRosterData(leagueId, rosterId);

  const { weeks1to8, weeks9to17 } = useTopScoringPlayers(
    roster,
    playersMetadata,
    playerPoints,
    currentWeek
  );

  const [selectedWeekTeamPoints, setSelectedWeekTeamPoints] = useState(currentWeek || 1);

  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [infoModalPlayer, setInfoModalPlayer] = useState(null);

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
        Loading your roster...
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
        : `${playerData.first_name || "Unknown"} ${playerData.last_name || "Player"}`;

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

  // Prepare team points for the selected week
  const currentWeekTeamPlayers = roster?.players
    ?.map((playerId) => {
      const isDefense = isNaN(playerId);
      const playerData = playersMetadata[playerId] || {};
      const playerName = isDefense
        ? teamAbbreviations[playerId] || `Unknown Team (ID: ${playerId})`
        : `${playerData.first_name || "Unknown"} ${playerData.last_name || "Player"}`;

      const position = playerData?.position || "N/A";
      const weekPoints = playerPoints.weeklyPoints[playerId]?.[selectedWeekTeamPoints] || 0;

      const teamAbbr = isDefense ? playerId : playerData.team;
      const { text, bg, border } = getPositionStyles(position);

      return {
        id: playerId,
        name: playerName,
        position,
        points: weekPoints.toFixed(2),
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

      {/* Matchups can be added here if needed */}

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-h-auto w-full">
        {/* Left Column - Players sorted by highest scorer */}
        <div className="grid grid-cols-2 gap-2 mt-6">
          {sortedPlayers.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onInfoClick={handleInfoClick}
              onChartClick={handlePlayerSelect}
            />
          ))}
        </div>

        {/* Center Column - Top Scoring Players */}
        <div className="col-span-1 bg-[#252942] p-4 rounded-md shadow-md text-white overflow-y-auto mt-6 max-h-auto">
          <h2 className="text-lg font-bold mb-4">
            Top Scoring Players per Week
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <TopScoringList weeks={weeks1to8} title="Weeks 1-8" />
            <TopScoringList weeks={weeks9to17} title="Weeks 9-17" />
          </div>
        </div>

        {/* Right Column - Team Points Scorers */}
        <TeamPointsList
          players={currentWeekTeamPlayers}
          selectedWeek={selectedWeekTeamPoints}
          onPrevWeek={() =>
            setSelectedWeekTeamPoints((prev) => Math.max(prev - 1, 1))
          }
          onNextWeek={() =>
            setSelectedWeekTeamPoints((prev) => Math.min(prev + 1, 17))
          }
        />
      </div>

      {/* Modals */}
      {selectedPlayer && (
        <PlayerChart
          {...selectedPlayer}
          playerName={selectedPlayer.name}
          onClose={closeModal}
        />
      )}

      {infoModalPlayer && (
        <PlayerWeeklyStats
          {...infoModalPlayer}
          leagueId={leagueId}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default TeamDetails;
