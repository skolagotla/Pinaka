"use client";

import { useProperty } from '@/lib/contexts/PropertyContext';
import { Alert, Button } from 'flowbite-react';
import { HiHome, HiX } from 'react-icons/hi';
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
      color="info"
      icon={HiHome}
      onDismiss={handleClear}
      className="mb-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{propertyName}</span>
          {propertyAddress && (
            <span className="text-sm text-gray-500">{propertyAddress}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" color="light" onClick={handleViewDetails}>
            View Details
          </Button>
        </div>
      </div>
    </Alert>
  );
}
