/**
 * Simple Timeline Component
 * A Flowbite-compatible timeline for displaying events
 */

"use client";

import React from 'react';

export default function SimpleTimeline({ items = [] }) {
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
      
      <div className="space-y-6">
        {items.map((item, index) => (
          <div key={index} className="relative flex items-start gap-4">
            {/* Timeline dot */}
            <div 
              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                item.color === 'green' ? 'bg-green-500' :
                item.color === 'blue' ? 'bg-blue-500' :
                item.color === 'red' ? 'bg-red-500' :
                'bg-gray-400'
              }`}
            >
              <div className="h-3 w-3 rounded-full bg-white dark:bg-gray-800" />
            </div>
            
            {/* Timeline content */}
            <div className="flex-1 pb-6">
              {item.children}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

