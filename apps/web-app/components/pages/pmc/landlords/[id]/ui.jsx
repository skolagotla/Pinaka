"use client";

import { useRouter } from 'next/navigation';
import { 
  Button,
  Badge,
} from 'flowbite-react';
import {
  HiUserGroup,
  HiHome,
  HiArrowLeft,
  HiMail,
  HiPhone,
  HiLocationMarker,
} from 'react-icons/hi';
import { PageLayout, TableWrapper, FlowbiteTable } from '@/components/shared';

export default function PMCLandlordDetailClient({ landlord, relationship }) {
  const router = useRouter();

  const propertyColumns = [
    {
      header: 'Property Name',
      accessorKey: 'propertyName',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold">{row.original.propertyName || row.original.addressLine1 || 'Unnamed Property'}</div>
          {row.original.propertyName && row.original.addressLine1 && (
            <div className="text-sm text-gray-500">
              {row.original.addressLine1}
            </div>
          )}
        </div>
      ),
    },
    {
      header: 'Address',
      accessorKey: 'address',
      cell: ({ row }) => (
        <span className="text-gray-500">
          {row.original.addressLine1}
          {row.original.addressLine2 && `, ${row.original.addressLine2}`}
          {row.original.city && `, ${row.original.city}`}
          {row.original.provinceState && `, ${row.original.provinceState}`}
          {row.original.postalZip && ` ${row.original.postalZip}`}
        </span>
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
        <Badge color="blue" icon={HiHome}>
          {row.original.units?.length || 0}
        </Badge>
      ),
    },
    {
      header: 'Action',
      accessorKey: 'action',
      cell: ({ row }) => (
        <Button
          color="light"
          onClick={() => router.push(`/properties/${row.original.id}`)}
        >
          View Property
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            color="light"
            onClick={() => router.push('/landlords')}
          >
            <HiArrowLeft className="mr-2 h-4 w-4" />
            Back to Landlords
          </Button>
          <div>
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <HiUserGroup className="h-6 w-6" />
              {landlord.firstName} {landlord.lastName}
            </h2>
          </div>
        </div>
      </div>

      {/* Landlord Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <HiMail className="h-5 w-5 text-gray-500" />
              <span>{landlord.email}</span>
            </div>
            {landlord.phone && (
              <div className="flex items-center gap-2">
                <HiPhone className="h-5 w-5 text-gray-500" />
                <span>{landlord.phone}</span>
              </div>
            )}
            {landlord.addressLine1 && (
              <div className="flex items-start gap-2">
                <HiLocationMarker className="h-5 w-5 text-gray-500 mt-0.5" />
                <div>
                  <div>{landlord.addressLine1}</div>
                  {landlord.addressLine2 && <div>{landlord.addressLine2}</div>}
                  <div>
                    {landlord.city}
                    {landlord.provinceState && `, ${landlord.provinceState}`}
                    {landlord.postalZip && ` ${landlord.postalZip}`}
                  </div>
                  {landlord.country && <div>{landlord.country}</div>}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Relationship Information</h3>
          <div className="space-y-3">
            {relationship && (
              <>
                <div className="flex justify-between">
                  <span className="font-medium">Status:</span>
                  <Badge color={relationship.status === 'active' ? 'success' : relationship.status === 'suspended' ? 'warning' : 'gray'}>
                    {relationship.status}
                  </Badge>
                </div>
                {relationship.startedAt && (
                  <div className="flex justify-between">
                    <span className="font-medium">Started:</span>
                    <span>{new Date(relationship.startedAt).toLocaleDateString()}</span>
                  </div>
                )}
                {relationship.endedAt && (
                  <div className="flex justify-between">
                    <span className="font-medium">Ended:</span>
                    <span>{new Date(relationship.endedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Properties Table */}
      {landlord.properties && landlord.properties.length > 0 ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Properties</h3>
          <TableWrapper>
            <FlowbiteTable
              data={landlord.properties}
              columns={propertyColumns}
              keyField="id"
            />
          </TableWrapper>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <HiHome className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No properties found for this landlord</p>
        </div>
      )}
    </div>
  );
}
