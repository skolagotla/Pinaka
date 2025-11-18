"use client";
import React, { useState, useEffect } from 'react';
import { Typography } from 'antd';

// Lazy load rules engine to avoid SSR issues
let rulesEngine = null;
function getRulesEngine() {
  if (typeof window === 'undefined') return null;
  if (!rulesEngine) {
    rulesEngine = require('@/lib/rules/rules-engine');
  }
  return rulesEngine;
}

const { Text } = Typography;

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
  type,
  style,
  className,
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

  return (
    <Text 
      strong={strong} 
      type={type}
      style={style}
      className={className}
      {...props}
    >
      {formattedValue}
    </Text>
  );
}

