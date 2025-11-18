/**
 * Users Filters Component
 * Extracted from admin/users/page.jsx for better code organization
 */

"use client";

import { Space, Input, Select, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

interface UsersFiltersProps {
  role: string;
  status: string;
  search: string;
  onRoleChange: (role: string) => void;
  onStatusChange: (status: string) => void;
  onSearchChange: (search: string) => void;
  onRefresh: () => void;
}

export default function UsersFilters({
  role,
  status,
  search,
  onRoleChange,
  onStatusChange,
  onSearchChange,
  onRefresh,
}: UsersFiltersProps) {
  return (
    <Space wrap style={{ marginBottom: 16, width: '100%' }}>
      <Input
        placeholder="Search by email, name..."
        prefix={<SearchOutlined />}
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        style={{ width: 300 }}
        allowClear
      />
      <Select
        placeholder="Filter by role"
        value={role}
        onChange={onRoleChange}
        style={{ width: 150 }}
      >
        <Select.Option value="all">All Roles</Select.Option>
        <Select.Option value="admin">Admin</Select.Option>
        <Select.Option value="pmc">PMC</Select.Option>
        <Select.Option value="landlord">Landlord</Select.Option>
        <Select.Option value="tenant">Tenant</Select.Option>
      </Select>
      <Select
        placeholder="Filter by status"
        value={status}
        onChange={onStatusChange}
        style={{ width: 150 }}
      >
        <Select.Option value="all">All Status</Select.Option>
        <Select.Option value="active">Active</Select.Option>
        <Select.Option value="inactive">Inactive</Select.Option>
        <Select.Option value="locked">Locked</Select.Option>
      </Select>
      <Button
        icon={<ReloadOutlined />}
        onClick={onRefresh}
      >
        Refresh
      </Button>
    </Space>
  );
}

