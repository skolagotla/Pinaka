"use client";

import UnifiedLibraryComponent from '@/components/shared/UnifiedLibraryComponent';

/**
 * Landlord Library Client
 * Uses the unified library component with Personal and Legal tabs
 */
export default function LandlordLibraryClient({ landlord, tenants }) {
  return (
    <UnifiedLibraryComponent
      userRole="landlord"
      user={landlord}
      tenants={tenants}
    />
  );
}
