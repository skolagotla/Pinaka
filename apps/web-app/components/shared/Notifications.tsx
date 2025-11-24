"use client";

import { useState, useEffect } from 'react';
import { Button, Badge, Dropdown, Spinner, Alert } from 'flowbite-react';
import { HiBell, HiCheck } from 'react-icons/hi';
import { v2Api } from '@/lib/api/v2-client';
import { notify } from '@/lib/utils/notification-helper';

interface Notification {
  id: string;
  type: string;
  entity_type: string;
  entity_id: string;
  is_read: boolean;
  created_at: string;
}

interface NotificationsProps {
  showBadge?: boolean;
  maxItems?: number;
}

export default function Notifications({ showBadge = true, maxItems = 10 }: NotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await v2Api.listNotifications(false); // Get unread notifications
      setNotifications(Array.isArray(data) ? data.slice(0, maxItems) : []);
    } catch (err: any) {
      console.error('Error loading notifications:', err);
      setError(err.detail || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await v2Api.markNotificationRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      notify.success('Notification marked as read');
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      notify.error(err.detail || 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await v2Api.markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      notify.success('All notifications marked as read');
    } catch (err: any) {
      console.error('Error marking all as read:', err);
      notify.error(err.detail || 'Failed to mark all as read');
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const formatNotificationType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <div className="relative">
      <Button
        color="gray"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <HiBell className="h-5 w-5" />
        {showBadge && unreadCount > 0 && (
          <Badge color="red" className="absolute -top-1 -right-1">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 rounded-lg bg-white shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <Button
                  size="xs"
                  color="blue"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all read
                </Button>
              )}
            </div>

            {loading ? (
              <div className="flex justify-center p-4">
                <Spinner size="sm" />
              </div>
            ) : error ? (
              <Alert color="failure" className="m-4">
                {error}
              </Alert>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <HiBell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No notifications</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 cursor-pointer ${
                      !notification.is_read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {formatNotificationType(notification.type)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                      {!notification.is_read && (
                        <Button
                          size="xs"
                          color="blue"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                        >
                          <HiCheck className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

