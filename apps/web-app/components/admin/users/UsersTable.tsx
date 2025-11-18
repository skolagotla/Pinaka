/**
 * Users Table Component
 * Extracted from admin/users/page.jsx for better code organization
 */

"use client";

import { Table, Tag, Space, Button, Tooltip } from 'antd';
import { EditOutlined, ReloadOutlined } from '@ant-design/icons';
import { PhoneDisplay } from '@/components/shared';
import { formatPhoneNumber } from '@/lib/utils/formatters';
import { getRoleLabel } from '@/lib/rbac/resourceLabels';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: string;
  rbacRoles?: Array<{ role: { name: string; displayName: string } }>;
}

interface UsersTableProps {
  users: User[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  onEdit: (user: User) => void;
  onRefresh: () => void;
}

export default function UsersTable({
  users,
  loading,
  pagination,
  onEdit,
  onRefresh,
}: UsersTableProps) {
  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
    },
    {
      title: 'Name',
      key: 'name',
      render: (record: User) => {
        if (record.firstName && record.lastName) {
          return `${record.firstName} ${record.lastName}`;
        }
        if (record.companyName) {
          return record.companyName;
        }
        return '-';
      },
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => phone ? <PhoneDisplay phone={phone} /> : '-',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string, record: User) => {
        const roleLabel = getRoleLabel(role);
        const rbacRoles = record.rbacRoles || [];
        
        return (
          <Space direction="vertical" size="small">
            <Tag color={role === 'admin' ? 'red' : role === 'pmc' ? 'blue' : 'green'}>
              {roleLabel}
            </Tag>
            {rbacRoles.length > 0 && (
              <Space size="small" wrap>
                {rbacRoles.map((ur, idx) => (
                  <Tag key={idx} color="purple" style={{ fontSize: '11px' }}>
                    {ur.role.displayName || ur.role.name}
                  </Tag>
                ))}
              </Space>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          active: 'green',
          inactive: 'default',
          locked: 'red',
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: User) => (
        <Space>
          <Tooltip title="Edit User">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      loading={loading}
      rowKey="id"
      pagination={{
        current: pagination.page,
        pageSize: pagination.limit,
        total: pagination.total,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} users`,
      }}
      scroll={{ x: 'max-content' }}
    />
  );
}

