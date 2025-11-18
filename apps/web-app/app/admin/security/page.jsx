"use client";

import { useState, useEffect } from 'react';
import {
  Table,
  Tabs,
  Tag,
  Popconfirm,
} from 'antd';
import { ActionButton, IconButton } from '@/components/shared/buttons';
import { PageLayout, TableWrapper, StatCard } from '@/components/shared';
import {
  SafetyOutlined,
  ReloadOutlined,
  StopOutlined,
  UserOutlined,
} from '@ant-design/icons';

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
      render: (type) => <Tag>{type}</Tag>,
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
        <Tag color={revoked ? 'red' : 'green'}>{revoked ? 'Revoked' : 'Active'}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        !record.isRevoked && (
          <Popconfirm
            title="Revoke this session?"
            onConfirm={() => handleRevokeSession(record.id)}
          >
            <ActionButton
              action="delete"
              size="small"
              tooltip="Revoke"
              showText={true}
              text="Revoke"
            />
          </Popconfirm>
        )
      ),
    },
  ];

  const statsData = stats ? [
    {
      title: 'Failed Logins (24h)',
      value: stats.last24Hours,
      prefix: <UserOutlined />,
    },
    {
      title: 'Active Sessions',
      value: sessions.filter(s => !s.isRevoked).length,
      prefix: <SafetyOutlined />,
    },
    {
      title: 'Top Suspicious IPs',
      value: stats.topIPs.length,
      prefix: <StopOutlined />,
    },
  ] : [];

  return (
    <PageLayout
      headerTitle={<><SafetyOutlined /> Security Center</>}
      headerActions={[
        <IconButton
          key="refresh"
          icon={<ReloadOutlined />}
          onClick={() => { fetchFailedLogins(); fetchSessions(); }}
          tooltip="Refresh"
        />
      ]}
      stats={statsData}
      statsCols={3}
    >
      <Tabs
        items={[
          {
            key: 'failed-logins',
            label: 'Failed Login Attempts',
            children: (
              <TableWrapper>
                <Table
                  columns={failedLoginColumns}
                  dataSource={failedLogins}
                  loading={loading}
                  rowKey="id"
                  pagination={{ pageSize: 50 }}
                />
              </TableWrapper>
            ),
          },
          {
            key: 'sessions',
            label: 'Active Sessions',
            children: (
              <TableWrapper>
                <Table
                  columns={sessionColumns}
                  dataSource={sessions}
                  rowKey="id"
                  pagination={{ pageSize: 50 }}
                />
              </TableWrapper>
            ),
          },
          {
            key: 'top-ips',
            label: 'Top Suspicious IPs',
            children: (
              <TableWrapper>
                {stats?.topIPs && stats.topIPs.length > 0 ? (
                  <Table
                    dataSource={stats.topIPs.map((item, index) => ({ ...item, key: index }))}
                    columns={[
                      { title: 'IP Address', dataIndex: 'ip', key: 'ip' },
                      { title: 'Failed Attempts', dataIndex: 'count', key: 'count' },
                    ]}
                    pagination={false}
                  />
                ) : (
                  <div style={{ padding: '24px', textAlign: 'center', color: '#999' }}>
                    No suspicious IPs found
                  </div>
                )}
              </TableWrapper>
            ),
          },
        ]}
      />
    </PageLayout>
  );
}

