"use client";

import { useState, useEffect, useMemo, memo } from 'react';
import { Select, Tag, Space, Tooltip, Button } from 'antd';
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useProperty } from '@/lib/contexts/PropertyContext';
import { useRouter, usePathname } from 'next/navigation';

const { Option } = Select;

function PropertySelector({ userRole, collapsed = false }) {
  const { selectedProperty, setSelectedProperty, properties, loading, refreshProperties } = useProperty();
  const router = useRouter();
  const pathname = usePathname();
  const [fetching, setFetching] = useState(false);

  // Don't show on certain pages where property selection isn't relevant
  const hideOnPages = ['/dashboard', '/settings', '/organization', '/pending-approval', '/invitations'];
  const shouldShow = useMemo(() => {
    if (!userRole || !['landlord', 'pmc'].includes(userRole)) return false;
    if (hideOnPages.some(page => pathname?.includes(page))) return false;
    return true;
  }, [userRole, pathname]);

  // Fetch properties on mount if not provided
  useEffect(() => {
    if (shouldShow && properties.length === 0 && !loading) {
      fetchProperties();
    }
  }, [shouldShow, properties.length, loading]);

  const fetchProperties = async () => {
    setFetching(true);
    try {
      await refreshProperties();
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setFetching(false);
    }
  };

  const handlePropertyChange = (propertyId) => {
    if (propertyId === 'all') {
      setSelectedProperty(null);
      // Navigate to properties list page
      if (userRole === 'landlord') {
        router.push('/properties');
      } else if (userRole === 'pmc') {
        router.push('/properties');
      }
    } else {
      const property = properties.find(p => p.id === propertyId);
      if (property) {
        setSelectedProperty(property);
        // Navigate to property detail page
        if (userRole === 'landlord') {
          router.push(`/properties/${propertyId}`);
        } else if (userRole === 'pmc') {
          router.push(`/properties/${propertyId}`);
        }
      }
    }
  };

  if (!shouldShow) return null;

  if (collapsed) {
    return (
      <Tooltip title={selectedProperty ? selectedProperty.addressLine1 || selectedProperty.propertyName : 'Select Property'}>
        <Button
          type="text"
          icon={<HomeOutlined />}
          onClick={() => {
            // Toggle property selector on click when collapsed
            // Could show a popover or modal
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
          }}
        />
      </Tooltip>
    );
  }

  return (
    <Space>
      <Select
        value={selectedProperty?.id || 'all'}
        onChange={handlePropertyChange}
        loading={loading || fetching}
        style={{ minWidth: 250 }}
        placeholder="Select Property"
        suffixIcon={<HomeOutlined />}
        dropdownRender={(menu) => (
          <div>
            {menu}
            <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
              <Button
                type="text"
                icon={<ReloadOutlined />}
                onClick={fetchProperties}
                loading={fetching}
                style={{ width: '100%' }}
              >
                Refresh Properties
              </Button>
            </div>
          </div>
        )}
      >
        <Option value="all">
          <Space>
            <HomeOutlined />
            <span>All Properties</span>
            <Tag color="default">{properties.length}</Tag>
          </Space>
        </Option>
        {properties.map(property => (
          <Option key={property.id} value={property.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {property.addressLine1 || property.propertyName || 'Unnamed Property'}
                </div>
                {property.city && (
                  <div style={{ fontSize: '12px', color: '#999', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {property.city}, {property.provinceState}
                  </div>
                )}
              </div>
              {property.units && (
                <Tag style={{ marginLeft: 8 }}>{property.units.length} units</Tag>
              )}
            </div>
          </Option>
        ))}
      </Select>
      {selectedProperty && (
        <Tag color="blue" style={{ margin: 0 }}>
          {selectedProperty.addressLine1 || selectedProperty.propertyName}
        </Tag>
      )}
    </Space>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(PropertySelector);

