"use client";

import React, { useMemo } from 'react';
import { useProperties } from '@/lib/hooks/useV2Data';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import { PageLayout } from '@/components/shared';
import { Spinner } from 'flowbite-react';
import { HiHome } from 'react-icons/hi';

export default function PortfolioProperties({ userRole, user }) {
  const { user: authUser, hasRole } = useV2Auth();
  const organizationId = hasRole('super_admin') ? undefined : (authUser?.user?.organization_id || undefined);
  const { data: properties, isLoading } = useProperties(organizationId);

  const columns = useMemo(() => [
    {
      title: 'Property Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Address',
      dataIndex: 'address_line1',
      key: 'address',
      render: (text, record) => (
        <div>
          <div>{record.address_line1}</div>
          {record.address_line2 && <div className="text-sm text-gray-500">{record.address_line2}</div>}
          <div className="text-sm text-gray-500">
            {[record.city, record.state, record.postal_code].filter(Boolean).join(', ')}
          </div>
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`px-2 py-1 rounded text-xs ${
          status === 'active' ? 'bg-green-100 text-green-800' :
          status === 'inactive' ? 'bg-gray-100 text-gray-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {status || 'N/A'}
        </span>
      ),
    },
  ], []);

  if (isLoading) {
    return (
      <PageLayout headerTitle="Properties">
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
          <HiHome className="h-5 w-5" />
          <span>Properties</span>
        </div>
      }
    >
      <FlowbiteTable
        dataSource={properties || []}
        columns={columns}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 25, showSizeChanger: true }}
      />
    </PageLayout>
  );
}

