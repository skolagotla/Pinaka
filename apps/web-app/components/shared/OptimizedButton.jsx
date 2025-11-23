/**
 * Optimized Button Component (Flowbite Version)
 * 
 * Reusable button component with consistent styling and loading states
 * Reduces code duplication across the application
 */

"use client";

import { Button } from 'flowbite-react';
import { memo } from 'react';

/**
 * Optimized Button with consistent styling
 * 
 * @param {Object} props - Button props
 * @param {ReactNode} props.children - Button content
 * @param {string} props.type - Button type ('primary' | 'default' | 'dashed' | 'link' | 'text')
 * @param {string} props.size - Button size ('large' | 'middle' | 'small')
 * @param {boolean} props.loading - Loading state
 * @param {boolean} props.disabled - Disabled state
 * @param {Function} props.onClick - Click handler
 * @param {ReactNode} props.icon - Button icon
 * @param {string} props.className - Additional CSS classes
 */
function OptimizedButton({
  children,
  type = 'default',
  size = 'middle',
  loading = false,
  disabled = false,
  onClick,
  icon,
  className = '',
  block = false,
  ...rest
}) {
  // Map Ant Design types to Flowbite colors
  const colorMap = {
    primary: 'blue',
    default: 'gray',
    dashed: 'light',
    link: 'light',
    text: 'light',
  };

  // Map Ant Design sizes to Flowbite sizes
  const sizeMap = {
    large: 'lg',
    middle: 'md',
    small: 'sm',
  };

  const flowbiteColor = colorMap[type] || 'gray';
  const flowbiteSize = sizeMap[size] || 'md';

  return (
    <Button
      color={flowbiteColor}
      size={flowbiteSize}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${block ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </Button>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(OptimizedButton);
