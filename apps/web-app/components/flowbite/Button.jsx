/**
 * Button Component - Flowbite replacement for Ant Design Button
 */
'use client';

import { Button as FlowbiteButton } from 'flowbite-react';
import { forwardRef } from 'react';

export const Button = forwardRef(({ 
  type = 'default',
  size = 'md',
  icon,
  loading,
  disabled,
  danger,
  ghost,
  block,
  htmlType = 'button',
  children,
  className = '',
  ...props 
}, ref) => {
  // Map Ant Design button types to Flowbite colors
  const colorMap = {
    default: 'gray',
    primary: 'blue',
    success: 'green',
    warning: 'yellow',
    danger: 'red',
    link: 'light',
  };

  // Map Ant Design sizes to Flowbite sizes
  const sizeMap = {
    small: 'xs',
    middle: 'sm',
    large: 'lg',
  };

  const flowbiteColor = danger ? 'red' : (colorMap[type] || 'gray');
  const flowbiteSize = sizeMap[size] || size;

  // Handle icon positioning
  const buttonContent = icon ? (
    <span className="flex items-center gap-2">
      {icon}
      {children}
    </span>
  ) : children;

  return (
    <FlowbiteButton
      ref={ref}
      color={flowbiteColor}
      size={flowbiteSize}
      disabled={disabled || loading}
      className={`
        ${block ? 'w-full' : ''}
        ${ghost ? 'bg-transparent border border-gray-300 hover:bg-gray-50' : ''}
        ${className}
      `}
      type={htmlType}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {children}
        </span>
      ) : buttonContent}
    </FlowbiteButton>
  );
});

Button.displayName = 'Button';

export default Button;

