"use client";

import { useRouter } from "next/navigation";
import { Button, Badge } from 'flowbite-react';
import { 
  HiUserGroup, HiHome, HiCheckCircle,
  HiXCircle, HiEye
} from 'react-icons/hi';
import { PageLayout, TableWrapper, FlowbiteTable } from '@/components/shared';
import { renderStatus } from '@/components/shared/TableRenderers';
import { STANDARD_COLUMNS, customizeColumn } from '@/lib/constants/standard-columns';

export default function PMCLandlordsClient({ pmc, relationships }) {
  const router = useRouter();

  const activeRelationships = relationships.filter(r => r.status === 'active');
  const suspendedRelationships = relationships.filter(r => r.status === 'suspended');
  const terminatedRelationships = relationships.filter(r => r.status === 'terminated');

  const columns = [
    {
      header: 'Landlord',
      accessorKey: 'landlord',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold">
            {row.original.landlord.firstName} {row.original.landlord.lastName}
          </div>
          <div className="text-sm text-gray-500">
            {row.original.landlord.email}
          </div>
        </div>
      ),
    },
    {
      header: 'Properties',
      accessorKey: 'properties',
      cell: ({ row }) => (
        <Badge color="blue" icon={HiHome}>
          {row.original.landlord.propertyCount || 0}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status;
        const statusMap = {
          active: 'Active',
          suspended: 'Suspended',
          terminated: 'Cancelled'
        };
        return renderStatus(statusMap[status] || status, {
          customColors: {
            'Active': 'green',
            'Suspended': 'orange',
            'Cancelled': 'red'
          }
        });
      },
    },
    {
      header: 'Started',
      accessorKey: 'startedAt',
      cell: ({ row }) => new Date(row.original.startedAt).toLocaleDateString(),
    },
    {
      header: 'Ended',
      accessorKey: 'endedAt',
      cell: ({ row }) => row.original.endedAt ? new Date(row.original.endedAt).toLocaleDateString() : '-',
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: ({ row }) => (
        <Button
          color="light"
          onClick={() => router.push(`/landlords/${row.original.landlordId}`)}
        >
          <HiEye className="mr-2 h-4 w-4" />
          View Details
        </Button>
      ),
    },
  ];

  const stats = [
    {
      title: 'Total Relationships',
      value: relationships.length,
      prefix: <HiUserGroup className="h-5 w-5" />,
    },
    {
      title: 'Active',
      value: activeRelationships.length,
      prefix: <HiCheckCircle className="h-5 w-5" />,
      valueStyle: { color: '#52c41a' },
    },
    {
      title: 'Suspended',
      value: suspendedRelationships.length,
      prefix: <HiXCircle className="h-5 w-5" />,
      valueStyle: { color: '#faad14' },
    },
    {
      title: 'Total Properties',
      value: relationships.reduce((sum, r) => sum + (r.landlord.propertyCount || 0), 0),
      prefix: <HiHome className="h-5 w-5" />,
    },
  ];

  return (
    <PageLayout
      headerTitle={<><HiUserGroup className="inline mr-2" /> Managed Landlords</>}
      stats={stats}
      statsCols={4}
    >
      <TableWrapper>
        <FlowbiteTable
          data={relationships}
          columns={columns}
          keyField="id"
          pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Total ${total} relationships` }}
        />
      </TableWrapper>
    </PageLayout>
  );
}
