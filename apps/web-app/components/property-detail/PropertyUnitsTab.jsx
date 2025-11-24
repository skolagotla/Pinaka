"use client";

import { useState, useEffect } from 'react';
import { Badge } from 'flowbite-react';
import { HiHome, HiDocumentText, HiUserGroup } from 'react-icons/hi';
import { Card } from 'flowbite-react';
import FlowbiteTable from '../shared/FlowbiteTable';

export default function PropertyUnitsTab({ property }) {
  const [units, setUnits] = useState(property?.units || []);

  if (!property || !units.length) {
    return (
      <Card>
        <div className="text-center py-12">
          <HiHome className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No units found for this property</p>
        </div>
      </Card>
    );
  }

  const columns = [
    {
      title: 'Unit',
      key: 'unitName',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <HiHome className="h-4 w-4 text-gray-500" />
          <span className="font-semibold">{record.unitName || 'Unnamed Unit'}</span>
        </div>
      ),
    },
    {
      title: 'Floor',
      dataIndex: 'floorNumber',
      key: 'floorNumber',
      render: (floor) => floor !== null ? `Floor ${floor}` : '-',
    },
    {
      title: 'Bedrooms',
      dataIndex: 'bedrooms',
      key: 'bedrooms',
    },
    {
      title: 'Bathrooms',
      dataIndex: 'bathrooms',
      key: 'bathrooms',
    },
    {
      title: 'Rent',
      dataIndex: 'rentPrice',
      key: 'rentPrice',
      render: (rent) => rent ? `$${rent.toLocaleString()}` : '-',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const hasActiveLease = record.leases?.some(l => l.status === 'Active');
        return hasActiveLease ? (
          <Badge color="success">Occupied</Badge>
        ) : (
          <Badge color="gray">Vacant</Badge>
        );
      },
    },
    {
      title: 'Active Leases',
      key: 'leases',
      render: (_, record) => {
        const activeLeases = record.leases?.filter(l => l.status === 'Active') || [];
        return (
          <div className="flex items-center gap-2">
            <HiDocumentText className="h-4 w-4 text-gray-500" />
            <span>{activeLeases.length}</span>
          </div>
        );
      },
    },
    {
      title: 'Tenants',
      key: 'tenants',
      render: (_, record) => {
        const tenants = record.leases?.flatMap(l => 
          l.leaseTenants?.map(lt => lt.tenant) || []
        ) || [];
        const uniqueTenants = [...new Map(tenants.map(t => [t.id, t])).values()];
        return (
          <div className="flex items-center gap-2">
            <HiUserGroup className="h-4 w-4 text-gray-500" />
            <span>{uniqueTenants.length}</span>
          </div>
        );
      },
    },
  ];

  return (
    <Card>
      <FlowbiteTable
        columns={columns}
        dataSource={units}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
}
