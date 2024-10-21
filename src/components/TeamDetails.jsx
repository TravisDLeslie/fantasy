import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { FaChevronDown, FaChevronUp, FaChartLine } from 'react-icons/fa';
import { getLeagueRosters, getPlayersMetadata, getLeagueMatchups } from '../api/sleeperApi';
import PlayerWeeklyPoints from './PlayerWeeklyPoints';
import PlayerChart from './PlayerChart';
import teamAbbreviations from '../utils/teamAbbreviations';
import { useDefensePoints } from '../hooks/useDefensePoints';
import useTeamByeWeeks from '../hooks/useTeamByeWeeks';

const TeamDetails = ({ leagueId }) => {
  const { rosterId } = useParams();
  const location = useLocation();
  const { teamName, defensePoints } = location.state || {};

  const { getDefensePoints } = useDefensePoints();
  const { getTeamByeWeek } = useTeamByeWeeks();

  const [roster, setRoster] = useState(null);
  const [playersMetadata, setPlayersMetadata] = useState({});
  const [playerPoints, setPlayerPoints] = useState({});
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [selectedPlayer, setSelectedPlayer] = useState(null);
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

  const toggleDropdown = (playerId) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [playerId]: !prev[playerId],
    }));
  };

  const handleChartClick = (playerId, playerName, teamAbbr) => {
    const byeWeek = getTeamByeWeek(teamAbbr);
    const playerData = {
      id: playerId,
      name: playerName,
      weeklyPoints: playerPoints.weeklyPoints[playerId] || {},
      byeWeek,
    };
    setSelectedPlayer(playerData);
  };

  const closeModal = () => setSelectedPlayer(null);

  if (loading) return <div className="text-center text-xl mt-10">Kindly hold on until I finish a cup of coffee...</div>;
  if (error) return <div className="text-center text-xl mt-10 text-red-500">{error}</div>;

  const sortedPlayers = roster?.players?.map((playerId) => {
    const isDefense = isNaN(playerId);
    const playerData = playersMetadata[playerId] || {};
    const playerName = isDefense
      ? teamAbbreviations[playerId] || `Unknown Team (ID: ${playerId})`
      : `${playerData.first_name || 'Unknown'} ${playerData.last_name || 'Player'}`;

    const position = playerData?.position ? `(${playerData.position})` : '';
    const rawPoints = isDefense
      ? getDefensePoints(playerId, rosterId, defensePoints)
      : playerPoints.totalPoints[playerId] || 0;

    const teamAbbr = isDefense ? playerId : playerData.team;

    return { id: playerId, name: playerName, position, points: rawPoints.toFixed(2), teamAbbr };
  }).sort((a, b) => b.points - a.points);

  return (
    <div className="container bg-[#15182D] mx-auto p-6">
      <Link to="/" className="text-blue-500 hover:underline">← Back to League</Link>
      <h1 className="text-3xl text-white font-bold mt-4">
        {teamName || roster?.settings?.team_name || 'Team Roster'}
      </h1>
      <div className="flex">
      <ul className="mt-6 space-y-4">
        {sortedPlayers.map(({ id, name, position, points, teamAbbr }) => (
          <li key={id} className="text-base text-white md:text-lg text-white">
            <div className="flex items-center justify-between md:justify-start md:space-x-2">
              <div className="flex-1 cursor-pointer" onClick={() => toggleDropdown(id)}>
                {name} <span className="text-zinc-500 text-sm">{position}</span> - 
                <span className="ml-2 text-white text-base md:text-lg">
                  {points !== '0.00' ? `${points} Pts` : 'Bye Week'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <FaChartLine
                  className="text-blue-500 cursor-pointer hover:text-blue-700"
                  size={16}
                  onClick={() => handleChartClick(id, name, teamAbbr)}
                />
                {openDropdowns[id] ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
              </div>
            </div>

            {openDropdowns[id] && (
              <div className="mt-2">
                <PlayerWeeklyPoints playerId={id} weeklyPoints={playerPoints.weeklyPoints[id] || {}} />
              </div>
            )}
          </li>
        ))}
      </ul>
      </div>

      {selectedPlayer && (
        <PlayerChart
          playerName={selectedPlayer.name}
          playerId={selectedPlayer.id}
          weeklyPoints={selectedPlayer.weeklyPoints}
          byeWeek={selectedPlayer.byeWeek}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default TeamDetails;
