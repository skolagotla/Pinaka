/**
 * Optimized Card Component
 * 
 * Reusable card component with consistent styling and performance optimizations
 * Replaces repetitive Card usage across the application
 */

"use client";

import { Card } from 'antd';
import { memo } from 'react';

/**
 * Optimized Card with consistent styling
 * 
 * @param {Object} props - Card props
 * @param {ReactNode} props.children - Card content
 * @param {string} props.title - Card title
 * @param {ReactNode} props.extra - Extra content (buttons, etc.)
 * @param {boolean} props.loading - Loading state
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional styles
 * @param {boolean} props.hoverable - Enable hover effect
 * @param {string} props.size - Card size ('default' | 'small')
 */
function OptimizedCard({
  children,
  title,
  extra,
  loading = false,
  className = '',
  style = {},
  hoverable = false,
  size = 'default',
  ...rest
}) {
  return (
    <Card
      title={title}
      extra={extra}
      loading={loading}
      hoverable={hoverable}
      size={size}
      className={className}
      style={{
        borderRadius: 8,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Card>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(OptimizedCard);

