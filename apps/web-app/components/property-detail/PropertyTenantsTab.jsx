"use client";

import { useState, useEffect } from 'react';
import { Table, Tag, Space, Empty, Avatar } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { ProCard } from '../shared/LazyProComponents';

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
    return <ProCard loading />;
  }

  if (!tenants.length) {
    return (
      <ProCard>
        <Empty description="No tenants found for this property" />
      </ProCard>
    );
  }

  const columns = [
    {
      title: 'Tenant',
      key: 'name',
      render: (_, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          <div>
            <div><strong>{record.firstName} {record.lastName}</strong></div>
            <div style={{ fontSize: '12px', color: '#999' }}>
              {record.email}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone) => phone || '-',
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        if (record.approvalStatus === 'APPROVED') {
          return <Tag color="green">Approved</Tag>;
        } else if (record.approvalStatus === 'PENDING') {
          return <Tag color="orange">Pending</Tag>;
        } else if (record.approvalStatus === 'REJECTED') {
          return <Tag color="red">Rejected</Tag>;
        }
        return <Tag>Unknown</Tag>;
      },
    },
    {
      title: 'Access',
      dataIndex: 'hasAccess',
      key: 'hasAccess',
      render: (hasAccess) => (
        <Tag color={hasAccess ? 'green' : 'default'}>
          {hasAccess ? 'Has Access' : 'No Access'}
        </Tag>
      ),
    },
  ];

  return (
    <ProCard>
      <Table
        columns={columns}
        dataSource={tenants}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />
    </ProCard>
  );
}

