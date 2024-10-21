import React, { useEffect, useState } from 'react';
import { getLeagueMatchups, getPlayersMetadata } from '../api/sleeperApi';

// Helper function to check if player is injured or didn't play
const getPlayerStatus = (playerId, weeklyPoints, metadata) => {
  const points = weeklyPoints[playerId] || 0;
  const injuryStatus = metadata[playerId]?.injury_status || 'healthy';
  const reason = metadata[playerId]?.injury_start_date ? 'Injured' : 'DNP'; // Did Not Play

  if (points === 0) {
    return injuryStatus !== 'healthy' ? `Injured (${reason})` : 'Did Not Play';
  }
  return 'Played';
};

const PlayerStatusComponent = ({ playerId, week, leagueId }) => {
  const [playerMetadata, setPlayerMetadata] = useState({});
  const [weeklyPoints, setWeeklyPoints] = useState({});
  const [status, setStatus] = useState('Loading...');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metadata, matchups] = await Promise.all([
          getPlayersMetadata(),
          getLeagueMatchups(leagueId, week),
        ]);

        setPlayerMetadata(metadata);

        // Extract weekly points for the player
        const points = matchups.flatMap((m) =>
          Object.entries(m.players_points || {}).map(([id, pts]) => ({ id, pts }))
        );
        const playerPoints = points.reduce((acc, { id, pts }) => {
          acc[id] = pts;
          return acc;
        }, {});

        setWeeklyPoints(playerPoints);

        // Get the player status
        const playerStatus = getPlayerStatus(playerId, playerPoints, metadata);
        setStatus(playerStatus);
      } catch (error) {
        console.error('Error fetching player status:', error);
        setStatus('Error fetching status');
      }
    };

    fetchData();
  }, [playerId, week, leagueId]);

  return <div className="text-white text-sm">{status}</div>;
};

export default PlayerStatusComponent;
