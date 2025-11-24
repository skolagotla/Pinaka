"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function PaymentHistoryChart({ data }) {
  if (!data || data.length === 0) {
    return <div className="p-10 text-center text-gray-500">No payment history data available</div>;
  }

  const chartData = data.map(item => ({
    month: item.month,
    amount: item.amount || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="month" 
          style={{ fontSize: 12 }}
        />
        <YAxis 
          style={{ fontSize: 12 }}
          tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`}
        />
        <Tooltip 
          formatter={(value) => `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <Legend />
        <Bar 
          dataKey="amount" 
          fill="#52c41a" 
          name="Amount Paid"
          radius={[4, 4, 0, 0}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

