"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

export default function PortfolioPerformanceChart({ data }) {
  if (!data) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>No performance data available</div>;
  }

  const chartData = [
    {
      name: 'Rent',
      value: data.totalRent || 0,
      color: '#3f8600',
    },
    {
      name: 'Expenses',
      value: data.totalExpenses || 0,
      color: '#cf1322',
    },
    {
      name: 'Net Income',
      value: data.netIncome || 0,
      color: data.netIncome >= 0 ? '#1890ff' : '#ff4d4f',
    },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" style={{ fontSize: 12 }} />
        <YAxis 
          style={{ fontSize: 12 }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip 
          formatter={(value) => `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <Legend />
        <Bar dataKey="value" radius={[8, 8, 0, 0}>
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

