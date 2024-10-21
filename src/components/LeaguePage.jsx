import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLeagueInfo, getLeagueUsers, getLeagueRosters } from '../api/sleeperApi';

const LeaguePage = ({ leagueId }) => {
  const [leagueInfo, setLeagueInfo] = useState(null);
  const [users, setUsers] = useState([]);
  const [rosters, setRosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch league data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [info, userData, rosterData] = await Promise.all([
          getLeagueInfo(leagueId),
          getLeagueUsers(leagueId),
          getLeagueRosters(leagueId),
        ]);

        setLeagueInfo(info);
        setUsers(userData);
        setRosters(rosterData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching league data:', err);
        setError('Failed to load league data. Please try again.');
        setLoading(false);
      }
    };

    fetchData();
  }, [leagueId]);

  const getTeamName = (roster, user) =>
    roster.settings.team_name || user?.metadata?.team_name || 'Unnamed Team';

  if (loading) {
    return (
      <div className="text-center text-white text-xl mt-10">
        Kindly hold on until I finish a cup of coffee...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-xl mt-10 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-4xl mt-8 font-bold text-center text-white mb-2">
        {leagueInfo.name} ({leagueInfo.season})
      </h1>
      <h2 className="text-center text-white mb-8">
        Where the neggin is real!
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rosters.map((roster) => {
          const user = users.find((u) => u.user_id === roster.owner_id);
          const teamName = getTeamName(roster, user);

          return (
            <Link
              to={`/team/${roster.roster_id}`}
              key={roster.roster_id}
            >
              <div className="bg-white p-6 shadow-lg rounded-lg hover:shadow-xl transition">
                <div className="flex items-center space-x-4">
                  <img
                    src={
                      user?.avatar
                        ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}`
                        : 'https://via.placeholder.com/64?text=User'
                    }
                    alt={user?.display_name || 'Unknown User'}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <h2 className="text-2xl font-semibold">
                      {user?.display_name || 'Unknown Owner'}
                    </h2>
                    <p className="text-lg text-gray-700 font-medium">
                      Team: {teamName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Wins: {roster.settings.wins} | Losses: {roster.settings.losses}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default LeaguePage;
