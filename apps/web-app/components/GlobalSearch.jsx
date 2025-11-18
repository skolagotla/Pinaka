/**
 * GlobalSearch - Command Palette Style Global Search
 * 
 * Features:
 * - Cmd/Ctrl+K to open
 * - Real-time search across all entities
 * - Keyboard navigation
 * - Quick navigation to results
 * - Beautiful UI with icons
 */

"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Modal, 
  Input, 
  List, 
  Typography, 
  Tag, 
  Empty, 
  Spin, 
  Space,
  Badge,
  Divider 
} from 'antd';
import {
  SearchOutlined,
  HomeOutlined,
  AppstoreOutlined,
  TeamOutlined,
  FileTextOutlined,
  ToolOutlined,
  DollarOutlined,
  ReconciliationOutlined,
  LoadingOutlined,
  FormOutlined,
  FileOutlined,
  ShopOutlined,
  WalletOutlined,
  CheckCircleOutlined,
  MessageOutlined,
  FileSearchOutlined,
  FilePdfOutlined,
} from '@ant-design/icons';
// Use native debounce or a lightweight alternative instead of full lodash
// This saves ~50KB from bundle size
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

const { Text } = Typography;

// Icon mapping for different entity types
const iconMap = {
  property: <HomeOutlined style={{ fontSize: '18px', color: '#1890ff' }} />,
  unit: <AppstoreOutlined style={{ fontSize: '18px', color: '#52c41a' }} />,
  tenant: <TeamOutlined style={{ fontSize: '18px', color: '#722ed1' }} />,
  lease: <FileTextOutlined style={{ fontSize: '18px', color: '#fa8c16' }} />,
  maintenance: <ToolOutlined style={{ fontSize: '18px', color: '#eb2f96' }} />,
  receipt: <ReconciliationOutlined style={{ fontSize: '18px', color: '#13c2c2' }} />,
  form: <FormOutlined style={{ fontSize: '18px', color: '#faad14' }} />,
  document: <FileOutlined style={{ fontSize: '18px', color: '#2f54eb' }} />,
  vendor: <ShopOutlined style={{ fontSize: '18px', color: '#f5222d' }} />,
  expense: <WalletOutlined style={{ fontSize: '18px', color: '#fa541c' }} />,
  task: <CheckCircleOutlined style={{ fontSize: '18px', color: '#52c41a' }} />,
  conversation: <MessageOutlined style={{ fontSize: '18px', color: '#1890ff' }} />,
  inspection: <FileSearchOutlined style={{ fontSize: '18px', color: '#722ed1' }} />,
  'generated-form': <FilePdfOutlined style={{ fontSize: '18px', color: '#fa8c16' }} />,
  'lease-document': <FilePdfOutlined style={{ fontSize: '18px', color: '#13c2c2' }} />,
};

// Tag colors for different entity types
const typeColors = {
  property: 'blue',
  unit: 'green',
  tenant: 'purple',
  lease: 'orange',
  maintenance: 'magenta',
  receipt: 'cyan',
  form: 'gold',
  document: 'geekblue',
  vendor: 'red',
  expense: 'volcano',
  task: 'green',
  conversation: 'blue',
  inspection: 'purple',
  'generated-form': 'orange',
  'lease-document': 'cyan',
};

// Friendly type names
const typeNames = {
  property: 'Property',
  unit: 'Unit',
  tenant: 'Tenant',
  lease: 'Lease',
  maintenance: 'Maintenance',
  receipt: 'Receipt',
  form: 'Legal Form',
  document: 'Document',
  vendor: 'Vendor',
  expense: 'Expense',
  task: 'Task',
  conversation: 'Message',
  inspection: 'Inspection',
  'generated-form': 'Generated Form',
  'lease-document': 'Lease Document',
};

export default function GlobalSearch({ open, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef(null);

  // Debounced search function
  const performSearch = useCallback(
    debounce(async (query) => {
      if (!query || query.trim().length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Use v1Api for search
        const { apiClient } = await import('@/lib/utils/api-client');
        const response = await apiClient(`/api/v1/search?q=${encodeURIComponent(query)}&limit=20`, {
          method: 'GET',
        });
        
        const data = await response.json().catch(() => ({}));
        
        if (!response.ok) {
          throw new Error(data.error || data.message || 'Search failed');
        }
        // Transform v1 search results to match expected format
        const transformedResults = [];
        if (data.data) {
          if (data.data.properties) {
            data.data.properties.forEach((p) => {
              transformedResults.push({
                type: 'property',
                id: p.id,
                title: p.propertyName || p.addressLine1,
                subtitle: p.city,
                url: `/properties/${p.id}`,
              });
            });
          }
          if (data.data.tenants) {
            data.data.tenants.forEach((t) => {
              transformedResults.push({
                type: 'tenant',
                id: t.id,
                title: `${t.firstName} ${t.lastName}`,
                subtitle: t.email,
                url: `/tenants/${t.id}`,
              });
            });
          }
          if (data.data.leases) {
            data.data.leases.forEach((l) => {
              transformedResults.push({
                type: 'lease',
                id: l.id,
                title: l.leaseNumber || `Lease ${l.id}`,
                subtitle: l.unit?.property?.propertyName || l.unit?.unitName,
                url: `/leases/${l.id}`,
              });
            });
          }
          if (data.data.maintenance) {
            data.data.maintenance.forEach((m) => {
              transformedResults.push({
                type: 'maintenance',
                id: m.id,
                title: m.title,
                subtitle: m.ticketNumber,
                url: `/maintenance/${m.id}`,
              });
            });
          }
          if (data.data.documents) {
            data.data.documents.forEach((d) => {
              transformedResults.push({
                type: 'document',
                id: d.id,
                title: d.originalName || d.fileName,
                subtitle: d.category,
                url: `/documents/${d.id}`,
              });
            });
          }
        }
        setResults(transformedResults);
      } catch (error) {
        console.error('[GlobalSearch] Error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300),
    []
  );

  // Handle search input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedIndex(0);
    
    if (value.trim().length >= 2) {
      setLoading(true);
      performSearch(value);
    } else {
      setResults([]);
      setLoading(false);
    }
  };

  // Handle result selection
  const handleSelect = (result) => {
    router.push(result.url);
    handleClose();
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      handleSelect(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      handleClose();
    }
  };

  // Close and reset
  const handleClose = () => {
    setSearchQuery('');
    setResults([]);
    setSelectedIndex(0);
    setLoading(false);
    onClose?.();
  };

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      closeIcon={null}
      width={700}
      styles={{
        body: { padding: 0 },
      }}
      style={{ top: 100 }}
      destroyOnClose
    >
      <div style={{ padding: '20px 20px 0 20px' }}>
        <Input
          ref={inputRef}
          size="large"
          placeholder="Search anything: properties, tenants, leases, maintenance, documents, vendors, expenses, tasks, messages..."
          prefix={loading ? <LoadingOutlined /> : <SearchOutlined />}
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          style={{ 
            fontSize: '16px', 
            borderRadius: '8px',
            border: 'none',
            boxShadow: 'none',
          }}
          autoFocus
        />
      </div>

      <Divider style={{ margin: '16px 0' }} />

      <div style={{ 
        maxHeight: '500px', 
        overflowY: 'auto',
        padding: '0 20px 20px 20px',
      }}>
        {loading && searchQuery.length >= 2 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16, color: '#999' }}>Searching...</div>
          </div>
        )}

        {!loading && searchQuery.length > 0 && searchQuery.length < 2 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Type at least 2 characters to search"
            style={{ padding: '40px 0' }}
          />
        )}

        {!loading && searchQuery.length >= 2 && results.length === 0 && (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No results found"
            style={{ padding: '40px 0' }}
          />
        )}

        {!loading && results.length > 0 && (
          <List
            dataSource={results}
            renderItem={(item, index) => (
              <List.Item
                key={item.id}
                onClick={() => handleSelect(item)}
                onMouseEnter={() => setSelectedIndex(index)}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  backgroundColor: index === selectedIndex ? '#f5f5f5' : 'transparent',
                  transition: 'background-color 0.2s',
                  border: 'none',
                }}
              >
                <List.Item.Meta
                  avatar={
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '8px',
                      background: index === selectedIndex ? '#e6f7ff' : '#fafafa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.2s',
                    }}>
                      {iconMap[item.type]}
                    </div>
                  }
                  title={
                    <Space>
                      <Text strong style={{ fontSize: '14px' }}>
                        {item.title}
                      </Text>
                      <Tag color={typeColors[item.type]} style={{ fontSize: '11px' }}>
                        {typeNames[item.type]}
                      </Tag>
                    </Space>
                  }
                  description={
                    <div>
                      {item.subtitle && (
                        <Text type="secondary" style={{ fontSize: '13px', display: 'block' }}>
                          {item.subtitle}
                        </Text>
                      )}
                      {item.description && (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {item.description}
                        </Text>
                      )}
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        )}

        {!loading && searchQuery.length === 0 && (
          <div style={{ padding: '20px 0', textAlign: 'center' }}>
            <Text type="secondary" style={{ fontSize: '13px' }}>
              Start typing to search across properties, units, tenants, leases, maintenance, documents, vendors, expenses, tasks, messages, inspections, and more...
            </Text>
            <Divider />
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                <kbd style={{ 
                  padding: '2px 6px', 
                  background: '#fafafa', 
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  fontSize: '11px',
                }}>↑</kbd>
                {' '}
                <kbd style={{ 
                  padding: '2px 6px', 
                  background: '#fafafa', 
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  fontSize: '11px',
                }}>↓</kbd>
                {' '}to navigate • 
                {' '}
                <kbd style={{ 
                  padding: '2px 6px', 
                  background: '#fafafa', 
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  fontSize: '11px',
                }}>Enter</kbd>
                {' '}to select • 
                {' '}
                <kbd style={{ 
                  padding: '2px 6px', 
                  background: '#fafafa', 
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  fontSize: '11px',
                }}>Esc</kbd>
                {' '}to close
              </Text>
            </Space>
          </div>
        )}
      </div>
    </Modal>
  );
}

