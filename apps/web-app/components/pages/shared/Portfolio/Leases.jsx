"use client";

import React, { useMemo } from 'react';
import { useLeases } from '@/lib/hooks/useV2Data';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import { PageLayout } from '@/components/shared';
import { Spinner } from 'flowbite-react';
import { HiDocumentText } from 'react-icons/hi';
import dayjs from 'dayjs';

export default function PortfolioLeases({ userRole, user }) {
  const { user: authUser, hasRole } = useV2Auth();
  const organizationId = hasRole('super_admin') ? undefined : (authUser?.user?.organization_id || undefined);
  const { data: leases, isLoading } = useLeases({ organization_id: organizationId });

  const columns = useMemo(() => [
    {
      title: 'Property',
      dataIndex: 'unit',
      key: 'property',
      render: (unit) => unit?.property?.name || 'N/A',
    },
    {
      title: 'Unit',
      dataIndex: 'unit',
      key: 'unit',
      render: (unit) => unit?.name || 'N/A',
    },
    {
      title: 'Start Date',
      dataIndex: 'start_date',
      key: 'start_date',
      render: (date) => date ? dayjs(date).format('MMM D, YYYY') : 'N/A',
    },
    {
      title: 'End Date',
      dataIndex: 'end_date',
      key: 'end_date',
      render: (date) => date ? dayjs(date).format('MMM D, YYYY') : 'N/A',
    },
    {
      title: 'Rent Amount',
      dataIndex: 'rent_amount',
      key: 'rent_amount',
      render: (amount) => amount ? `$${parseFloat(amount).toLocaleString()}` : 'N/A',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={`px-2 py-1 rounded text-xs ${
          status === 'active' ? 'bg-green-100 text-green-800' :
          status === 'expired' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {status || 'N/A'}
        </span>
      ),
    },
  ], []);

  if (isLoading) {
    return (
      <PageLayout headerTitle="Leases">
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
          <HiDocumentText className="h-5 w-5" />
          <span>Leases</span>
        </div>
      }
    >
      <FlowbiteTable
        dataSource={leases || []}
        columns={columns}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 25, showSizeChanger: true }}
      />
    </PageLayout>
  );
}

