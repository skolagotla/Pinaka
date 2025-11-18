"use client";

import { useState, useEffect, useCallback, memo } from 'react';
import { BellOutlined, CheckOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { Badge, Popover, List, Button, Empty, Typography, Space, Spin, message } from 'antd';
import { useUnifiedApi } from '@/lib/hooks';
import { useRouter } from 'next/navigation';

const { Text } = Typography;

function NotificationCenter() {
  const { fetch } = useUnifiedApi({ showUserMessage: false });
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [processingAction, setProcessingAction] = useState(null);

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.notifications.list({ limit: 20, unreadOnly: false });
      // v1Api returns { success: true, data: { notifications: [], unreadCount: 0 } }
      const data = response.data || response;
      if (data.success || data.notifications) {
        setNotifications(data.notifications || data.data?.notifications || []);
        setUnreadCount(data.unreadCount || data.data?.unreadCount || 0);
      }
    } catch (error) {
      // Error already handled
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      await v1Api.notifications.update(notificationId, { isRead: true });
      loadNotifications();
    } catch (error) {
      console.error('[NotificationCenter] Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      await v1Api.specialized.markAllNotificationsAsRead();
      loadNotifications();
    } catch (error) {
      console.error('[NotificationCenter] Error marking all as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.actionUrl) {
      // SECURITY FIX: Validate URL to prevent injection attacks
      const url = notification.actionUrl.trim();
      // Only allow relative paths or same-origin URLs
      if (url.startsWith('/')) {
        // Relative path - safe
        window.location.href = url;
      } else if (url.startsWith(window.location.origin)) {
        // Same origin - safe
        window.location.href = url;
      } else if (!url.match(/^(https?|javascript|data|file):/i)) {
        // Relative URL that doesn't start with / - allow if not a protocol
        window.location.href = url;
      } else {
        // Potentially dangerous URL - log and ignore
        console.error('[NotificationCenter] Blocked potentially unsafe actionUrl:', url);
      }
    }
    setVisible(false);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return '#ff4d4f';
      case 'high':
        return '#ff7875';
      case 'normal':
        return '#1890ff';
      case 'low':
        return '#52c41a';
      default:
        return '#1890ff';
    }
  };

  const content = (
    <div style={{ width: 360, maxHeight: 500, overflowY: 'auto' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong>Notifications</Text>
        {unreadCount > 0 && (
          <Button type="link" size="small" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>
      {loading ? (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <Spin />
        </div>
      ) : notifications.length === 0 ? (
        <Empty description="No notifications" style={{ padding: 40 }} />
      ) : (
        <List
          dataSource={notifications}
          renderItem={(notification) => {
            // Check if this is a payment retry notification that needs action buttons
            const isPaymentRetry = notification.type === 'payment_failed' && 
                                   notification.metadata?.requiresApproval === true &&
                                   notification.metadata?.stripePaymentId;
            const isPaymentDispute = notification.type === 'payment_disputed' && 
                                     notification.metadata?.canMarkUnpaid === true;
            
            return (
              <List.Item
                style={{
                  padding: '12px 16px',
                  cursor: notification.actionUrl ? 'pointer' : 'default',
                  backgroundColor: notification.isRead ? '#fff' : '#f0f7ff',
                  borderLeft: `3px solid ${getPriorityColor(notification.priority)}`,
                }}
                onClick={() => {
                  if (notification.actionUrl && !isPaymentRetry && !isPaymentDispute) {
                    handleNotificationClick(notification);
                  }
                }}
              >
                <List.Item.Meta
                title={
                  <Space>
                    <Text strong={!notification.isRead} style={{ fontSize: 14 }}>
                      {notification.title}
                    </Text>
                    {!notification.isRead && (
                      <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1890ff', display: 'inline-block' }} />
                    )}
                  </Space>
                }
                description={
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {notification.message}
                    </Text>
                    {/* Action buttons for payment retry notifications */}
                    {isPaymentRetry && (
                      <Space style={{ marginTop: 8 }} size="small">
                        <Button
                          type="primary"
                          size="small"
                          icon={<CheckCircleOutlined />}
                          loading={processingAction === `approve-${notification.id}`}
                          onClick={async (e) => {
                            e.stopPropagation();
                            setProcessingAction(`approve-${notification.id}`);
                            try {
                              // Use direct fetch for payment retry approval (no v1 equivalent yet)
                              const response = await fetch(
                                `/api/payments/${notification.metadata.stripePaymentId}/retry/approve`,
                                {
                                  method: 'POST',
                                  credentials: 'include',
                                }
                              );
                              if (response.ok) {
                                message.success('Payment retry approved');
                                loadNotifications();
                                if (notification.actionUrl) {
                                  router.push(notification.actionUrl);
                                }
                              } else {
                                const error = await response.json().catch(() => ({}));
                                throw new Error(error.error || error.message || 'Failed to approve payment retry');
                              }
                            } catch (error) {
                              console.error('[NotificationCenter] Error approving payment retry:', error);
                              message.error(error.message || 'Failed to approve payment retry');
                            } finally {
                              setProcessingAction(null);
                            }
                          }}
                        >
                          Approve Retry
                        </Button>
                        <Button
                          danger
                          size="small"
                          icon={<CloseCircleOutlined />}
                          loading={processingAction === `reject-${notification.id}`}
                          onClick={async (e) => {
                            e.stopPropagation();
                            setProcessingAction(`reject-${notification.id}`);
                            try {
                              // Use direct fetch for payment retry rejection (no v1 equivalent yet)
                              const response = await fetch(
                                `/api/payments/${notification.metadata.stripePaymentId}/retry/reject`,
                                {
                                  method: 'POST',
                                  credentials: 'include',
                                }
                              );
                              if (response.ok) {
                                message.success('Payment retry rejected');
                                loadNotifications();
                              } else {
                                const error = await response.json().catch(() => ({}));
                                throw new Error(error.error || error.message || 'Failed to reject payment retry');
                              }
                            } catch (error) {
                              console.error('[NotificationCenter] Error rejecting payment retry:', error);
                              message.error(error.message || 'Failed to reject payment retry');
                            } finally {
                              setProcessingAction(null);
                            }
                          }}
                        >
                          Reject Retry
                        </Button>
                      </Space>
                    )}
                    {/* Action button for payment dispute notifications (landlord) */}
                    {isPaymentDispute && (
                      <Space style={{ marginTop: 8 }} size="small">
                        <Button
                          danger
                          size="small"
                          icon={<WarningOutlined />}
                          loading={processingAction === `mark-unpaid-${notification.id}`}
                          onClick={async (e) => {
                            e.stopPropagation();
                            setProcessingAction(`mark-unpaid-${notification.id}`);
                            try {
                              // Use v1Api specialized method for marking rent as unpaid
                              const { v1Api } = await import('@/lib/api/v1-client');
                              await v1Api.specialized.markRentPaymentUnpaid(notification.entityId);
                              message.success('Rent payment marked as unpaid');
                              loadNotifications();
                              if (notification.actionUrl) {
                                router.push(notification.actionUrl);
                              }
                            } catch (error) {
                              console.error('[NotificationCenter] Error marking rent as unpaid:', error);
                              message.error(error.message || 'Failed to mark rent as unpaid');
                            } finally {
                              setProcessingAction(null);
                            }
                          }}
                        >
                          Mark as Unpaid
                        </Button>
                        {notification.actionUrl && (
                          <Button
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notification);
                            }}
                          >
                            View Payment
                          </Button>
                        )}
                      </Space>
                    )}
                  </div>
                }
              />
              <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                {new Date(notification.createdAt).toLocaleDateString()}
              </div>
            </List.Item>
          );
          }}
        />
      )}
    </div>
  );

  return (
    <Popover
      content={content}
      title={null}
      trigger="click"
      visible={visible}
      onVisibleChange={setVisible}
      placement="bottomRight"
    >
      <Badge count={unreadCount} offset={[-5, 5]}>
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 18 }} />}
          style={{ color: '#8c8c8c' }}
        />
      </Badge>
    </Popover>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(NotificationCenter);

