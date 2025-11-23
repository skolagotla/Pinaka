"use client";

import { Card } from 'flowbite-react';
import FlowbiteStatistic from './FlowbiteStatistic';
import { HiArrowUp, HiArrowDown } from 'react-icons/hi';

export default function QuickStatsWidget({ title, stats = [], icon }) {
  const getColClass = (statsLength, index) => {
    if (statsLength === 1) return 'col-span-12';
    if (statsLength === 2) return 'col-span-6';
    if (statsLength > 2) return 'col-span-4';
    return 'col-span-6';
  };

  const formatValue = (value, stat) => {
    if (typeof value === 'number') {
      if (stat.format === 'currency') {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: stat.currency || 'USD',
        }).format(value);
      }
      if (stat.format === 'percent') {
        return `${value}%`;
      }
      return value.toLocaleString();
    }
    return value;
  };

  return (
    <Card className="h-full min-h-[300px]">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          {icon && <span>{icon}</span>}
          {title}
        </h3>
      </div>
      <div className="grid grid-cols-12 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={getColClass(stats.length, index)}>
            <FlowbiteStatistic
              title={stat.label}
              value={formatValue(stat.value, stat)}
              prefix={stat.prefix}
              suffix={stat.suffix}
              valueStyle={{
                color: stat.color || '#3f8600',
                fontSize: stat.size || '24px',
              }}
            />
            {stat.trend && (
              <div className="mt-2">
                <span
                  className={`text-xs flex items-center gap-1 ${
                    stat.trend > 0
                      ? 'text-green-600'
                      : stat.trend < 0
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}
                >
                  {stat.trend > 0 ? (
                    <HiArrowUp className="h-3 w-3" />
                  ) : (
                    <HiArrowDown className="h-3 w-3" />
                  )}
                  {Math.abs(stat.trend)}% vs last period
                </span>
              </div>
            )}
            {stat.description && (
              <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
