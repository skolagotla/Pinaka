/**
 * Composite hook combining usePinakaCRUD with useCountryRegion
 * 
 * This hook combines CRUD operations with country/region/postal code management
 * for forms that need both (e.g., Properties, Units, Tenants).
 * 
 * Benefits:
 * - Single import for address-based CRUD pages
 * - Maintains separation of concerns (both hooks work independently)
 * - Optional - use only when needed
 * - Doesn't bloat usePinakaCRUD for non-address forms
 * 
 * @example
 * const pinaka = usePinakaCRUDWithAddress({
 *   apiEndpoint: '/api/properties',
 *   initialData: properties,
 *   entityName: 'Property',
 *   initialCountry: 'CA',
 * });
 * 
 * // Use CRUD functionality
 * pinaka.openAdd();
 * pinaka.handleSubmit(data);
 * 
 * // Use country/region functionality
 * pinaka.countryRegion.setCountry('US');
 * pinaka.countryRegion.getRegionLabel(); // "State"
 */

"use client";
import { usePinakaCRUD } from './usePinakaCRUD';
import { useCountryRegion } from './useCountryRegion';

export function usePinakaCRUDWithAddress(config) {
  const {
    // Country/region config
    initialCountry = 'CA',
    
    // Rest of config goes to usePinakaCRUD (including domain, useV1Api)
    ...crudConfig
  } = config;

  // Initialize both hooks
  // usePinakaCRUD now supports v1Api via domain and useV1Api flags
  const pinaka = usePinakaCRUD(crudConfig);
  const countryRegion = useCountryRegion(initialCountry);

  // Return combined functionality
  return {
    // All usePinakaCRUD functionality
    ...pinaka,
    
    // Country/region functionality nested under 'countryRegion'
    // This prevents naming conflicts and keeps it organized
    countryRegion,
    
    // Convenience shortcuts (optional - can access via countryRegion.xxx)
    country: countryRegion.country,
    region: countryRegion.region,
    setCountry: countryRegion.setCountry,
    setRegion: countryRegion.setRegion,
  };
}

/**
 * Alternative: Flat structure (all properties at top level)
 * Use this if you prefer direct access without nesting
 * 
 * @example
 * const pinaka = usePinakaCRUDWithAddressFlat({...});
 * pinaka.setCountry('US');  // Direct access
 */
export function usePinakaCRUDWithAddressFlat(config) {
  const {
    initialCountry = 'CA',
    ...crudConfig
  } = config;

  const pinaka = usePinakaCRUD(crudConfig);
  const countryRegion = useCountryRegion(initialCountry);

  return {
    // CRUD properties/methods
    ...pinaka,
    
    // Country/region properties/methods (flattened)
    country: countryRegion.country,
    region: countryRegion.region,
    setCountry: countryRegion.setCountry,
    setRegion: countryRegion.setRegion,
    getRegions: countryRegion.getRegions,
    getRegionLabel: countryRegion.getRegionLabel,
    getPostalLabel: countryRegion.getPostalLabel,
    getPostalPlaceholder: countryRegion.getPostalPlaceholder,
    getPostalPattern: countryRegion.getPostalPattern,
    formatPostalCode: countryRegion.formatPostalCode,
    validatePostalCode: countryRegion.validatePostalCode,
    countries: countryRegion.countries,
    DEFAULT_COUNTRY: countryRegion.DEFAULT_COUNTRY,
    DEFAULT_REGIONS: countryRegion.DEFAULT_REGIONS,
    
    // Keep full countryRegion object available too
    _countryRegion: countryRegion,
  };
}

