/**
 * Navigation Component - Migrated to v2 FastAPI
 * 
 * Role-aware navigation using v2 FastAPI auth roles.
 * Shows appropriate menu items based on user's roles from v2 backend.
 */
"use client";

import { usePathname, useRouter } from "next/navigation";
import { SidebarItems, SidebarItemGroup, SidebarItem } from 'flowbite-react';
import Link from 'next/link';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import {
  HiHome,
  HiUser,
  HiDocumentText,
  HiCurrencyDollar,
  HiClipboard,
  HiLockClosed,
  HiCalendar,
  HiChat,
  HiBookOpen,
  HiMail,
  HiShieldCheck,
  HiCheckCircle,
  HiCalculator,
  HiDatabase,
  HiCog,
  HiDownload,
  HiBell,
  HiKey,
  HiOfficeBuilding,
  HiShoppingBag,
  HiChartBar,
} from 'react-icons/hi';

export default function Navigation({ show, userRole: propUserRole, collapsed = false }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, hasRole } = useV2Auth();
  
  // Use v2 auth role if available, fallback to prop
  let userRole = propUserRole;
  if (user) {
    if (hasRole('super_admin')) {
      userRole = 'super_admin';
    } else if (hasRole('pmc_admin')) {
      userRole = 'pmc_admin';
    } else if (hasRole('pm')) {
      userRole = 'pm';
    } else if (hasRole('landlord')) {
      userRole = 'landlord';
    } else if (hasRole('tenant')) {
      userRole = 'tenant';
    } else if (hasRole('vendor')) {
      userRole = 'vendor';
    } else if (hasRole('contractor')) {
      userRole = 'contractor';
    }
  }
  
  if (!show) return null;
  
  // Role-aware navigation items
  // super_admin sees everything, other roles see filtered items
  const isSuperAdmin = userRole === 'admin' || userRole === 'super_admin';
  const isPMCAdmin = userRole === 'pmc_admin' || userRole === 'pmc';
  const isPM = userRole === 'pm';
  const isLandlord = userRole === 'landlord';
  const isTenant = userRole === 'tenant';
  const isVendor = userRole === 'vendor';
  const isContractor = userRole === 'contractor';

  // Base navigation items - role-aware visibility
  const baseNavItems = [
    { key: "/portfolio", label: "Portfolio", icon: HiOfficeBuilding, roles: ['super_admin', 'pmc_admin', 'pm', 'landlord', 'tenant', 'vendor'] },
    { key: "/properties", label: "Properties", icon: HiHome, roles: ['super_admin', 'pmc_admin', 'pm', 'landlord'] },
    { key: "/leases", label: "Leases", icon: HiDocumentText, roles: ['super_admin', 'pmc_admin', 'pm', 'landlord', 'tenant'] },
    { key: "/tenants", label: "Tenants", icon: HiUser, roles: ['super_admin', 'pmc_admin', 'pm', 'landlord'] },
    { key: "/landlords", label: "Landlords", icon: HiUser, roles: ['super_admin', 'pmc_admin', 'pm'] },
    { key: "/operations", label: "Work Orders", icon: HiCog, roles: ['super_admin', 'pmc_admin', 'pm', 'landlord', 'tenant', 'vendor'] },
    { key: "/partners", label: "Vendors", icon: HiShoppingBag, roles: ['super_admin', 'pmc_admin', 'pm', 'landlord'] },
    { key: "/reports", label: "Reports", icon: HiChartBar, roles: ['super_admin', 'pmc_admin', 'pm', 'landlord'] },
    { key: "/settings", label: "Settings", icon: HiCog, roles: ['super_admin', 'pmc_admin', 'pm', 'landlord', 'tenant', 'vendor'] },
  ];

  // Filter navigation items based on role
  const getNavItemsForRole = (role) => {
    if (isSuperAdmin) {
      // super_admin sees everything
      return baseNavItems;
    }
    
    // Filter items based on role
    return baseNavItems.filter(item => {
      if (item.roles.includes(role)) {
        return true;
      }
      // Map legacy roles to new roles
      if (role === 'admin' && item.roles.includes('super_admin')) {
        return true;
      }
      if (role === 'pmc' && item.roles.includes('pmc_admin')) {
        return true;
      }
      return false;
    });
  };

  // Get navigation items for current role
  // Default to empty array if no role
  const navItems = userRole ? getNavItemsForRole(userRole) : [];
  
  const handleClick = (path) => {
    if (path !== pathname) {
      router.push(path);
    }
  };
  
  return (
    <SidebarItems>
      <SidebarItemGroup>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.key || pathname?.startsWith(item.key + '/');
          return (
            <SidebarItem
              key={item.key}
              as={Link}
              href={item.key}
              icon={Icon}
              active={isActive}
              onClick={(e) => {
                e.preventDefault();
                handleClick(item.key);
              }}
            >
              {item.label}
            </SidebarItem>
          );
        })}
      </SidebarItemGroup>
    </SidebarItems>
  );
}
