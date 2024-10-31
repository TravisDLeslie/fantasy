import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useNavigate, useParams } from 'react-router-dom';
import LeaguePage from './components/LeaguePage';
import TeamDetails from './components/TeamDetails';
import Header from './components/Header';
import LeagueRosterAggregator from './components/LeagueRosterAggregator';
import LeagueScoringSettings from './components/LeagueScoringSettings';
import PlayerStats from './components/PlayerStats';
import { getLeagueRosters } from './api/sleeperApi'; // API import
import PlayerSearch from './components/PlayerSearch';

const App = () => {
  const [leagueId, setLeagueId] = useState('1130687436515831808'); // Default league ID
  const [rosters, setRosters] = useState([]); // Store rosters
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Navigation for redirection

  // Fetch league rosters when leagueId changes
  useEffect(() => {
    const fetchRosters = async () => {
      try {
        const rosterData = await getLeagueRosters(leagueId);
        setRosters(rosterData);
      } catch (err) {
        console.error('Error fetching rosters:', err);
        setError('Failed to load rosters.');
      } finally {
        setLoading(false);
      }
    };

    fetchRosters();
  }, [leagueId]);

  const handleLeagueIdChange = (newLeagueId) => {
    setLeagueId(newLeagueId); // Update league ID
    navigate('/'); // Redirect to homepage
  };

  if (loading) return <div className="text-white text-center mt-10">Loading rosters...</div>;
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>;

  return (
    <div className="min-h-screen bg-[#15182D]">
      <Header onLeagueIdChange={handleLeagueIdChange} />
      <Routes>
        <Route path="/" element={<LeaguePage leagueId={leagueId} />} />
        <Route path="/team/:rosterId" element={<TeamDetails leagueId={leagueId} rosters={rosters} />} />
        <Route path="/players" element={<LeagueRosterAggregator leagueId={leagueId} />} />
        <Route path="/scoring" element={<LeagueScoringSettings leagueId={leagueId} />} />
        <Route path="/metrics" element={<PlayerSearch />} />
      </Routes>
    </div>
  );
};

export default App;
