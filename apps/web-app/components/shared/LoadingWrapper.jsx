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
import { Spin, Alert, Button, Empty } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

export default function LoadingWrapper({
  loading,
  error,
  children,
  skeleton,
  errorContent,
  errorMessage = 'Failed to load data',
  onRetry,
  size = 'large',
}) {
  // Error state
  if (error) {
    if (errorContent) {
      return errorContent;
    }

    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Alert
          message={errorMessage}
          description={error?.message || 'An error occurred while loading data'}
          type="error"
          showIcon
          action={
            onRetry && (
              <Button size="small" icon={<ReloadOutlined />} onClick={onRetry}>
                Retry
              </Button>
            )
          }
        />
      </div>
    );
  }

  // Loading state
  if (loading) {
    if (skeleton) {
      return skeleton;
    }

    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Spin size={size} />
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
    <div style={{ padding: '16px' }}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: 'flex',
            gap: '16px',
            marginBottom: '16px',
            padding: '12px',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              style={{
                flex: 1,
                height: '20px',
                background: '#f0f0f0',
                borderRadius: '4px',
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          ))}
        </div>
      ))}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}

