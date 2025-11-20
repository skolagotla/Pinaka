"use client";

import UnifiedLibraryComponent from '@/components/shared/UnifiedLibraryComponent';

/**
 * Tenant Library Client
 * Uses the unified library component with Personal and Legal tabs
 */
export default function TenantLibraryClient({ tenant, initialDocuments, leaseDocuments }) {
  return (
    <UnifiedLibraryComponent
      userRole="tenant"
      user={tenant}
      initialDocuments={initialDocuments}
      leaseDocuments={leaseDocuments}
    />
  );
}
