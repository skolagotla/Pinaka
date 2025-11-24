"use client";

import { useState, useEffect } from 'react';
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Badge, Spinner } from 'flowbite-react';
import { HiUser, HiMail, HiPhone } from 'react-icons/hi';
import { Card } from 'flowbite-react';
import FlowbiteTable from '../shared/FlowbiteTable';

export default function PropertyTenantsTab({ property }) {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!property?.id) return;

    // Extract unique tenants from all units' leases
    const allTenants = [];
    property.units?.forEach(unit => {
      unit.leases?.forEach(lease => {
        lease.leaseTenants?.forEach(lt => {
          if (lt.tenant && !allTenants.find(t => t.id === lt.tenant.id)) {
            allTenants.push(lt.tenant);
          }
        });
      });
    });

    setTenants(allTenants);
    setLoading(false);
  }, [property]);

  if (loading) {
    return (
      <Card>
        <div className="flex justify-center items-center py-12">
          <Spinner size="xl" />
        </div>
      </Card>
    );
  }

  if (!tenants.length) {
    return (
      <Card>
        <div className="text-center py-12">
          <HiUser className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No tenants found for this property</p>
        </div>
      </Card>
    );
  }

  const columns = [
    {
      title: 'Tenant',
      key: 'name',
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <HiUser className="h-5 w-5 text-gray-500" />
            </div>
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {record.firstName} {record.lastName}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {record.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => (
        <div className="flex items-center gap-2">
          <HiPhone className="h-4 w-4 text-gray-400" />
          <span>{phone || '-'}</span>
        </div>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        if (record.approvalStatus === 'APPROVED') {
          return <Badge color="success">Approved</Badge>;
        } else if (record.approvalStatus === 'PENDING') {
          return <Badge color="warning">Pending</Badge>;
        } else if (record.approvalStatus === 'REJECTED') {
          return <Badge color="failure">Rejected</Badge>;
        }
        return <Badge color="gray">Unknown</Badge>;
      },
    },
    {
      title: 'Access',
      dataIndex: 'hasAccess',
      key: 'hasAccess',
      render: (hasAccess) => (
        <Badge color={hasAccess ? 'success' : 'gray'}>
          {hasAccess ? 'Has Access' : 'No Access'}
        </Badge>
      ),
    },
  ];

  return (
    <Card>
      <FlowbiteTable
        columns={columns}
        dataSource={tenants}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </Card>
  );
}
