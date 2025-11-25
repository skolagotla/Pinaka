"use client";

import React, { useMemo } from 'react';
import { useUsers } from '@/lib/hooks/useV2Data';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import { PageLayout } from '@/components/shared';
import { Spinner } from 'flowbite-react';
import { HiUsers, HiLockClosed } from 'react-icons/hi';

export default function PortfolioAdministrators({ user }) {
  // Super admin sees all users with super_admin role
  const { data: users, isLoading } = useUsers(undefined);

  const administrators = useMemo(() => {
    if (!users) return [];
    return users.filter(user => 
      user.roles?.some(role => role.name === 'super_admin')
    );
  }, [users]);

  const columns = useMemo(() => [
    {
      title: 'Name',
      dataIndex: 'full_name',
      key: 'name',
      render: (name, record) => name || record.email || 'N/A',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`px-2 py-1 rounded text-xs ${
          status === 'active' ? 'bg-green-100 text-green-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status || 'Active'}
        </span>
      ),
    },
  ], []);

  if (isLoading) {
    return (
      <PageLayout headerTitle="Administrators">
        <div className="flex justify-center items-center py-12">
          <Spinner size="xl" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      headerTitle={
        <div className="flex items-center gap-2">
          <HiUsers className="h-5 w-5" />
          <span>Administrators</span>
        </div>
      }
    >
      <FlowbiteTable
        dataSource={administrators}
        columns={columns}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 25, showSizeChanger: true }}
      />
    </PageLayout>
  );
}

