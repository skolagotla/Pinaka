/**
 * SafeStatistic Component
 * 
 * A wrapper around Flowbite-compatible statistic display that prevents
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

"use client";
import { useMemo } from 'react';

/**
 * SafeStatistic Component
 * 
 * A wrapper that prevents caching issues with dynamic suffix props.
 * Creates a unique key based on the suffix content and value,
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
export default function SafeStatistic({ suffix, value, title, prefix, color = '#3b82f6', ...props }) {
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

  return (
    <div key={`safe-stat-${suffixKey}`} {...props}>
      {title && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{title}</p>
      )}
      <div className="flex items-baseline gap-2">
        {prefix && <span className="text-lg text-gray-600 dark:text-gray-300">{prefix}</span>}
        <span className="text-2xl font-bold" style={{ color }}>
          {value}
        </span>
        {suffix && <span className="text-sm text-gray-500 dark:text-gray-400">{suffix}</span>}
      </div>
    </div>
  );
}
