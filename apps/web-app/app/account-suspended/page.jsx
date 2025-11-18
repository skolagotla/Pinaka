"use client";

import { useEffect, useState } from 'react';
import { Result, Button, Card, Typography, Space } from 'antd';
import { StopOutlined, CustomerServiceOutlined, HomeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Paragraph, Text } = Typography;

export default function AccountSuspendedPage() {
  const router = useRouter();
  const [organizationInfo, setOrganizationInfo] = useState(null);

  useEffect(() => {
    // Try to get organization info to show more details
    fetch('/api/organizations/me')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data.organization) {
          setOrganizationInfo(data.data.organization);
        }
      })
      .catch(err => {
        console.error('Error fetching organization info:', err);
      });
  }, []);

  const getStatusMessage = () => {
    if (!organizationInfo) {
      return {
        title: 'Account Suspended',
        subTitle: 'Your organization account has been suspended.',
      };
    }

    switch (organizationInfo.status) {
      case 'SUSPENDED':
        return {
          title: 'Account Suspended',
          subTitle: 'Your organization account has been suspended. Please contact support for assistance.',
        };
      case 'CANCELLED':
        return {
          title: 'Account Cancelled',
          subTitle: 'Your organization account has been cancelled. Please contact support to reactivate.',
        };
      case 'TRIAL':
        if (organizationInfo.trialEndsAt && new Date(organizationInfo.trialEndsAt) < new Date()) {
          return {
            title: 'Trial Expired',
            subTitle: 'Your trial period has ended. Please upgrade to a paid plan to continue using the service.',
          };
        }
        return {
          title: 'Account Suspended',
          subTitle: 'Your organization account has been suspended.',
        };
      default:
        return {
          title: 'Account Suspended',
          subTitle: 'Your organization account is in an invalid state. Please contact support.',
        };
    }
  };

  const message = getStatusMessage();

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '24px',
      background: '#f0f2f5'
    }}>
      <Card style={{ maxWidth: 600, width: '100%' }}>
        <Result
          icon={<StopOutlined style={{ color: '#ff4d4f' }} />}
          title={message.title}
          subTitle={message.subTitle}
          extra={
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              {organizationInfo && (
                <div style={{ textAlign: 'left', background: '#fafafa', padding: '16px', borderRadius: '4px' }}>
                  <Text strong>Organization Details:</Text>
                  <div style={{ marginTop: '8px' }}>
                    <Text type="secondary">Name: </Text>
                    <Text>{organizationInfo.name}</Text>
                  </div>
                  {organizationInfo.plan && (
                    <div>
                      <Text type="secondary">Plan: </Text>
                      <Text>{organizationInfo.plan}</Text>
                    </div>
                  )}
                  {organizationInfo.trialEndsAt && (
                    <div>
                      <Text type="secondary">Trial Ended: </Text>
                      <Text>{new Date(organizationInfo.trialEndsAt).toLocaleDateString()}</Text>
                    </div>
                  )}
                </div>
              )}
              <Space>
                <Button 
                  type="primary" 
                  icon={<CustomerServiceOutlined />}
                  onClick={() => window.open('mailto:support@pinaka.com', '_blank')}
                >
                  Contact Support
                </Button>
                <Button 
                  icon={<HomeOutlined />}
                  onClick={() => router.push('/')}
                >
                  Go Home
                </Button>
              </Space>
            </Space>
          }
        />
      </Card>
    </div>
  );
}

