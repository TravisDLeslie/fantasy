import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const BASE_URL = "https://api.sleeper.app";

const PlayerStats = ({ season = "2024" }) => {
  const { playerId } = useParams(); // Extract playerId from route params
  const [playerStats, setPlayerStats] = useState(null);
  const [playerMetadata, setPlayerMetadata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch player stats and metadata
  useEffect(() => {
    const fetchPlayerData = async () => {
      try {
        const statsResponse = await axios.get(
          `${BASE_URL}/stats/nfl/player/${playerId}?season_type=regular&season=${season}&grouping=season`
        );

        const metadataResponse = await axios.get(
          `${BASE_URL}/v1/players/nfl/${playerId}`
        );

        setPlayerStats(statsResponse.data);
        setPlayerMetadata(metadataResponse.data);
      } catch (err) {
        console.error("Error fetching player data:", err.response?.data || err.message);
        setError("Failed to load player data.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayerData();
  }, [playerId, season]);

  if (loading) {
    return <div className="text-white text-center mt-10">Loading player data...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  if (!playerStats || !playerMetadata) {
    return <div className="text-white text-center mt-10">No data available.</div>;
  }

  const { full_name } = playerMetadata;
  const { pass_yds, rush_yds, rec_yds, pass_tds, rush_tds, rec_tds } = playerStats;

  return (
    <div className="max-w-lg mx-auto bg-[#252942] p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl text-white font-semibold mb-4">Player Details</h2>
      <p className="text-lg text-white mb-2">
        <span className="font-bold">Name:</span> {full_name || 'Unknown'}
      </p>
      <p className="text-lg text-white mb-4">
        <span className="font-bold">Player ID:</span> {playerId}
      </p>
      <h3 className="text-xl text-white font-semibold mb-2">Stats</h3>
      <table className="table-auto w-full text-white text-left">
        <thead>
          <tr>
            <th className="border-b px-4 py-2">Statistic</th>
            <th className="border-b px-4 py-2">Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="border-b px-4 py-2">Passing Yards</td>
            <td className="border-b px-4 py-2">{pass_yds || 0}</td>
          </tr>
          <tr>
            <td className="border-b px-4 py-2">Rushing Yards</td>
            <td className="border-b px-4 py-2">{rush_yds || 0}</td>
          </tr>
          <tr>
            <td className="border-b px-4 py-2">Receiving Yards</td>
            <td className="border-b px-4 py-2">{rec_yds || 0}</td>
          </tr>
          <tr>
            <td className="border-b px-4 py-2">Passing Touchdowns</td>
            <td className="border-b px-4 py-2">{pass_tds || 0}</td>
          </tr>
          <tr>
            <td className="border-b px-4 py-2">Rushing Touchdowns</td>
            <td className="border-b px-4 py-2">{rush_tds || 0}</td>
          </tr>
          <tr>
            <td className="border-b px-4 py-2">Receiving Touchdowns</td>
            <td className="border-b px-4 py-2">{rec_tds || 0}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default PlayerStats;
