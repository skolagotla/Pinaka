"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Alert, Spinner, Badge } from 'flowbite-react';
import {
  HiHome,
  HiUser,
  HiDatabase,
  HiDocumentText,
  HiCog,
  HiShieldCheck,
  HiLockClosed,
  HiChartBar,
  HiUsers,
  HiOfficeBuilding,
  HiKey,
  HiMail,
  HiDownload,
  HiBell,
  HiCheckCircle,
  HiXCircle,
  HiArrowRight,
  HiTrendingUp,
  HiArrowUp,
  HiArrowDown,
} from 'react-icons/hi';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAdmin();
    fetchStats();
  }, []);

  const fetchAdmin = async () => {
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getCurrentUser();

      if (data.success) {
        setAdmin(data.user);
      } else {
        router.push('/admin/login');
      }
    } catch (err) {
      console.error('Error fetching admin:', err);
      setError(err?.message || 'An error occurred');
      router.push('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getDashboardStats?.();
      if (data?.success) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
      // Stats are optional, don't fail the page
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert color="failure">
          <div>
            <div className="font-medium">Error</div>
            <div className="text-sm mt-1">{error}</div>
          </div>
        </Alert>
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  const statsData = stats ? [
    {
      title: 'Total Users',
      value: stats.totalUsers || 0,
      icon: HiUsers,
      color: 'blue',
      trend: '+12%',
      trendUp: true,
    },
    {
      title: 'Total Properties',
      value: stats.totalProperties || 0,
      icon: HiOfficeBuilding,
      color: 'green',
      trend: '+8%',
      trendUp: true,
    },
    {
      title: 'Active Leases',
      value: stats.activeLeases || 0,
      icon: HiDocumentText,
      color: 'purple',
      trend: '+5%',
      trendUp: true,
    },
    {
      title: 'Open Tickets',
      value: stats.openTickets || 0,
      icon: HiMail,
      color: stats.openTickets > 0 ? 'red' : 'green',
      trend: stats.openTickets > 0 ? '+3' : '0',
      trendUp: stats.openTickets > 0,
    },
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header with Flowbite Pro styling */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Welcome back, <span className="font-semibold text-gray-900 dark:text-white">{admin.firstName} {admin.lastName}</span> — Platform Administrator
            </p>
          </div>
          <Button color="blue" size="sm" className="hidden md:flex items-center gap-2">
            <HiTrendingUp className="h-4 w-4" />
            View Analytics
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Statistics Cards with Flowbite Pro enhanced styling */}
        {statsData.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statsData.map((stat, idx) => {
              const Icon = stat.icon;
              const colorClasses = {
                blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
                green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
                purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
                red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
              };
              
              return (
                <Card key={idx} className="p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                        {stat.title}
                      </p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {stat.value.toLocaleString()}
                        </p>
                        {stat.trend && (
                          <div className={`flex items-center gap-1 text-xs font-medium ${
                            stat.trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            {stat.trendUp ? (
                              <HiArrowUp className="h-3 w-3" />
                            ) : (
                              <HiArrowDown className="h-3 w-3" />
                            )}
                            {stat.trend}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg ${colorClasses[stat.color]}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Admin Information - Flowbite Pro Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Admin Information</h3>
            <Button color="light" size="xs" onClick={() => router.push('/admin/settings')}>
              Edit Profile
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Email</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{admin.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Role</p>
              <Badge color="blue" className="w-fit">
                {admin.role || 'Admin'}
              </Badge>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Status</p>
              <Badge color={admin.isActive ? 'success' : 'failure'} className="w-fit">
                {admin.isActive ? (
                  <>
                    <HiCheckCircle className="h-3 w-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <HiXCircle className="h-3 w-3 mr-1" />
                    Inactive
                  </>
                )}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Quick Actions with Flowbite Pro enhanced cards */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Access frequently used features</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card 
              className="p-6 hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 group"
              onClick={() => router.push('/admin/users')}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                  <HiUser className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Users</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage user accounts and permissions</p>
                </div>
                <HiArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
              </div>
            </Card>

            <Card 
              className="p-6 hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-green-500 dark:hover:border-green-500 group"
              onClick={() => router.push('/admin/portfolio')}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                  <HiOfficeBuilding className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Portfolio</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View properties and assets</p>
                </div>
                <HiArrowRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors flex-shrink-0" />
              </div>
            </Card>

            <Card 
              className="p-6 hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 group"
              onClick={() => router.push('/admin/audit-logs')}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                  <HiDocumentText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Audit Logs</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View system activity logs</p>
                </div>
                <HiArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex-shrink-0" />
              </div>
            </Card>

            <Card 
              className="p-6 hover:shadow-xl transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-gray-500 dark:hover:border-gray-500 group"
              onClick={() => router.push('/admin/settings')}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg group-hover:bg-gray-200 dark:group-hover:bg-gray-600 transition-colors">
                  <HiCog className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Settings</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Configure platform settings</p>
                </div>
                <HiArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-400 transition-colors flex-shrink-0" />
              </div>
            </Card>
          </div>
        </div>

        {/* Quick Links with Flowbite Pro enhanced styling */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Links</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Navigate to key sections</p>
            </div>
            <Badge color="blue" size="sm">8 Links</Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link 
              href="/admin/rbac" 
              className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md group"
            >
              <div className="p-2.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <HiLockClosed className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">RBAC Settings</span>
            </Link>
            <Link 
              href="/admin/analytics" 
              className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700 hover:shadow-md group"
            >
              <div className="p-2.5 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
                <HiChartBar className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Analytics</span>
            </Link>
            <Link 
              href="/admin/verifications" 
              className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md group"
            >
              <div className="p-2.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                <HiShieldCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Verifications</span>
            </Link>
            <Link 
              href="/admin/library" 
              className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-yellow-300 dark:hover:border-yellow-700 hover:shadow-md group"
            >
              <div className="p-2.5 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/50 transition-colors">
                <HiDocumentText className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Library</span>
            </Link>
            <Link 
              href="/admin/support-tickets" 
              className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700 hover:shadow-md group"
            >
              <div className="p-2.5 bg-red-100 dark:bg-red-900/30 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                <HiMail className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Support Tickets</span>
            </Link>
            <Link 
              href="/admin/notifications" 
              className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md group"
            >
              <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg group-hover:bg-indigo-200 dark:group-hover:bg-indigo-900/50 transition-colors">
                <HiBell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Notifications</span>
            </Link>
            <Link 
              href="/admin/api-keys" 
              className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-700 hover:shadow-md group"
            >
              <div className="p-2.5 bg-pink-100 dark:bg-pink-900/30 rounded-lg group-hover:bg-pink-200 dark:group-hover:bg-pink-900/50 transition-colors">
                <HiKey className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">API Keys</span>
            </Link>
            <Link 
              href="/admin/data-export" 
              className="flex flex-col items-center gap-3 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 border border-gray-200 dark:border-gray-700 hover:border-teal-300 dark:hover:border-teal-700 hover:shadow-md group"
            >
              <div className="p-2.5 bg-teal-100 dark:bg-teal-900/30 rounded-lg group-hover:bg-teal-200 dark:group-hover:bg-teal-900/50 transition-colors">
                <HiDownload className="h-5 w-5 text-teal-600 dark:text-teal-400" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">Data Export</span>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
