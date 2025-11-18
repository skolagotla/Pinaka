"use client";
import React, { useState, useEffect } from 'react';
import { InputNumber } from 'antd';

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

  return (
    <InputNumber
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      disabled={disabled}
      style={style}
      placeholder={placeholder}
      prefix="$"
      precision={2}
      formatter={formatter}
      parser={parser}
      {...props}
    />
  );
}

