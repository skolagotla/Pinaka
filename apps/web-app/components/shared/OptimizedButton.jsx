/**
 * Optimized Button Component
 * 
 * Reusable button component with consistent styling and loading states
 * Reduces code duplication across the application
 */

"use client";

import { Button } from 'antd';
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
  ...rest
}) {
  return (
    <Button
      type={type}
      size={size}
      loading={loading}
      disabled={disabled || loading}
      onClick={onClick}
      icon={icon}
      className={className}
      style={{
        borderRadius: 6,
      }}
      {...rest}
    >
      {children}
    </Button>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(OptimizedButton);

