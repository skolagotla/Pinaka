/**
 * ═══════════════════════════════════════════════════════════════
 * QUICK ACTIONS FLOATING ACTION BUTTON (FAB)
 * ═══════════════════════════════════════════════════════════════
 * 
 * Role-based quick actions menu
 * Responsive and mobile-friendly
 */

"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Dropdown } from 'flowbite-react';
import {
  HiPlus,
  HiHome,
  HiUser,
  HiDocumentText,
  HiCog,
  HiShoppingBag,
} from 'react-icons/hi';

type Role = 'super_admin' | 'pmc_admin' | 'pm' | 'landlord' | 'tenant' | 'vendor';

interface QuickActionsFABProps {
  userRole: Role | string | null;
}

export default function QuickActionsFAB({ userRole }: QuickActionsFABProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Role-based actions
  const getActionsForRole = (role: Role | string | null) => {
    const isSuperAdmin = role === 'super_admin' || role === 'admin';
    const isPMCAdmin = role === 'pmc_admin' || role === 'pmc';
    const isPM = role === 'pm';
    const isLandlord = role === 'landlord';
    const isTenant = role === 'tenant';
    const isVendor = role === 'vendor';

    const actions = [];

    // Super Admin, PMC Admin, PM actions
    if (isSuperAdmin || isPMCAdmin || isPM) {
      actions.push(
        { label: 'New Property', icon: HiHome, path: '/properties/new' },
        { label: 'New Lease', icon: HiDocumentText, path: '/leases/new' },
        { label: 'New Tenant', icon: HiUser, path: '/tenants/new' },
        { label: 'New Work Order', icon: HiCog, path: '/operations/new' },
        { label: 'Assign Vendor', icon: HiShoppingBag, path: '/partners/assign' },
      );
    }

    // Landlord actions
    if (isLandlord) {
      actions.push(
        { label: 'New Work Order', icon: HiCog, path: '/operations/new' },
        { label: 'Add Tenant', icon: HiUser, path: '/tenants/new' },
      );
    }

    // Tenant actions
    if (isTenant) {
      actions.push(
        { label: 'New Work Order', icon: HiCog, path: '/operations/new' },
      );
    }

    return actions;
  };

  const actions = getActionsForRole(userRole);

  if (actions.length === 0) {
    return null;
  }

  const handleActionClick = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Dropdown
        arrowIcon={false}
        label={
          <div
            className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center cursor-pointer focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
            role="button"
            tabIndex={0}
            aria-label="Quick actions menu"
          >
            <HiPlus className="h-6 w-6" />
          </div>
        }
        className="mb-2"
        placement="top"
      >
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Dropdown.Item
              key={index}
              onClick={() => handleActionClick(action.path)}
              className="flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {action.label}
            </Dropdown.Item>
          );
        })}
      </Dropdown>
    </div>
  );
}

