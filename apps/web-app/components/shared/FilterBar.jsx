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
 *   width? | string
 * }
 * 
 * @example
 * <FilterBar
 *   filters={
 *     { key: 'status', label: 'Status', type: 'select', options: statusOptions },
 *     { key: 'type', label: 'Type', type: 'select', options: typeOptions }
 *   }
 *   activeFilters={filters}
 *   onFilterChange={setFilters}
 *   onReset={() => setFilters({})}
 *   searchValue={searchTerm}
 *   onSearchChange={setSearchTerm}
 *   searchPlaceholder="Search..."
 * />
 */

import React from 'react';
import { Card, Space, Select, DatePicker, Input, Button, Tag } from 'antd';
import { FilterOutlined, ClearOutlined, SearchOutlined } from '@ant-design/icons';

const { RangePicker } = DatePicker;
const { Search } = Input;

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
            placeholder={filter.placeholder || `Select ${filter.label}`}
            value={value}
            onChange={(val) => handleFilterChange(filter.key, val)}
            allowClear
            style={{ width: filter.width || 180, ...filter.style }}
            size={compact ? 'small' : 'middle'}
          >
            {filter.options?.map(option => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        );

      case 'dateRange':
        return (
          <RangePicker
            key={filter.key}
            value={value}
            onChange={(dates) => handleFilterChange(filter.key, dates)}
            style={{ width: filter.width || 240, ...filter.style }}
            size={compact ? 'small' : 'middle'}
          />
        );

      case 'input':
        return (
          <Input
            key={filter.key}
            placeholder={filter.placeholder || `Enter ${filter.label}`}
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            allowClear
            style={{ width: filter.width || 180, ...filter.style }}
            size={compact ? 'small' : 'middle'}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card
      size={compact ? 'small' : 'default'}
      style={{ marginBottom: 12 }}
      bodyStyle={{ padding: compact ? '8px 12px' : '12px 16px' }}
    >
      <Space size="middle" wrap style={{ width: '100%' }}>
        {/* Filter Dropdowns */}
        {filters.map(filter => (
          <Space key={filter.key} size="small">
            {!compact && <span style={{ fontSize: 14, color: '#666' }}>{filter.label}:</span>}
            {renderFilterInput(filter)}
          </Space>
        ))}

        {/* Search Input */}
        {showSearch && (
          <Search
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onSearch={(value) => onSearchChange?.(value)}
            allowClear
            style={{ width: 300 }}
            size={compact ? 'small' : 'middle'}
            enterButton
          />
        )}

        {/* Reset Button */}
        {showReset && (
          <Button
            icon={<ClearOutlined />}
            onClick={handleReset}
            disabled={activeFilterCount === 0}
            size={compact ? 'small' : 'middle'}
          >
            Reset
          </Button>
        )}

        {/* Active Filter Count Badge */}
        {activeFilterCount > 0 && !compact && (
          <Tag color="blue" icon={<FilterOutlined />}>
            {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
          </Tag>
        )}
      </Space>
    </Card>
  );
}

