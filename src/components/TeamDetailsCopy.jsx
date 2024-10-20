// src/components/TeamDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getLeagueRosters, getPlayersMetadata, getPlayerStats } from '../api/sleeperApi';

const TeamDetails = ({ leagueId }) => {
  const { rosterId } = useParams();
  const [roster, setRoster] = useState(null);
  const [playersMetadata, setPlayersMetadata] = useState({});
  const [playerStats, setPlayerStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRosterAndPlayers = async () => {
      try {
        const [rosters, metadata, stats] = await Promise.all([
          getLeagueRosters(leagueId),
          getPlayersMetadata(),
          getPlayerStats(), // Fetch cumulative player stats
        ]);

        const team = rosters.find((r) => r.roster_id === parseInt(rosterId));
        setRoster(team);
        setPlayersMetadata(metadata);
        setPlayerStats(stats);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load team roster. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRosterAndPlayers();
  }, [leagueId, rosterId]);

  if (loading) return <div className="text-center text-xl mt-10">Loading...</div>;
  if (error) return <div className="text-center text-xl mt-10 text-red-500">{error}</div>;

  // Sort players by their points (highest to lowest)
  const sortedPlayers = [...roster.players].sort((a, b) => {
    const pointsA = playerStats[a]?.pts_ppr ?? 0;
    const pointsB = playerStats[b]?.pts_ppr ?? 0;
    return pointsB - pointsA; // Descending order
  });

  return (
    <div className="container mx-auto p-6">
      <Link to="/" className="text-blue-500 hover:underline">← Back to League</Link>
      <h1 className="text-3xl font-bold mt-4">Team Roster</h1>
      <ul className="mt-6 space-y-2">
        {sortedPlayers.map((playerId) => {
          const player = playersMetadata[playerId];
          const stats = playerStats[playerId];

          const playerName = player
            ? `${player.first_name} ${player.last_name}`
            : `Unknown Player (ID: ${playerId})`;

          const points = stats?.pts_ppr ?? 'N/A'; // Show points or N/A

          return (
            <li key={playerId} className="text-lg">
              {playerName} - <span className="text-gray-500">Points: {points}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default TeamDetails;


// Manual defense points fallback
const manualDefensePoints = {
  ARI: { 1: 10, 2: 12, 3: 8, 4: 7 },
  DEN: { 1: 27, 2: 14, 3: 30, 4: 23, 5: 26, 6: 9, 7: 34 },
  KC: { 1: 3, 2: 18, 3: 12, 4: 14, 5: 15 },
  CHI: { 1: 38, 2: 14, 3: 11, 4: 17,  5: 27,  6: 22 },
  MIN: { 1: 34, 2: 26, 3: 26, 4: 6,  5: 29, },
  LAC:{ 1: 27, 2: 21, 3: 12, 4: 17,  6: 15 },
  CIN:{ 1: 10, 2: 21, 3: 1, 4: 6, 5: 0,  6: 14 },
  JAX:{ 1: 7, 2: 12, 3: 0, 4: 6, 5: 6,  6: 9 },
  WAS:{ 1: -1, 2: 10, 3: -1, 4: 19, 5: 27,  6: -1 },
  IND:{ 1: 6, 2: 8, 3: 22, 4: 13, 5: -4,  6: 11 },
  BUF:{ 1: 13, 2: 26, 3: 26, 4: -2, 5: 7,  6: 14 },
  PIT:{ 1: 23, 2: 22, 3: 22, 4: 7, 5: 17,  6: 24 },
  PHI:{ 1: 2, 2: 5, 3: 15, 4: 2,  6: 18 },
};