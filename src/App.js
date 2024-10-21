import React, { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import LeaguePage from './components/LeaguePage'; 
import TeamDetails from './components/TeamDetails';
import Header from './components/Header'; // Import Header component

const App = () => {
  const [leagueId, setLeagueId] = useState('1130687436515831808'); // Default league ID
  const navigate = useNavigate(); // Navigation for redirection

  const handleLeagueIdChange = (newLeagueId) => {
    setLeagueId(newLeagueId); // Update the league ID
    navigate('/'); // Redirect to homepage
  };

  return (
    <div className="min-h-screen bg-[#15182D]">
      <Header onLeagueIdChange={handleLeagueIdChange} />
      <Routes>
        <Route path="/" element={<LeaguePage leagueId={leagueId} />} />
        <Route path="/team/:rosterId" element={<TeamDetails leagueId={leagueId} />} />
      </Routes>
    </div>
  );
};

export default App;
