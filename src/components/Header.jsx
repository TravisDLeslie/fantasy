import React, { useState } from 'react';

const Header = ({ onLeagueIdChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal state
  const [inputLeagueId, setInputLeagueId] = useState(''); // Input state

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleSubmit = () => {
    if (inputLeagueId.trim()) {
      onLeagueIdChange(inputLeagueId.trim()); // Update league ID
      handleCloseModal(); // Close modal after submission
    }
  };

  return (
    <header className="bg-[#1F2233] p-4 flex justify-between items-center">
      <h1 className="text-3xl text-white font-bold">Edge</h1>
      <button
        className="px-4 py-2 bg-[#01F5BF] text-[#15182D] font-semibold rounded hover:bg-[#019977]"
        onClick={handleOpenModal}
      >
        View Your League
      </button>

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
