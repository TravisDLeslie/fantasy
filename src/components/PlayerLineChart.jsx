// src/components/PlayerLineChart.jsx
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PlayerLineChart = ({ weeklyPoints }) => {
  // Convert weeklyPoints object to an array of { week, points } objects
  const data = Object.entries(weeklyPoints).map(([week, points]) => ({
    week: `Week ${week}`,
    points,
  }));

  return (
    <div className="w-full h-128 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="week" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="points" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlayerLineChart;
