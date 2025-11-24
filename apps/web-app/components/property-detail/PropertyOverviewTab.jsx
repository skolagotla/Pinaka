"use client";

import { Row, Col, Statistic, Card, Descriptions, Tag } from 'antd';
import {
  HomeOutlined,
  TeamOutlined,
  FileTextOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { ProCard } from '../shared/LazyProComponents';

export default function PropertyOverviewTab({ property }) {
  if (!property) return null;

  const totalUnits = property.units?.length || 0;
  const activeLeases = property.units?.reduce(
    (sum, unit) => sum + (unit.leases?.filter(l => l.status === 'Active').length || 0),
    0
  ) || 0;
  const totalTenants = new Set(
    property.units?.flatMap(unit =>
      unit.leases?.flatMap(lease =>
        lease.leaseTenants?.map(lt => lt.tenant?.id).filter(Boolean) || []
      ) || []
    ) || []
  ).size;
  const vacantUnits = totalUnits - activeLeases;

  return (
    <div>
      <Row gutter={[16, 16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <ProCard>
            <Statistic
              title="Total Units"
              value={totalUnits}
              prefix={<HomeOutlined />}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard>
            <Statistic
              title="Active Leases"
              value={activeLeases}
              prefix={<FileTextOutlined />}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard>
            <Statistic
              title="Total Tenants"
              value={totalTenants}
              prefix={<TeamOutlined />}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard>
            <Statistic
              title="Vacant Units"
              value={vacantUnits}
              prefix={<HomeOutlined />}
            />
          </ProCard>
        </Col>
      </Row>

      <ProCard title="Property Details">
        <Descriptions column={2} bordered>
          <Descriptions.Item label="Property ID">
            <Tag>{property.propertyId}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Type">
            <Tag>{property.propertyType || 'N/A'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Address">
            {property.addressLine1}
            {property.addressLine2 && `, ${property.addressLine2}`}
          </Descriptions.Item>
          <Descriptions.Item label="City">
            {property.city}, {property.provinceState} {property.postalZip}
          </Descriptions.Item>
          {property.yearBuilt && (
            <Descriptions.Item label="Year Built">
              {property.yearBuilt}
            </Descriptions.Item>
          )}
          {property.rent && (
            <Descriptions.Item label="Base Rent">
              ${property.rent.toLocaleString()}
            </Descriptions.Item>
          )}
        </Descriptions>
      </ProCard>
    </div>
  );
}

