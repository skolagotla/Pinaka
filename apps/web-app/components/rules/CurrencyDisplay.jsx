"use client";
import React, { useState, useEffect } from 'react';

// Lazy load rules engine to avoid SSR issues
let rulesEngine = null;
function getRulesEngine() {
  if (typeof window === 'undefined') return null;
  if (!rulesEngine) {
    rulesEngine = require('@/lib/rules/rules-engine');
  }
  return rulesEngine;
}

/**
 * CurrencyDisplay Component
 * Automatically formats currency values according to rules engine
 * 
 * @example
 * <CurrencyDisplay value={1234.56} country="CA" strong />
 * // Output: $1,234.56
 */
export default function CurrencyDisplay({ 
  value, 
  country = 'CA',
  strong = false,
  className = '',
  style,
  ...props 
}) {
  const [formattedValue, setFormattedValue] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const formatValue = async () => {
      if (value == null || value === '') {
        setFormattedValue('—');
        return;
      }

      const engine = getRulesEngine();
      if (!engine) {
        // Fallback formatting if engine not available
        setFormattedValue(typeof value === 'number' ? value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : String(value));
        return;
      }

      const formatted = await engine.formatCurrency(value, { country });
      setFormattedValue(formatted);
    };

    formatValue();
  }, [value, country]);

  const Tag = strong ? 'strong' : 'span';
  const classes = strong ? `font-semibold ${className}` : className;

  return (
    <Tag 
      className={classes}
      style={style}
      {...props}
    >
      {formattedValue}
    </Tag>
  );
}
