'use client';

import { useState, useRef, useEffect } from 'react';
import { Input, Spin, List, Tag, Typography, Space } from 'antd';
import { SearchOutlined, EnvironmentOutlined } from '@ant-design/icons';

const { Text } = Typography;

/**
 * TomTomAddressAutocomplete - Address autocomplete using TomTom Search API
 * 
 * Free tier: 2,500 requests/day, 250,000 requests/month
 * Documentation: https://developer.tomtom.com/search-api/documentation/product/Search/Search
 * 
 * @param {Object} props
 * @param {string} props.value - Current input value
 * @param {Function} props.onChange - Callback when input changes
 * @param {Function} props.onSelect - Callback when address is selected (receives address object)
 * @param {string} props.placeholder - Input placeholder text
 * @param {string} props.apiKey - TomTom API key (required)
 * @param {string} props.country - Country filter (default: 'CA,US')
 * @param {number} props.limit - Maximum suggestions (default: 5)
 * @param {number} props.debounceMs - Debounce delay in milliseconds (default: 300)
 */
export default function TomTomAddressAutocomplete({
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
      console.error('[TomTomAddressAutocomplete] ❌ TomTom API key not found');
      console.error('[TomTomAddressAutocomplete] Please provide an API key via the apiKey prop');
      setSuggestions([]);
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[TomTomAddressAutocomplete] 🔍 Searching for:', query);
      console.log('[TomTomAddressAutocomplete] 📍 Country filter:', country);
    }

    setLoading(true);
    try {
      // Build country filter
      const countryFilter = Array.isArray(country) 
        ? country.join(',') 
        : (typeof country === 'string' ? country : 'CA,US');

      // TomTom Search API endpoint
      // https://developer.tomtom.com/search-api/documentation/product/Search/Search
      const countryCodes = countryFilter.split(',').map(c => c.trim().toUpperCase());
      
      // Build URL - TomTom uses countrySet parameter
      let url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?` +
        `key=${apiKey}&` +
        `limit=${limit}&` +
        `countrySet=${countryCodes.join(',')}`;

      if (process.env.NODE_ENV === 'development') {
        console.log('[TomTomAddressAutocomplete] 🌐 API URL:', url.replace(apiKey, '***'));
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
        
        console.error('[TomTomAddressAutocomplete] ❌ TomTom API error:', {
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
        console.log('[TomTomAddressAutocomplete] ✅ Response:', data);
      }

      // TomTom response structure: { results: [...] }
      const results = data.results || [];
      
      setSuggestions(results);
    } catch (error) {
      console.error('[TomTomAddressAutocomplete] ❌ Error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle address selection
  const handleSelectAddress = (result) => {
    // TomTom response structure
    const address = result.address || {};
    const position = result.position || {};
    
    // Extract address components
    const addressLine1 = [
      address.streetNumber,
      address.streetName,
    ].filter(Boolean).join(' ').trim() || result.poi?.name || '';
    
    const city = address.municipality || address.municipalitySubdivision || '';
    const provinceState = address.countrySubdivision || '';
    const postalZip = address.postalCode || '';
    const countryCode = address.countryCode || '';
    
    const formattedAddress = result.address?.freeformAddress || result.poi?.name || '';

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
            console.log('[TomTomAddressAutocomplete] ✅ Corrected postal code:', {
              original: rawPostalCode,
              corrected: validation.corrected,
              country: countryCode,
            });
          }
        } else if (!validation.valid && process.env.NODE_ENV === 'development') {
          console.warn('[TomTomAddressAutocomplete] ⚠️  Invalid postal code from API:', {
            postalCode: rawPostalCode,
            country: countryCode,
            address: formattedAddress,
          });
        }
      } catch (error) {
        // Postal code validator not available, use original
        console.warn('[TomTomAddressAutocomplete] Could not validate postal code:', error);
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
        fullAddress: result, // Include full TomTom response
        latitude: position.lat,
        longitude: position.lon,
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
            renderItem={(result) => {
              const address = result.address || {};
              const displayText = address.freeformAddress || result.poi?.name || 'Unknown address';
              
              return (
                <List.Item
                  style={{
                    cursor: 'pointer',
                    padding: '8px 12px',
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault(); // Prevent input blur
                    handleSelectAddress(result);
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
                      {address.municipality && (
                        <div>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            {[address.municipality, address.countrySubdivision, address.countryCode]
                              .filter(Boolean)
                              .join(', ')}
                          </Text>
                        </div>
                      )}
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

