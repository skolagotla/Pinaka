"use client";

import { useEffect, useState } from 'react';
import { Card, Typography, Spin, Alert } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

export default function PendingApprovalPage() {
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null);
  const [approvalStatus, setApprovalStatus] = useState('PENDING');

  useEffect(() => {
    let isMounted = true;
    
    const checkUserStatus = async () => {
      try {
        // Fetch user status from API (which handles authentication)
        const response = await fetch('/api/v1/user/status', {
          credentials: 'include', // Include cookies for authentication
        });
        
        if (!isMounted) return;
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.success) {
            if (isMounted) {
              setUserInfo(data);
              setApprovalStatus(data.approvalStatus || 'PENDING');
            }
          } else {
            console.error('Invalid response format:', data);
            if (isMounted) {
              setApprovalStatus('PENDING');
            }
          }
        } else if (response.status === 401) {
          // Not authenticated, redirect to home
          if (isMounted) {
            window.location.href = '/';
          }
          return;
        } else {
          console.error('Failed to fetch user status:', response.status);
          // Set default status if API fails
          if (isMounted) {
            setApprovalStatus('PENDING');
          }
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        // Set default status on error
        if (isMounted) {
          setApprovalStatus('PENDING');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    checkUserStatus();
    
    return () => {
      isMounted = false;
    };
  }, []);


  // Compute status info without useMemo to avoid React hook issues
  const getStatusInfo = () => {
    const status = approvalStatus || 'PENDING';
    switch (status) {
      case 'APPROVED':
        return {
          title: 'Your Account Has Been Approved!',
          message: 'You can now access the system. Redirecting you to your dashboard...',
          type: 'success',
        };
      case 'REJECTED':
        const rejectionReason = (userInfo && typeof userInfo === 'object' && userInfo.rejectionReason) 
          ? String(userInfo.rejectionReason)
          : null;
        return {
          title: 'Your Application Has Been Rejected',
          message: rejectionReason
            ? `Reason: ${rejectionReason}`
            : 'Your application has been rejected. Please contact support for more information.',
          type: 'error',
        };
      default:
        return {
          title: 'Your Application is Pending Approval',
          message: 'Your account is currently pending approval. You will be notified once your application has been reviewed. Please check back later.',
          type: 'warning',
        };
    }
  };

  const getStatusIcon = () => {
    const status = approvalStatus || 'PENDING';
    switch (status) {
      case 'APPROVED':
        return <CheckCircleOutlined style={{ fontSize: 48, color: '#52c41a' }} />;
      case 'REJECTED':
        return <CloseCircleOutlined style={{ fontSize: 48, color: '#ff4d4f' }} />;
      default:
        return <ClockCircleOutlined style={{ fontSize: 48, color: '#faad14' }} />;
    }
  };

  // Auto-redirect if approved
  useEffect(() => {
    if (approvalStatus === 'APPROVED') {
      const timer = setTimeout(() => {
        window.location.href = '/';
      }, 3000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [approvalStatus]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  const statusInfo = getStatusInfo();
  const statusIcon = getStatusIcon();

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          {statusIcon}
        </div>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 16 }}>
          {statusInfo.title}
        </Title>
        <Alert
          message={statusInfo.message}
          type={statusInfo.type}
          showIcon
          style={{ marginBottom: 24 }}
        />
        {userInfo?.role && (
          <Paragraph style={{ textAlign: 'center', color: '#666' }}>
            Role: <strong>{userInfo.role.toUpperCase()}</strong>
          </Paragraph>
        )}
        {approvalStatus === 'PENDING' && (
          <Paragraph style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
            This page will automatically refresh when your status changes.
          </Paragraph>
        )}
      </Card>
    </div>
  );
}

