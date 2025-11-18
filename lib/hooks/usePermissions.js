"use client";

import { useState, useEffect } from 'react';

/**
 * Hook to check user permissions
 * @param {Object} user - User object with role and userId
 * @param {Object} options - Options for permission checks
 * @returns {Object} Permission context
 */
export function usePermissions(user, options = {}) {
  const [permissions, setPermissions] = useState({
    canEdit: true,
    canAddProperties: true,
    canEditProperties: true,
    canEditTenants: true,
    canEditLeases: true,
    canEditMaintenance: true,
    isPMC: false,
    isPMCManaged: false,
  });

  useEffect(() => {
    if (!user) {
      setPermissions({
        canEdit: false,
        canAddProperties: false,
        canEditProperties: false,
        canEditTenants: false,
        canEditLeases: false,
        canEditMaintenance: false,
        isPMC: false,
        isPMCManaged: false,
        managingPMC: null,
      });
      return;
    }

    // Check if user is PMC
    if (user.role === 'pmc') {
      setPermissions({
        canEdit: false,
        canAddProperties: false,
        canEditProperties: false,
        canEditTenants: false,
        canEditLeases: false,
        canEditMaintenance: false,
        isPMC: true,
        isPMCManaged: false,
        managingPMC: null,
      });
      return;
    }

    // For landlords, check if they're managed by PMC
    if (user.role === 'landlord') {
      const isPMCManaged = user.isPMCManaged || false;
      setPermissions({
        canEdit: !isPMCManaged,
        canAddProperties: true, // Landlords can always add properties
        canEditProperties: !isPMCManaged, // Cannot edit if managed by PMC
        canEditTenants: !isPMCManaged,
        canEditLeases: !isPMCManaged,
        canEditMaintenance: !isPMCManaged,
        isPMC: false,
        isPMCManaged: isPMCManaged,
        managingPMC: user.managingPMC || null,
      });
      return;
    }

    // Default: full permissions
    setPermissions({
      canEdit: true,
      canAddProperties: true,
      canEditProperties: true,
      canEditTenants: true,
      canEditLeases: true,
      canEditMaintenance: true,
      isPMC: false,
      isPMCManaged: false,
      managingPMC: null,
    });
  }, [user]);

  return permissions;
}

