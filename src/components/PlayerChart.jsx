import React, { useRef, useEffect } from 'react';
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
  const chartRef = useRef();

  const labels = [];
  const data = [];

  const now = new Date();
  const currentWeek = Math.min(
    Math.ceil((now - new Date(now.getFullYear(), 8, 7)) / (7 * 24 * 60 * 60 * 1000)), 
    17
  );

  Array.from({ length: currentWeek }, (_, i) => i + 1).forEach((week) => {
    if (week === byeWeek) {
      labels.push(`Week ${week} (Bye)`);
      data.push(null);
    } else if (weeklyPoints[week] !== undefined) {
      labels.push(`Week ${week}`);
      data.push(weeklyPoints[week]);
    } else {
      labels.push(`Week ${week}`);
      data.push(null);
    }
  });

  const validPoints = data.filter((points) => points !== null);
  const totalPoints = validPoints.reduce((total, pts) => total + pts, 0);
  const gamesPlayed = validPoints.length;
  const avgPoints = gamesPlayed > 0 ? (totalPoints / gamesPlayed).toFixed(2) : '0.00';
  const minPoints = Math.min(...validPoints);
  const maxPoints = Math.max(...validPoints);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Points per Week',
        data,
        borderColor: '#01F5BF',
        borderWidth: 2,
        fill: true,
        spanGaps: true,
        lineTension: 0.2,
        pointBackgroundColor: data.map((value) =>
          value === minPoints ? '#E77C09' : value === maxPoints ? '#01F5BF' : '#01F5BF'
        ),
      },
      {
        label: `Average Points: ${avgPoints}`,
        data: Array(data.length).fill(parseFloat(avgPoints)),
        borderColor: '#B7640B',
        borderWidth: 2,
        borderDash: [2, 5],
        fill: true,
        lineTension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: '#fff',
          font: { size: 14 },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            if (value === minPoints) return `Low: ${value} Pts`;
            if (value === maxPoints) return `High: ${value} Pts`;
            return `${value} Pts`;
          },
        },
      },
    },
    scales: {
      y: { ticks: { color: '#fff' } },
      x: { ticks: { color: '#fff' } },
    },
    animation: {
      onComplete: () => {
        const chart = chartRef.current;
        const { ctx, scales } = chart;
        const xScale = scales.x;
        const yScale = scales.y;

        const minIndex = data.indexOf(minPoints);
        const maxIndex = data.indexOf(maxPoints);

        if (minIndex !== -1) {
          const x = xScale.getPixelForValue(minIndex);
          const y = yScale.getPixelForValue(minPoints);
          drawLabel(ctx, `Low: ${minPoints}`, x, y, '#E77C09');
        }

        if (maxIndex !== -1) {
          const x = xScale.getPixelForValue(maxIndex);
          const y = yScale.getPixelForValue(maxPoints);
          drawLabel(ctx, `High: ${maxPoints}`, x, y, '#01F5BF');
        }
      },
    },
  };

  const drawLabel = (ctx, text, x, y, color) => {
    ctx.save();
    ctx.fillStyle = '#3B3F5E';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.font = '12px Arial';
    const textWidth = ctx.measureText(text).width + 8;

    ctx.beginPath();
    ctx.moveTo(x - textWidth / 2, y - 20);
    ctx.lineTo(x + textWidth / 2, y - 20);
    ctx.arcTo(x + textWidth / 2 + 5, y - 15, x + textWidth / 2 + 5, y, 5);
    ctx.lineTo(x + textWidth / 2 + 5, y + 5);
    ctx.arcTo(x + textWidth / 2, y + 10, x - textWidth / 2, y + 10, 5);
    ctx.lineTo(x - textWidth / 2 - 5, y + 10);
    ctx.arcTo(x - textWidth / 2 - 5, y + 5, x - textWidth / 2 - 5, y - 15, 5);
    ctx.lineTo(x - textWidth / 2 - 5, y - 20);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y - 5);
    ctx.restore();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-[#15182D] p-8 rounded shadow-lg max-w-2xl w-full">
        <h2 className="text-xl text-white font-bold mb-4">{playerName} - Weekly Points</h2>
        <Line ref={chartRef} data={chartData} options={chartOptions} />
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
