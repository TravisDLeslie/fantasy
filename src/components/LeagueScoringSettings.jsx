import React, { useEffect, useState } from 'react';

const LeagueScoringSettings = ({ leagueId, onScoringSettingsLoaded }) => {
  const [scoringSettings, setScoringSettings] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state separately

  // Fetch scoring settings when the leagueId changes
  useEffect(() => {
    const fetchScoringSettings = async () => {
      try {
        const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        
        const data = await response.json();
        setScoringSettings(data.scoring_settings);
        onScoringSettingsLoaded?.(data.scoring_settings); // Call callback if provided
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // Stop loading after fetch
      }
    };

    fetchScoringSettings();
  }, [leagueId, onScoringSettingsLoaded]);

  if (loading) return <div className="text-center text-white mt-10">Loading Scoring Settings...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">Error: {error}</div>;

  // Helper function to format keys nicely
  const formatKey = (key) =>
    key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  // Grouping scoring settings by categories
  const groupedSettings = {
    Passing: {},
    Rushing: {},
    Receiving: {},
    Kicking: {},
    Defense: {},
    Miscellaneous: {},
  };

  // Organize settings into categories
  Object.entries(scoringSettings).forEach(([key, value]) => {
    if (key.includes('pass')) groupedSettings.Passing[key] = value;
    else if (key.includes('rush')) groupedSettings.Rushing[key] = value;
    else if (key.includes('rec')) groupedSettings.Receiving[key] = value;
    else if (key.includes('kick') || key.includes('fg')) groupedSettings.Kicking[key] = value;
    else if (key.includes('def')) groupedSettings.Defense[key] = value;
    else groupedSettings.Miscellaneous[key] = value;
  });

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#252942] rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white text-center mb-6">League Scoring Settings</h2>
      {Object.entries(groupedSettings).map(([category, settings]) => (
        <div key={category} className="mb-8">
          <h3 className="text-xl font-semibold text-white mb-4">{category}</h3>
          <table className="table-auto w-full text-white text-left border-collapse">
            <thead>
              <tr>
                <th className="border-b px-4 py-2 font-medium">Statistic</th>
                <th className="border-b px-4 py-2 font-medium">Points</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(settings).map(([key, value]) => (
                <tr key={key} className="even:bg-[#2F3347]">
                  <td className="border-b px-4 py-2">{formatKey(key)}</td>
                  <td className="border-b px-4 py-2">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default LeagueScoringSettings;
