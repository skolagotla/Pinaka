"use client";
import React, { useState, useEffect } from 'react';
import { TextInput } from 'flowbite-react';

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
 * CurrencyInput Component
 * Automatically applies currency formatting rules from the rules engine
 * 
 * @example
 * <CurrencyInput 
 *   value={amount} 
 *   onChange={setAmount}
 *   country="CA"
 *   style={{ width: '100%' }}
 * />
 */
export default function CurrencyInput({ 
  value = undefined, 
  onChange = undefined, 
  country = 'CA',
  min = 0,
  max = undefined,
  disabled = false,
  style,
  placeholder,
  ...props 
}) {
  const [formatter, setFormatter] = useState(() => (val) => val);
  const [parser, setParser] = useState(() => (val) => val);
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    // Load formatting rules from the rules engine (client-side only)
    if (typeof window === 'undefined') return;
    
    const loadRules = async () => {
      const engine = getRulesEngine();
      if (!engine) return;
      
      const formatterFn = await engine.getAntdFormatter({ country });
      const parserFn = engine.getAntdParser();
      
      setFormatter(() => formatterFn);
      setParser(() => parserFn);
    };

    loadRules();
  }, [country]);

  useEffect(() => {
    // Format the value for display
    if (value !== undefined && value !== null) {
      const formatted = formatter(value);
      setDisplayValue(formatted);
    } else {
      setDisplayValue('');
    }
  }, [value, formatter]);

  const handleChange = (e) => {
    const inputValue = e.target.value;
    // Remove currency symbols and parse
    const parsed = parser(inputValue);
    
    if (onChange) {
      // Validate min/max
      let numValue = parseFloat(parsed) || 0;
      if (min !== undefined && numValue < min) numValue = min;
      if (max !== undefined && numValue > max) numValue = max;
      onChange(numValue);
    }
  };

  return (
    <TextInput
      type="text"
      value={displayValue}
      onChange={handleChange}
      disabled={disabled}
      style={style}
      placeholder={placeholder || '$0.00'}
      addon="$"
      {...props}
    />
  );
}
