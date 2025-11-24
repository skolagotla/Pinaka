"use client";

/**
 * LoadingWrapper Component
 * 
 * Consistent loading state wrapper for tables, lists, and content areas.
 * 
 * Features:
 * - Loading spinner
 * - Skeleton loaders for tables
 * - Error states
 * - Empty states
 * 
 * @param {Object} props
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.error - Error state
 * @param {React.ReactNode} props.children - Content to display when not loading
 * @param {React.ReactNode} props.skeleton - Custom skeleton loader
 * @param {React.ReactNode} props.errorContent - Custom error content
 * @param {string} props.errorMessage - Error message text
 * @param {function} props.onRetry - Retry handler for errors
 * @param {string} props.size - Spinner size: 'small' | 'default' | 'large' (default: 'large')
 * 
 * @example
 * <LoadingWrapper loading={loading} error={error} onRetry={refetch}>
 *   <Table dataSource={data} />
 * </LoadingWrapper>
 */

import React from 'react';
import { Spinner, Alert, Button } from 'flowbite-react';
import { HiRefresh } from 'react-icons/hi';

export default function LoadingWrapper({
  loading,
  error,
  children,
  skeleton,
  errorContent,
  errorMessage = 'Failed to load data',
  onRetry,
  size = 'xl',
}) {
  // Error state
  if (error) {
    if (errorContent) {
      return errorContent;
    }

    return (
      <div className="p-10 text-center">
        <Alert color="failure" className="mb-4">
          <div>
            <h3 className="font-semibold">{errorMessage}</h3>
            <p className="text-sm mt-1">{error?.message || 'An error occurred while loading data'}</p>
          </div>
        </Alert>
        {onRetry && (
          <Button color="gray" size="sm" onClick={onRetry} className="flex items-center gap-2 mx-auto">
            <HiRefresh className="h-4 w-4" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  // Loading state
  if (loading) {
    if (skeleton) {
      return skeleton;
    }

    return (
      <div className="p-10 text-center">
        <Spinner size={size} />
      </div>
    );
  }

  // Content
  return <>{children}</>;
}

/**
 * TableSkeleton Component
 * 
 * Skeleton loader specifically for tables.
 */
export function TableSkeleton({ rows = 5, columns = 4 }) {
  return (
    <div className="p-4">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-4 mb-4 p-3 border-b border-gray-200 dark:border-gray-700"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="flex-1 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"
            />
          ))}
        </div>
      ))}
    </div>
  );
}
