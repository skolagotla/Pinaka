"use client";

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function CashFlowChart({ data }) {
  if (!data || data.length === 0) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#999' }}>No cash flow data available</div>;
  }

  const chartData = data.map(month => ({
    month: month.month,
    income: month.projectedIncome,
    expenses: month.projectedExpenses,
    netFlow: month.netCashFlow,
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
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
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip 
          formatter={(value) => `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        />
        <Legend />
        <Bar 
          dataKey="income" 
          fill="#3f8600" 
          name="Projected Income"
          radius={[4, 4, 0, 0}
        />
        <Bar 
          dataKey="expenses" 
          fill="#cf1322" 
          name="Projected Expenses"
          radius={[4, 4, 0, 0}
        />
        <Line 
          type="monotone" 
          dataKey="netFlow" 
          stroke="#1890ff" 
          strokeWidth={2}
          name="Net Cash Flow"
          dot={{ r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

