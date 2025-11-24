/**
 * Shared Dashboard Stat Card Component
 * Displays a statistic card with icon, title, value, and optional suffix
 */

"use client";
import { Card, Spinner } from 'flowbite-react';

export default function DashboardStatCard({ 
  title, 
  value, 
  suffix, 
  prefix,
  icon,
  color = '#3b82f6',
  loading = false,
  onClick,
  style = {}
}) {
  const cardStyle = {
    cursor: onClick ? 'pointer' : 'default',
    transition: 'all 0.3s',
    ...style
  };

  return (
    <Card 
      className={onClick ? 'hover:shadow-lg hover:-translate-y-1 transition-all' : ''}
      style={cardStyle}
      onClick={onClick}
    >
      {loading ? (
        <div className="flex justify-center items-center py-4">
          <Spinner size="xl" />
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{title}</p>
          <div className="flex items-baseline gap-2">
            {prefix && <span className="text-lg text-gray-600 dark:text-gray-300">{prefix}</span>}
            <span className="text-2xl font-bold" style={{ color }}>
              {value}
            </span>
            {suffix && <span className="text-sm text-gray-500 dark:text-gray-400">{suffix}</span>}
          </div>
          {icon && (
            <div className="absolute right-4 top-4 text-2xl opacity-30" style={{ color }}>
              {icon}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
