"use client";

import React from 'react';
import { Card } from 'flowbite-react';

/**
 * StatCard Component
 * 
 * Displays a metric with icon, title, and value
 * 
 * @param {string} title - Stat title
 * @param {string|number} value - Stat value
 * @param {React.ReactNode} icon - Optional icon component
 * @param {string} color - Color variant (blue, green, yellow, red, purple, gray)
 * @param {string} trend - Optional trend indicator (up, down, neutral)
 * @param {string} trendValue - Optional trend value
 * @param {React.ReactNode} action - Optional action button/link
 */
export default function StatCard({ 
  title, 
  value, 
  icon, 
  color = 'blue',
  trend,
  trendValue,
  action 
}) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-300',
    green: 'bg-green-50 text-green-600 dark:bg-green-900 dark:text-green-300',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-300',
    red: 'bg-red-50 text-red-600 dark:bg-red-900 dark:text-red-300',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900 dark:text-purple-300',
    gray: 'bg-gray-50 text-gray-600 dark:bg-gray-900 dark:text-gray-300',
  };

  const iconBgClass = colorClasses[color] || colorClasses.blue;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {trend && trendValue && (
            <p className={`text-xs mt-1 ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {trend === 'up' && '↑'} {trend === 'down' && '↓'} {trendValue}
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${iconBgClass}`}>
            {icon}
          </div>
        )}
      </div>
      {action && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {action}
        </div>
      )}
    </Card>
  );
}
