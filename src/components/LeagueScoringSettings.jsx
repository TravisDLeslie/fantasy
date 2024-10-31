// LeagueScoringSettings.js
import React from 'react';
import useScoringSettings from '../hooks/useScoringSettings';

const LeagueScoringSettings = ({ leagueId }) => {
  const { groupedSettings, error, loading } = useScoringSettings(leagueId);

  if (loading) return <div className="text-center text-white mt-10">Loading Scoring Settings...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">Error: {error}</div>;

  const formatKey = (key) =>
    key.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  return (
    <div className="max-w-4xl mt-12 mx-auto p-6 bg-[#252942] rounded-lg shadow-lg">
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
