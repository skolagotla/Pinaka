'use client';

import { useState, useRef, useEffect } from 'react';
import { TextInput, Spinner, Badge } from 'flowbite-react';
import { HiSearch, HiLocationMarker } from 'react-icons/hi';
// Import config - ES6 import for Next.js client components
import configModule from '@/lib/config/app-config';
// Handle both default export and named exports
const config = configModule.default || configModule;

/**
 * AddressAutocomplete - A reusable address autocomplete component using TomTom API
 * Now uses TomTom as the default provider (was Geoapify)
 * 
 * @param {Object} props
 * @param {string} props.value - Current input value
 * @param {Function} props.onChange - Callback when input changes
 * @param {Function} props.onSelect - Callback when address is selected (receives address object)
 * @param {string} props.placeholder - Input placeholder text
 * @param {string} props.apiKey - TomTom API key (optional, will use config)
 * @param {string} props.country - Country filter (default: 'CA,US')
 * @param {number} props.limit - Maximum suggestions (default: 5)
 * @param {number} props.debounceMs - Debounce delay in milliseconds (default: 300)
 */
export default function AddressAutocomplete({
  value = '',
  onChange,
  onSelect,
  placeholder = 'Type an address (e.g., 123 Main St, Toronto)',
  apiKey,
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

  // Get API key from props or centralized config
  const getApiKey = () => {
    // Props take highest priority
    if (apiKey) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[AddressAutocomplete] Using TomTom API key from props');
      }
      return apiKey;
    }
    
    // Use centralized configuration
    // Access the getter function - it handles env var, localStorage, and fallback
    let configKey = null;
    try {
      if (config && config.apiKeys) {
        // Access the getter - it will check env var, localStorage, and fallback
        configKey = config.apiKeys.tomtom;
      }
    } catch (error) {
      console.error('[AddressAutocomplete] Error accessing config:', error);
    }
    
    // Fallback: Check localStorage directly if config didn't work
    if (!configKey && typeof window !== 'undefined') {
      const localKey = localStorage.getItem('tomtom_api_key');
      if (localKey) {
        configKey = localKey;
        if (process.env.NODE_ENV === 'development') {
          console.log('[AddressAutocomplete] Using TomTom API key from localStorage');
        }
      }
    }
    
    // Development fallback: Use default key from config
    if (!configKey && process.env.NODE_ENV === 'development') {
      // Use the same key as defined in lib/config/app-config.js
      const defaultKey = '3YUuSV1wwvh36u5LanbjnqdP03IjhBf3';
      console.warn('[AddressAutocomplete] ⚠️  Using default TomTom API key for development');
      console.warn('[AddressAutocomplete] Set NEXT_PUBLIC_TOMTOM_API_KEY in .env for production');
      configKey = defaultKey;
    }
    
    if (process.env.NODE_ENV === 'development') {
      if (configKey) {
        console.log('[AddressAutocomplete] ✅ TomTom API key found:', configKey.substring(0, 20) + '...');
      } else {
        console.error('[AddressAutocomplete] ❌ No TomTom API key found');
        console.error('[AddressAutocomplete] Options:');
        console.error('  1. Set NEXT_PUBLIC_TOMTOM_API_KEY in .env file');
        console.error('  2. localStorage.setItem("tomtom_api_key", "your_key")');
      }
    }
    
    return configKey;
  };

  // Debounced search function
  const searchAddresses = async (query) => {
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      console.error('[AddressAutocomplete] ❌ TomTom API key not found');
      console.error('[AddressAutocomplete] Please set NEXT_PUBLIC_TOMTOM_API_KEY in .env file');
      console.error('[AddressAutocomplete] Or store in localStorage: localStorage.setItem("tomtom_api_key", "your_key")');
      setSuggestions([]);
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('[AddressAutocomplete] 🔍 Searching for:', query);
      console.log('[AddressAutocomplete] 📍 Country filter:', country);
    }

    setLoading(true);
    try {
      // Build country filter - handle both single country and comma-separated
      const countryFilter = Array.isArray(country) 
        ? country.join(',') 
        : (typeof country === 'string' ? country : 'CA,US');

      // TomTom Search API endpoint
      // https://developer.tomtom.com/search-api/documentation/product/Search/Search
      const countryCodes = countryFilter.split(',').map(c => c.trim().toUpperCase());
      
      // Build URL - TomTom uses countrySet parameter
      // Note: API key should be passed as 'key' parameter
      let url = `https://api.tomtom.com/search/2/search/${encodeURIComponent(query)}.json?` +
        `key=${encodeURIComponent(apiKey)}&` +
        `limit=${limit}`;
      
      // Add country filter if specified (skip if 'both' or empty)
      if (countryCodes.length > 0 && countryCodes[0] !== 'BOTH' && countryCodes[0] !== '') {
        url += `&countrySet=${countryCodes.join(',')}`;
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[AddressAutocomplete] 🌐 TomTom API URL:', url.replace(apiKey, '***'));
        console.log('[AddressAutocomplete] 🔑 API Key length:', apiKey?.length);
        console.log('[AddressAutocomplete] 🔑 API Key preview:', apiKey?.substring(0, 10) + '...');
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
        
        const errorInfo = {
          status: response.status,
          statusText: response.statusText,
          url: url.substring(0, 150).replace(apiKey, '***'),
          error: errorData,
          errorText: errorText,
          apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET',
        };
        
        console.error('[AddressAutocomplete] ❌ TomTom API error:', errorInfo);
        
        // Provide helpful error messages
        if (response.status === 401) {
          console.error('[AddressAutocomplete] 🔑 Authentication failed. Check your API key.');
          console.error('[AddressAutocomplete] Current API key (first 10 chars):', errorInfo.apiKey);
          console.error('[AddressAutocomplete] 💡 Verify:');
          console.error('  1. API key is correct: 3YUuSV1wwvh36u5LanbjnqdP03IjhBf3');
          console.error('  2. API key is active in TomTom Developer Portal');
          console.error('  3. API key has Search API permissions enabled');
          console.error('  4. Check: https://developer.tomtom.com/user/me/apps');
        } else if (response.status === 403) {
          console.error('[AddressAutocomplete] 🚫 Access forbidden. Check API key permissions.');
          console.error('[AddressAutocomplete] 💡 Ensure Search API is enabled for this key');
        } else if (response.status === 429) {
          console.error('[AddressAutocomplete] ⏱️  Rate limit exceeded. Please wait and try again.');
        } else if (response.status === 400) {
          console.error('[AddressAutocomplete] 📝 Bad request. Check your query parameters.');
          if (errorData.message) {
            console.error('[AddressAutocomplete] Error details:', errorData.message);
          }
          if (errorData.error) {
            console.error('[AddressAutocomplete] Error object:', errorData.error);
          }
        } else {
          console.error('[AddressAutocomplete] ⚠️  Unexpected error. Status:', response.status);
        }
        
        // Extract error message from TomTom response
        const errorMsg = errorData.message || 
                        errorData.error?.message || 
                        errorData.error?.description ||
                        (typeof errorData.error === 'string' ? errorData.error : null) ||
                        errorText || 
                        `TomTom API error: ${response.statusText}`;
        
        throw new Error(errorMsg);
      }

      const data = await response.json();
      if (process.env.NODE_ENV === 'development') {
        console.log('[AddressAutocomplete] ✅ Received', data.results?.length || 0, 'suggestions from TomTom');
      }
      // TomTom response structure: { results: [...] }
      setSuggestions(data.results || []);
    } catch (error) {
      console.error('[AddressAutocomplete] ❌ TomTom API search error:', {
        message: error.message,
        name: error.name,
        stack: error.stack?.split('\n').slice(0, 3).join('\n'),
      });
      setSuggestions([]);
      
      // Show user-friendly error in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('[AddressAutocomplete] 💡 Troubleshooting tips:');
        console.warn('  1. Check API key is set: NEXT_PUBLIC_TOMTOM_API_KEY');
        console.warn('  2. Verify API key is valid: 3YUuSV1wwvh36u5LanbjnqdP03IjhBf3');
        console.warn('  3. Check network tab for full API response');
        console.warn('  4. Verify TomTom API is accessible');
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
    
    // Extract postal code from multiple possible fields in TomTom response
    let postalZip = address.postalCode || 
                    address.postcode || 
                    address.postal || 
                    result.postalCode ||
                    result.postcode ||
                    '';
    const countryCode = address.countryCode || address.country || '';
    
    const formattedAddress = result.address?.freeformAddress || result.poi?.name || '';

    // If postal code is missing or incomplete, try to extract from freeformAddress
    if (!postalZip || postalZip.length < 5) {
      // Try to extract postal code from freeformAddress
      // Canadian format: A1A 1A1 or A1A1A1
      // US format: 12345 or 12345-6789
      const postalMatch = formattedAddress.match(/\b([A-Z]\d[A-Z]\s?\d[A-Z]\d|\d{5}(-\d{4})?)\b/i);
      if (postalMatch) {
        postalZip = postalMatch[1];
        if (process.env.NODE_ENV === 'development') {
          console.log('[AddressAutocomplete] 📮 Extracted postal code from formatted address:', postalZip);
        }
      }
    }

    // Log for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('[AddressAutocomplete] 📦 TomTom result:', {
        hasAddress: !!address,
        postalCode: postalZip,
        postalCodeLength: postalZip?.length,
        addressFields: Object.keys(address),
        formattedAddress: formattedAddress,
        fullResult: result,
      });
    }

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
            console.log('[AddressAutocomplete] ✅ Corrected postal code:', {
              original: rawPostalCode,
              corrected: validation.corrected,
              country: countryCode,
            });
          }
        } else if (!validation.valid && process.env.NODE_ENV === 'development') {
          console.warn('[AddressAutocomplete] ⚠️  Invalid postal code from API:', {
            postalCode: rawPostalCode,
            country: countryCode,
            address: formattedAddress,
          });
        }
      } catch (error) {
        // Postal code validator not available, use original
        console.warn('[AddressAutocomplete] Could not validate postal code:', error);
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
        provinceState: provinceState.toUpperCase(), // Ensure uppercase for consistency (ON, NY, etc.)
        postalZip: correctedPostalZip,
        country: countryCode,
        formattedAddress,
        fullAddress: result, // Include full TomTom response for advanced use cases
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
          {suggestions.map((result, index) => {
            const address = result.address || {};
            const displayText = address.freeformAddress || result.poi?.name || 'Unknown address';
            const city = address.municipality || address.municipalitySubdivision || '';
            const state = address.countrySubdivision || '';
            
            return (
              <div
                key={index}
                className="p-3 cursor-pointer border-b border-gray-200 hover:bg-gray-50 transition-colors"
                onClick={() => handleSelectAddress(result)}
              >
                <div className="flex items-start gap-3">
                  <HiLocationMarker className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{displayText}</span>
                      {result.score && (
                        <Badge color="success" size="sm">
                          Score: {result.score.toFixed(2)}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {city && state ? `${city}, ${state}` : displayText}
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
