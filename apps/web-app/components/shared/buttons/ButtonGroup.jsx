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
import { Space } from 'antd';
import ActionButton from './ActionButton';
import IconButton from './IconButton';

export default function ButtonGroup({
  buttons = [],
  direction = 'horizontal',
  gap = 8,
  ...restProps
}) {
  return (
    <Space direction={direction} size={gap} {...restProps}>
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
    </Space>
  );
}

