"use client";

/**
 * FilterBar Component
 * 
 * A reusable filter/search bar component for consistent filtering across pages.
 * 
 * Features:
 * - Multiple filter dropdowns
 * - Search input
 * - Reset button
 * - Active filter tags display
 * - Responsive layout
 * 
 * @param {Object} props
 * @param {Array} props.filters - Array of filter configurations
 * @param {Object} props.activeFilters - Current active filter values
 * @param {function} props.onFilterChange - Handler when filters change: (filters) => void
 * @param {function} props.onReset - Handler for reset button
 * @param {string} props.searchValue - Search input value
 * @param {function} props.onSearchChange - Handler for search input: (value) => void
 * @param {string} props.searchPlaceholder - Search placeholder text
 * @param {boolean} props.showSearch - Show search input (default: true)
 * @param {boolean} props.showReset - Show reset button (default: true)
 * @param {boolean} props.compact - Compact mode (default: false)
 * 
 * Filter configuration:
 * {
 *   key,           // Filter key
 *   label,         // Filter label
 *   type: 'select' | 'dateRange' | 'input',
 *   options?: [],  // For select type
 *   placeholder?,
 *   style?: object,
 *   width?: string
 * }
 * 
 * @example
 * <FilterBar
 *   filters={[
 *     { key: 'status', label: 'Status', type: 'select', options: statusOptions },
 *     { key: 'type', label: 'Type', type: 'select', options: typeOptions }
 *   ]}
 *   activeFilters={filters}
 *   onFilterChange={setFilters}
 *   onReset={() => setFilters({})}
 *   searchValue={searchTerm}
 *   onSearchChange={setSearchTerm}
 *   searchPlaceholder="Search..."
 * />
 */

import React from 'react';
import { Card, Select, Button, Badge, TextInput } from 'flowbite-react';
import { HiFilter, HiX, HiSearch } from 'react-icons/hi';

export default function FilterBar({
  filters = [],
  activeFilters = {},
  onFilterChange,
  onReset,
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  showSearch = true,
  showReset = true,
  compact = false,
}) {
  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value };
    onFilterChange?.(newFilters);
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      // Default reset: clear all filters and search
      const clearedFilters = {};
      filters.forEach(filter => {
        clearedFilters[filter.key] = undefined;
      });
      onFilterChange?.(clearedFilters);
      onSearchChange?.('');
    }
  };

  const activeFilterCount = Object.values(activeFilters).filter(
    value => value !== undefined && value !== null && value !== ''
  ).length + (searchValue ? 1 : 0);

  const renderFilterInput = (filter) => {
    const value = activeFilters[filter.key];

    switch (filter.type) {
      case 'select':
        return (
          <Select
            key={filter.key}
            id={`filter-${filter.key}`}
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value || undefined)}
            className={compact ? 'text-sm' : ''}
            style={{ width: filter.width || 180, ...filter.style }}
          >
            <option value="">{filter.placeholder || `Select ${filter.label}`}</option>
            {filter.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );

      case 'dateRange':
        // Note: Flowbite doesn't have a built-in date range picker
        // For now, use two separate date inputs or a custom component
        return (
          <div key={filter.key} className="flex gap-2" style={{ width: filter.width || 240, ...filter.style }}>
            <TextInput
              type="date"
              value={value?.[0] || ''}
              onChange={(e) => {
                const newValue = [e.target.value, value?.[1]];
                handleFilterChange(filter.key, newValue);
              }}
              className={compact ? 'text-sm' : ''}
            />
            <TextInput
              type="date"
              value={value?.[1] || ''}
              onChange={(e) => {
                const newValue = [value?.[0], e.target.value];
                handleFilterChange(filter.key, newValue);
              }}
              className={compact ? 'text-sm' : ''}
            />
          </div>
        );

      case 'input':
        return (
          <TextInput
            key={filter.key}
            type="text"
            placeholder={filter.placeholder || `Enter ${filter.label}`}
            value={value || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value || undefined)}
            className={compact ? 'text-sm' : ''}
            style={{ width: filter.width || 180, ...filter.style }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card className={`mb-3 ${compact ? 'p-2' : 'p-4'}`}>
      <div className="flex flex-wrap items-center gap-3 w-full">
        {/* Filter Dropdowns */}
        {filters.map(filter => (
          <div key={filter.key} className="flex items-center gap-2">
            {!compact && (
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {filter.label}:
              </span>
            )}
            {renderFilterInput(filter)}
          </div>
        ))}

        {/* Search Input */}
        {showSearch && (
          <div className="relative flex-1 min-w-[200px]">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <HiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <TextInput
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSearchChange?.(e.target.value);
                }
              }}
              className={`pl-10 ${compact ? 'text-sm' : ''}`}
              style={{ width: '100%', maxWidth: 300 }}
            />
            {searchValue && (
              <button
                type="button"
                onClick={() => onSearchChange?.('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                <HiX className="h-4 w-4" />
              </button>
            )}
          </div>
        )}

        {/* Reset Button */}
        {showReset && (
          <Button
            color="gray"
            onClick={handleReset}
            disabled={activeFilterCount === 0}
            size={compact ? 'xs' : 'sm'}
            className="flex items-center gap-2"
          >
            <HiX className="h-4 w-4" />
            Reset
          </Button>
        )}

        {/* Active Filter Count Badge */}
        {activeFilterCount > 0 && !compact && (
          <Badge color="blue" icon={HiFilter} size="sm">
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
          </Badge>
        )}
      </div>
    </Card>
  );
}
