'use client';

/**
 * AddressAutocompleteProvider - Abstraction layer for address autocomplete providers
 * 
 * This component allows easy switching between different address autocomplete providers
 * (Geoapify, Here API, etc.) without changing the consuming code.
 * 
 * Usage:
 * <AddressAutocompleteProvider
 *   provider="geoapify" // or "here"
 *   value={value}
 *   onChange={onChange}
 *   onSelect={onSelect}
 *   apiKey={apiKey}
 *   country={country}
 * />
 */

import AddressAutocomplete from './AddressAutocomplete';
// import HereAddressAutocomplete from './HereAddressAutocomplete'; // Uncomment when needed

export default function AddressAutocompleteProvider({
  provider = 'geoapify', // Default to Geoapify
  ...props
}) {
  // Switch between providers based on the 'provider' prop
  switch (provider) {
    case 'geoapify':
      return <AddressAutocomplete {...props} />;
    
    case 'here':
      // return <HereAddressAutocomplete {...props} />;
      // For now, fallback to Geoapify until Here is fully implemented
      console.warn('Here API provider not yet implemented, using Geoapify');
      return <AddressAutocomplete {...props} />;
    
    default:
      console.warn(`Unknown provider: ${provider}, using Geoapify as fallback`);
      return <AddressAutocomplete {...props} />;
  }
}

