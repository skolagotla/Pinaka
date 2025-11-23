"use client";

import React from 'react';
import { Card } from 'flowbite-react';

/**
 * PageLayout Component (Flowbite Version)
 * 
 * A reusable template for consistent page layouts across the application.
 * Provides:
 * - Flexbox layout that fills available height
 * - Compact header section
 * - Optional statistics cards
 * - Full-height content area
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.header - Header content (title, actions, etc.)
 * @param {Array} props.stats - Array of statistics to display: [{ title, value, prefix, valueStyle }]
 * @param {React.ReactNode} props.children - Main content (usually a table or list)
 * @param {string} props.headerTitle - Optional title text (if not using custom header)
 * @param {React.ReactNode} props.headerActions - Optional actions to show in header
 * @param {Object} props.style - Additional styles for main container
 * @param {number} props.statsCols - Number of columns for stats (default: 4, responsive: xs=12, sm=12, md=6)
 */
export default function PageLayout({
  header,
  stats,
  children,
  headerTitle,
  headerActions,
  style = {},
  statsCols = 4,
}) {
  // Determine column spans based on number of stats
  const getColSpan = (index) => {
    if (statsCols === 1) return 'col-span-12';
    if (statsCols === 2) return 'col-span-6';
    if (statsCols === 3) return 'col-span-4';
    return 'col-span-3'; // default 4 columns
  };

  return (
    <div className="flex flex-col h-full" style={style}>
      {/* Header Section */}
      {(header || headerTitle) && (
        <div className="mb-6">
          {header || (
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">{headerTitle}</h1>
              {headerActions && <div>{headerActions}</div>}
            </div>
          )}
        </div>
      )}

      {/* Statistics Cards */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-12 gap-4 mb-6">
          {stats.map((stat, index) => {
            const Icon = stat.prefix;
            return (
              <Card key={index} className={getColSpan(index)}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900" style={stat.valueStyle}>
                      {stat.value}
                    </p>
                  </div>
                  {Icon && (
                    <div className="text-3xl text-gray-400">
                      {Icon}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}

/**
 * EmptyState Component (Flowbite Version)
 */
export function EmptyState({ 
  description = "No data available", 
  image, 
  action 
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {image && <div className="mb-4">{image}</div>}
      <p className="text-gray-500 mb-4">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}

/**
 * TableWrapper Component (Flowbite Version)
 */
export function TableWrapper({ children, className = "" }) {
  return (
    <Card className={className}>
      {children}
    </Card>
  );
}
