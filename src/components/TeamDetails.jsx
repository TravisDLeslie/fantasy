import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { FaChevronDown, FaChevronUp, FaChartLine } from 'react-icons/fa';
import { getLeagueRosters, getPlayersMetadata, getLeagueMatchups } from '../api/sleeperApi';
import PlayerWeeklyPoints from './PlayerWeeklyPoints';
import PlayerChart from './PlayerChart';
import teamAbbreviations from '../utils/teamAbbreviations';
import { useDefensePoints } from '../hooks/useDefensePoints';
import useTeamByeWeeks from '../hooks/useTeamByeWeeks';

// Define position styles for background, text color, and border radius
const positionStyles = {
  QB: { text: 'text-[#FC2B6D]', bg: 'bg-[#323655]', border: 'rounded-md' },
  RB: { text: 'text-[#20CEB8]', bg: 'bg-[#323655]', border: 'rounded-md' },
  WR: { text: 'text-[#56C9F8]', bg: 'bg-[#323655]', border: 'rounded-md' },
  TE: { text: 'text-[#FEAE58]', bg: 'bg-[#323655]', border: 'rounded-md' },
  K: { text: 'text-[#C96CFF]', bg: 'bg-[#323655]', border: 'rounded-md' },
  DEF: { text: 'text-[#BF755D]', bg: 'bg-[#323655]', border: 'rounded-md' },
  FLEX: { text: 'text-pink-900', bg: 'bg-[#323655]', border: 'rounded-md' },
};

const getPositionStyles = (position) => positionStyles[position] || { 
  text: 'text-gray-900', 
  bg: 'bg-gray-300', 
  border: 'rounded' 
};

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

  if (loading) return <div className="text-center text-white text-xl mt-10">Loading...</div>;
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
      <div className="flex">
      <ul className="mt-6 space-y-4 w-full md:w-auto">
        {sortedPlayers.map(({ id, name, position, points, teamAbbr, text, bg, border }) => (
          <li key={id} className="text-base md:text-lg text-white">
            <div className="flex w-full items-start justify-between md:space-x-2">
              <div className="md:flex-1 cursor-pointer" onClick={() => toggleDropdown(id)}>
                <div className='flex'>
                <span className="font-regular">{name} - </span> 
                <span className="ml-1 text-[#fcfcfc] mr-4 font-semibold">{points !== '0.00' ? `${points} Pts` : 'Bye Week'}</span>
                </div>
                <div className='w-full mt-1 mb-1'>
                <span className={`text-xs font-semibold ${text} ${bg} ${border} px-2 py-1`}>{position}</span> 
                <span className="ml-1 text-xs text-gray-300">- for ({teamAbbr})</span>

                </div>
              </div>
              <div className="flex ml-4 items-center space-x-2">
                <FaChartLine
                  className="text-[#01F5BF] cursor-pointer hover:text-[#019977]"
                  size={16}
                  onClick={() => handleChartClick(id, name, teamAbbr)}
                />
                {openDropdowns[id] ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
              </div>
            </div>
            {openDropdowns[id] && (
              <div className="mt-2 mb-8 ">
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
