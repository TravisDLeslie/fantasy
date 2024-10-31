import React, { useState } from 'react';
import { FaLock, FaChartLine, FaChevronDown, FaListAlt } from 'react-icons/fa'; // Icons for menu items
import { useNavigate, Link } from 'react-router-dom'; // Navigation tools
import menuIcon from '../assets/icons/menu.svg'; // Import custom menu icon

const Header = ({ onLeagueIdChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [inputLeagueId, setInputLeagueId] = useState(''); // Input state
  const [isMenuOpen, setIsMenuOpen] = useState(false); // Mobile menu state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // Desktop dropdown state
  const navigate = useNavigate(); // Use navigate for page transitions

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = () => {
    if (inputLeagueId.trim()) {
      onLeagueIdChange(inputLeagueId.trim()); // Update league ID
      handleCloseModal(); // Close modal after submission
    }
  };

  const handleNavigation = (path) => {
    navigate(path); // Navigate to the specified route
    setIsMenuOpen(false); // Close the menu after navigating (mobile)
    setIsDropdownOpen(false); // Close dropdown after navigating (desktop)
  };

  const toggleMenu = () => setIsMenuOpen((prev) => !prev); // Toggle mobile menu
  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev); // Toggle desktop dropdown

  return (
    <header className="bg-[#1F2233] p-4 flex justify-between items-center">
      {/* Logo with Home Link */}
      <Link to="/" className="text-3xl text-white font-bold hover:underline">
        Fleeced
      </Link>

      {/* Desktop Dropdown Menu */}
      <div className="hidden md:flex items-center space-x-4">
        <div className="relative">
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-[#01F5BF] text-[#15182D] font-semibold rounded hover:bg-[#019977]"
            onClick={toggleDropdown}
          >
            <FaChevronDown className="mr-2" /> Menu
          </button>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-[#15182D] rounded shadow-lg">
              <button
                className="block w-full px-4 py-2 text-left text-white hover:bg-[#019977] flex items-center"
                onClick={() => handleNavigation('/players')}
              >
                <FaLock className="mr-2" /> Player Insights
              </button>
              <button
                className="block w-full px-4 py-2 text-left text-white hover:bg-[#019977] flex items-center"
                onClick={() => handleNavigation('/metrics')}
              >
                <FaChartLine className="mr-2" /> Player Metrics
              </button>
              <button
                className="block w-full px-4 py-2 text-left text-white hover:bg-[#019977] flex items-center"
                onClick={() => handleNavigation('/scoring')}
              >
                <FaListAlt className="mr-2" /> Scoring
              </button>
              <button
                className="block w-full px-4 py-2 text-left text-white hover:bg-[#019977]"
                onClick={handleOpenModal}
              >
                View Your League
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Icon */}
      <button className="md:hidden" onClick={toggleMenu}>
        <img src={menuIcon} alt="Menu" className="w-8 h-8" />
      </button>

      {/* Mobile Menu Drawer */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-[#15182D] p-6 rounded shadow-lg max-w-sm w-full space-y-4">
            <button
              className="w-full px-4 py-2 bg-[#01F5BF] text-[#15182D] font-semibold rounded hover:bg-[#019977] flex items-center justify-center"
              onClick={() => handleNavigation('/players')}
            >
              <FaLock className="mr-2" /> Player Insights
            </button>
            <button
              className="w-full px-4 py-2 bg-[#01F5BF] text-[#15182D] font-semibold rounded hover:bg-[#019977] flex items-center justify-center"
              onClick={() => handleNavigation('/metrics')}
            >
              <FaChartLine className="mr-2" /> Player Metrics
            </button>
            <button
              className="w-full px-4 py-2 bg-[#01F5BF] text-[#15182D] font-semibold rounded hover:bg-[#019977] flex items-center justify-center"
              onClick={() => handleNavigation('/scoring')}
            >
              <FaListAlt className="mr-2" /> Scoring
            </button>
            <button
              className="w-full px-4 py-2 bg-[#01F5BF] text-[#15182D] font-semibold rounded hover:bg-[#019977]"
              onClick={handleOpenModal}
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
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
