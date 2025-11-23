"use client";

import { useState, useEffect } from 'react';
import { Card, Button, Alert, Spinner } from 'flowbite-react';
import {
  HiDatabase,
  HiUser,
  HiHome,
  HiDocumentText,
  HiRefresh,
  HiCheckCircle,
  HiXCircle,
} from 'react-icons/hi';

export default function AdminSystemPage() {
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getSystemHealth();

      if (data.success) {
        setHealth(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch system health');
      }
    } catch (err) {
      console.error('Error fetching health:', err);
      setError(err?.message || 'Failed to fetch system health');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !health) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error && !health) {
    return (
      <div className="p-6">
        <Alert color="failure">
          <div>
            <div className="font-medium">Error</div>
            <div className="text-sm mt-1">{error}</div>
          </div>
          <Button size="sm" color="gray" onClick={fetchHealth} className="mt-2">
            Retry
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HiDatabase className="h-6 w-6" />
          System Monitoring
        </h1>
        <Button color="gray" onClick={fetchHealth} disabled={loading}>
          <HiRefresh className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {health && (
        <div className="space-y-6">
          {/* Database Status */}
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  {health.database.healthy ? (
                    <HiCheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <HiXCircle className="h-5 w-5 text-red-600" />
                  )}
                  <span className="text-sm text-gray-600">Database Status</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">{health.database.status}</span>
                  <span className={`px-2 py-1 rounded text-sm ${health.database.healthy ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {health.database.responseTime}ms
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <HiUser className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">Active Sessions</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{health.metrics.system.activeSessions}</span>
              </div>
            </div>
          </Card>

          {/* User Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <HiUser className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Landlords</p>
                  <p className="text-2xl font-bold text-gray-900">{health.metrics.users.landlords}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <HiUser className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Tenants</p>
                  <p className="text-2xl font-bold text-gray-900">{health.metrics.users.tenants}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <HiUser className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{health.metrics.users.total}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Property Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <HiHome className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Properties</p>
                  <p className="text-2xl font-bold text-gray-900">{health.metrics.properties.total}</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <HiDocumentText className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Active Leases</p>
                  <p className="text-2xl font-bold text-gray-900">{health.metrics.properties.activeLeases}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Recent Activity */}
          {health.metrics.recentActivity && (
            <Card>
              <h3 className="text-lg font-semibold mb-4">Recent Activity (Last 24 Hours)</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Logins:</span>
                  <span className="font-medium">{health.metrics.recentActivity.logins || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">New Users:</span>
                  <span className="font-medium">{health.metrics.recentActivity.newUsers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">New Properties:</span>
                  <span className="font-medium">{health.metrics.recentActivity.newProperties || 0}</span>
                </div>
              </div>
            </Card>
          )}

          {/* System Info */}
          {health.system && (
            <Card>
              <h3 className="text-lg font-semibold mb-4">System Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Tables:</span>
                  <span className="font-medium">{health.system.tableCount || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">
                    {health.system.lastUpdated ? new Date(health.system.lastUpdated).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
