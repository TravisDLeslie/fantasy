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

const PlayerChart = ({ playerName = 'Player', position, teamAbbr, weeklyPoints = {}, byeWeek, onClose }) => {
    const chartRef = useRef();

  const labels = [];
  const data = [];

  const now = new Date();
  const currentWeek = Math.min(
    Math.ceil((now - new Date(now.getFullYear(), 8, 7)) / (7 * 24 * 60 * 60 * 1000)),
    17
  );

  // Helper to determine if the week should be excluded
  const shouldExcludeWeek = (week) =>
    week === byeWeek || weeklyPoints[week] === 0 || weeklyPoints[week] === undefined;

  // Fill the labels and data arrays, but exclude "bye" and "didn't play" weeks from the data
  Array.from({ length: currentWeek }, (_, i) => i + 1).forEach((week) => {
    labels.push(
      week === byeWeek
        ? `Week ${week} (Bye)`
        : weeklyPoints[week] === 0
        ? `Week ${week} (Inactive)`
        : `Week ${week}`
    );
    data.push(shouldExcludeWeek(week) ? null : weeklyPoints[week]);
  });

  // Filter only valid points for calculations (exclude null values)
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
      padding: { top: 30, bottom: 20, left: 10, right: 30 },
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
            const week = context.label;

            if (week.includes("Didn't Play")) return `${week}: 0 Pts`;
            if (week.includes('Bye')) return `${week}: Bye Week`;
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
          padding: 10,
        },
        grid: {
          color: '#131313',
          drawBorder: false,
        },
      },
      x: {
        ticks: {
          color: '#fcfcfc',
          padding: 10,
        },
        grid: {
          color: '#131313',
          drawBorder: false,
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
    const offsetX = Math.min(Math.max(x, 40), ctx.canvas.width - 40);
    const offsetY = Math.min(Math.max(y, 20), ctx.canvas.height - 20);
    const padding = 5;

    ctx.save();
    ctx.fillStyle = '#3B3F5E';
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.font = '12px Arial';
    const labelText = `${text}: ${points} Pts`;
    const textWidth = ctx.measureText(labelText).width + 8;

    ctx.beginPath();
    ctx.moveTo(offsetX - textWidth / 2 - padding, offsetY - 20 - padding);
    ctx.lineTo(offsetX + textWidth / 2 + padding, offsetY - 20 - padding);
    ctx.arcTo(offsetX + textWidth / 2 + padding + 5, offsetY - 15, offsetX + textWidth / 2 + padding + 5, offsetY, 5);
    ctx.lineTo(offsetX + textWidth / 2 + padding + 5, offsetY + 5);
    ctx.arcTo(offsetX + textWidth / 2 + padding, offsetY + 10, offsetX - textWidth / 2 - padding, offsetY + 10, 5);
    ctx.lineTo(offsetX - textWidth / 2 - padding - 5, offsetY + 10);
    ctx.arcTo(offsetX - textWidth / 2 - padding - 5, offsetY + 5, offsetX - textWidth / 2 - padding - 5, offsetY - 15, 5);
    ctx.closePath();

    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(labelText, offsetX, offsetY - 5);
    ctx.restore();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-[#15182D] p-4 md:p-8 rounded shadow-lg max-w-2xl w-full">
        <h2 className="flex flex-col items-center text-center text-gray-400 font-semibold mb-4 mt-2">
          <span>
            {playerName} - <span className="text-sm text-white">{totalPoints.toFixed(2)} Pts</span>
          </span>
          <span className="text-xs text-gray-300 mt-1">
            {position} for ({teamAbbr})
          </span>
        </h2>
        <div className="p-1 md:p-4" style={{ height: '500px' }}>
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
