import { useMemo } from "react";

/**
 * Custom hook to enrich players with their rank difference and rank label.
 */
const usePlayersWithRankDifference = (players, positionAverages) => {
  const playersWithRank = useMemo(() => {
    return players.map((player) => {
      const leagueAvg = positionAverages?.[player.position] || 0;
      const rankDifference = (player.avgPoints - leagueAvg).toFixed(2);
      const rankLabel = rankDifference > 0 ? `+${rankDifference}` : rankDifference;

      return { ...player, rankDifference, rankLabel };
    });
  }, [players, positionAverages]);

  return playersWithRank;
};

export default usePlayersWithRankDifference;
