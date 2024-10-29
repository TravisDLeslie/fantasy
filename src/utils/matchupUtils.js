// utils/matchupUtils.js
import { getPositionStyles } from "./positionStyles";
import teamAbbreviations from "../utils/teamAbbreviations";

const processMatchups = (allMatchups) => {
  const totalPoints = {};
  const weeklyPoints = {};
  const schedules = {};
  const processed = new Set();

  allMatchups.forEach((matchups, week) => {
    matchups.forEach((matchup) => {
      const points = matchup.players_points || {};
      const opponentId = matchup.matchup_id;

      Object.entries(points).forEach(([playerId, weekPoints]) => {
        const key = `${playerId}-${week}`;

        if (!processed.has(key)) {
          totalPoints[playerId] = (totalPoints[playerId] || 0) + weekPoints;
          if (!weeklyPoints[playerId]) weeklyPoints[playerId] = {};
          weeklyPoints[playerId][week + 1] = weekPoints;

          if (!schedules[playerId]) schedules[playerId] = {};
          schedules[playerId][week + 1] = opponentId;

          processed.add(key);
        }
      });
    });
  });

  return { totalPoints, weeklyPoints, schedules };
};

const processTeamMatchups = (
  allMatchups,
  rosterId,
  rosters,
  users,
  currentWeek
) => {
  const matchups = [];

  allMatchups.forEach((weeklyMatchups, index) => {
    const week = index + 1;
    const teamMatchup = weeklyMatchups.find(
      (matchup) => matchup.roster_id === parseInt(rosterId)
    );

    if (teamMatchup) {
      const opponentMatchup = weeklyMatchups.find(
        (m) =>
          m.matchup_id === teamMatchup.matchup_id &&
          m.roster_id !== teamMatchup.roster_id
      );

      const opponentRoster = opponentMatchup
        ? rosters.find((r) => r.roster_id === opponentMatchup.roster_id)
        : null;

      const opponentUser = opponentRoster
        ? users.find((u) => u.user_id === opponentRoster.owner_id)
        : null;

      const result = determineMatchupResult(
        teamMatchup,
        opponentMatchup,
        week,
        currentWeek
      );

      matchups.push({
        week,
        points: teamMatchup.points || 0,
        opponentPoints: opponentMatchup?.points || 0,
        opponentName: opponentUser?.display_name || "Bye",
        opponentAvatar: opponentUser?.avatar || null,
        result,
      });
    }
  });

  return matchups;
};

const determineMatchupResult = (
  teamMatchup,
  opponentMatchup,
  week,
  currentWeek
) => {
  if (week === currentWeek) {
    return "In Progress";
  } else if (
    teamMatchup.points !== null &&
    teamMatchup.points !== undefined &&
    opponentMatchup?.points !== null &&
    opponentMatchup?.points !== undefined
  ) {
    if (teamMatchup.points > opponentMatchup.points) return "W";
    if (teamMatchup.points < opponentMatchup.points) return "L";
    return "T";
  } else {
    return "Scheduled";
  }
};

export { processMatchups, processTeamMatchups, determineMatchupResult };
