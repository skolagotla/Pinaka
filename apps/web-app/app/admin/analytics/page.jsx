"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, Button, Badge, Select, Spinner, Alert } from 'flowbite-react';
import { PageLayout } from '@/components/shared';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import {
  HiChartBar,
  HiUser,
  HiHome,
  HiDocumentText,
  HiCog,
  HiRefresh,
} from 'react-icons/hi';

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30d');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setAnalytics(data.data);
      } else {
        setError(data.error || 'Failed to fetch analytics');
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to fetch analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const recentActivityColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => date ? new Date(date).toLocaleString() : '-',
    },
    {
      title: 'Admin',
      key: 'admin',
      render: (_, record) => {
        if (record?.admin) {
          return `${record.admin.firstName} ${record.admin.lastName}`;
        }
        return record?.googleEmail || 'System';
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      render: (action) => action ? <Badge color="info">{action}</Badge> : '-',
    },
    {
      title: 'Resource',
      dataIndex: 'resource',
      key: 'resource',
      render: (resource) => resource || '-',
    },
    {
      title: 'Status',
      dataIndex: 'success',
      key: 'success',
      render: (success) => (
        <Badge color={success ? 'success' : 'failure'}>
          {success ? 'Success' : 'Failed'}
        </Badge>
      ),
    },
  ];

  if (loading && !analytics) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  return (
    <PageLayout
      headerTitle={
        <div className="flex items-center gap-2">
          <HiChartBar className="h-5 w-5" />
          <span>Analytics & Reporting</span>
        </div>
      }
      headerActions={[
        <Select
          key="period"
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="w-40"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="1y">Last Year</option>
        </Select>,
        <Button
          key="refresh"
          color="gray"
          onClick={fetchAnalytics}
          disabled={loading}
        >
          <HiRefresh className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      ]}
      contentStyle={{ maxWidth: 1400, margin: '0 auto' }}
    >

      {analytics && analytics.overview ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Total Landlords
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.overview?.users?.landlords || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                  <HiUser className="h-6 w-6" />
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Total Tenants
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.overview?.users?.tenants || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400">
                  <HiUser className="h-6 w-6" />
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Total Properties
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.overview?.properties?.total || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                  <HiHome className="h-6 w-6" />
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Active Leases
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.overview?.leases?.active || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400">
                  <HiDocumentText className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Total Maintenance Requests
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.overview?.maintenance?.total || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                  <HiCog className="h-6 w-6" />
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Open Maintenance
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.overview?.maintenance?.open || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                  <HiCog className="h-6 w-6" />
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Total Documents
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {analytics.overview?.documents?.total || 0}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                  <HiDocumentText className="h-6 w-6" />
                </div>
              </div>
            </Card>
          </div>

          {analytics.activity && (
            <>
              <Card className="p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Actions</h3>
                <FlowbiteTable
                  dataSource={analytics.activity.topActions || []}
                  columns={[
                    { title: 'Action', dataIndex: 'action', key: 'action' },
                    { title: 'Count', dataIndex: 'count', key: 'count' },
                  ]}
                  pagination={false}
                  rowKey="action"
                />
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                <FlowbiteTable
                  columns={recentActivityColumns}
                  dataSource={analytics.activity.recent || []}
                  pagination={false}
                  rowKey="id"
                />
              </Card>
            </>
          )}
        </>
      ) : error ? (
        <Alert color="failure" className="mb-6">
          <div>
            <div className="font-medium">Error</div>
            <div className="text-sm mt-1">{error}</div>
            <Button
              color="gray"
              size="sm"
              onClick={fetchAnalytics}
              className="mt-3"
            >
              Retry
            </Button>
          </div>
        </Alert>
      ) : (
        <Card className="p-6">
          <p className="text-gray-500 dark:text-gray-400">
            No analytics data available. Please refresh to load data.
          </p>
        </Card>
      )}
    </PageLayout>
  );
}

