import React, { useState } from 'react';
import { FaLock } from 'react-icons/fa'; // Import Lock Icon
import { useNavigate } from 'react-router-dom'; // Import navigate function
import menuIcon from '../assets/icons/menu.svg'; // Import custom menu icon

const Header = ({ onLeagueIdChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [inputLeagueId, setInputLeagueId] = useState(''); // Input state
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Mobile menu state
  const navigate = useNavigate(); // Use navigate function for page transitions

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = () => {
    if (inputLeagueId.trim()) {
      onLeagueIdChange(inputLeagueId.trim()); // Update league ID
      handleCloseModal(); // Close modal after submission
    }
  };

  const handlePlayerStatsClick = () => {
    navigate('/players'); // Navigate to Player List Page
  };

  const toggleMenu = () => setIsMenuOpen((prev) => !prev); // Toggle mobile menu

  return (
    <header className="bg-[#1F2233] p-4 flex justify-between items-center">
      <h1 className="text-3xl text-white font-bold">Edge</h1>

      {/* Desktop Buttons */}
      <div className="hidden md:flex space-x-4">
        <button
          className="px-4 py-2 bg-[#01F5BF] text-[#15182D] font-semibold rounded hover:bg-[#019977] flex items-center"
          onClick={handlePlayerStatsClick}
        >
          <FaLock className="mr-2" /> Player Stats
        </button>

        <button
          className="px-4 py-2 bg-[#01F5BF] text-[#15182D] font-semibold rounded hover:bg-[#019977]"
          onClick={handleOpenModal}
        >
          View Your League
        </button>
      </div>

      {/* Mobile Menu Icon */}
      <button className="md:hidden" onClick={toggleMenu}>
        <img src={menuIcon} alt="Menu" className="w-8 h-8" />
      </button>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#15182D] p-6 rounded shadow-lg max-w-sm w-full space-y-4">
            <button
              className="w-full px-4 py-2 bg-[#01F5BF] text-[#15182D] font-semibold rounded hover:bg-[#019977] flex items-center justify-center"
              onClick={() => {
                handlePlayerStatsClick();
                toggleMenu();
              }}
            >
              <FaLock className="mr-2" /> Player Stats
            </button>

            <button
              className="w-full px-4 py-2 bg-[#01F5BF] text-[#15182D] font-semibold rounded hover:bg-[#019977]"
              onClick={() => {
                handleOpenModal();
                toggleMenu();
              }}
            >
              View Your League
            </button>

            <button
              className="w-full px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
              onClick={toggleMenu}
            >
              Close Menu
            </button>
          </div>
        </div>
      )}

      {/* League ID Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center">
          <div className="bg-[#15182D] p-6 rounded shadow-lg max-w-sm w-full">
            <h2 className="text-xl text-white font-bold mb-4">Enter Your Sleeper League ID</h2>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded mb-4"
              placeholder="League ID"
              value={inputLeagueId}
              onChange={(e) => setInputLeagueId(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                onClick={handleCloseModal}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#01F5BF] text-[#15182D] font-semibold rounded hover:bg-[#019977]"
                onClick={handleSubmit}
              >
                Enter
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
