/**
 * SafeStatistic Component
 * 
 * A wrapper around Ant Design's Statistic component that prevents
 * caching issues with dynamic suffix props. This component ensures
 * that suffix values are always rendered correctly, even when they change.
 * 
 * Usage:
 * ```jsx
 * <SafeStatistic
 *   title="N4 Forms"
 *   value={10}
 *   suffix={`${draftCount} drafts, ${servedCount} served`}
 * />
 * ```
 */

import { Statistic } from 'antd';
import { useMemo } from 'react';

/**
 * SafeStatistic Component
 * 
 * A wrapper around Ant Design's Statistic component that prevents
 * caching issues with dynamic suffix props. This component ensures
 * that suffix values are always rendered correctly, even when they change.
 * 
 * The fix: Creates a unique key based on the suffix content and value,
 * forcing React to treat it as a new component when the data changes.
 * 
 * Usage:
 * ```jsx
 * <SafeStatistic
 *   title="N4 Forms"
 *   value={10}
 *   suffix={`${draftCount} drafts, ${servedCount} served`}
 * />
 * ```
 */
export default function SafeStatistic({ suffix, value, ...props }) {
  // Create a stable key based on the suffix content and value
  // This ensures React re-renders when either changes
  const suffixKey = useMemo(() => {
    if (!suffix) return '';
    // Create a hash-like key from the suffix content
    const suffixStr = typeof suffix === 'string' 
      ? suffix 
      : typeof suffix === 'number'
      ? String(suffix)
      : JSON.stringify(suffix);
    const valueStr = value !== undefined && value !== null ? String(value) : '';
    // Combine both to create a unique key
    return `${suffixStr}-${valueStr}`;
  }, [suffix, value]);

  // Create a key for the Statistic component that changes when suffix or value changes
  const statisticKey = useMemo(() => {
    return `safe-stat-${suffixKey}`;
  }, [suffixKey]);

  return (
    <Statistic
      {...props}
      key={statisticKey}
      value={value}
      suffix={suffix}
    />
  );
}

