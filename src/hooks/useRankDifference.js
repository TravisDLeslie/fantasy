 // hooks/useRankDifference.js
import { useMemo } from "react";

/**
 * Custom hook to calculate rank difference and rank label for a player.
 */
const useRankDifference = (player, positionAverages) => {
  const { rankDifference, rankLabel } = useMemo(() => {
    const leagueAvg = positionAverages?.[player.position] || 0;
    const difference = (player.avgPoints - leagueAvg).toFixed(2);
    return {
      rankDifference: difference,
      rankLabel: difference > 0 ? `+${difference}` : difference,
    };
  }, [player, positionAverages]);

  return { rankDifference, rankLabel };
};

export default useRankDifference;
