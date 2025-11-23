"use client";

import { useState, useEffect } from 'react';
import { Tabs, Badge, Button, Card } from 'flowbite-react';
import { PageLayout } from '@/components/shared';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import FlowbitePopconfirm from '@/components/shared/FlowbitePopconfirm';
import {
  HiShieldCheck,
  HiRefresh,
  HiStop,
  HiUser,
} from 'react-icons/hi';

export default function AdminSecurityPage() {
  const [loading, setLoading] = useState(true);
  const [failedLogins, setFailedLogins] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchFailedLogins();
    fetchSessions();
  }, []);

  const fetchFailedLogins = async () => {
    setLoading(true);
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getFailedLogins();
      if (data.success) {
        setFailedLogins(data.data);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching failed logins:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessions = async () => {
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getSessions();
      if (data.success) {
        setSessions(data.data);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.revokeSession(sessionId);
      if (data.success) {
        fetchSessions();
      }
    } catch (err) {
      console.error('Error revoking session:', err);
    }
  };

  const failedLoginColumns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
    {
      title: 'Type',
      dataIndex: 'attemptType',
      key: 'attemptType',
      render: (type) => <Badge color="info">{type}</Badge>,
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Timestamp',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString(),
    },
  ];

  const sessionColumns = [
    {
      title: 'Admin',
      key: 'admin',
      render: (_, record) => {
        if (record.admin) {
          return `${record.admin.firstName} ${record.admin.lastName} (${record.admin.email})`;
        }
        return '-';
      },
    },
    {
      title: 'IP Address',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
    },
    {
      title: 'Last Activity',
      dataIndex: 'lastActivityAt',
      key: 'lastActivityAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Expires',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date) => new Date(date).toLocaleString(),
    },
    {
      title: 'Status',
      dataIndex: 'isRevoked',
      key: 'isRevoked',
      render: (revoked) => (
        <Badge color={revoked ? 'failure' : 'success'}>
          {revoked ? 'Revoked' : 'Active'}
        </Badge>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        !record.isRevoked && (
          <FlowbitePopconfirm
            title="Revoke this session?"
            onConfirm={() => handleRevokeSession(record.id)}
          >
            <Button size="xs" color="failure" title="Revoke">
              Revoke
            </Button>
          </FlowbitePopconfirm>
        )
      ),
    },
  ];

  const statsData = stats ? [
    {
      title: 'Failed Logins (24h)',
      value: stats.last24Hours,
      icon: HiUser,
      color: 'warning',
    },
    {
      title: 'Active Sessions',
      value: sessions.filter(s => !s.isRevoked).length,
      icon: HiShieldCheck,
      color: 'success',
    },
    {
      title: 'Top Suspicious IPs',
      value: stats.topIPs.length,
      icon: HiStop,
      color: 'failure',
    },
  ] : [];

  const [activeTab, setActiveTab] = useState('failed-logins');

  return (
    <PageLayout
      headerTitle={
        <div className="flex items-center gap-2">
          <HiShieldCheck className="h-5 w-5" />
          <span>Security Center</span>
        </div>
      }
      headerActions={[
        <Button
          key="refresh"
          color="gray"
          onClick={() => { fetchFailedLogins(); fetchSessions(); }}
        >
          <HiRefresh className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      ]}
    >
      {/* Statistics Cards */}
      {statsData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {statsData.map((stat, idx) => {
            const Icon = stat.icon;
            const colorClasses = {
              warning: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
              success: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
              failure: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400',
            };
            
            return (
              <Card key={idx} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
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

      <Card className="p-6">
        <Tabs
          aria-label="Security tabs"
          style="underline"
          onActiveTabChange={(tabIndex) => {
            const tabKeys = ['failed-logins', 'sessions', 'top-ips'];
            const selectedKey = tabKeys[tabIndex];
            if (selectedKey) {
              setActiveTab(selectedKey);
            }
          }}
        >
          <Tabs.Item active={activeTab === 'failed-logins'} title="Failed Login Attempts">
            <div className="pt-4">
              <FlowbiteTable
                columns={failedLoginColumns}
                dataSource={failedLogins}
                loading={loading}
                rowKey="id"
                pagination={{ pageSize: 50 }}
              />
            </div>
          </Tabs.Item>
          <Tabs.Item active={activeTab === 'sessions'} title="Active Sessions">
            <div className="pt-4">
              <FlowbiteTable
                columns={sessionColumns}
                dataSource={sessions}
                rowKey="id"
                pagination={{ pageSize: 50 }}
              />
            </div>
          </Tabs.Item>
          <Tabs.Item active={activeTab === 'top-ips'} title="Top Suspicious IPs">
            <div className="pt-4">
              {stats?.topIPs && stats.topIPs.length > 0 ? (
                <FlowbiteTable
                  dataSource={stats.topIPs.map((item, index) => ({ ...item, key: index }))}
                  columns={[
                    { title: 'IP Address', dataIndex: 'ip', key: 'ip' },
                    { title: 'Failed Attempts', dataIndex: 'count', key: 'count' },
                  ]}
                  pagination={false}
                />
              ) : (
                <div className="py-12 text-center text-gray-500 dark:text-gray-400">
                  No suspicious IPs found
                </div>
              )}
            </div>
          </Tabs.Item>
        </Tabs>
      </Card>
    </PageLayout>
  );
}

