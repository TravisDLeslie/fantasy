// src/components/TeamDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { getLeagueRosters, getPlayersMetadata, getLeagueMatchups } from '../api/sleeperApi';
import PlayerWeeklyPoints from './PlayerWeeklyPoints'; // Weekly points component
import { FaChevronDown, FaChevronUp } from 'react-icons/fa'; // Import icons
import teamAbbreviations from '../utils/teamAbbreviations'; // Team abbreviations utility
import { useDefensePoints } from '../hooks/useDefensePoints'; // Hook for defense points

const TeamDetails = ({ leagueId }) => {
  const { rosterId } = useParams();
  const location = useLocation(); // Access state from LeaguePage
  const { teamName, defensePoints } = location.state || {}; // Extract state

  const { getDefensePoints } = useDefensePoints(); // Use custom hook logic

  const [roster, setRoster] = useState(null);
  const [playersMetadata, setPlayersMetadata] = useState({});
  const [playerPoints, setPlayerPoints] = useState({});
  const [openDropdowns, setOpenDropdowns] = useState({}); // Track open dropdowns
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data on component mount
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

        // Fetch matchups across the season
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

  if (loading) return <div className="text-center text-xl mt-10">Loading...Patience you son of a b...</div>;
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

    return { id: playerId, name: playerName, position, points: rawPoints.toFixed(2) };
  }).sort((a, b) => b.points - a.points);

  return (
    <div className="container mx-auto p-6">
      <Link to="/" className="text-blue-500 hover:underline">← Back to League</Link>
      <h1 className="text-3xl font-bold mt-4">
        {teamName || roster?.settings?.team_name || 'Team Roster'}
      </h1>
      <ul className="mt-6 space-y-4">
        {sortedPlayers.map(({ id, name, position, points }) => (
          <li key={id} className="text-base md:text-lg text-zinc-800">
            <div
              className="flex justify-start items-center cursor-pointer"
              onClick={() => toggleDropdown(id)}
            >
              <div>
                {name} <span className="text-zinc-500 text-sm">{position}</span> - 
                <span className="text-zinc-900 text-base md:text-lg font-regular"> Total Points: {points}</span>
              </div>
              <div className="ml-8">
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
  );
};

export default TeamDetails;
