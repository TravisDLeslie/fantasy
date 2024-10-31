import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BASE_URL = "https://api.sleeper.app";

const PlayerSearch = () => {
  const [searchTerm, setSearchTerm] = useState(''); // Search input
  const [players, setPlayers] = useState([]); // Full player list
  const [filteredPlayers, setFilteredPlayers] = useState([]); // Filtered search results
  const [selectedPlayer, setSelectedPlayer] = useState(null); // Selected player for stats
  const [playerStats, setPlayerStats] = useState(null); // Selected player's stats
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false); 


  const defenseTeams = [
    { full_name: "Buffalo Bills", player_id: "BUF_DEF", position: "DEF", team: "BUF" },
    { full_name: "New England Patriots", player_id: "NE_DEF", position: "DEF", team: "NE" },
    // Add all other NFL teams similarly
  ];

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/v1/players/nfl`);
        const playerData = Array.isArray(response.data) ? response.data : Object.values(response.data);
        
        // Filter for active players by position and team presence
        const validPositions = ['QB', 'RB', 'WR', 'TE', 'K', 'DEF'];
        const activePlayers = playerData.filter(
          player => validPositions.includes(player.position) && player.team // Only players with a team
        );
  
        setPlayers(activePlayers);
        setFilteredPlayers(activePlayers); // Start with filtered list
      } catch (err) {
        console.error("Error fetching players:", err);
        setError("Failed to load player data.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchPlayers();
  }, []);
  

  // Update filtered results based on search term
  useEffect(() => {
    const results = players.filter((player) =>
      player.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPlayers(results);
  }, [searchTerm, players]);

  // Fetch player stats by player ID for the 2024 season
const fetchPlayerStats = async (playerId) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/stats/nfl/player/${playerId}?season_type=regular&season=2024&grouping=season`
      );
      console.log("Fetched player stats:", response.data); // Debug: Log the stats response
      setPlayerStats(response.data.stats); // Store only the nested stats object
    } catch (err) {
      console.error("Error fetching player stats:", err);
      setError("Failed to load player stats.");
    }
  };
  
  

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setIsModalOpen(true);
    fetchPlayerStats(player.player_id);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedPlayer(null);
    setPlayerStats(null);
  };


  const renderStats = () => {
    if (!playerStats || !selectedPlayer) return null;
  
    switch (selectedPlayer.position) {
      case 'QB':
        return (
          <>
            <tr><td className="px-4 py-2 border">Passing Yards</td><td className="px-4 py-2 border">{playerStats?.pass_air_yd || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Passing Touchdowns</td><td className="px-4 py-2 border">{playerStats?.pass_td || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Interceptions</td><td className="px-4 py-2 border">{playerStats?.pass_int || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Fumbles</td><td className="px-4 py-2 border">{playerStats?.fum || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Fumbles Lost</td><td className="px-4 py-2 border">{playerStats?.fum_lost || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Rushing Att</td><td className="px-4 py-2 border">{playerStats?.rush_att || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Rushing Yards</td><td className="px-4 py-2 border">{playerStats?.rush_yd || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Yards Per Rush</td><td className="px-4 py-2 border">{playerStats?.rush_ypa || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Longest Rush</td><td className="px-4 py-2 border">{playerStats?.rush_lng || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Games Played</td><td className="px-4 py-2 border">{playerStats?.gp || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Receiving Yards</td><td className="px-4 py-2 border">{playerStats?.rec_yd || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Receiving Touchdowns</td><td className="px-4 py-2 border">{playerStats?.rec_td || '-'}</td></tr>

          </>
        );
      case 'RB':
        return (
          <>
            
            <tr><td className="px-4 py-2 border">Rushing Att</td><td className="px-4 py-2 border">{playerStats?.rush_att || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Rushing Yards</td><td className="px-4 py-2 border">{playerStats?.rush_yd || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Yards Per Rush</td><td className="px-4 py-2 border">{playerStats?.rush_ypa || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Rushing Touchdowns</td><td className="px-4 py-2 border">{playerStats?.rush_td || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Receiving Yards</td><td className="px-4 py-2 border">{playerStats?.rec_yd || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Receiving Touchdowns</td><td className="px-4 py-2 border">{playerStats?.rec_td || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Red Zone Targets</td><td className="px-4 py-2 border">{playerStats?.rec_rz_tgt || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Targets</td><td className="px-4 py-2 border">{playerStats?.rec_tgt || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Receptions</td><td className="px-4 py-2 border">{playerStats?.rec || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Yards Per Catch</td><td className="px-4 py-2 border">{playerStats?.rec_ypr || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Games Played</td><td className="px-4 py-2 border">{playerStats?.gp || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Fumbles</td><td className="px-4 py-2 border">{playerStats?.fum || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Fumbles Lost</td><td className="px-4 py-2 border">{playerStats?.fum_lost || '-'}</td></tr>
          </>
        );
      case 'WR':
      case 'TE':
        return (
          <>
            <tr><td className="px-4 py-2 border">Receiving Yards</td><td className="px-4 py-2 border">{playerStats?.rec_yd || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Red Zone Targets</td><td className="px-4 py-2 border">{playerStats?.rec_rz_tgt || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Receiving Touchdowns</td><td className="px-4 py-2 border">{playerStats?.rec_td || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Targets</td><td className="px-4 py-2 border">{playerStats?.rec_tgt || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Receptions</td><td className="px-4 py-2 border">{playerStats?.rec || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Yards Per Catch</td><td className="px-4 py-2 border">{playerStats?.rec_ypr || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Rushing Att</td><td className="px-4 py-2 border">{playerStats?.rush_att || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Rushing Yards</td><td className="px-4 py-2 border">{playerStats?.rush_yd || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Rushing Touchdowns</td><td className="px-4 py-2 border">{playerStats?.rush_td || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Games Played</td><td className="px-4 py-2 border">{playerStats?.gp || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Fumbles</td><td className="px-4 py-2 border">{playerStats?.fum || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Fumbles Lost</td><td className="px-4 py-2 border">{playerStats?.fum_lost || '-'}</td></tr>
          </>
        );
      case 'K':
        return (
          <>
            <tr><td className="px-4 py-2 border">Field Goals Att</td><td className="px-4 py-2 border">{playerStats?.fga || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Field Goals Made</td><td className="px-4 py-2 border">{playerStats?.fgm || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Field Goals 20-29</td><td className="px-4 py-2 border">{playerStats?.fgm_20_29 || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Field Goals 30-39</td><td className="px-4 py-2 border">{playerStats?.fgm_30_39 || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Field Goals 40-49</td><td className="px-4 py-2 border">{playerStats?.fgm_40_49 || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Field Goals 50-59</td><td className="px-4 py-2 border">{playerStats?.fgm_50_59 || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Field Goals 60+</td><td className="px-4 py-2 border">{playerStats?.fgm_60p || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Extra Points Att</td><td className="px-4 py-2 border">{playerStats?.xpa || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Extra Points Made</td><td className="px-4 py-2 border">{playerStats?.xpm || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Games Played</td><td className="px-4 py-2 border">{playerStats?.gp || '-'}</td></tr>
          </>
        );
      case 'DEF':
        return (
            <>
            <tr><td className="px-4 py-2 border">Sacks</td><td className="px-4 py-2 border">{playerStats?.sacks || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Interceptions</td><td className="px-4 py-2 border">{playerStats?.ints || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Defensive Touchdowns</td><td className="px-4 py-2 border">{playerStats?.def_td || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Fumbles Recovered</td><td className="px-4 py-2 border">{playerStats?.fum_rec || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">Points Allowed</td><td className="px-4 py-2 border">{playerStats?.pts_allowed || '-'}</td></tr>
          </>
        );
      default:
        return null;
    }
  };
  
  

  if (loading) return <div className="text-center mt-10 text-white">Loading players...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="max-w-3xl mx-auto bg-[#252942] p-6 rounded-lg shadow-lg text-white">
      <h2 className="text-2xl font-semibold mb-4">Search NFL Players</h2>
      <input
        type="text"
        className="w-full p-2 mb-4 border border-gray-300 rounded bg-[#323655] text-white placeholder-gray-400"
        placeholder="Search by player name..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <table className="table-auto w-full text-white mb-6">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b border-gray-600">Player ID</th>
            <th className="px-4 py-2 border-b border-gray-600">Name</th>
            <th className="px-4 py-2 border-b border-gray-600">Position</th>
            <th className="px-4 py-2 border-b border-gray-600">Team</th>
          </tr>
        </thead>
        <tbody>
          {filteredPlayers.map((player) => (
            <tr
              key={player.player_id}
              onClick={() => handlePlayerClick(player)}
              className="cursor-pointer hover:bg-[#323655]"
            >
              <td className="px-4 py-2 border-b border-gray-600">{player.player_id}</td>
              <td className="px-4 py-2 border-b border-gray-600">{player.full_name}</td>
              <td className="px-4 py-2 border-b border-gray-600">{player.position}</td>
              <td className="px-4 py-2 border-b border-gray-600">{player.team || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={closeModal}>
          <div
            className="bg-[#15182D] p-6 rounded-lg shadow-lg max-w-lg w-full relative text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="absolute top-2 right-2 text-gray-400 hover:text-white" onClick={closeModal}>X</button>
            <h3 className="text-xl font-semibold mb-2">Stats for {selectedPlayer.full_name}</h3>
            <p className="text-gray-300 mb-2">Player ID: {selectedPlayer.player_id}</p>
            <table className="table-auto w-full text-white">
              <thead>
                <tr>
                  <th className="px-4 py-2 border-b border-gray-600">Statistic</th>
                  <th className="px-4 py-2 border-b border-gray-600">Value</th>
                </tr>
              </thead>
              <tbody>
                {renderStats()}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};


export default PlayerSearch;