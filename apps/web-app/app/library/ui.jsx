"use client";

import UnifiedLibraryComponent from '@/components/shared/UnifiedLibraryComponent';

/**
 * Library Client Component
 * Renders the UnifiedLibraryComponent directly - EXACT same structure as admin library
 * For business roles (admin, pmc, pm): Pass userRole to ensure correct role detection
 * For landlord/tenant: Pass props including libraryData
 */
export default function DocumentsClient({ user, userRole, libraryData }) {
  // For all business roles (admin, pmc, pm), pass userRole to ensure correct detection
  // This matches admin library structure while ensuring role is known immediately
  const isBusinessRole = userRole === 'admin' || userRole === 'pmc' || userRole === 'pm';
  
  if (isBusinessRole) {
    // For business roles, pass userRole to ensure correct role detection
    // UnifiedLibraryComponent will still load user from API but knows the role immediately
    return <UnifiedLibraryComponent userRole={userRole} />;
  }
  
  // For landlord/tenant, pass all the data they need
  return (
    <UnifiedLibraryComponent
      userRole={userRole}
      user={user}
      tenants={libraryData?.tenants || []}
      initialDocuments={libraryData?.initialDocuments || []}
      leaseDocuments={libraryData?.leaseDocuments || []}
    />
  );
}

