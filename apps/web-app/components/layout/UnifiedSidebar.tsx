"use client";

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  SidebarItems,
  SidebarItemGroup,
  SidebarItem,
} from 'flowbite-react';
import {
  HiChartBar,
  HiOfficeBuilding,
  HiUsers,
  HiHome,
  HiDocumentText,
  HiShoppingBag,
  HiCog,
  HiDatabase,
  HiLockClosed,
  HiShieldCheck,
  HiBell,
  HiKey,
  HiDownload,
  HiMail,
  HiUser,
  HiQuestionMarkCircle,
  HiClipboard,
  HiPlay,
} from 'react-icons/hi';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useRolePermissions } from '@/lib/hooks/useRolePermissions';
import { useTour } from '@/components/tour/TourProvider';
import { getTourForRole } from '@/lib/tour/tourSteps';
import { formatAriaLabel } from '@/lib/utils/a11y';

// Safe wrapper for useTour
function useTourSafe() {
  try {
    return useTour();
  } catch {
    return null;
  }
}

interface MenuItem {
  path: string;
  name: string;
  icon: any; // Flowbite accepts various icon types
  roles: string[];
  children?: MenuItem[];
}

export default function UnifiedSidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const { canViewScreen, role } = useRolePermissions();
  const tour = useTourSafe();

  const handleStartTour = () => {
    if (!tour || !role) return;

    const tourConfig = getTourForRole(role);
    if (tourConfig) {
      tour.startTour(tourConfig);
    }
  };

  // Build menu items based on ROLE_SCREENS config
  const menuItems = useMemo<MenuItem[]>(() => {
    const items: MenuItem[] = [];

    // Dashboard - All roles can view
    if (canViewScreen('/portfolio')) {
      items.push({
        path: '/portfolio',
        name: 'Dashboard',
        icon: HiChartBar,
        roles: ['super_admin', 'pmc_admin', 'pm', 'landlord', 'tenant', 'vendor'],
      });
    }

    // Portfolio sub-items - Super Admin only
    if (canViewScreen('/portfolio/administrators')) {
      items.push({
        path: '/portfolio/administrators',
        name: 'Administrators',
        icon: HiUsers,
        roles: ['super_admin'],
      });
    }

    if (canViewScreen('/portfolio/pmcs')) {
      items.push({
        path: '/portfolio/pmcs',
        name: 'PMCs',
        icon: HiOfficeBuilding,
        roles: ['super_admin'],
      });
    }

    // Platform Section - Super Admin only
    if (canViewScreen('/platform')) {
      items.push({
        path: '/platform',
        name: 'Platform Dashboard',
        icon: HiDatabase,
        roles: ['super_admin'],
      });
    }

    if (canViewScreen('/platform/organizations')) {
      items.push({
        path: '/platform/organizations',
        name: 'Organizations',
        icon: HiOfficeBuilding,
        roles: ['super_admin'],
      });
    }

    if (canViewScreen('/platform/settings')) {
      items.push({
        path: '/platform/settings',
        name: 'Global Settings',
        icon: HiCog,
        roles: ['super_admin'],
      });
    }

    // Audit Logs - Super Admin only
    if (canViewScreen('/platform/audit-logs')) {
      items.push({
        path: '/platform/audit-logs',
        name: 'Audit Logs',
        icon: HiDocumentText,
        roles: ['super_admin'],
      });
    }

    // Work Orders - All roles that can view
    if (canViewScreen('/work-orders-v2')) {
      items.push({
        path: '/work-orders-v2',
        name: 'Work Orders',
        icon: HiClipboard,
        roles: ['super_admin', 'pmc_admin', 'pm', 'landlord', 'tenant', 'vendor'],
      });
    }

    // Messages - All roles that can view
    if (canViewScreen('/messages')) {
      items.push({
        path: '/messages',
        name: 'Messages',
        icon: HiMail,
        roles: ['super_admin', 'pmc_admin', 'pm', 'landlord', 'tenant', 'vendor'],
      });
    }

    // Reports - Roles that can view
    if (canViewScreen('/reports')) {
      items.push({
        path: '/reports',
        name: 'Reports',
        icon: HiDocumentText,
        roles: ['super_admin', 'pmc_admin', 'pm', 'landlord'],
      });
    }

    // Settings - All roles
    if (canViewScreen('/settings')) {
      items.push({
        path: '/settings',
        name: 'Settings',
        icon: HiCog,
        roles: ['super_admin', 'pmc_admin', 'pm', 'landlord', 'tenant', 'vendor'],
      });
    }

    return items;
  }, [canViewScreen]);

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  const getTourId = (path: string) => {
    if (path === '/portfolio') return 'dashboard-overview';
    if (path === '/portfolio/administrators') return 'administrators-tab';
    if (path === '/portfolio/pmcs') return 'pmcs-tab';
    if (path === '/portfolio/properties') return 'properties-tab';
    if (path === '/portfolio/landlords') return 'landlords-tab';
    if (path === '/portfolio/tenants') return 'tenants-tab';
    if (path === '/portfolio/leases') return 'leases-tab';
    if (path === '/portfolio/vendors') return 'vendors-tab';
    if (path === '/platform/settings') return 'platform-settings';
    return null;
  };

  const renderMenuItem = (item: MenuItem) => {
    const Icon = item.icon;
    const active = isActive(item.path);

    // For now, render children as flat items (can be enhanced later with collapsible groups)
    if (item.children && item.children.length > 0) {
      return (
        <>
          <SidebarItem
            key={item.path}
            as={Link}
            href={item.path}
            icon={Icon}
            active={active}
            data-tour-id={getTourId(item.path) || undefined}
          >
            {item.name}
          </SidebarItem>
          {item.children.map((child) => {
            const ChildIcon = child.icon;
            const childActive = isActive(child.path);
            return (
              <SidebarItem
                key={child.path}
                as={Link}
                href={child.path}
                icon={ChildIcon}
                active={childActive}
                className="ml-4"
                data-tour-id={getTourId(child.path) || undefined}
              >
                {child.name}
              </SidebarItem>
            );
          })}
        </>
      );
    }

    const tourId = getTourId(item.path);

    return (
      <SidebarItem
        key={item.path}
        as={Link}
        href={item.path}
        icon={Icon}
        active={active}
        data-tour-id={tourId || undefined}
        aria-label={item.name}
        aria-current={active ? 'page' : undefined}
        role="listitem"
      >
        {item.name}
      </SidebarItem>
    );
  };

  return (
    <>
      <SidebarItems role="list">
        <SidebarItemGroup role="group" aria-label="Navigation menu">
          {menuItems.map(renderMenuItem)}
        </SidebarItemGroup>
      </SidebarItems>
      {/* Footer with Help Center and Tour Links */}
      <div className="mt-auto border-t border-gray-200 dark:border-gray-700 p-4 space-y-2" role="group" aria-label="Help and support">
        <Link
          href="/help"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-colors"
          data-tour-id="help-center-link"
          aria-label="Open help center"
        >
          <HiQuestionMarkCircle className="h-4 w-4" aria-hidden="true" />
          {!collapsed && <span>Help Center</span>}
        </Link>
        <button
          onClick={handleStartTour}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg transition-colors"
          data-tour-id="start-tour-button"
          aria-label="Start guided tour"
        >
          <HiPlay className="h-4 w-4" aria-hidden="true" />
          {!collapsed && <span>Start Guided Tour</span>}
        </button>
      </div>
    </>
  );
}

