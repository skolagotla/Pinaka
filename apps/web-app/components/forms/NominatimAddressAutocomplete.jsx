'use client';

import { useState, useRef, useEffect } from 'react';
import { TextInput, Spinner, Badge } from 'flowbite-react';
import { HiSearch, HiLocationMarker } from 'react-icons/hi';

/**
 * NominatimAddressAutocomplete - Address autocomplete using Nominatim (OpenStreetMap) API
 * 
 * @param {Object} props
 * @param {string} props.value - Current input value
 * @param {Function} props.onChange - Callback when input changes
 * @param {Function} props.onSelect - Callback when address is selected (receives address object)
 * @param {string} props.placeholder - Input placeholder text
 * @param {string} props.country - Country filter (default: 'CA,US')
 * @param {number} props.limit - Maximum suggestions (default: 5)
 * @param {number} props.debounceMs - Debounce delay in milliseconds (default: 300)
 */
export default function NominatimAddressAutocomplete({
  value = '',
  onChange,
  onSelect,
  placeholder = 'Type an address (e.g., 123 Main St, Toronto)',
  country = 'CA,US',
  limit = 5,
  debounceMs = 300,
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

    if (process.env.NODE_ENV === 'development') {
      console.log('[NominatimAddressAutocomplete] 🔍 Searching for:', query);
      console.log('[NominatimAddressAutocomplete] 📍 Country filter:', country);
    }

    setLoading(true);
    try {
      // Build country filter - handle both single country and comma-separated
      const countryFilter = Array.isArray(country) 
        ? country.join(',') 
        : (typeof country === 'string' ? country : 'CA,US');

      // Nominatim API endpoint
      // https://nominatim.org/release-docs/develop/api/Search/
      // Format: countrycodes=ca,us (comma-separated, lowercase)
      const countryCodes = countryFilter.split(',').map(c => c.trim().toLowerCase()).join(',');
      
      const url = `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(query)}&` +
        `format=json&` +
        `addressdetails=1&` +
        `limit=${limit}&` +
        `countrycodes=${countryCodes}&` +
        `email=your-email@example.com`; // Nominatim requires email for usage policy
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[NominatimAddressAutocomplete] 🌐 API URL:', url);
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Pinaka Property Management App', // Nominatim requires User-Agent
          'Accept-Language': 'en-US,en;q=0.9',
        },
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
        
        const errorInfo = {
          status: response.status,
          statusText: response.statusText,
          url: url.substring(0, 150),
          error: errorData,
          errorText: errorText,
        };
        
        console.error('[NominatimAddressAutocomplete] ❌ Nominatim API error:', errorInfo);
        
        // Provide helpful error messages
        if (response.status === 429) {
          console.error('[NominatimAddressAutocomplete] ⏱️  Rate limit exceeded. Please wait and try again.');
        } else if (response.status === 400) {
          console.error('[NominatimAddressAutocomplete] 📝 Bad request. Check your query parameters.');
        } else {
          console.error('[NominatimAddressAutocomplete] ⚠️  Unexpected error. Status:', response.status);
        }
        
        const errorMessage = errorData.message || errorData.error || errorText || `Nominatim API error: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('[NominatimAddressAutocomplete] ✅ Received', data?.length || 0, 'suggestions');
      }
      setSuggestions(data || []);
    } catch (error) {
      console.error('[NominatimAddressAutocomplete] ❌ Nominatim API search error:', {
        message: error.message,
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 3).join('\n'),
      });
      setSuggestions([]);
      
      // Show user-friendly error in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('[NominatimAddressAutocomplete] 💡 Troubleshooting tips:');
        console.warn('  1. Nominatim is free but has usage policies');
        console.warn('  2. Check network tab for full API response');
        console.warn('  3. Verify query is at least 3 characters');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  // Handle address selection
  const handleSelectAddress = (place) => {
    const address = place.address || {};
    const formattedAddress = place.display_name || '';
    
    // Update input value
    if (onChange) {
      const syntheticEvent = {
        target: { value: formattedAddress },
        currentTarget: { value: formattedAddress },
      };
      onChange(syntheticEvent);
    }

    // Call onSelect callback with parsed address components
    if (onSelect) {
      // Extract address components from Nominatim response
      const addressLine1 = [
        address.house_number,
        address.road
      ].filter(Boolean).join(' ') || address.road || formattedAddress.split(',')[0] || '';

      // Extract state/province code
      let provinceState = address.state_code || address.state || '';
      // Ensure uppercase for consistency (ON, NY, etc.)
      if (provinceState && provinceState.length > 2) {
        provinceState = address.state_code || provinceState;
      }

      // Normalize country code to 'CA' or 'US'
      const rawCountry = place.address?.country_code?.toUpperCase() || address.country_code?.toUpperCase() || '';
      let countryCode = '';
      if (rawCountry === 'CA' || rawCountry === 'CAN' || rawCountry === 'Canada') {
        countryCode = 'CA';
      } else if (rawCountry === 'US' || rawCountry === 'USA' || rawCountry === 'United States') {
        countryCode = 'US';
      } else {
        countryCode = rawCountry; // Keep as-is if not CA/US
      }

      // Validate and correct postal code
      const rawPostalCode = address.postcode || '';
      let postalZip = rawPostalCode;
      
      if (rawPostalCode && countryCode) {
        const { validateAndCorrectPostalCode } = require('@/lib/utils/postal-code-validator');
        const validation = validateAndCorrectPostalCode(rawPostalCode, countryCode, { autoCorrect: true });
        if (validation.corrected) {
          postalZip = validation.corrected;
          if (process.env.NODE_ENV === 'development' && validation.wasCorrected) {
            console.log('[NominatimAddressAutocomplete] ✅ Corrected postal code:', {
              original: rawPostalCode,
              corrected: validation.corrected,
              country: countryCode,
            });
          }
        } else if (!validation.valid && process.env.NODE_ENV === 'development') {
          console.warn('[NominatimAddressAutocomplete] ⚠️  Invalid postal code from API:', {
            postalCode: rawPostalCode,
            country: countryCode,
            address: formattedAddress,
          });
        }
      }

      onSelect({
        addressLine1,
        city: address.city || address.town || address.village || address.municipality || '',
        provinceState: provinceState.toUpperCase(), // Ensure uppercase for consistency (ON, NY, etc.)
        postalZip,
        country: countryCode,
        formattedAddress,
        fullAddress: place, // Include full Nominatim response for advanced use cases
        latitude: parseFloat(place.lat),
        longitude: parseFloat(place.lon),
        postalCodeValidation: rawPostalCode !== postalZip ? {
          original: rawPostalCode,
          corrected: postalZip,
        } : null,
      });
    }

    setSuggestions([]);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <HiSearch className="h-5 w-5 text-gray-400" />
        </div>
        <TextInput
          {...inputProps}
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="pl-10 pr-10"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <Spinner size="sm" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && value && value.length >= 3 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-lg max-h-[300px] overflow-y-auto mt-1"
        >
          {suggestions.map((place, index) => {
            const address = place.address || {};
            const formatted = place.display_name || '';
            const city = address.city || address.town || address.village || '';
            const state = address.state || address.state_code || '';
            
            return (
              <div
                key={index}
                className="p-3 cursor-pointer border-b border-gray-200 hover:bg-gray-50 transition-colors"
                onClick={() => handleSelectAddress(place)}
              >
                <div className="flex items-start gap-3">
                  <HiLocationMarker className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{formatted}</span>
                      {place.importance && (
                        <Badge color="success" size="sm">
                          {Math.round(place.importance * 100)}% relevance
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {city && state ? `${city}, ${state}` : formatted}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
