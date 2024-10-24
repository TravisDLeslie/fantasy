import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { FaChartLine, FaInfoCircle } from 'react-icons/fa';
import { getLeagueRosters, getPlayersMetadata, getLeagueMatchups } from '../api/sleeperApi';
import PlayerWeeklyStats from './PlayerWeeklyStats'; // Assuming this is the modal component for weekly stats
import PlayerChart from './PlayerChart';
import teamAbbreviations from '../utils/teamAbbreviations';
import { useDefensePoints } from '../hooks/useDefensePoints';
import useTeamByeWeeks from '../hooks/useTeamByeWeeks';

const positionStyles = {
  QB: { text: 'text-[#FC2B6D]', bg: 'bg-[#323655]', border: 'rounded-md' },
  RB: { text: 'text-[#20CEB8]', bg: 'bg-[#323655]', border: 'rounded-md' },
  WR: { text: 'text-[#56C9F8]', bg: 'bg-[#323655]', border: 'rounded-md' },
  TE: { text: 'text-[#FEAE58]', bg: 'bg-[#323655]', border: 'rounded-md' },
  K: { text: 'text-[#C96CFF]', bg: 'bg-[#323655]', border: 'rounded-md' },
  DEF: { text: 'text-[#BF755D]', bg: 'bg-[#323655]', border: 'rounded-md' },
  FLEX: { text: 'text-pink-900', bg: 'bg-[#323655]', border: 'rounded-md' },
};

const getPositionStyles = (position) =>
  positionStyles[position] || { text: 'text-gray-900', bg: 'bg-gray-300', border: 'rounded' };

const TeamDetails = ({ leagueId }) => {
  const { rosterId } = useParams();
  const location = useLocation();
  const { teamName, defensePoints } = location.state || {};

  const { getDefensePoints } = useDefensePoints();
  const { getTeamByeWeek } = useTeamByeWeeks();

  const [roster, setRoster] = useState(null);
  const [playersMetadata, setPlayersMetadata] = useState({});
  const [playerPoints, setPlayerPoints] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [infoModalPlayer, setInfoModalPlayer] = useState(null); // For the info modal
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rosters, metadata] = await Promise.all([
          getLeagueRosters(leagueId),
          getPlayersMetadata(),
        ]);

        const team = rosters.find((r) => r.roster_id === parseInt(rosterId));
        if (!team) throw new Error(`Team with roster ID ${rosterId} not found`);

        setRoster(team);
        setPlayersMetadata(metadata);

        const totalPoints = {};
        const weeklyPoints = {};
        const processed = new Set();

        const allMatchups = await Promise.all(
          Array.from({ length: 17 }, (_, i) => getLeagueMatchups(leagueId, i + 1))
        );

        allMatchups.forEach((matchups, week) => {
          matchups.forEach((matchup) => {
            const points = matchup.players_points || {};
            Object.entries(points).forEach(([playerId, weekPoints]) => {
              if (!processed.has(`${playerId}-${week}`)) {
                totalPoints[playerId] = (totalPoints[playerId] || 0) + weekPoints;
                if (!weeklyPoints[playerId]) weeklyPoints[playerId] = {};
                weeklyPoints[playerId][week + 1] = weekPoints;
                processed.add(`${playerId}-${week}`);
              }
            });
          });
        });

        setPlayerPoints({ totalPoints, weeklyPoints });
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load team roster. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [leagueId, rosterId]);

  const handleChartClick = (playerId, playerName, teamAbbr, position) => {
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
    const byeWeek = getTeamByeWeek(teamAbbr); // Ensure we get the correct bye week here
    setInfoModalPlayer({
      playerName,
      position,
      teamAbbr,
      weeklyPoints: playerPoints.weeklyPoints[playerId] || {},
      byeWeek,
    });
  };

  const closeModal = () => {
    setSelectedPlayer(null);
    setInfoModalPlayer(null);
  };

  if (loading) return <div className="text-center text-white text-xl mt-10">Loading your wack roster...</div>;
  if (error) return <div className="text-center text-xl mt-10 text-red-500">{error}</div>;

  const sortedPlayers = roster?.players?.map((playerId) => {
    const isDefense = isNaN(playerId);
    const playerData = playersMetadata[playerId] || {};
    const playerName = isDefense
      ? teamAbbreviations[playerId] || `Unknown Team (ID: ${playerId})`
      : `${playerData.first_name || 'Unknown'} ${playerData.last_name || 'Player'}`;

    const position = playerData?.position || 'N/A';
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
  }).sort((a, b) => b.points - a.points);

  return (
    <div className="container bg-[#15182D] mx-auto p-6">
      <Link to="/" className="text-[#BCC3FF] hover:underline">← Back to League</Link>
      <h1 className="text-3xl text-white font-bold mt-4">
        {teamName || roster?.settings?.team_name || 'Team Roster'}
      </h1>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {sortedPlayers.map(({ id, name, position, points, teamAbbr, text, bg, border }) => (
          <div key={id} className={`p-4 ${bg} ${border} shadow-md rounded-md`}>
            <div className="flex items-center justify-between">
              <span className={`font-semibold text-sm md:text-base ${text}`}>{name}</span>
              <span className="text-white text-sm md:text-base">{points} Pts</span>
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
                onClick={() => handleChartClick(id, name, teamAbbr, position)}
              />
            </div>
          </div>
        ))}
      </div>

      {selectedPlayer && (
        <PlayerChart
          playerName={selectedPlayer.name}
          position={selectedPlayer.position}
          teamAbbr={selectedPlayer.teamAbbr}
          weeklyPoints={selectedPlayer.weeklyPoints}
          byeWeek={selectedPlayer.byeWeek}
          onClose={closeModal}
        />
      )}

      {infoModalPlayer && (
        <PlayerWeeklyStats
          playerName={infoModalPlayer.playerName}
          position={infoModalPlayer.position}
          teamAbbr={infoModalPlayer.teamAbbr}
          weeklyPoints={infoModalPlayer.weeklyPoints}
          byeWeek={infoModalPlayer.byeWeek}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default TeamDetails;
