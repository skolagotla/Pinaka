"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const PropertyContext = createContext({
  selectedProperty: null,
  setSelectedProperty: () => {},
  properties: [],
  loading: false,
  refreshProperties: () => {},
});

export function PropertyProvider({ children, userRole, initialProperties = [] }) {
  const [selectedProperty, setSelectedPropertyState] = useState(null);
  const [properties, setProperties] = useState(initialProperties);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Load selected property from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`selectedProperty_${userRole}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Verify property still exists in properties list
          const exists = properties.find(p => p.id === parsed.id);
          if (exists) {
            setSelectedPropertyState(parsed);
          }
        } catch (e) {
          console.error('Error parsing saved property:', e);
        }
      }
    }
  }, [userRole, properties]);

  // Save selected property to localStorage
  const setSelectedProperty = useCallback((property) => {
    setSelectedPropertyState(property);
    if (typeof window !== 'undefined' && property) {
      localStorage.setItem(`selectedProperty_${userRole}`, JSON.stringify(property));
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem(`selectedProperty_${userRole}`);
    }
  }, [userRole]);

  // Refresh properties list
  const refreshProperties = useCallback(async () => {
    if (!userRole || !['landlord', 'pmc'].includes(userRole)) {
      setProperties([]);
      return;
    }
    
    setLoading(true);
    try {
      // Use v1Api for properties list
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.properties.list();
      const props = response.data || response.properties || [];
      const propertiesArray = Array.isArray(props) ? props : [];
      setProperties(propertiesArray);
      
      // If selected property no longer exists, clear selection
      if (selectedProperty && !propertiesArray.find(p => p.id === selectedProperty.id)) {
        setSelectedProperty(null);
      }
    } catch (error) {
      console.error('Error refreshing properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, [userRole, selectedProperty, setSelectedProperty]);

  // Auto-select first property if none selected and properties exist
  useEffect(() => {
    if (!selectedProperty && properties.length > 0 && pathname?.includes('/properties')) {
      setSelectedProperty(properties[0]);
    }
  }, [selectedProperty, properties, pathname, setSelectedProperty]);

  return (
    <PropertyContext.Provider
      value={{
        selectedProperty,
        setSelectedProperty,
        properties,
        setProperties,
        loading,
        refreshProperties,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
}

export function useProperty() {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within PropertyProvider');
  }
  return context;
}

