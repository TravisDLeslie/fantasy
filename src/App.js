import React from 'react';
import { Route, Routes } from 'react-router-dom';
import LeaguePage from './components/LeaguePage'; // Make sure the import path is correct
import TeamDetails from './components/TeamDetails';
import DefenseDetails from './components/DefenseDetails';

const App = () => {
  const leagueId = '1130687436515831808'; // Your league ID

  return (
    <div className="min-h-screen bg-gray-100">
      <Routes>
        <Route path="/" element={<LeaguePage leagueId={leagueId} />} />
        <Route path="/team/:rosterId" element={<TeamDetails leagueId={leagueId} />} />
        {/* Route for viewing defense details */}
        <Route path="/defense" element={<DefenseDetails leagueId={leagueId} />} />
      </Routes>
    </div>
  );
};

export default App;
