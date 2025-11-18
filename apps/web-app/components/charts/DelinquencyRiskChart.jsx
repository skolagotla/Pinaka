"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const COLORS = {
  low: '#52c41a',
  medium: '#faad14',
  high: '#ff4d4f',
};

export default function DelinquencyRiskChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>No risk data available</div>;
  }

  const riskDistribution = {
    low: data.filter(t => t.riskLevel === 'low').length,
    medium: data.filter(t => t.riskLevel === 'medium').length,
    high: data.filter(t => t.riskLevel === 'high').length,
  };

  const chartData = [
    { name: 'Low Risk', value: riskDistribution.low, color: COLORS.low },
    { name: 'Medium Risk', value: riskDistribution.medium, color: COLORS.medium },
    { name: 'High Risk', value: riskDistribution.high, color: COLORS.high },
  ].filter(item => item.value > 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

