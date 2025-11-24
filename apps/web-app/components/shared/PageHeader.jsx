"use client";

import React from 'react';
import { Button } from 'flowbite-react';

/**
 * PageHeader Component
 * 
 * Consistent page header with title, description, and action buttons
 * 
 * @param {string} title - Page title
 * @param {string} description - Optional description text
 * @param {React.ReactNode} actions - Action buttons or elements
 * @param {React.ReactNode} children - Additional header content
 */
export default function PageHeader({ title, description, actions, children }) {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
          {children}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

