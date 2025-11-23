"use client";

import React from 'react';
import { Card } from 'flowbite-react';

/**
 * StatCard Component (Flowbite Version)
 * 
 * A card component for displaying statistics
 */
export default function StatCard({
  title,
  value,
  prefix,
  suffix,
  valueStyle,
  onClick,
  className = "",
}) {
  const content = (
    <Card className={`cursor-pointer hover:shadow-lg transition-shadow ${className}`} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900" style={valueStyle}>
            {prefix && <span className="text-gray-400 mr-1">{prefix}</span>}
            {value}
            {suffix && <span className="text-gray-400 ml-1">{suffix}</span>}
          </p>
        </div>
        {prefix && typeof prefix !== 'string' && (
          <div className="text-3xl text-gray-400">
            {prefix}
          </div>
        )}
      </div>
    </Card>
  );

  return content;
}
