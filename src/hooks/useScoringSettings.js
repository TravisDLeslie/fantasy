// useScoringSettings.js
import { useEffect, useState } from 'react';

const useScoringSettings = (leagueId) => {
  const [scoringSettings, setScoringSettings] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScoringSettings = async () => {
      try {
        const response = await fetch(`https://api.sleeper.app/v1/league/${leagueId}`);
        if (!response.ok) throw new Error(`Error: ${response.status}`);
        
        const data = await response.json();
        setScoringSettings(data.scoring_settings);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScoringSettings();
  }, [leagueId]);

  const groupedSettings = {
    Passing: {},
    Rushing: {},
    Receiving: {},
    Kicking: {},
    Defense: {},
    Miscellaneous: {},
  };

  if (scoringSettings) {
    Object.entries(scoringSettings).forEach(([key, value]) => {
      if (key.includes('pass')) groupedSettings.Passing[key] = value;
      else if (key.includes('rush')) groupedSettings.Rushing[key] = value;
      else if (key.includes('rec')) groupedSettings.Receiving[key] = value;
      else if (key.includes('kick') || key.includes('fg')) groupedSettings.Kicking[key] = value;
      else if (key.includes('def')) groupedSettings.Defense[key] = value;
      else groupedSettings.Miscellaneous[key] = value;
    });
  }

  return { groupedSettings, error, loading };
};

export default useScoringSettings;
