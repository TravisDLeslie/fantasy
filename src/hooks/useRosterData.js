// hooks/useRosterData.js
import { useState, useEffect, useCallback } from "react";
import {
  getLeagueRosters,
  getLeagueUsers,
  getPlayersMetadata,
  getLeagueMatchups,
  getNFLState,
} from "../api/sleeperApi";
import { processMatchups, processTeamMatchups } from "../utils/matchupUtils";

const useRosterData = (leagueId, rosterId) => {
  const [roster, setRoster] = useState(null);
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [playersMetadata, setPlayersMetadata] = useState({});
  const [playerPoints, setPlayerPoints] = useState({});
  const [playerSchedules, setPlayerSchedules] = useState({});
  const [teamMatchups, setTeamMatchups] = useState([]);
  const [currentWeek, setCurrentWeek] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRosterData = useCallback(async () => {
    try {
      const [rosters, metadata, nflState, usersData] = await Promise.all([
        getLeagueRosters(leagueId),
        getPlayersMetadata(),
        getNFLState(),
        getLeagueUsers(leagueId),
      ]);

      const currentWeekNumber = nflState.week || 1;
      setCurrentWeek(currentWeekNumber);

      setUsers(usersData);
      
      const team = rosters.find((r) => r.roster_id === parseInt(rosterId));
      if (!team) throw new Error(`Team with roster ID ${rosterId} not found`);

      setRoster(team);

      const owner = usersData.find((u) => u.user_id === team.owner_id);
      setUser(owner);

      setPlayersMetadata(metadata);

      const allMatchups = await fetchAllMatchups(leagueId);

      const { totalPoints, weeklyPoints, schedules } = processMatchups(allMatchups);

      setPlayerPoints({ totalPoints, weeklyPoints });
      setPlayerSchedules(schedules);

      const teamMatchupsData = processTeamMatchups(
        allMatchups,
        rosterId,
        rosters,
        usersData,
        currentWeek
      );
      setTeamMatchups(teamMatchupsData);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load team roster. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [leagueId, rosterId, currentWeek]);

  useEffect(() => {
    fetchRosterData();
  }, [fetchRosterData]);

  const fetchAllMatchups = async (leagueId) => {
    const weeks = Array.from({ length: 17 }, (_, i) => i + 1);
    const matchups = await Promise.all(
      weeks.map((week) => getLeagueMatchups(leagueId, week))
    );
    return matchups;
  };

  return {
    roster,
    users,
    user,
    playersMetadata,
    playerPoints,
    playerSchedules,
    teamMatchups,
    currentWeek,
    loading,
    error,
  };
};

export default useRosterData;
