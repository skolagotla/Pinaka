"use client";

import React, { useMemo } from 'react';
import { useOrganizations } from '@/lib/hooks/useV2Data';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import { PageLayout } from '@/components/shared';
import { Spinner } from 'flowbite-react';
import { HiOfficeBuilding } from 'react-icons/hi';

export default function PortfolioPMCs({ user }) {
  // Super admin sees all organizations (PMCs)
  const { data: organizations, isLoading } = useOrganizations();

  const columns = useMemo(() => [
    {
      title: 'Organization Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
          {type || 'PMC'}
        </span>
      ),
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
      <PageLayout headerTitle="PMCs">
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
          <HiOfficeBuilding className="h-5 w-5" />
          <span>PMCs</span>
        </div>
      }
    >
      <FlowbiteTable
        dataSource={organizations || []}
        columns={columns}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 25, showSizeChanger: true }}
      />
    </PageLayout>
  );
}

