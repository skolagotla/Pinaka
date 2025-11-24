/**
 * Optimized Card Component
 * 
 * Reusable card component with consistent styling and performance optimizations
 * Replaces repetitive Card usage across the application
 */

"use client";

import { Card } from 'flowbite-react';
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
  ...rest
}) {
  const hoverClass = hoverable ? 'hover:shadow-lg transition-shadow' : '';
  
  return (
    <Card
      className={`rounded-lg ${hoverClass} ${className}`}
      style={style}
      {...rest}
    >
      {(title || extra) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {extra && <div>{extra}</div>}
        </div>
      )}
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        children
      )}
    </Card>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(OptimizedCard);
