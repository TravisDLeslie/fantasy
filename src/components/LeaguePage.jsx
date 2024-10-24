import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getLeagueInfo, getLeagueUsers, getLeagueRosters } from '../api/sleeperApi';
import AwardsModal from '../components/AwardsModal'; // Import the awards modal

const LeaguePage = ({ leagueId }) => {
  const [leagueInfo, setLeagueInfo] = useState(null);
  const [users, setUsers] = useState([]);
  const [rosters, setRosters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAwardsOpen, setIsAwardsOpen] = useState(false); // Modal state

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

  const sortedRosters = [...rosters].sort((a, b) => {
    if (b.settings.wins !== a.settings.wins) {
      return b.settings.wins - a.settings.wins;
    }
    return a.settings.losses - b.settings.losses;
  });

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#15182D] p-6">
      {/* League Title */}
      <h1 className="text-2xl md:text-4xl font-bold text-center text-white mb-2">
        {leagueInfo.name} ({leagueInfo.season})
      </h1>
      <h2 className="text-center text-white mb-8">
        Where the neggin is real!
      </h2>

      {/* Centered View Awards Button */}
      <div className="flex items-center justify-center h-12 mb-10">
        <button
          onClick={() => setIsAwardsOpen(true)}
          className="bg-[#252942] text-white px-6 py-3 rounded-full shadow-lg hover:bg-[#e69f45] transition"
        >
          🏅 View Awards
        </button>
      </div>

      {/* User List */}
      <div className="w-full max-w-5xl ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
          {rosters.map((roster) => {
            const user = users.find((u) => u.user_id === roster.owner_id);
            const teamName = getTeamName(roster, user);

            return (
              <Link to={`/team/${roster.roster_id}`} key={roster.roster_id}>
                <div className="bg-[#252942] hover:bg-[#3B3F5E] items-center p-6 shadow-lg rounded-lg hover:shadow-xl transition">
                  {/* Flex layout with avatar on the left */}
                  <div className="flex items-center justify-center space-x-4 p-2">
  {/* Avatar */}
  <img
    src={
      user?.avatar
        ? `https://sleepercdn.com/avatars/thumbs/${user.avatar}`
        : 'https://via.placeholder.com/64?text=User'
    }
    alt={user?.display_name || 'Unknown User'}
    className="w-16 h-16 rounded-full mr-2"
  />

  {/* User Info */}
  <div className="flex- text-left  md:text-left">
    <h2 className="text-lg md:text-xl font-semibold text-white">
      {user?.display_name || 'Unknown Owner'}
    </h2>
    <p className="text-md text-gray-300">{teamName}</p>
    <p className="text-sm text-gray-400">
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

      {/* Awards Modal */}
      <AwardsModal
        isOpen={isAwardsOpen}
        onClose={() => setIsAwardsOpen(false)}
        sortedRosters={sortedRosters}
        users={users}
      />
    </div>
  );
};

export default LeaguePage;
