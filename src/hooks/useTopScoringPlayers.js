// hooks/useTopScoringPlayers.js
import { useMemo } from "react";
import teamAbbreviations from "../utils/teamAbbreviations";
import { getPositionStyles } from "./usePositionStyles";

const useTopScoringPlayers = (roster, playersMetadata, playerPoints, currentWeek) => {
  return useMemo(() => {
    const topScoringPlayersPerWeek = {};

    if (playerPoints.weeklyPoints) {
      for (let week = 1; week <= currentWeek; week++) {
        let topPlayer = null;
        let maxPoints = -1;

        roster.players.forEach((playerId) => {
          const points = playerPoints.weeklyPoints[playerId]?.[week] || 0;
          if (points > maxPoints) {
            maxPoints = points;
            const isDefense = isNaN(playerId);
            const playerData = playersMetadata[playerId] || {};
            const playerName = isDefense
              ? teamAbbreviations[playerId] || `Unknown Team (ID: ${playerId})`
              : `${playerData.first_name || "Unknown"} ${playerData.last_name || "Player"}`;
            const position = playerData?.position || "N/A";
            const teamAbbr = isDefense ? playerId : playerData.team;

            topPlayer = {
              id: playerId,
              name: playerName,
              position,
              points: points.toFixed(2),
              teamAbbr,
              text: getPositionStyles(position).text,
            };
          }
        });

        if (topPlayer) {
          topScoringPlayersPerWeek[week] = topPlayer;
        }
      }
    }

    // Split weeks into two arrays: 1-8 and 9-17
    const weeks1to8 = Array.from({ length: 8 }, (_, i) => i + 1).map((week) => ({
      week,
      player: topScoringPlayersPerWeek[week],
    }));

    const weeks9to17 = Array.from({ length: 9 }, (_, i) => i + 9).map((week) => ({
      week,
      player: topScoringPlayersPerWeek[week],
    }));

    return { weeks1to8, weeks9to17 };
  }, [roster, playersMetadata, playerPoints, currentWeek]);
};

export default useTopScoringPlayers;
