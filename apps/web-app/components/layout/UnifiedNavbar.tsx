"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Navbar,
  Button,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  Avatar,
  TextInput,
} from 'flowbite-react';
import {
  HiSearch,
  HiMenuAlt1,
  HiLogout,
  HiUser,
  HiCog,
  HiBell,
  HiQuestionMarkCircle,
  HiPlay,
} from 'react-icons/hi';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import GlobalSearch from '@/components/GlobalSearch';
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

interface UnifiedNavbarProps {
  onSidebarToggle: () => void;
  sidebarCollapsed: boolean;
}

export default function UnifiedNavbar({
  onSidebarToggle,
  sidebarCollapsed,
}: UnifiedNavbarProps) {
  const router = useRouter();
  const { user, logout, hasRole } = useV2Auth();
  const [searchOpen, setSearchOpen] = useState(false);
  const tour = useTourSafe();

  const handleStartTour = () => {
    if (!tour) return;
    
    // Get user's primary role
    let userRole: string | null = null;
    if (hasRole('super_admin')) userRole = 'super_admin';
    else if (hasRole('pmc_admin')) userRole = 'pmc_admin';
    else if (hasRole('pm')) userRole = 'pm';
    else if (hasRole('landlord')) userRole = 'landlord';
    else if (hasRole('tenant')) userRole = 'tenant';
    else if (hasRole('vendor')) userRole = 'vendor';

    if (!userRole) return;

    const tourConfig = getTourForRole(userRole);
    if (tourConfig) {
      tour.startTour(tourConfig);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const keyboardShortcut =
    typeof window !== 'undefined' &&
    navigator?.platform?.toUpperCase().indexOf('MAC') >= 0
      ? '⌘K'
      : 'Ctrl+K';

  return (
    <>
      <Navbar
        fluid
        role="banner"
        aria-label="Main navigation"
        className="fixed top-0 left-0 right-0 z-40 border-b border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
      >
        <div className="flex w-full items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle */}
            <Button
              color="gray"
              size="sm"
              onClick={onSidebarToggle}
              className="p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!sidebarCollapsed}
              aria-controls="main-sidebar"
            >
              <HiMenuAlt1 className="h-5 w-5" aria-hidden="true" />
            </Button>

            {/* Logo */}
            <Link 
              href="/portfolio" 
              className="flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
              aria-label="Go to dashboard"
            >
              <img
                src="/favicon.ico"
                alt=""
                className="mr-3 h-8"
                aria-hidden="true"
              />
              {!sidebarCollapsed && (
                <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-900 dark:text-white">
                  Pinaka
                </span>
              )}
            </Link>

            {/* Search - Desktop */}
            <div className="hidden lg:block">
              <TextInput
                icon={HiSearch}
                type="search"
                placeholder="Search..."
                className="w-96 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                onClick={() => setSearchOpen(true)}
                readOnly
                aria-label="Open search (press Ctrl+K or Cmd+K)"
                aria-describedby="search-hint"
              />
              <span id="search-hint" className="sr-only">
                Press {keyboardShortcut} to open search
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Help Center Button */}
            <Button
              color="gray"
              size="sm"
              onClick={() => router.push('/help')}
              className="hidden lg:flex focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Open help center"
            >
              <HiQuestionMarkCircle className="h-5 w-5" aria-hidden="true" />
            </Button>
            
            {/* Help/Tour Button */}
            <Button
              color="gray"
              size="sm"
              onClick={handleStartTour}
              className="hidden lg:flex focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Start guided tour"
            >
              <HiPlay className="h-5 w-5" aria-hidden="true" />
            </Button>

            {/* Mobile Search Button */}
            <Button
              color="gray"
              size="sm"
              onClick={() => setSearchOpen(true)}
              className="lg:hidden focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-label="Open search"
            >
              <HiSearch className="h-5 w-5" aria-hidden="true" />
            </Button>

            {/* Notifications */}
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <div className="inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                  <span className="sr-only">Notifications</span>
                  <HiBell className="h-5 w-5" aria-hidden="true" />
                </div>
              }
              className="w-80 rounded-xl"
              aria-label="Notifications menu"
            >
              <div className="block rounded-t-xl bg-gray-50 px-4 py-2 text-center text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-white">
                Notifications
              </div>
              <div className="max-h-96 overflow-y-auto">
                <div className="border-b border-gray-200 px-4 py-3 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    No new notifications
                  </div>
                </div>
              </div>
            </Dropdown>

            {/* User Menu */}
            <Dropdown
              arrowIcon={false}
              inline
              label={
                <div className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full">
                  <Avatar
                    alt=""
                    img={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user?.user?.full_name || 'User'
                    )}&background=6366f1&color=fff`}
                    rounded
                    size="sm"
                    aria-hidden="true"
                  />
                </div>
              }
              className="w-56 rounded-lg"
              aria-label="User menu"
            >
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.user?.full_name || 'User'}
                </span>
                <span className="block truncate text-sm text-gray-500 dark:text-gray-400">
                  {user?.user?.email || ''}
                </span>
                <span className="block text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {user?.roles?.[0]?.name || 'User'}
                </span>
              </div>
              <DropdownItem
                className="flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => router.push('/settings')}
                aria-label="Go to my profile"
              >
                <HiUser className="mr-2 h-4 w-4" aria-hidden="true" />
                My profile
              </DropdownItem>
              <DropdownItem
                className="flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                onClick={() => router.push('/settings')}
                aria-label="Go to settings"
              >
                <HiCog className="mr-2 h-4 w-4" aria-hidden="true" />
                Settings
              </DropdownItem>
              <DropdownDivider />
              <DropdownItem 
                className="flex items-center focus:outline-none focus:ring-2 focus:ring-blue-500" 
                onClick={handleLogout}
                aria-label="Sign out"
              >
                <HiLogout className="mr-2 h-4 w-4" aria-hidden="true" />
                Sign out
              </DropdownItem>
            </Dropdown>
          </div>
        </div>
      </Navbar>

      {/* Global Search Modal */}
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

