"use client";

import { useState, useEffect, useMemo, memo } from 'react';
import { Select, Badge, Button, Tooltip } from 'flowbite-react';
import { HiHome, HiRefresh } from 'react-icons/hi';
import { useProperty } from '@/lib/contexts/PropertyContext';
import { useRouter, usePathname } from 'next/navigation';

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
      <Tooltip content={selectedProperty ? selectedProperty.addressLine1 || selectedProperty.propertyName : 'Select Property'}>
        <Button
          color="gray"
          onClick={() => {
            // Toggle property selector on click when collapsed
            // Could show a popover or modal
          }}
          className="flex items-center justify-center w-10 h-10 rounded-full p-0"
        >
          <HiHome className="h-5 w-5" />
        </Button>
      </Tooltip>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Select
          value={selectedProperty?.id || 'all'}
          onChange={(e) => handlePropertyChange(e.target.value)}
          disabled={loading || fetching}
          className="min-w-[250px]"
        >
          <option value="all">
            <div className="flex items-center gap-2">
              <HiHome className="h-4 w-4" />
              <span>All Properties</span>
              <Badge color="gray">{properties.length}</Badge>
            </div>
          </option>
          {properties.map(property => (
            <option key={property.id} value={property.id}>
              <div className="flex justify-between items-center w-full">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {property.addressLine1 || property.propertyName || 'Unnamed Property'}
                  </div>
                  {property.city && (
                    <div className="text-xs text-gray-500 truncate">
                      {property.city}, {property.provinceState}
                    </div>
                  )}
                </div>
                {property.units && (
                  <Badge color="gray" className="ml-2">
                    {property.units.length} units
                  </Badge>
                )}
              </div>
            </option>
          ))}
        </Select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <HiHome className="h-4 w-4 text-gray-400" />
        </div>
      </div>
      
      <Tooltip content="Refresh Properties">
        <Button
          color="gray"
          size="sm"
          onClick={fetchProperties}
          disabled={fetching}
          className="flex items-center gap-2"
        >
          <HiRefresh className={`h-4 w-4 ${fetching ? 'animate-spin' : ''}`} />
        </Button>
      </Tooltip>
      
      {selectedProperty && (
        <Badge color="blue">
          {selectedProperty.addressLine1 || selectedProperty.propertyName}
        </Badge>
      )}
    </div>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(PropertySelector);
