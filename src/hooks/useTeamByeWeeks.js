// src/hooks/useTeamByeWeeks.js
import { useState, useEffect } from 'react';

// Predefined bye week data for 2024
const byeWeeks2024 = {
  ARI: 11, ATL: 12, BAL: 14, BUF: 12, CAR: 11, CHI: 7, CIN: 12,
  CLE: 10, DAL: 7, DEN: 14, DET: 5, GB: 10, HOU: 14, IND: 14,
  JAX: 12, KC: 6, LAC: 5, LAR: 6, LV: 10, MIA: 6, MIN: 6, 
  NE: 14, NO: 12, NYG: 11, NYJ: 12, PHI: 5, PIT: 9, SF: 9,
  SEA: 10, TB: 11, TEN: 5, WAS: 14,
};

const useTeamByeWeeks = () => {
  const [byeWeeks, setByeWeeks] = useState({});

  useEffect(() => {
    // Simulate fetching bye week data (could replace with an API call)
    setByeWeeks(byeWeeks2024);
  }, []);

  const getTeamByeWeek = (teamId) => byeWeeks[teamId] || null;

  return { byeWeeks, getTeamByeWeek };
};

export default useTeamByeWeeks;
