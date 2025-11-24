"use client";

import React, { useState, useEffect } from "react";
import { 
  Button, Badge, Select
} from 'flowbite-react';
import { 
  HiHome, HiUserGroup, HiDocumentText,
  HiEye
} from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { PageLayout, EmptyState, TableWrapper, FlowbiteTable } from '@/components/shared';

export default function PMCPropertiesClient({ pmcId, initialProperties, pmcRelationships }) {
  const router = useRouter();
  const [properties, setProperties] = useState(initialProperties || []);
  const [selectedLandlord, setSelectedLandlord] = useState('all');
  const [mounted, setMounted] = useState(false);
  
  // Fix hydration mismatch - only render after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get unique landlords for filter and form
  const landlords = (pmcRelationships || [])
    .filter(rel => rel.landlord) // Filter out any relationships without landlord data
    .map(rel => ({
      id: rel.landlordId,
      name: `${rel.landlord.firstName} ${rel.landlord.lastName}`,
      email: rel.landlord.email,
    }));

  // Filter properties by selected landlord
  const filteredProperties = selectedLandlord === 'all' 
    ? properties 
    : properties.filter(p => {
        // Ensure both values are strings for comparison
        const propertyLandlordId = String(p.landlordId || '');
        const selectedId = String(selectedLandlord || '');
        return propertyLandlordId === selectedId;
      });

  const columns = [
    {
      header: 'Property',
      accessorKey: 'property',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold">{row.original.addressLine1 || row.original.propertyName}</div>
          {row.original.propertyName && row.original.addressLine1 && (
            <div className="text-sm text-gray-500">
              {row.original.propertyName}
            </div>
          )}
          <div className="text-sm text-gray-500">
            {row.original.city}, {row.original.provinceState} {row.original.postalZip}
          </div>
        </div>
      ),
    },
    {
      header: 'Owned By',
      accessorKey: 'landlord',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold">
            {row.original.landlord ? `${row.original.landlord.firstName} ${row.original.landlord.lastName}` : 'N/A'}
          </div>
          {row.original.landlord?.email && (
            <div className="text-sm text-gray-500">
              {row.original.landlord.email}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Type',
      accessorKey: 'propertyType',
      cell: ({ row }) => <Badge>{row.original.propertyType || 'N/A'}</Badge>,
    },
    {
      header: 'Units',
      accessorKey: 'units',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge color="blue" icon={HiHome}>
            {row.original.units?.length || 0}
          </Badge>
          <span className="text-sm text-gray-500">
            {row.original.units?.filter(u => u.leases?.length > 0).length || 0} occupied
          </span>
        </div>
      ),
    },
    {
      header: 'Active Leases',
      accessorKey: 'leases',
      cell: ({ row }) => {
        const leaseCount = row.original.units?.reduce((sum, unit) => sum + (unit.leases?.length || 0), 0) || 0;
        return <Badge color="green">{leaseCount}</Badge>;
      },
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: ({ row }) => (
        <Button
          color="light"
          onClick={() => router.push(`/properties/${row.original.id}`)}
        >
          <HiEye className="mr-2 h-4 w-4" />
          View Details
        </Button>
      ),
    },
  ];

  // Calculate statistics
  const totalUnits = filteredProperties.reduce((sum, p) => sum + (p.units?.length || 0), 0);
  const totalLeases = filteredProperties.reduce((sum, p) => {
    return sum + (p.units?.reduce((unitSum, unit) => {
      return unitSum + (unit.leases?.length || 0);
    }, 0) || 0);
  }, 0);

  // Prepare statistics
  const stats = [
    {
      title: 'Properties',
      value: filteredProperties.length,
      prefix: <HiHome className="h-5 w-5" />,
      valueStyle: { color: '#1890ff' },
    },
    {
      title: 'Total Units',
      value: totalUnits,
      prefix: <HiHome className="h-5 w-5" />,
      valueStyle: { color: '#52c41a' },
    },
    {
      title: 'Active Leases',
      value: totalLeases,
      prefix: <HiDocumentText className="h-5 w-5" />,
      valueStyle: { color: '#722ed1' },
    },
    {
      title: 'Landlords',
      value: landlords.length,
      prefix: <HiUserGroup className="h-5 w-5" />,
      valueStyle: { color: '#faad14' },
    },
  ];

  // Prepare header actions - Searchable Landlord Filter (Always show for PMC users)
  // Only render after mount to prevent hydration mismatch
  const headerActions = mounted ? (
    <div className="flex items-center gap-2">
      <HiUserGroup className="h-5 w-5 text-blue-600" />
      <Select
        value={selectedLandlord}
        onChange={setSelectedLandlord}
        className="min-w-[300px]"
      >
        <option value="all">All Landlords {landlords.length > 0 && `(${landlords.length})`}</option>
        {landlords.length > 0 ? (
          landlords.map(landlord => (
            <option key={landlord.id} value={landlord.id}>
              {landlord.name} ({landlord.email})
            </option>
          ))
        ) : (
          <option value="none" disabled>No landlords available</option>
        )}
      </Select>
    </div>
  ) : null;

  return (
    <PageLayout
      headerTitle={<><HiHome className="inline mr-2" /> Managed Properties</>}
      headerActions={headerActions}
      stats={stats}
      statsCols={4}
    >
      {filteredProperties.length === 0 ? (
        <EmptyState
          icon={<HiHome className="h-12 w-12 text-gray-400" />}
          title="No properties found"
          description="No properties are currently managed"
        />
      ) : (
        <TableWrapper>
          <FlowbiteTable
            data={filteredProperties}
            columns={columns}
            keyField="id"
            pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `Total ${total} properties` }}
          />
        </TableWrapper>
      )}
    </PageLayout>
  );
}
