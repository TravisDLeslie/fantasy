import React, { useEffect, useState } from 'react';
import { getAllPlayersStatsForWeek, getLeagueInfo } from '../api/sleeperApi'; // Adjust path if needed

const OFFENSIVE_POSITIONS = ['QB', 'RB', 'WR', 'TE', 'K']; // Valid offensive positions

const TestComponent = ({ leagueId, season = 2024 }) => {
  const [playerStats, setPlayerStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scoringFormat, setScoringFormat] = useState('stdPoints'); // Default scoring format
  const [leagueSettings, setLeagueSettings] = useState({}); // Store league-specific settings

  useEffect(() => {
    const fetchLeagueSettings = async () => {
      try {
        const leagueInfo = await getLeagueInfo(leagueId);
        console.log('Fetched League Info:', leagueInfo); // Debug league settings

        // Extract scoring format or other relevant info if necessary
        const format = leagueInfo.scoring_settings.default; // Example: Adjust based on API response
        setScoringFormat(format || 'stdPoints');
        setLeagueSettings(leagueInfo);
      } catch (error) {
        console.error('Error fetching league info:', error);
      }
    };

    const fetchStats = async () => {
      try {
        const stats = await getAllPlayersStatsForWeek(season, 8); // Fetch week 8, 2024 season
        console.log('Fetched Player Stats:', stats); // Check raw data in console

        // Filter for offensive players and sort by points in descending order
        const filteredAndSortedStats = stats
          .filter((player) => OFFENSIVE_POSITIONS.includes(player.position))
          .sort((a, b) => b[scoringFormat] - a[scoringFormat]);

        setPlayerStats(filteredAndSortedStats);
      } catch (error) {
        console.error('Error fetching player stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagueSettings(); // Fetch league settings first
    fetchStats(); // Fetch player stats

  }, [leagueId, season, scoringFormat]); // Re-run when leagueId, season, or scoring format changes

  const handleScoringChange = (event) => setScoringFormat(event.target.value);

  if (loading) {
    return <div className="text-white text-center mt-10">Loading player stats...</div>;
  }

  return (
    <div className="p-8 text-white">
      <h1 className="text-2xl font-bold mb-4 text-center">Offensive Player Points (Sorted by Points)</h1>
      <div className="mb-4 text-center">
        <label className="mr-2">Select Scoring Format:</label>
        <select
          value={scoringFormat}
          onChange={handleScoringChange}
          className="border border-gray-300 p-2 text-black"
        >
          <option value="stdPoints">Standard</option>
          <option value="halfPprPoints">Half-PPR</option>
          <option value="pprPoints">PPR</option>
        </select>
      </div>

      <table className="table-auto w-full border-collapse border border-gray-500">
        <thead>
          <tr>
            <th className="border border-gray-500 px-4 py-2">Name</th>
            <th className="border border-gray-500 px-4 py-2">Position</th>
            <th className="border border-gray-500 px-4 py-2">Team</th>
            <th className="border border-gray-500 px-4 py-2">Points</th>
          </tr>
        </thead>
        <tbody>
          {playerStats.length > 0 ? (
            playerStats.map((player) => (
              <tr key={player.id}>
                <td className="border border-gray-500 px-4 py-2">{player.name}</td>
                <td className="border border-gray-500 px-4 py-2">{player.position}</td>
                <td className="border border-gray-500 px-4 py-2">{player.team}</td>
                <td className="border border-gray-500 px-4 py-2">
                  {player[scoringFormat]}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-4">
                No offensive player stats available for this week.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TestComponent;
