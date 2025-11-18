"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, List, Typography, Space, Tag, Empty, Spin } from 'antd';
import { ClockCircleOutlined, UserOutlined } from '@ant-design/icons';
import { formatDateTimeDisplay as formatDateTimeLocal } from '@/lib/utils/date-utils';

const { Text, Title } = Typography;

const ACTION_COLORS = {
  create: 'green',
  update: 'blue',
  delete: 'red',
  view: 'default',
  approve: 'success',
  reject: 'error',
  send: 'cyan',
  upload: 'purple',
};

const ENTITY_ICONS = {
  property: '🏠',
  tenant: '👤',
  maintenance: '🔧',
  lease: '📄',
  payment: '💰',
  document: '📎',
  vendor: '👷',
  expense: '💵',
};

export default function ActivityLogWidget({ limit = 4, userRole, showViewAll = true }) {
  const router = useRouter();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      // Use direct fetch for activity logs (no v1 equivalent yet)
      const response = await fetch(
        `/api/activity-logs?limit=${limit}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load activities');
      }
      
      const data = await response.json();
      setActivities(data.activities || data.data || []);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const getActionDescription = (activity) => {
    // If description exists, use it (it may already include changed fields)
    if (activity.description) {
      return activity.description;
    }
    
    // If metadata has changedFields, show what was changed
    if (activity.metadata && activity.metadata.changedFields) {
      const changedFields = activity.metadata.changedFields;
      const fieldNames = Array.isArray(changedFields) 
        ? changedFields.join(', ')
        : Object.keys(changedFields).join(', ');
      const entityName = activity.entityName || activity.entityId.substring(0, 8);
      return `Updated ${activity.entityType} "${entityName}" - Changed: ${fieldNames}`;
    }
    
    // Fallback to default description
    const action = activity.action?.toLowerCase() || 'unknown';
    const entity = activity.entityType?.toLowerCase() || 'item';
    const name = activity.entityName || activity.entityId?.substring(0, 8) || 'unknown';

    const descriptions = {
      create: `Created ${entity} "${name}"`,
      update: `Updated ${entity} "${name}"`,
      delete: `Deleted ${entity} "${name}"`,
      view: `Viewed ${entity} "${name}"`,
      approve: `Approved ${entity} "${name}"`,
      reject: `Rejected ${entity} "${name}"`,
      send: `Sent ${entity} "${name}"`,
      upload: `Uploaded ${entity} "${name}"`,
    };

    return descriptions[action] || `${action} ${entity}`;
  };

  if (loading) {
    return (
      <Card title="Recent Activity" style={{ height: '100%' }}>
        <Spin size="large" style={{ display: 'block', textAlign: 'center', padding: '40px' }} />
      </Card>
    );
  }

  return (
    <Card
      title="Recent Activity"
      extra={
        showViewAll && (
          <a 
            onClick={(e) => {
              e.preventDefault();
              router.push('/activity-logs');
            }}
            style={{ 
              color: '#1890ff',
              fontWeight: 500,
              textDecoration: 'none',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            View All →
          </a>
        )
      }
      style={{ height: '100%', minHeight: '300px' }}
      bodyStyle={{ padding: '16px' }}
    >
      {activities.length === 0 ? (
        <Empty description="No recent activity" image={Empty.PRESENTED_IMAGE_SIMPLE} style={{ padding: '20px 0' }} />
      ) : (
        <>
          <List
            dataSource={activities.slice(0, limit)}
            renderItem={(activity) => (
              <List.Item style={{ padding: '12px 0', borderBottom: '1px solid #f0f0f0' }}>
                <List.Item.Meta
                  avatar={
                    <div style={{ fontSize: '20px', width: '32px', textAlign: 'center' }}>
                      {ENTITY_ICONS[activity.entityType?.toLowerCase()] || '📋'}
                    </div>
                  }
                  title={
                    <Space size="small" wrap>
                      <Text strong style={{ fontSize: '13px' }}>
                        {activity.userName || 'System'}
                      </Text>
                      <Tag color={activity.userRole === 'landlord' ? 'blue' : activity.userRole === 'tenant' ? 'green' : 'default'} style={{ fontSize: '10px', margin: 0 }}>
                        {activity.userRole || 'system'}
                      </Tag>
                      <Tag color={ACTION_COLORS[activity.action?.toLowerCase()] || 'default'} style={{ fontSize: '10px', margin: 0 }}>
                        {activity.action || 'action'}
                      </Tag>
                    </Space>
                  }
                  description={
                    <div>
                      <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 4 }}>
                        {getActionDescription(activity)}
                      </Text>
                      <Space size="small" style={{ marginTop: 6 }}>
                        <ClockCircleOutlined style={{ fontSize: '11px', color: '#999' }} />
                        <Text type="secondary" style={{ fontSize: '11px' }}>
                          {formatDateTimeLocal(activity.createdAt)}
                        </Text>
                      </Space>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
          {showViewAll && activities.length > limit && (
            <div style={{ textAlign: 'center', marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
              <a 
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/activity-logs');
                }}
                style={{ 
                  color: '#1890ff',
                  fontWeight: 500,
                  textDecoration: 'none',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
              >
                View All {activities.length} Activities →
              </a>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

