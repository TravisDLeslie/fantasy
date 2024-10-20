import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

const PlayerChart = ({ playerName = 'Player', weeklyPoints = {}, byeWeek, onClose }) => {
  const labels = [];
  const data = [];
  
  // Get the current week dynamically to exclude future weeks
  const now = new Date();
  const currentWeek = Math.min(
    Math.ceil((now - new Date(now.getFullYear(), 8, 7)) / (7 * 24 * 60 * 60 * 1000)), 
    17
  ); // Cap at week 17

  // Iterate over weeks 1 through current week only
  Array.from({ length: currentWeek }, (_, i) => i + 1).forEach((week) => {
    if (week === byeWeek) {
      labels.push(`Week ${week} (Bye)`);
      data.push(null); // No point plotted for bye week
    } else if (weeklyPoints[week] !== undefined) {
      labels.push(`Week ${week}`);
      data.push(weeklyPoints[week]);
    } else {
      labels.push(`Week ${week}`);
      data.push(null); // No data available for this week
    }
  });

  // Filter out bye weeks and future weeks
  const validPoints = data.filter((points) => points !== null);
  
  // Calculate total points and games played
  const totalPoints = validPoints.reduce((total, pts) => total + pts, 0);
  const gamesPlayed = validPoints.length;

  // Avoid division by zero
  const avgPoints = gamesPlayed > 0 ? totalPoints / gamesPlayed : 0;

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Points per Week',
        data,
        borderColor: 'blue',
        borderWidth: 2,
        fill: false,
        spanGaps: true, // Skip gaps for bye weeks
      },
      {
        label: 'Average Points',
        data: Array(data.length).fill(avgPoints),
        borderColor: 'orange',
        borderWidth: 2,
        borderDash: [5, 5], // Dashed line for average
        fill: false,
      },
    ],
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-lg max-w-2xl w-full">
        <h2 className="text-xl font-bold mb-4">{playerName} - Weekly Points</h2>
        <Line data={chartData} />
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default PlayerChart;
