"use client";

import { useState } from 'react';
import { Card, Space, Select, DatePicker, Input, Button, Tag, Row, Col } from 'antd';
import { FilterOutlined, ClearOutlined, SaveOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

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
            style={{ width: '100%' }}
            placeholder={filter.placeholder}
            value={activeFilters[filter.key]}
            onChange={(value) => handleFilterChange(filter.key, value)}
            options={filter.options}
            allowClear
          />
        );
      case 'dateRange':
        return (
          <RangePicker
            style={{ width: '100%' }}
            value={activeFilters[filter.key]}
            onChange={(dates) => handleFilterChange(filter.key, dates)}
          />
        );
      case 'input':
        return (
          <Input
            placeholder={filter.placeholder}
            value={activeFilters[filter.key]}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            allowClear
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
    <Card
      title={
        <Space>
          <FilterOutlined />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Tag color="blue">{activeFilterCount} active</Tag>
          )}
        </Space>
      }
      size="small"
      style={{ marginBottom: 16 }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {/* Saved Presets */}
        {savedPresets.length > 0 && (
          <div>
            <Text type="secondary" style={{ fontSize: '12px', marginBottom: 8, display: 'block' }}>
              Saved Presets:
            </Text>
            <Space wrap>
              {savedPresets.map((preset) => (
                <Tag
                  key={preset.id}
                  color="blue"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setActiveFilters(preset.filters);
                    onLoadPreset(preset);
                  }}
                >
                  {preset.name}
                </Tag>
              ))}
            </Space>
          </div>
        )}

        {/* Filter Inputs */}
        <Row gutter={[16, 16]}>
          {filters.map((filter) => (
            <Col xs={24} sm={12} md={8} lg={6} key={filter.key}>
              <div>
                <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: 4 }}>
                  {filter.label}
                </Text>
                {renderFilterInput(filter)}
              </div>
            </Col>
          ))}
        </Row>

        {/* Actions */}
        <Space>
          <Button icon={<ClearOutlined />} onClick={handleReset}>
            Reset
          </Button>
          {onSavePreset && (
            <>
              <Input
                placeholder="Preset name"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                style={{ width: 150 }}
                onPressEnter={handleSavePreset}
              />
              <Button
                icon={<SaveOutlined />}
                onClick={handleSavePreset}
                disabled={!presetName.trim()}
              >
                Save Preset
              </Button>
            </>
          )}
        </Space>
      </Space>
    </Card>
  );
}

