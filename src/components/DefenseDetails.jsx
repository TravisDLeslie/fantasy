// src/components/DefenseDetails.jsx
import React, { useEffect, useState } from 'react';
import { getLeagueMatchups } from '../api/sleeperApi'; // Import API function

// NFL Teams Abbreviations
const teamAbbreviations = {
  ARI: 'Arizona Cardinals', ATL: 'Atlanta Falcons', BAL: 'Baltimore Ravens',
  BUF: 'Buffalo Bills', CAR: 'Carolina Panthers', CHI: 'Chicago Bears',
  CIN: 'Cincinnati Bengals', CLE: 'Cleveland Browns', DAL: 'Dallas Cowboys',
  DEN: 'Denver Broncos', DET: 'Detroit Lions', GB: 'Green Bay Packers',
  HOU: 'Houston Texans', IND: 'Indianapolis Colts', JAX: 'Jacksonville Jaguars',
  KC: 'Kansas City Chiefs', LV: 'Las Vegas Raiders', LAC: 'Los Angeles Chargers',
  LAR: 'Los Angeles Rams', MIA: 'Miami Dolphins', MIN: 'Minnesota Vikings',
  NE: 'New England Patriots', NO: 'New Orleans Saints', NYG: 'New York Giants',
  NYJ: 'New York Jets', PHI: 'Philadelphia Eagles', PIT: 'Pittsburgh Steelers',
  SEA: 'Seattle Seahawks', SF: 'San Francisco 49ers', TB: 'Tampa Bay Buccaneers',
  TEN: 'Tennessee Titans', WAS: 'Washington Commanders',
};

// Manually entered defense points for fallback
const manualDefensePoints = {
  ARI: { 1: 10, 2: 12, 3: 8, 4: 7 },
  DEN: { 1: 27, 2: 14, 3: 30, 4: 23, 5: 26, 6: 9, 7: 34 },
  KC: { 1: 15, 2: 18, 3: 10, 4: 13 },
  CHI: { 1: 38, 2: 14, 3: 11, 4: 17 },
};

// 2024 Bye Week Mapping
const byeWeeks = {
  ARI: 11, ATL: 12, BAL: 14, BUF: 12, CAR: 11, CHI: 7, CIN: 12, CLE: 10,
  DAL: 7, DEN: 14, DET: 5, GB: 10, HOU: 14, IND: 14, JAX: 12, KC: 6,
  LV: 10, LAC: 5, LAR: 6, MIA: 6, MIN: 6, NE: 14, NO: 12, NYG: 11,
  NYJ: 12, PHI: 5, PIT: 9, SF: 9, SEA: 10, TB: 11, TEN: 5, WAS: 14,
};

export const fetchDefensePoints = async (leagueId) => {
  const pointsByDefense = {};

  console.log('Fetching matchups for all weeks (1-17)...');

  // Preload with manual points to avoid missing entries
  Object.keys(manualDefensePoints).forEach((teamId) => {
    pointsByDefense[teamId] = { total: 0, weekly: { ...manualDefensePoints[teamId] } };

    // Calculate the initial manual total
    pointsByDefense[teamId].total = Object.values(manualDefensePoints[teamId]).reduce(
      (sum, val) => sum + val, 0
    );
  });

  // Fetch matchups for each week from the API
  for (let week = 1; week <= 17; week++) {
    console.log(`Requesting matchups for week ${week}...`);
    const matchups = await getLeagueMatchups(leagueId, week);

    if (!matchups || matchups.length === 0) {
      console.warn(`⚠️ No matchups found for week ${week}`);
      continue;
    }

    matchups.forEach((matchup) => {
      const points = matchup?.players_points || {};

      Object.entries(points).forEach(([playerId, weekPoints]) => {
        const normalizedId = playerId.toUpperCase(); // Normalize to uppercase

        if (!teamAbbreviations[normalizedId]) return; // Skip if not a defense team

        if (!pointsByDefense[normalizedId]) {
          pointsByDefense[normalizedId] = { total: 0, weekly: {} };
        }

        const manualPoints = manualDefensePoints[normalizedId]?.[week];
        const finalPoints = weekPoints !== undefined ? weekPoints : manualPoints ?? 0;

        // Record the points if not already set for this week
        if (!pointsByDefense[normalizedId].weekly[week]) {
          pointsByDefense[normalizedId].weekly[week] = finalPoints;
          pointsByDefense[normalizedId].total += finalPoints;
        }

        console.log(
          `Week ${week}: ${teamAbbreviations[normalizedId]} - ${finalPoints} points (Source: ${weekPoints !== undefined ? 'API' : 'Manual'})`
        );
      });
    });
  }

  console.log('🏁 Final Aggregated Defense Points:', pointsByDefense);
  return pointsByDefense;
};

const DefenseDetails = ({ leagueId }) => {
  const [defensePoints, setDefensePoints] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDefensePoints = async () => {
      try {
        const fetchedPoints = await fetchDefensePoints(leagueId);
        setDefensePoints(fetchedPoints);
      } catch (err) {
        console.error('Error fetching defense points:', err);
        setError('Failed to load defense points. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDefensePoints();
  }, [leagueId]);

  if (loading) return <div className="text-center text-xl mt-10">Loading defenses...</div>;
  if (error) return <div className="text-center text-xl mt-10 text-red-500">{error}</div>;

  const sortedDefenses = Object.entries(defensePoints).sort((a, b) => b[1].total - a[1].total);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mt-4">Defense Points</h1>
      <ul className="mt-6 space-y-4">
        {sortedDefenses.map(([defenseId, { total, weekly }]) => (
          <li key={defenseId} className="text-lg">
            <div className="font-semibold">
              {teamAbbreviations[defenseId] || `Unknown Team (ID: ${defenseId})`} - 
              <span className="text-gray-500"> Total Points: {total.toFixed(2)}</span>
            </div>
            <ul className="ml-6 mt-2 space-y-1">
              {Array.from({ length: 17 }, (_, i) => i + 1).map((week) => (
                <li key={week} className="text-sm">
                  Week {week}: <span className="text-gray-700">
                    {weekly[week] ?? 'No Points Recorded'}
                  </span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DefenseDetails;
