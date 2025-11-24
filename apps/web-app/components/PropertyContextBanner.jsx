"use client";

import { useProperty } from '@/lib/contexts/PropertyContext';
import { Alert, Space, Button } from 'antd';
import { HomeOutlined, CloseOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

export default function PropertyContextBanner({ userRole, onDismiss }) {
  const { selectedProperty, setSelectedProperty } = useProperty();
  const router = useRouter();

  if (!selectedProperty) return null;

  const propertyName = selectedProperty.addressLine1 || selectedProperty.propertyName || 'Property';
  const propertyAddress = selectedProperty.city && selectedProperty.provinceState
    ? `${selectedProperty.city}, ${selectedProperty.provinceState}`
    : '';

  const handleViewDetails = () => {
    router.push(`/properties/${selectedProperty.id}`);
  };

  const handleClear = () => {
    setSelectedProperty(null);
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <Alert
      message={
        <Space>
          <HomeOutlined />
          <span>
            <strong>{propertyName}</strong>
            {propertyAddress && <span style={{ marginLeft: 8, color: '#666' }}propertyAddress}</span>}
          </span>
        </Space>
      }
      type="info"
      showIcon={false}
      action={
        <Space>
          <Button size="small" onClick={handleViewDetails}>
            View Details
          </Button>
          <Button size="small" icon={<CloseOutlined />} onClick={handleClear}>
            Clear
          </Button>
        </Space>
      }
      closable={false}
      style={{
        marginBottom: 16,
        borderRadius: 6,
      }}
    />
  );
}

