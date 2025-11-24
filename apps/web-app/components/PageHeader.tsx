"use client";
import React from 'react';
import { HiRefresh } from 'react-icons/hi';
import SearchBar from './shared/SearchBar';
import { ActionButton, IconButton } from './shared/buttons';

interface Stat {
  label: string;
  value: number | string;
  color?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  stats?: Stat[];
  onAdd?: () => void;
  addButtonText?: string;
  addTooltip?: string;
  onRefresh?: () => void;
  onSearch?: () => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSearchClear?: () => void;
  searchPlaceholder?: string;
  extra?: React.ReactNode;
}

export default function PageHeader({ 
  title, 
  subtitle,
  stats,
  onAdd, 
  addButtonText = "Add",
  addTooltip,
  onRefresh,
  onSearch,
  searchValue = '',
  onSearchChange,
  onSearchClear,
  searchPlaceholder = "Search...",
  extra = null 
}: PageHeaderProps) {
  return (
    <div className="mb-6 bg-white dark:bg-gray-800 p-5 rounded-lg shadow-sm">
      <div className="grid grid-cols-[auto_1px_1fr_1px_auto] gap-6 items-center">
        {/* SECTION 1: Title */}
        <div className="min-w-[200px]">
          <h2 className="text-2xl font-semibold m-0">{title}</h2>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>

        {/* DIVIDER 1 */}
        <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 self-center" />

        {/* SECTION 2: Stats */}
        {stats && stats.length > 0 ? (
          <div className="flex gap-6 items-center justify-center">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className="text-xl font-semibold" style={{ color: stat.color || '#3b82f6' }}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div />
        )}

        {/* DIVIDER 2 */}
        <div className="w-px h-10 bg-gray-300 dark:bg-gray-600 self-center" />

        {/* SECTION 3: Actions */}
        <div className="flex items-center gap-2">
          {/* Search First */}
          {onSearchChange && (
            <SearchBar
              value={searchValue}
              onChange={onSearchChange}
              onClear={onSearchClear || (() => {})}
              placeholder={searchPlaceholder}
              width={350}
              autoFocus={true}
            />
          )}

          {/* Refresh */}
          {onRefresh && (
            <IconButton
              icon={<HiRefresh />}
              onClick={onRefresh}
              tooltip="Refresh"
              showText={false}
              text=""
            />
          )}

          {/* Add */}
          {onAdd && (
            <ActionButton
              action="add"
              onClick={onAdd}
              tooltip={addTooltip || addButtonText}
              text=""
              htmlType="button"
              buttonType="primary"
            />
          )}

          {/* Extra Actions */}
          {extra}
        </div>
      </div>
    </div>
  );
}
