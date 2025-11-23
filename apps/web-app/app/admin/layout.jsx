"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Sidebar,
  SidebarItems,
  SidebarItemGroup,
  SidebarItem,
  Navbar,
  TextInput,
  Dropdown,
  DropdownDivider,
  DropdownItem,
  Avatar,
  Badge,
  Drawer,
} from 'flowbite-react';
import Link from 'next/link';
import {
  HiHome,
  HiUser,
  HiDatabase,
  HiDocumentText,
  HiCog,
  HiShieldCheck,
  HiDownload,
  HiBell,
  HiKey,
  HiLockClosed,
  HiMail,
  HiSearch,
  HiMenuAlt1,
  HiOfficeBuilding,
  HiChartBar,
  HiUsers,
  HiLogout,
  HiViewGrid,
  HiAdjustments,
  HiX,
} from 'react-icons/hi';
import GlobalSearch from '@/components/GlobalSearch';
import UserMenu from '@/components/UserMenu';
import ErrorBoundary from '@/components/ErrorBoundary';
import TestDatabaseBanner from '@/components/TestDatabaseBanner';
import AdminRouteGuard from '@/components/admin/AdminRouteGuard';
import ImpersonationBanner from '@/components/admin/ImpersonationBanner';
import { Role } from '@/lib/types/roles';

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [admin, setAdmin] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setMobile] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => {
      const isMobileNow = window.innerWidth < 768;
      setMobile(isMobileNow);
      setSidebarOpen(!isMobileNow);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarCollapsed');
      if (saved === 'true') {
        setSidebarCollapsed(true);
      }
    }
  }, [isMounted]);

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed));
    }
  }, [sidebarCollapsed, isMounted]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (pathname !== '/admin/login') {
      fetchAdmin();
    }
  }, [pathname]);

  const fetchAdmin = async () => {
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getCurrentUser();

      if (data.success && data.user) {
        // Role checking is now handled by AdminRouteGuard
        setAdmin(data.user);
      } else {
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (!errorMessage.includes('Not authenticated') && !errorMessage.includes('401')) {
        console.error('[Admin Layout] Error fetching admin:', err);
      }
      if (pathname !== '/admin/login') {
        router.push('/admin/login');
      }
    }
  };

  const handleLogout = async () => {
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      await adminApi.logout();
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const adminMenuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: HiChartBar },
    { path: '/admin/portfolio', name: 'Portfolio', icon: HiOfficeBuilding },
    { path: '/admin/users', name: 'Users', icon: HiUsers },
    { path: '/admin/rbac', name: 'RBAC Settings', icon: HiLockClosed },
    { path: '/admin/verifications', name: 'Verifications', icon: HiShieldCheck },
    { path: '/admin/system', name: 'System Monitoring', icon: HiDatabase },
    { path: '/admin/audit-logs', name: 'Audit Logs', icon: HiDocumentText },
    { path: '/admin/library', name: 'Library', icon: HiDocumentText },
    { path: '/admin/settings', name: 'Platform Settings', icon: HiCog },
    { path: '/admin/analytics', name: 'Analytics', icon: HiChartBar },
    { path: '/admin/support-tickets', name: 'Support Tickets', icon: HiMail },
    { path: '/admin/security', name: 'Security Center', icon: HiShieldCheck },
    { path: '/admin/data-export', name: 'Data Export', icon: HiDownload },
    { path: '/admin/notifications', name: 'Notifications', icon: HiBell },
    { path: '/admin/user-activity', name: 'User Activity', icon: HiUser },
    { path: '/admin/content', name: 'Content Management', icon: HiDocumentText },
    { path: '/admin/api-keys', name: 'API Keys', icon: HiKey },
    { path: '/admin/database', name: 'Database', icon: HiDatabase },
  ];

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (!isMounted) {
    return (
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    );
  }

  const keyboardShortcut = isMounted && typeof window !== 'undefined' && 
    navigator?.platform?.toUpperCase().indexOf('MAC') >= 0 ? '⌘K' : 'Ctrl+K';

  return (
    <AdminRouteGuard 
      allowedRoles={['super_admin'] as Role[]}
      redirectMessage="Access denied: Platform Administrator access required"
    >
      <ErrorBoundary>
        <ImpersonationBanner />
        <div className="bg-gray-50 dark:bg-gray-900 min-h-screen" suppressHydrationWarning>
        {/* Professional Navbar */}
        <Navbar
          fluid
          className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white p-0 dark:border-gray-700 dark:bg-gray-800"
        >
          <div className="w-full px-4 py-3">
            <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => {
                  if (isMobile) {
                    setSidebarOpen(!isSidebarOpen);
                  } else {
                    setSidebarCollapsed(!sidebarCollapsed);
                  }
                }}
                className="inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-600"
              >
                <span className="sr-only">Toggle sidebar</span>
                {isMobile ? (
                  <HiMenuAlt1 className="h-6 w-6" />
                ) : (
                  <HiMenuAlt1 className="h-6 w-6" />
                )}
              </button>

              {/* Logo */}
              <Link href="/admin/dashboard" className="mr-4 flex items-center">
                <img
                  src="/favicon.ico"
                  className="mr-3 h-8"
                  alt="Pinaka Logo"
                />
                <span className="self-center whitespace-nowrap text-xl font-semibold text-gray-900 dark:text-white">
                  Pinaka
                </span>
              </Link>

              {/* Search - Desktop */}
              <form className="hidden lg:block lg:pl-2">
                <TextInput
                  icon={HiSearch}
                  type="search"
                  placeholder="Search..."
                  className="w-full lg:w-96"
                  onClick={() => setSearchOpen(true)}
                  readOnly
                />
              </form>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile search button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="lg:hidden inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-600"
              >
                <span className="sr-only">Search</span>
                <HiSearch className="h-5 w-5" />
              </button>

              {/* Notifications */}
              <Dropdown
                arrowIcon={false}
                inline
                label={
                  <span className="inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-600">
                    <span className="sr-only">Notifications</span>
                    <HiBell className="h-5 w-5" />
                    <Badge color="failure" className="ml-2 -mt-1">3</Badge>
                  </span>
                }
                className="w-80 rounded-xl"
              >
                <div className="block rounded-t-xl bg-gray-50 px-4 py-2 text-center text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-white">
                  Notifications
                </div>
                <div className="max-h-96 overflow-y-auto">
                  <div className="border-b border-gray-200 px-4 py-3 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      New user registered
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      A few moments ago
                    </div>
                  </div>
                  <div className="border-b border-gray-200 px-4 py-3 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      System update available
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      10 minutes ago
                    </div>
                  </div>
                </div>
                <div className="block rounded-b-xl border-t border-gray-200 bg-gray-50 px-4 py-2 text-center text-sm font-medium text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600">
                  <a href="/admin/notifications" className="inline-flex items-center">
                    View all
                  </a>
                </div>
              </Dropdown>

              {/* Apps Menu */}
              <Dropdown
                arrowIcon={false}
                inline
                label={
                  <span className="inline-flex items-center rounded-lg p-2 text-sm text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-600">
                    <span className="sr-only">Apps</span>
                    <HiViewGrid className="h-5 w-5" />
                  </span>
                }
                className="w-64 rounded-xl"
              >
                <div className="block rounded-t-xl bg-gray-50 px-4 py-2 text-center text-sm font-semibold text-gray-700 dark:bg-gray-700 dark:text-white">
                  Quick Access
                </div>
                <div className="grid grid-cols-3 gap-4 p-4">
                  <a
                    href="/admin/dashboard"
                    className="block rounded-lg p-3 text-center hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <HiChartBar className="mx-auto mb-2 h-6 w-6 text-gray-500 dark:text-gray-400" />
                    <div className="text-xs font-medium text-gray-900 dark:text-white">Dashboard</div>
                  </a>
                  <a
                    href="/admin/users"
                    className="block rounded-lg p-3 text-center hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <HiUsers className="mx-auto mb-2 h-6 w-6 text-gray-500 dark:text-gray-400" />
                    <div className="text-xs font-medium text-gray-900 dark:text-white">Users</div>
                  </a>
                  <a
                    href="/admin/portfolio"
                    className="block rounded-lg p-3 text-center hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <HiOfficeBuilding className="mx-auto mb-2 h-6 w-6 text-gray-500 dark:text-gray-400" />
                    <div className="text-xs font-medium text-gray-900 dark:text-white">Portfolio</div>
                  </a>
                </div>
              </Dropdown>

              {/* User Menu */}
              <Dropdown
                arrowIcon={false}
                inline
                label={
                  <span>
                    <span className="sr-only">User menu</span>
                    <Avatar
                      alt="User"
                      img={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                        `${admin?.firstName || ''} ${admin?.lastName || ''}`.trim() || 'Platform Admin'
                      )}&background=6366f1&color=fff`}
                      rounded
                      size="sm"
                    />
                  </span>
                }
                className="w-56 rounded-lg"
              >
                <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                  <span className="block text-sm font-semibold text-gray-900 dark:text-white">
                    {admin?.firstName && admin?.lastName
                      ? `${admin.firstName} ${admin.lastName}`
                      : 'Platform Admin'}
                  </span>
                  <span className="block truncate text-sm text-gray-500 dark:text-gray-400">
                    {admin?.email || 'admin@pinaka.com'}
                  </span>
                </div>
                <DropdownItem
                  className="flex items-center"
                  onClick={() => router.push('/admin/settings')}
                >
                  <HiUser className="mr-2 h-4 w-4" />
                  My profile
                </DropdownItem>
                <DropdownItem
                  className="flex items-center"
                  onClick={() => router.push('/admin/settings')}
                >
                  <HiCog className="mr-2 h-4 w-4" />
                  Settings
                </DropdownItem>
                <DropdownDivider />
                <DropdownItem 
                  className="flex items-center"
                  onClick={handleLogout}
                >
                  <HiLogout className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownItem>
              </Dropdown>
            </div>
          </div>
          </div>
        </Navbar>

        {/* Sidebar - Desktop */}
        {!isMobile && (
          <Sidebar
            aria-label="Platform Admin sidebar"
            collapsed={sidebarCollapsed}
            className="fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] transition-transform"
          >
            <SidebarItems>
              <SidebarItemGroup>
                {adminMenuItems.map((item) => {
                  const Icon = item.icon || HiCog;
                  const isActive = pathname === item.path;
                  const IconComponent = (Icon && typeof Icon === 'function') ? Icon : HiCog;
                  
                  return (
                    <SidebarItem
                      key={item.path}
                      href={item.path}
                      icon={IconComponent}
                      active={isActive}
                      onClick={(e) => {
                        e.preventDefault();
                        router.push(item.path);
                      }}
                    >
                      {item.name}
                    </SidebarItem>
                  );
                })}
              </SidebarItemGroup>
            </SidebarItems>
          </Sidebar>
        )}

        {/* Sidebar - Mobile Drawer */}
        {isMobile && (
          <Drawer
            backdrop
            open={isSidebarOpen}
            onClose={() => setSidebarOpen(false)}
            className="top-16 z-40"
          >
            <Drawer.Items className="h-full">
              <Sidebar
                aria-label="Platform Admin sidebar"
                className="w-full [&>div]:bg-transparent [&>div]:p-0"
              >
                <SidebarItems>
                  <SidebarItemGroup>
                    {adminMenuItems.map((item) => {
                      const Icon = item.icon || HiCog;
                      const isActive = pathname === item.path;
                      const IconComponent = (Icon && typeof Icon === 'function') ? Icon : HiCog;
                      
                      return (
                        <SidebarItem
                          key={item.path}
                          href={item.path}
                          icon={IconComponent}
                          active={isActive}
                          onClick={(e) => {
                            e.preventDefault();
                            setSidebarOpen(false);
                            router.push(item.path);
                          }}
                        >
                          {item.name}
                        </SidebarItem>
                      );
                    })}
                  </SidebarItemGroup>
                </SidebarItems>
              </Sidebar>
            </Drawer.Items>
          </Drawer>
        )}

        {/* Main Content */}
        <div 
          className={`mt-16 transition-all duration-300 ${
            isMobile 
              ? 'ml-0' 
              : sidebarCollapsed 
                ? 'ml-16' 
                : 'ml-64'
          }`}
        >
          <main className="min-h-[calc(100vh-4rem)] bg-gray-50 p-6 dark:bg-gray-900">
            <TestDatabaseBanner />
            {children}
          </main>
        </div>

        {/* Global Search Modal */}
        <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      </div>
      </ErrorBoundary>
    </AdminRouteGuard>
  );
}
