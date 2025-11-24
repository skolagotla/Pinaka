/**
 * PageBanner Component
 * 
 * Reusable 3-section banner component used across all landlord and tenant pages
 * 
 * Layout:
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  [Title]        [Stats: Key-Value Pairs]      [🔍 ↻ ➕ ▼]       │
 * └─────────────────────────────────────────────────────────────────┘
 * 
 * - Left: Title
 * - Middle: Stats (key-value pairs)
 * - Right: Actions (Search, Refresh, Add, Dropdown) - consistent order
 * 
 * Usage:
 * <PageBanner
 *   title="Vault"
 *   stats={[
 *     { label: 'Tenants', value: 3, color: '#3b82f6' },
 *     { label: 'Documents', value: 9, color: '#22c55e' }
 *   ]}
 *   actions={[
 *     { icon: <HiPlus />, tooltip: 'Add', onClick: handleAdd, type: 'primary' }
 *   ]}
 *   dropdown={<Select ... />}
 *   showStats={true}
 *   searchValue={searchTerm}
 *   onSearchChange={setSearchTerm}
 *   onSearchClear={clearSearch}
 * />
 */

import React, { memo } from 'react';
import { Card, Button, Tooltip } from 'flowbite-react';
import SearchBar from './SearchBar';
import { IconButton, ActionButton } from './buttons';

function PageBanner({ 
  title, 
  subtitle = null,
  stats = [], 
  actions = [], 
  dropdown = null,
  showStats = true,
  style = {},
  searchValue = '',
  onSearchChange = null,
  onSearchClear = null,
  searchPlaceholder = "Search..."
}) {
  return (
    <Card
      className="mb-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
      style={style}
    >
      <div className="grid grid-cols-[auto_auto_1fr_auto_auto] gap-6 items-center">
        {/* SECTION 1: Title (Left) */}
        <div>
          <h2 className="text-2xl font-semibold m-0 text-gray-900 dark:text-white">{title}</h2>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        
        {/* DIVIDER 1 */}
        <div className="w-px h-10 bg-gray-200 dark:bg-gray-700 self-center" />
        
        {/* SECTION 2: Stats (Middle) */}
        <div className="flex items-center gap-6 justify-center overflow-hidden">
          {showStats && stats.length > 0 && stats.map((stat, index) => (
            <span key={index} className="text-base text-gray-600 dark:text-gray-300 whitespace-nowrap">
              {stat.label}: <strong className="text-lg" style={{ color: stat.color }}>{stat.value}</strong>
            </span>
          ))}
        </div>
        
        {/* DIVIDER 2 */}
        <div className="w-px h-10 bg-gray-200 dark:bg-gray-700 self-center" />
        
        {/* SECTION 3: Actions (Right) - Consistent Order: Search, Dropdown, Refresh, Add */}
        <div className="flex items-center gap-2 min-w-fit">
          {/* Search First - Uses SearchBar component */}
          {onSearchChange && (
            <SearchBar
              value={searchValue}
              onChange={onSearchChange}
              onClear={onSearchClear}
              placeholder={searchPlaceholder}
              width={350}
            />
          )}
          
          {/* Dropdown Second */}
          {dropdown}
          
          {/* Other Action Buttons (Refresh, Add, etc.) */}
          <div className="flex items-center gap-2">
            {actions.map((action, index) => {
              // If action has a standard action type, use ActionButton
              if (action.action && ['add', 'edit', 'delete', 'save', 'cancel'].includes(action.action)) {
                return (
                  <ActionButton
                    key={index}
                    action={action.action}
                    onClick={action.onClick}
                    tooltip={action.tooltip}
                    loading={action.loading}
                    disabled={action.disabled}
                  />
                );
              }
              
              // If action has a label, use regular Button with icon and text
              if (action.label) {
                const button = (
                  <Button
                    key={index}
                    onClick={action.onClick}
                    color={action.type === 'primary' ? 'blue' : 'gray'}
                    disabled={action.loading || action.disabled}
                    className="flex items-center gap-2"
                  >
                    {action.icon && <span>{action.icon}</span>}
                    {action.label}
                  </Button>
                );
                return action.tooltip ? (
                  <Tooltip key={index} content={action.tooltip}>
                    {button}
                  </Tooltip>
                ) : button;
              }
              
              // Otherwise use IconButton for icon-only actions
              return (
                <IconButton
                  key={index}
                  icon={action.icon}
                  onClick={action.onClick}
                  tooltip={action.tooltip}
                  type={action.type || 'default'}
                  loading={action.loading}
                  disabled={action.disabled}
                />
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(PageBanner);
