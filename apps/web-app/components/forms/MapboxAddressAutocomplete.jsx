'use client';

import { useState, useRef, useEffect } from 'react';
import { Input, Spin, List, Tag, Typography, Space } from 'antd';
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * MapboxAddressAutocomplete - Address autocomplete using Mapbox Geocoding API
 * 
 * Free tier: 100,000 requests/month
 * Documentation: https://docs.mapbox.com/api/search/geocoding/
 * 
 * @param {Object} props
 * @param {string} props.value - Current input value
 * @param {Function} props.onChange - Callback when input changes
 * @param {Function} props.onSelect - Callback when address is selected (receives address object)
 * @param {string} props.placeholder - Input placeholder text
 * @param {string} props.apiKey - Mapbox access token (required)
 * @param {string} props.country - Country filter (default: 'CA,US')
 * @param {number} props.limit - Maximum suggestions (default: 5)
 * @param {number} props.debounceMs - Debounce delay in milliseconds (default: 300)
 */
export default function MapboxAddressAutocomplete({
  value = '',
  onChange,
  onSelect,
  placeholder = 'Type an address (e.g., 123 Main St, Toronto)',
  apiKey,
  country = 'CA,US',
  limit = 5,
  debounceMs = 300,
  style = {},
  className = '',
  ...inputProps
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceTimer = useRef(null);
  const suggestionsRef = useRef(null);
  const inputRef = useRef(null);

  // Debounced search function
  const searchAddresses = async (query) => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    if (!apiKey) {
      console.error('[MapboxAddressAutocomplete] ❌ Mapbox access token not found!');
      console.error('[MapboxAddressAutocomplete] Please provide an access token via the apiKey prop');
      setSuggestions([]);
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[MapboxAddressAutocomplete] 🔍 Searching for:', query);
      console.log('[MapboxAddressAutocomplete] 📍 Country filter:', country);
    }

    setLoading(true);
    try {
      // Build country filter
      const countryFilter = Array.isArray(country) 
        ? country.join(',') 
        : (typeof country === 'string' ? country : 'CA,US');

      // Mapbox Geocoding API endpoint
      // https://docs.mapbox.com/api/search/geocoding/
      const countryCodes = countryFilter.split(',').map(c => c.trim().toLowerCase());
      
      // Build URL - Mapbox uses country parameter
      let url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
        `access_token=${apiKey}&` +
        `limit=${limit}&` +
        `country=${countryCodes.join(',')}`;

      if (process.env.NODE_ENV === 'development') {
        console.log('[MapboxAddressAutocomplete] 🌐 API URL:', url.replace(apiKey, '***'));
      }

      const response = await fetch(url, {
        method: 'GET',
      });

      if (!response.ok) {
        let errorData = {};
        let errorText = '';
        
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json();
          } else {
            errorText = await response.text();
          }
        } catch (parseError) {
          errorText = `Failed to parse error response: ${parseError.message}`;
        }
        
        console.error('[MapboxAddressAutocomplete] ❌ Mapbox API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          errorText: errorText,
        });
        
        setSuggestions([]);
        return;
      }

      const data = await response.json();
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[MapboxAddressAutocomplete] ✅ Response:', data);
      }

      // Mapbox response structure: { features: [...] }
      const features = data.features || [];
      
      setSuggestions(features);
    } catch (error) {
      console.error('[MapboxAddressAutocomplete] ❌ Error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle address selection
  const handleSelectAddress = (feature) => {
    // Mapbox response structure
    const properties = feature.properties || {};
    const context = feature.context || [];
    const coordinates = feature.geometry?.coordinates || [];
    
    // Extract address components from context
    const getContextValue = (type) => {
      const item = context.find(c => c.id?.startsWith(type));
      return item?.text || '';
    };
    
    const addressLine1 = properties.address || '';
    const city = getContextValue('place') || getContextValue('locality') || '';
    const provinceState = getContextValue('region') || '';
    const postalZip = getContextValue('postcode') || properties.postcode || '';
    const countryCode = getContextValue('country') || properties.short_code?.toUpperCase() || '';
    
    const formattedAddress = feature.place_name || feature.text || '';

    // Validate and correct postal code
    const rawPostalCode = postalZip;
    let correctedPostalZip = rawPostalCode;
    
    if (rawPostalCode && countryCode) {
      try {
        const { validateAndCorrectPostalCode } = require('@/lib/utils/postal-code-validator');
        const validation = validateAndCorrectPostalCode(rawPostalCode, countryCode, { autoCorrect: true });
        if (validation.corrected) {
          correctedPostalZip = validation.corrected;
          if (process.env.NODE_ENV === 'development' && validation.wasCorrected) {
            console.log('[MapboxAddressAutocomplete] ✅ Corrected postal code:', {
              original: rawPostalCode,
              corrected: validation.corrected,
              country: countryCode,
            });
          }
        } else if (!validation.valid && process.env.NODE_ENV === 'development') {
          console.warn('[MapboxAddressAutocomplete] ⚠️  Invalid postal code from API:', {
            postalCode: rawPostalCode,
            country: countryCode,
            address: formattedAddress,
          });
        }
      } catch (error) {
        // Postal code validator not available, use original
        console.warn('[MapboxAddressAutocomplete] Could not validate postal code:', error);
      }
    }

    // Update input value
    if (onChange) {
      const syntheticEvent = {
        target: { value: formattedAddress },
        currentTarget: { value: formattedAddress },
      };
      onChange(syntheticEvent);
    }

    // Call onSelect callback
    if (onSelect) {
      onSelect({
        addressLine1,
        city,
        provinceState: provinceState.toUpperCase(),
        postalZip: correctedPostalZip,
        country: countryCode,
        formattedAddress,
        fullAddress: feature, // Include full Mapbox response
        latitude: coordinates[1],
        longitude: coordinates[0],
        postalCodeValidation: rawPostalCode !== correctedPostalZip ? {
          original: rawPostalCode,
          corrected: correctedPostalZip,
        } : null,
      });
    }

    setSuggestions([]);
  };

  // Handle input change with debouncing
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    
    // Call onChange immediately for controlled input
    if (onChange) {
      onChange(e);
    }

    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Debounce API call
    debounceTimer.current = setTimeout(() => {
      searchAddresses(newValue);
    }, debounceMs);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.input.contains(event.target)
      ) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <Input
        {...inputProps}
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        prefix={<SearchOutlined />}
        suffix={loading ? <Spin size="small" /> : null}
        style={{ width: '100%', ...style }}
        className={className}
      />
      
      {suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'white',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            maxHeight: '300px',
            overflowY: 'auto',
            marginTop: '4px',
          }}
        >
          <List
            dataSource={suggestions}
            renderItem={(feature) => {
              const displayText = feature.place_name || feature.text || 'Unknown address';
              
              return (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    padding: '8px 12px',
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input blur
                    handleSelectAddress(feature);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <Space>
                    <EnvironmentOutlined style={{ color: '#1890ff' }} />
                    <div>
                      <Text strong>{displayText}</Text>
                    </div>
                  </Space>
                </List.Item>
              );
            }}
          />
        </div>
      )}
    </div>
  );
}

