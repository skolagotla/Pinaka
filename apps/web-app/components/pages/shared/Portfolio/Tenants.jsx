"use client";

import React, { useMemo } from 'react';
import { useTenants } from '@/lib/hooks/useV2Data';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import { PageLayout } from '@/components/shared';
import { Spinner } from 'flowbite-react';
import { HiUser } from 'react-icons/hi';

export default function PortfolioTenants({ userRole, user }) {
  const { user: authUser, hasRole } = useV2Auth();
  const organizationId = hasRole('super_admin') ? undefined : (authUser?.user?.organization_id || undefined);
  const { data: tenants, isLoading } = useTenants(organizationId);

  const columns = useMemo(() => [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`px-2 py-1 rounded text-xs ${
          status === 'active' ? 'bg-green-100 text-green-800' :
          status === 'approved' ? 'bg-blue-100 text-blue-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status || 'N/A'}
        </span>
      ),
    },
  ], []);

  if (isLoading) {
    return (
      <PageLayout headerTitle="Tenants">
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
          <HiUser className="h-5 w-5" />
          <span>Tenants</span>
        </div>
      }
    >
      <FlowbiteTable
        dataSource={tenants || []}
        columns={columns}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 25, showSizeChanger: true }}
      />
    </PageLayout>
  );
}

