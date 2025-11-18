"use client";

import { useState, useEffect } from 'react';
import { Alert, Space, Button, Badge, Card, Statistic, Row, Col } from 'antd';
import { 
  InfoCircleOutlined, 
  BellOutlined, 
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { ProCard } from './LazyProComponents';
import { useRouter } from 'next/navigation';

/**
 * PMC Dashboard Widget
 * Shows PMC status, pending approvals, and quick actions
 */
export default function PMCDashboardWidget({ pmcName, landlordId }) {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (landlordId) {
      fetchPendingApprovals();
    }
  }, [landlordId]);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      // Use adminApi for approvals
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getApprovals({ status: 'PENDING' });
      
      if (data.success || data.data) {
        setPendingApprovals(data.data || data.approvals || []);
      } else {
        setPendingApprovals([]);
      }
    } catch (error) {
      // Silently handle errors for optional widget
      console.debug('[PMC Dashboard Widget] Approvals endpoint not available:', error.message);
      setPendingApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = pendingApprovals.length;
  const approvedCount = pendingApprovals.filter(a => a.status === 'APPROVED').length;
  const rejectedCount = pendingApprovals.filter(a => a.status === 'REJECTED').length;

  if (!pmcName) {
    return null;
  }

  return (
    <div style={{ marginBottom: 24 }}>
      <Alert
        message={
          <Space>
            <InfoCircleOutlined />
            <span>
              <strong>Managed by {pmcName}</strong>
              {pendingCount > 0 && (
                <Badge 
                  count={pendingCount} 
                  style={{ marginLeft: 8 }}
                  showZero={false}
                >
                  <Button
                    type="link"
                    icon={<BellOutlined />}
                    onClick={() => router.push('/verifications')}
                  >
                    Pending Approvals
                  </Button>
                </Badge>
              )}
            </span>
          </Space>
        }
        type="info"
        showIcon={false}
        action={
          <Space>
            {pendingCount > 0 && (
              <Button
                type="primary"
                onClick={() => router.push('/verifications')}
              >
                Review Approvals ({pendingCount})
              </Button>
            )}
            <Button onClick={() => router.push('/activity-logs')}>
              View Activity Log
            </Button>
          </Space>
        }
        style={{
          borderRadius: 6,
        }}
      />

      {pendingCount > 0 && (
        <Row gutter={16} style={{ marginTop: 16 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Pending Approvals"
                value={pendingCount}
                prefix={<BellOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Approved This Month"
                value={approvedCount}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Rejected This Month"
                value={rejectedCount}
                prefix={<CloseCircleOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}

