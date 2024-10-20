// src/hooks/useDefensePoints.js
import manualDefensePoints from '../utils/manualDefensePoints';

export const useDefensePoints = () => {
  const getDefensePoints = (teamId, defensePoints) => {
    const total = defensePoints?.[teamId]?.total || 0;
    const manualTotal = Object.values(manualDefensePoints[teamId] || {}).reduce(
      (sum, points) => sum + points, 0
    );
    return total || manualTotal;
  };

  const aggregateDefensePoints = (defensePoints) => {
    return Object.keys(manualDefensePoints).reduce((acc, teamId) => {
      const total = getDefensePoints(teamId, defensePoints);
      acc[teamId] = { total };
      return acc;
    }, {});
  };

  return { getDefensePoints, aggregateDefensePoints };
};
