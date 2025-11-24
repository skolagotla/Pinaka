"use client";

import { useState } from 'react';
import { Card, Select, TextInput, Button, Badge } from 'flowbite-react';
import { HiFilter, HiX, HiSave } from 'react-icons/hi';
import dayjs from 'dayjs';

export default function AdvancedFilters({
  filters = [],
  onFilterChange,
  onReset,
  onSavePreset,
  savedPresets = [],
  onLoadPreset,
}) {
  const [activeFilters, setActiveFilters] = useState({});
  const [presetName, setPresetName] = useState('');

  const handleFilterChange = (key, value) => {
    const newFilters = { ...activeFilters, [key]: value };
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    setActiveFilters({});
    onReset();
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      return;
    }
    onSavePreset(presetName, activeFilters);
    setPresetName('');
  };

  const renderFilterInput = (filter) => {
    switch (filter.type) {
      case 'select':
        return (
          <Select
            className="w-full"
            value={activeFilters[filter.key]}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          >
            <option value="">{filter.placeholder || 'Select...'}</option>
            {filter.options?.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        );
      case 'dateRange':
        return (
          <div className="flex gap-2">
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={activeFilters[filter.key]?.[0] || ''}
              onChange={(e) => {
                const dates = activeFilters[filter.key] || [];
                dates[0] = e.target.value;
                handleFilterChange(filter.key, dates);
              }}
            />
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={activeFilters[filter.key]?.[1] || ''}
              onChange={(e) => {
                const dates = activeFilters[filter.key] || [];
                dates[1] = e.target.value;
                handleFilterChange(filter.key, dates);
              }}
            />
          </div>
        );
      case 'input':
        return (
          <TextInput
            placeholder={filter.placeholder}
            value={activeFilters[filter.key] || ''}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
          />
        );
      default:
        return null;
    }
  };

  const activeFilterCount = Object.keys(activeFilters).filter(
    key => activeFilters[key] !== null && activeFilters[key] !== undefined && activeFilters[key] !== ''
  ).length;

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <HiFilter className="h-5 w-5" />
          <span className="font-semibold">Filters</span>
          {activeFilterCount > 0 && (
            <Badge color="blue">{activeFilterCount} active</Badge>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {/* Saved Presets */}
        {savedPresets.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Saved Presets:</p>
            <div className="flex flex-wrap gap-2">
              {savedPresets.map((preset) => (
                <Badge
                  key={preset.id}
                  color="blue"
                  className="cursor-pointer hover:bg-blue-600"
                  onClick={() => {
                    setActiveFilters(preset.filters);
                    onLoadPreset(preset);
                  }}
                >
                  {preset.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Filter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filters.map((filter) => (
            <div key={filter.key}>
              <label className="block text-xs text-gray-500 mb-1">
                {filter.label}
              </label>
              {renderFilterInput(filter)}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button
            color="light"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <HiX className="h-4 w-4" />
            Reset
          </Button>
          {onSavePreset && (
            <>
              <TextInput
                placeholder="Preset name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                className="w-40"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSavePreset();
                  }
                }}
              />
              <Button
                color="light"
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
                className="flex items-center gap-2"
              >
                <HiSave className="h-4 w-4" />
                Save Preset
              </Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
