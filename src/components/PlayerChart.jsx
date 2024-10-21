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
  const avgPoints = validPoints.length > 0 ? (totalPoints / validPoints.length).toFixed(2) : '0.00';
  const minPoints = Math.min(...validPoints);
  const maxPoints = Math.max(...validPoints);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Points per Week',
        data,
        borderColor: '#01F5BF',
        borderWidth: 1,
        fill: true,
        spanGaps: true,
        lineTension: 0.3,
        pointBackgroundColor: data.map((value) =>
          value === minPoints ? '#fff' : value === maxPoints ? '#BCC3FF' : '#BCC3FF'
        ),
      },
      {
        label: `Average Points: ${avgPoints}`,
        data: Array(data.length).fill(parseFloat(avgPoints)),
        borderColor: '#E77C09',
        borderWidth: 2,
        borderDash: [2, 5],
        fill: true,
        lineTension: 0.5,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: { top: 30, bottom: 20, left: 10, right: 30 }, // Ensure padding on the right side
    },
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
        y: {
          beginAtZero: true,
          ticks: {
            color: '#fcfcfc',
            padding: 10, // Add padding to y-axis ticks
          },
          grid: {
            color: '#131313',
            drawBorder: false, // Optional: Remove border to make it look cleaner
          },
        },
        x: {
          ticks: {
            color: '#fcfcfc',
            padding: 10, // Add padding to x-axis ticks
          },
          grid: {
            color: '#131313',
            drawBorder: false, // Optional: Remove border on x-axis
          },
        },
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
          drawLabel(ctx, 'Low', x, y, '#E77C09', minPoints);
        }

        if (maxIndex !== -1) {
          const x = xScale.getPixelForValue(maxIndex);
          const y = yScale.getPixelForValue(maxPoints);
          drawLabel(ctx, 'High', x, y, '#01F5BF', maxPoints);
        }
      },
    },
  };

  const drawLabel = (ctx, text, x, y, color, points) => {
    const offsetX = Math.min(Math.max(x, 40), ctx.canvas.width - 40); // Keep label within bounds
    const offsetY = Math.min(Math.max(y, 20), ctx.canvas.height - 20);
    const padding = 5; // Padding inside the label box


    ctx.save();
    ctx.fillStyle = '#3B3F5E';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.font = '12px Arial';
    const labelText = `${text}: ${points} Pts`;
    const textWidth = ctx.measureText(labelText).width + 8;

   // Draw rounded rectangle with padding
  ctx.beginPath();
  ctx.moveTo(x - textWidth / 2 - padding, y - 20 - padding);
  ctx.lineTo(x + textWidth / 2 + padding, y - 20 - padding);
  ctx.arcTo(x + textWidth / 2 + padding + 5, y - 15, x + textWidth / 2 + padding + 5, y, 5);
  ctx.lineTo(x + textWidth / 2 + padding + 5, y + 5);
  ctx.arcTo(x + textWidth / 2 + padding, y + 10, x - textWidth / 2 - padding, y + 10, 5);
  ctx.lineTo(x - textWidth / 2 - padding - 5, y + 10);
  ctx.arcTo(x - textWidth / 2 - padding - 5, y + 5, x - textWidth / 2 - padding - 5, y - 15, 5);
  ctx.lineTo(x - textWidth / 2 - padding - 5, y - 20 - padding);
  ctx.closePath();

  ctx.fill(); // Fill the background
  ctx.stroke(); // Stroke the border
  ctx.fillStyle = color; // Text color
  ctx.textAlign = 'center';
  ctx.fillText(labelText, x, y - 5); // Render the label text
  ctx.restore();
};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-[#15182D] p-8 rounded shadow-lg max-w-2xl w-full">
        <h2 className="flex items-center justify-start text-base text-gray-400 font-semibold mb-4">
          <span>{playerName}</span>
          <span className="ml-4 text-sm text-white">{totalPoints.toFixed(2)} Pts</span>
        </h2>
        <div className="p-4" style={{ height: '400px' }}>
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        </div>
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
