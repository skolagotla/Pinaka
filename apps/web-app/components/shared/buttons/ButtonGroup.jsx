"use client";

/**
 * ButtonGroup Component
 * 
 * Standardized button group for related actions
 * Ensures consistent spacing and styling
 * 
 * @param {Array} buttons - Array of button configs
 * @param {string} direction - 'horizontal' | 'vertical' (default: 'horizontal')
 * @param {number} gap - Gap between buttons in pixels (default: 8)
 */

import React from 'react';
import ActionButton from './ActionButton';
import IconButton from './IconButton';

export default function ButtonGroup({
  buttons = [],
  direction = 'horizontal',
  gap = 8,
  className = '',
  ...restProps
}) {
  const flexDirection = direction === 'vertical' ? 'flex-col' : 'flex-row';
  const gapClass = `gap-${gap / 4}`; // Convert px to Tailwind spacing (gap-2 = 8px)
  
  return (
    <div className={`flex ${flexDirection} ${className}`} style={{ gap: `${gap}px` }} {...restProps}>
      {buttons.map((buttonConfig, index) => {
        const { component, ...props } = buttonConfig;
        
        if (component === 'ActionButton' || ['add', 'edit', 'delete', 'save', 'cancel'].includes(props.action)) {
          return <ActionButton key={index} {...props} />;
        }
        
        if (component === 'IconButton' || props.icon) {
          return <IconButton key={index} {...props} />;
        }
        
        // Fallback to rendering the component directly if provided
        if (component) {
          return React.cloneElement(component, { key: index, ...props });
        }
        
        return null;
      })}
    </div>
  );
}
