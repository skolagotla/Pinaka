"use client";

import { ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function IncomeExpensesChart({ data }) {
  if (!data || data.length === 0) {
    return null;
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={data}
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
          name="Income"
          radius={[4, 4, 0, 0}
        />
        <Bar 
          dataKey="expenses" 
          fill="#cf1322" 
          name="Expenses"
          radius={[4, 4, 0, 0}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

