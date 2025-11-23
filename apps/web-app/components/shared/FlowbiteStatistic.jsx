"use client";

import React from 'react';
import { Card } from 'flowbite-react';

/**
 * FlowbiteStatistic Component
 * 
 * A Flowbite-compatible replacement for Ant Design's Statistic component.
 * 
 * @param {string} title - Title text
 * @param {string|number} value - Main value to display
 * @param {string|React.ReactNode} suffix - Suffix text/element
 * @param {React.ReactNode} prefix - Prefix icon/element
 * @param {Object} valueStyle - Styles for the value
 * @param {boolean} hoverable - Whether card is hoverable
 * @param {Function} onClick - Click handler
 * @param {string} className - Additional CSS classes
 */
export default function FlowbiteStatistic({
  title,
  value,
  suffix,
  prefix,
  valueStyle = {},
  hoverable = false,
  onClick,
  className = "",
  ...props
}) {
  const content = (
    <div className={`flex flex-col ${onClick ? 'cursor-pointer' : ''} ${className}`} onClick={onClick}>
      {title && (
        <p className="text-sm text-gray-600 mb-1">{title}</p>
      )}
      <div className="flex items-baseline gap-2">
        {prefix && (
          <div className="text-2xl" style={{ color: valueStyle.color || '#1890ff' }}>
            {prefix}
          </div>
        )}
        <div className="flex items-baseline gap-1">
          <p className="text-2xl font-bold text-gray-900" style={valueStyle}>
            {value}
          </p>
          {suffix && (
            <span className="text-sm text-gray-600 ml-1">{suffix}</span>
          )}
        </div>
      </div>
    </div>
  );

  if (onClick || hoverable) {
    return (
      <Card className={`${hoverable ? 'hover:shadow-lg transition-shadow' : ''} ${className}`} onClick={onClick}>
        {content}
      </Card>
    );
  }

  return (
    <Card className={className} {...props}>
      {content}
    </Card>
  );
}

