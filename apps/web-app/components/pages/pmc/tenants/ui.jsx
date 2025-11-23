"use client";

import { useRouter } from "next/navigation";
import { Button, TextInput, Badge } from 'flowbite-react';
import { 
  HiUserGroup, 
  HiHome, 
  HiDocumentText,
  HiEye
} from 'react-icons/hi';
import { useState, useMemo } from 'react';
import { PageLayout, TableWrapper } from '@/components/shared';
import FlowbiteTable from '@/components/shared/FlowbiteTable';

export default function PMCTenantsClient({ pmc, tenants }) {
  const router = useRouter();
  const [searchText, setSearchText] = useState('');

  const filteredTenants = useMemo(() => {
    if (!searchText) return tenants;
    const lowerSearch = searchText.toLowerCase();
    return tenants.filter(tenant => {
      const name = `${tenant.firstName} ${tenant.lastName}`.toLowerCase();
      const email = (tenant.email || '').toLowerCase();
      return name.includes(lowerSearch) || email.includes(lowerSearch);
    });
  }, [tenants, searchText]);

  const columns = [
    {
      title: 'Tenant',
      key: 'tenant',
      render: (_, record) => (
        <div>
          <span className="font-semibold">
            {record.firstName} {record.lastName}
          </span>
          <div className="text-xs text-gray-500">
            {record.email}
          </div>
          {record.phone && (
            <div className="text-xs text-gray-500">
              {record.phone}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Properties',
      key: 'properties',
      render: (_, record) => {
        const uniqueProperties = new Set(
          (record.leases || []).map(l => l.property?.id).filter(Boolean)
        );
        return (
          <div className="flex items-center gap-2">
            <Badge color="blue" icon={HiHome}>{uniqueProperties.size}</Badge>
            <span className="text-gray-500 text-sm">
              {uniqueProperties.size} propert{uniqueProperties.size !== 1 ? 'ies' : 'y'}
            </span>
          </div>
        );
      },
    },
    {
      title: 'Active Leases',
      key: 'leases',
      render: (_, record) => (
        <Badge color="success" icon={HiDocumentText}>
          {record.leases?.length || 0}
        </Badge>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          color="blue"
          size="sm"
          onClick={() => router.push(`/tenants/${record.id}`)}
          className="flex items-center gap-2"
        >
          <HiEye className="h-4 w-4" />
          View Details
        </Button>
      ),
    },
  ];

  // Calculate statistics
  const totalLeases = filteredTenants.reduce((sum, t) => sum + (t.leases?.length || 0), 0);
  const totalProperties = new Set(filteredTenants.flatMap(t => (t.leases || []).map(l => l.property?.id).filter(Boolean))).size;

  const stats = [
    {
      title: 'Total Tenants',
      value: filteredTenants.length,
      prefix: <HiUserGroup className="h-5 w-5" />,
    },
    {
      title: 'Total Leases',
      value: totalLeases,
      prefix: <HiDocumentText className="h-5 w-5" />,
    },
    {
      title: 'Properties',
      value: totalProperties,
      prefix: <HiHome className="h-5 w-5" />,
    },
  ];

  return (
    <PageLayout
      headerTitle={
        <div className="flex items-center gap-2">
          <HiUserGroup className="h-5 w-5" />
          <span>Tenants</span>
        </div>
      }
      headerActions={[
        <TextInput
          key="search"
          type="text"
          placeholder="Search tenants..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-72"
          icon={HiEye}
        />
      ]}
      stats={stats}
      statsCols={3}
    >
      <TableWrapper>
        <FlowbiteTable
          dataSource={filteredTenants}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 20, showSizeChanger: true }}
        />
      </TableWrapper>
    </PageLayout>
  );
}
