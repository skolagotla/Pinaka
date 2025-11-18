/**
 * Maintenance Vendor Selector Component
 * 
 * Handles vendor selection for maintenance requests (landlord/PMC only)
 * Extracted from MaintenanceClient.jsx to reduce component size
 */

"use client";
import { useState } from 'react';
import {
  Modal, Input, Space, Tag, Card, Row, Col, Button, Spin, Typography, Tooltip, Rate, Select, Empty
} from 'antd';
import { ToolOutlined, SearchOutlined } from '@ant-design/icons';

const { Text } = Typography;
const { Search } = Input;

/**
 * Maintenance Vendor Selector Component
 * 
 * @param {Object} props
 * @param {boolean} props.open - Modal open state
 * @param {Function} props.onCancel - Close modal handler
 * @param {Object} props.selectedRequest - Selected maintenance request
 * @param {Array} props.allVendors - All available vendors
 * @param {Array} props.suggestedVendors - Suggested vendors based on category
 * @param {boolean} props.loadingAllVendors - Loading state for vendors
 * @param {string} props.vendorSearchText - Search text
 * @param {Function} props.setVendorSearchText - Set search text
 * @param {string} props.vendorSourceFilter - Filter by source ('all', 'admin', 'landlord', 'pmc')
 * @param {Function} props.setVendorSourceFilter - Set source filter
 * @param {Object} props.vendorUsageStats - Vendor usage statistics
 * @param {Object} props.loadingVendorStats - Loading state for stats
 * @param {Function} props.onAssignVendor - Callback when vendor is assigned
 * @param {Function} props.fetchVendorUsageStats - Fetch vendor stats
 */
export default function MaintenanceVendorSelector({
  open,
  onCancel,
  selectedRequest,
  allVendors = [],
  suggestedVendors = [],
  loadingAllVendors = false,
  vendorSearchText = '',
  setVendorSearchText,
  vendorSourceFilter = 'all',
  setVendorSourceFilter,
  vendorUsageStats = {},
  loadingVendorStats = {},
  onAssignVendor,
  fetchVendorUsageStats
}) {
  const getVendorSourceInfo = (vendor) => {
    // Determine vendor source based on original logic
    const vendorSource = vendor?.isGlobal 
      ? 'admin' 
      : vendor?.invitedByRole === 'landlord' 
      ? 'landlord' 
      : vendor?.invitedByRole === 'pmc' 
      ? 'pmc' 
      : 'unknown';
    
    const sourceLabels = {
      admin: { label: 'Admin-Approved', color: 'green' },
      landlord: { label: 'Landlord-Added', color: 'blue' },
      pmc: { label: 'PMC Team', color: 'purple' },
      unknown: { label: 'Unknown', color: 'default' },
    };
    
    return sourceLabels[vendorSource] || sourceLabels.unknown;
  };

  const filterVendors = () => {
    // Ensure arrays are always arrays
    const safeAllVendors = Array.isArray(allVendors) ? allVendors : [];
    const safeSuggestedVendors = Array.isArray(suggestedVendors) ? suggestedVendors : [];
    
    // Show suggested vendors first (matching category), then all others
    const vendorsToShow = vendorSearchText 
      ? safeAllVendors 
      : [...safeSuggestedVendors, ...safeAllVendors.filter(v => v && !safeSuggestedVendors.find(sv => sv && sv.id === v.id))];
    
    const filtered = vendorsToShow.filter(vendor => {
      // Filter by search text if provided
      if (vendorSearchText) {
        const search = vendorSearchText.toLowerCase();
        if (!(
          vendor.name?.toLowerCase().includes(search) ||
          vendor.businessName?.toLowerCase().includes(search) ||
          vendor.category?.toLowerCase().includes(search) ||
          vendor.phone?.includes(search) ||
          vendor.email?.toLowerCase().includes(search)
        )) {
          return false;
        }
      }
      
      // Filter by source
      if (vendorSourceFilter !== 'all') {
        if (vendorSourceFilter === 'admin' && !vendor.isGlobal) return false;
        if (vendorSourceFilter === 'landlord' && (vendor.isGlobal || vendor.invitedByRole !== 'landlord')) return false;
        if (vendorSourceFilter === 'pmc' && (vendor.isGlobal || vendor.invitedByRole !== 'pmc')) return false;
      }
      
      return true;
    });
    
    return filtered.filter(vendor => vendor && vendor.id); // Ensure vendor exists and has an id
  };

  const filteredVendors = filterVendors();

  return (
    <Modal
      title={
        <Space>
          <ToolOutlined />
          <Text strong>Select Vendor</Text>
          {selectedRequest?.category && (
            <Tag color="blue">{selectedRequest.category}</Tag>
          )}
        </Space>
      }
      open={open}
      onCancel={onCancel}
      footer={null}
      width={700}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Space style={{ width: '100%' }} size="middle">
          <Input
            placeholder="Search vendors by name, business, or category..."
            value={vendorSearchText}
            onChange={(e) => setVendorSearchText(e.target.value)}
            allowClear
            prefix={<SearchOutlined />}
            style={{ flex: 1 }}
          />
          <Select
            value={vendorSourceFilter}
            onChange={setVendorSourceFilter}
            style={{ width: 150 }}
          >
            <Select.Option value="all">All Sources</Select.Option>
            <Select.Option value="admin">Admin-Approved</Select.Option>
            <Select.Option value="landlord">Landlord-Added</Select.Option>
            <Select.Option value="pmc">PMC Team</Select.Option>
          </Select>
        </Space>

        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <Spin spinning={loadingAllVendors}>
            {filteredVendors.length === 0 ? (
              <Empty 
                description="No vendors found"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                style={{ padding: '24px 0' }}
              />
            ) : (
              filteredVendors.map((vendor) => {
                const sourceInfo = getVendorSourceInfo(vendor);
                const stats = vendor?.id ? vendorUsageStats[vendor.id] : null;
                const loadingStats = vendor?.id ? loadingVendorStats[vendor.id] : false;
                const isSuggested = Array.isArray(suggestedVendors) && suggestedVendors.some(sv => sv && sv.id === vendor.id);

                return (
                  <Card
                    key={vendor.id}
                    size="small"
                    hoverable
                    style={{
                      marginBottom: 8,
                      border: isSuggested ? '2px solid #1890ff' : '1px solid #e8e8e8',
                      borderRadius: 6
                    }}
                    bodyStyle={{ padding: '12px' }}
                    onMouseEnter={() => {
                      if (!stats && vendor?.id && !loadingStats) {
                        fetchVendorUsageStats(vendor.id);
                      }
                    }}
                  >
                      <Row gutter={12} align="middle">
                        <Col flex="auto">
                          <Space direction="vertical" size={4} style={{ width: '100%' }}>
                            <div>
                              <Space>
                                <Text strong style={{ fontSize: 13 }}>
                                  {vendor?.businessName || vendor?.name || 'Unknown Vendor'}
                                </Text>
                                <Tag color={sourceInfo.color} style={{ fontSize: 10 }}>
                                  {sourceInfo.label}
                                </Tag>
                                {vendor?.category && (
                                  <Tag color="blue" style={{ fontSize: 10 }}>
                                    {vendor.category}
                                  </Tag>
                                )}
                              </Space>
                            </div>
                          {vendor?.name && (
                            <Text type="secondary" style={{ fontSize: 11 }}>
                              {vendor.name}
                            </Text>
                          )}
                          <Space size={12} wrap>
                            {vendor?.rating && (
                              <Space size={4}>
                                <Rate disabled value={vendor.rating} style={{ fontSize: 11 }} />
                                <Text type="secondary" style={{ fontSize: 11 }}>
                                  {vendor.rating.toFixed(1)}
                                </Text>
                              </Space>
                            )}
                            {stats?.averageRating && (
                              <Tooltip title={`Average rating from ${stats.completedCount} completed jobs`}>
                                <Space size={4}>
                                  <Text type="secondary" style={{ fontSize: 10 }}>
                                    Avg: {stats.averageRating.toFixed(1)}
                                  </Text>
                                </Space>
                              </Tooltip>
                            )}
                            {vendor?.hourlyRate && vendor.hourlyRate > 0 && (
                              <Tooltip title="Hourly rate">
                                <Text strong style={{ fontSize: 11, color: '#1890ff' }}>
                                  ${vendor.hourlyRate}/hr
                                </Text>
                              </Tooltip>
                            )}
                            {stats?.averageCost && (
                              <Tooltip title={`Average cost per job (${stats.completedCount || 0} completed)`}>
                                <Text type="secondary" style={{ fontSize: 10 }}>
                                  Avg Cost: ${stats.averageCost.toFixed(2)}
                                </Text>
                              </Tooltip>
                            )}
                            {stats?.usageCount > 0 && (
                              <Tooltip title={`Used ${stats.usageCount} time${stats.usageCount !== 1 ? 's' : ''}`}>
                                <Text type="secondary" style={{ fontSize: 10 }}>
                                  Used {stats.usageCount}x
                                </Text>
                              </Tooltip>
                            )}
                            {vendor?.phone && (
                              <Text type="secondary" style={{ fontSize: 11 }}>
                                📞 {vendor.phone}
                              </Text>
                            )}
                          </Space>
                        </Space>
                      </Col>
                        <Col>
                          <Button
                            type="primary"
                            size="small"
                            onClick={() => {
                              if (vendor?.id) {
                                onAssignVendor(vendor.id);
                              }
                            }}
                          >
                            Assign
                          </Button>
                        </Col>
                    </Row>
                  </Card>
                );
              })
            )}
          </Spin>
        </div>
      </Space>
    </Modal>
  );
}

