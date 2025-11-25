"use client";

import React, { useMemo } from 'react';
import { useUnits } from '@/lib/hooks/useV2Data';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import { PageLayout } from '@/components/shared';
import { Spinner } from 'flowbite-react';
import { HiHome } from 'react-icons/hi';

export default function PortfolioUnits({ userRole, user }) {
  const { user: authUser, hasRole } = useV2Auth();
  const organizationId = hasRole('super_admin') ? undefined : (authUser?.user?.organization_id || undefined);
  const { data: units, isLoading } = useUnits(undefined, organizationId);

  const columns = useMemo(() => [
    {
      title: 'Unit Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Property',
      dataIndex: 'property',
      key: 'property',
      render: (property) => property?.name || 'N/A',
    },
    {
      title: 'Type',
      dataIndex: 'unit_type',
      key: 'unit_type',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`px-2 py-1 rounded text-xs ${
          status === 'occupied' ? 'bg-green-100 text-green-800' :
          status === 'vacant' ? 'bg-gray-100 text-gray-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {status || 'N/A'}
        </span>
      ),
    },
  ], []);

  if (isLoading) {
    return (
      <PageLayout headerTitle="Units">
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
          <span>Units</span>
        </div>
      }
    >
      <FlowbiteTable
        dataSource={units || []}
        columns={columns}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 25, showSizeChanger: true }}
      />
    </PageLayout>
  );
}

