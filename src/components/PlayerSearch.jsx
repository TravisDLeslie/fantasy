import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { fetchLeagueScoringSettings, leagueId } from '../api/sleeperApi'

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
  const [scoringSettings, setScoringSettings] = useState(null);



  const defenseTeams = [
    { full_name: "Buffalo Bills", player_id: "BUF_DEF", position: "DEF", team: "BUF" },
    { full_name: "New England Patriots", player_id: "NE_DEF", position: "DEF", team: "NE" },
    // Add all other NFL teams similarly
  ];


  useEffect(() => {
    const leagueId = '1130687436515831808'; // Replace with actual league ID
    const loadScoringSettings = async () => {
      const settings = await fetchLeagueScoringSettings(leagueId);
      setScoringSettings(settings);
      console.log("Fetched Scoring Settings:", settings); // Debugging line to confirm scoring settings
    };
    loadScoringSettings();
  }, []);
  
  
    const calculatePlayerPoints = (player) => {
      if (!playerStats || !selectedPlayer || !scoringSettings) return 0;
      let points = 0;
      console.log(`Calculating points for ${player.full_name} (${player.position}):`);
    

      const passYardsPoints = (playerStats.pass_yd || 0) * (scoringSettings.pass_yd !== undefined ? scoringSettings.pass_yd : 0.05);
          // Passing 
          const passTDPoints = (playerStats.pass_td || 0) * (scoringSettings.pass_tds || 4);
          const passIntPoints = (playerStats.pass_int || 0) * (scoringSettings.pass_int || -2);
          const pass2ptPoints = (playerStats.pass_2pt || 0) * (scoringSettings.pass_2pt || 2);
          const pass300BonusPoints = (playerStats.bonus_pass_yd_300 || 0) * (scoringSettings.bonus_pass_yd_300 || 5);
          const pass400BonusPoints = (playerStats.bonus_pass_yd_400 || 0) * (scoringSettings.bonus_pass_yd_400 || 10);

           // Rushing 
          const rushYardsPoints = (playerStats.rush_yd || 0) * (scoringSettings.rush_yards || 0.1);
          const rushTDPoints = (playerStats.rush_td || 0) * (scoringSettings.rush_tds || 6);
          const rushAttPoints = (playerStats.rush_att || 0) * (scoringSettings.rush_att || 0.35);
          const rush100BonusPoints = (playerStats.bonus_rush_yd_100 || 0) * (scoringSettings.bonus_rush_yd_100 || 5);
          const rush200BonusPoints = (playerStats.bonus_rush_yd_200 || 0) * (scoringSettings.bonus_rush_yd_200 || 5);
          const fumbleLostPoints = (playerStats.fum_lost || 0) * (scoringSettings.fum_lost || -3);

           // Receiving 
           const recYardsPoints = (playerStats.rec_yd || 0) * (scoringSettings.rec_yd || 0.1);
           const recTDPoints = (playerStats.rec_td || 0) * (scoringSettings.rec_td || 6);
           const recReceptionPoints = (playerStats.rec || 0) * (scoringSettings.rec || 1);
           const rec100BounusPoints = (playerStats.bonus_rec_yd_100 || 0) * (scoringSettings.bonus_rec_yd_100 || 5);
           const rec200BounusPoints = (playerStats.bonus_rec_yd_200 || 0) * (scoringSettings.bonus_rec_yd_200 || 6);
           const rec2ptPoints = (playerStats.rec_2pt || 0) * (scoringSettings.rec_2pt || 2);

           // Kicker 
           const fgm0_19Points = (playerStats.fgm_0_19 || 0) * (scoringSettings.fgm_0_19 || 3);
           const fgm20_29Points = (playerStats.fgm_20_29 || 0) * (scoringSettings.fgm_20_29 || 4);
           const fgm30_39Points = (playerStats.fgm_30_39 || 0) * (scoringSettings.fgm_30_39 || 5);
           const fgm40_49Points = (playerStats.fgm_40_49 || 0) * (scoringSettings.fgm_40_49 || 6);
           const fgm50_59Points = (playerStats.fgm_50_59 || 0) * (scoringSettings.fgm_50_59 || 7);
           const fgm60pPoints = (playerStats.fgm_60p || 0) * (scoringSettings.fgm_60p || 7);
           const xpmPoints = (playerStats.xpm || 0) * (scoringSettings.xpm || 1);
           const fgmissPoints = (playerStats.fgmiss || 0) * (scoringSettings.fgmiss|| -1);
           const xpmissPoints = (playerStats.xpmiss || 0) * (scoringSettings.xpmiss|| -5);
           const fgmiss0_19Points = (playerStats.fgmiss_0_19 || 0) * (scoringSettings.fgmiss_0_19 || -5);
           const fgmiss20_29Points = (playerStats.fgmiss_20_29 || 0) * (scoringSettings.fgmiss_20_29 || -4);
           const fgmiss30_39Points = (playerStats.fgmiss_30_39 || 0) * (scoringSettings.fgmiss_30_39 || -3);
           const fgmiss40_49Points = (playerStats.fgmiss_40_49 || 0) * (scoringSettings.fgmiss_40_49 || -2);
           const fgmiss50pPoints = (playerStats.fgmiss_50p || 0) * (scoringSettings.fgmiss_50p || -1);

           // Misc 


  
      switch (player.position) {
        case 'QB':
      

          points += passYardsPoints + passTDPoints + rushAttPoints  + rushYardsPoints + rush100BonusPoints + rush200BonusPoints + rushTDPoints + pass300BonusPoints + pass400BonusPoints + passIntPoints + fumbleLostPoints + pass2ptPoints;
          console.log('passTDPoints:', passTDPoints);
console.log('passIntPoints:', passIntPoints);
console.log('pass2ptPoints:', pass2ptPoints);
console.log('pass300BonusPoints:', pass300BonusPoints);
console.log('pass400BonusPoints:', pass400BonusPoints);

console.log('rushYardsPoints:', rushYardsPoints);
console.log('rushTDPoints:', rushTDPoints);
console.log('rushAttPoints:', rushAttPoints);
console.log('rush100BonusPoints:', rush100BonusPoints);
console.log('rush200BonusPoints:', rush200BonusPoints);
console.log('fumbleLostPoints:', fumbleLostPoints);

console.log('recYardsPoints:', recYardsPoints);
console.log('recTDPoints:', recTDPoints);
console.log('recReceptionPoints:', recReceptionPoints);
console.log('rec100BounusPoints:', rec100BounusPoints);
console.log('rec200BounusPoints:', rec200BounusPoints);
console.log('rec2ptPoints:', rec2ptPoints);


          break;
    
        case 'RB':
          points += passYardsPoints + passTDPoints +rec2ptPoints + rec100BounusPoints + rec200BounusPoints + recReceptionPoints + recTDPoints + recYardsPoints + rushAttPoints  + rushYardsPoints + rush100BonusPoints + rush200BonusPoints + rushTDPoints + pass300BonusPoints + pass400BonusPoints + passIntPoints + fumbleLostPoints + pass2ptPoints;
          console.log('passTDPoints:', passTDPoints);
          console.log('passIntPoints:', passIntPoints);
          console.log('pass2ptPoints:', pass2ptPoints);
          console.log('pass300BonusPoints:', pass300BonusPoints);
          console.log('pass400BonusPoints:', pass400BonusPoints);
          
          console.log('rushYardsPoints:', rushYardsPoints);
          console.log('rushTDPoints:', rushTDPoints);
          console.log('rushAttPoints:', rushAttPoints);
          console.log('rush100BonusPoints:', rush100BonusPoints);
          console.log('rush200BonusPoints:', rush200BonusPoints);
          console.log('fumbleLostPoints:', fumbleLostPoints);
          
          console.log('recYardsPoints:', recYardsPoints);
          console.log('recTDPoints:', recTDPoints);
          console.log('recReceptionPoints:', recReceptionPoints);
          console.log('rec100BounusPoints:', rec100BounusPoints);
          console.log('rec200BounusPoints:', rec200BounusPoints);
          console.log('rec2ptPoints:', rec2ptPoints);
          
          break;
        case 'WR':
          points += passYardsPoints + passTDPoints +rec2ptPoints + rec100BounusPoints + rec200BounusPoints + recReceptionPoints + recTDPoints + recYardsPoints + rushAttPoints  + rushYardsPoints + rush100BonusPoints + rush200BonusPoints + rushTDPoints + pass300BonusPoints + pass400BonusPoints + passIntPoints + fumbleLostPoints + pass2ptPoints;
          console.log('passTDPoints:', passTDPoints);
console.log('passIntPoints:', passIntPoints);
console.log('pass2ptPoints:', pass2ptPoints);
console.log('pass300BonusPoints:', pass300BonusPoints);
console.log('pass400BonusPoints:', pass400BonusPoints);

console.log('rushYardsPoints:', rushYardsPoints);
console.log('rushTDPoints:', rushTDPoints);
console.log('rushAttPoints:', rushAttPoints);
console.log('rush100BonusPoints:', rush100BonusPoints);
console.log('rush200BonusPoints:', rush200BonusPoints);
console.log('fumbleLostPoints:', fumbleLostPoints);

console.log('recYardsPoints:', recYardsPoints);
console.log('recTDPoints:', recTDPoints);
console.log('recReceptionPoints:', recReceptionPoints);
console.log('rec100BounusPoints:', rec100BounusPoints);
console.log('rec200BounusPoints:', rec200BounusPoints);
console.log('rec2ptPoints:', rec2ptPoints);

          
          break;
        case 'TE':
          points += fgmissPoints + fgm0_19Points + fgm20_29Points + fgm30_39Points + fgm40_49Points + fgm50_59Points + fgm60pPoints + xpmPoints + xpmissPoints + fgmiss0_19Points + fgmiss20_29Points + fgmiss30_39Points + fgmiss40_49Points + fgmiss50pPoints  + passYardsPoints + passTDPoints +rec2ptPoints + rec100BounusPoints + rec200BounusPoints + recReceptionPoints + recTDPoints + recYardsPoints + rushAttPoints  + rushYardsPoints + rush100BonusPoints + rush200BonusPoints + rushTDPoints + pass300BonusPoints + pass400BonusPoints + passIntPoints + fumbleLostPoints + pass2ptPoints;

          break;
        case 'K':
          points += fgmissPoints + fgm0_19Points + fgm20_29Points + fgm30_39Points + fgm40_49Points + fgm50_59Points + fgm60pPoints + xpmPoints + xpmissPoints + fgmiss0_19Points + fgmiss20_29Points + fgmiss30_39Points + fgmiss40_49Points + fgmiss50pPoints  + passYardsPoints + passTDPoints +rec2ptPoints + rec100BounusPoints + rec200BounusPoints + recReceptionPoints + recTDPoints + recYardsPoints + rushAttPoints  + rushYardsPoints + rush100BonusPoints + rush200BonusPoints + rushTDPoints + pass300BonusPoints + pass400BonusPoints + passIntPoints + fumbleLostPoints + pass2ptPoints;

          console.log('fgm0_19Points:', fgm0_19Points);
console.log('fgm20_29Points:', fgm20_29Points);
console.log('fgm30_39Points:', fgm30_39Points);
console.log('fgm40_49Points:', fgm40_49Points);
console.log('fgm50_59Points:', fgm50_59Points);
console.log('fgm60pPoints:', fgm60pPoints);
console.log('xpmPoints:', xpmPoints);
console.log('xpmissPoints:', xpmissPoints);
console.log('fgmiss0_19Points:', fgmiss0_19Points);
console.log('fgmiss20_29Points:', fgmiss20_29Points);
console.log('fgmiss30_39Points:', fgmiss30_39Points);
console.log('fgmiss40_49Points:', fgmiss40_49Points);
console.log('fgmiss50_59Points:', fgmiss50pPoints);
console.log('fgmissPoints:', fgmissPoints);


console.log('passYardsPoints:', passYardsPoints);
console.log('passTDPoints:', passTDPoints);
console.log('rec2ptPoints:', rec2ptPoints);
console.log('rec100BounusPoints:', rec100BounusPoints);
console.log('rec200BounusPoints:', rec200BounusPoints);
console.log('recReceptionPoints:', recReceptionPoints);
console.log('recTDPoints:', recTDPoints);
console.log('recYardsPoints:', recYardsPoints);

console.log('rushAttPoints:', rushAttPoints);
console.log('rushYardsPoints:', rushYardsPoints);
console.log('rush100BonusPoints:', rush100BonusPoints);
console.log('rush200BonusPoints:', rush200BonusPoints);
console.log('rushTDPoints:', rushTDPoints);

console.log('pass300BonusPoints:', pass300BonusPoints);
console.log('pass400BonusPoints:', pass400BonusPoints);
console.log('passIntPoints:', passIntPoints);
console.log('fumbleLostPoints:', fumbleLostPoints);
console.log('pass2ptPoints:', pass2ptPoints);


          break;
        case 'DEF':
          points += (playerStats.sacks || 0) * (scoringSettings.sacks || 1);
          points += (playerStats.ints || 0) * (scoringSettings.interceptions || 2);
          points += (playerStats.def_td || 0) * (scoringSettings.defensive_tds || 6);
          points -= (playerStats.pts_allowed || 0) * (scoringSettings.points_allowed || -0.1);
          break;
        default:
          return 0;
      }
      console.log(`Total Points for ${player.full_name}: ${points.toFixed(2)}`);

      return points.toFixed(2); // Rounded for readability
    };
  
  

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
            <tr><td className="px-4 py-2 border">Passing Yards</td><td className="px-4 py-2 border">{playerStats?.pass_yd || '-'}</td></tr>
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
            <tr><td className="px-4 py-2 border">Pass 2pt</td><td className="px-4 py-2 border">{playerStats?.pass_2pt || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">300 Pass Yd Bonus</td><td className="px-4 py-2 border">{playerStats?.bonus_pass_yd_300 || '-'}</td></tr>
            <tr><td className="px-4 py-2 border">400 Pass Yd Bonus</td><td className="px-4 py-2 border">{playerStats?.bonus_pass_yd_400 || '-'}</td></tr>




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
                  <th className="px-4 py-2 border font-semibold">Points: {calculatePlayerPoints(selectedPlayer)}</th>
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