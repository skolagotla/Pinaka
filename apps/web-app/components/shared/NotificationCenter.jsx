/**
 * NotificationCenter Component - Migrated to v2 FastAPI
 * 
 * Displays notifications dropdown in header using v2 FastAPI backend.
 * All data comes from FastAPI v2 endpoints - no Next.js API routes.
 */
"use client";

import { useState, useEffect, useCallback, memo } from 'react';
import { HiBell } from 'react-icons/hi';
import { Badge, Button, Dropdown, Spinner } from 'flowbite-react';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead } from '@/lib/hooks/useV2Data';
import { useRouter } from 'next/navigation';

function NotificationCenter() {
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  
  const { data: notifications, isLoading } = useNotifications();
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();
  
  // Calculate unread count
  const unreadCount = notifications?.filter((n: any) => !n.is_read)?.length || 0;
  
  const handleNotificationClick = (notification: any) => {
    if (!notification.is_read) {
      markAsRead.mutate(notification.id);
    }
    if (notification.action_url) {
      // SECURITY: Validate URL to prevent injection attacks
      const url = notification.action_url.trim();
      if (url.startsWith('/')) {
        router.push(url);
      } else if (url.startsWith(window.location.origin)) {
        window.location.href = url;
      } else {
        console.error('[NotificationCenter] Blocked potentially unsafe actionUrl:', url);
      }
    }
    setVisible(false);
  };
  
  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };
  
  const getNotificationIcon = (type: string) => {
    // Return appropriate icon based on notification type
    return '🔔';
  };
  
  const dropdownContent = (
    <div className="w-80 max-h-96 overflow-y-auto">
      <div className="p-3 border-b border-gray-200 flex justify-between items-center">
        <span className="font-semibold text-gray-900">Notifications</span>
        {unreadCount > 0 && (
          <Button
            size="xs"
            color="light"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsRead.isPending}
          >
            Mark all as read
          </Button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Spinner size="md" />
        </div>
      ) : !notifications || notifications.length === 0 ? (
        <div className="p-8 text-center text-gray-500">
          <p>No notifications</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {notifications.map((notification: any) => (
            <div
              key={notification.id}
              className={`p-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                !notification.is_read ? 'bg-blue-50' : ''
              }`}
              onClick={() => handleNotificationClick(notification)}
            >
              <div className="flex items-start gap-2">
                <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${!notification.is_read ? 'font-semibold' : ''}`}>
                    {notification.title || notification.message}
                  </p>
                  {notification.message && notification.title && (
                    <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.created_at).toLocaleDateString()}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
  
  return (
    <Dropdown
      label=""
      dismissOnClick={false}
      renderTrigger={() => (
        <Button color="gray" size="sm" className="relative">
          <HiBell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      )}
    >
      {dropdownContent}
    </Dropdown>
  );
}

// Memoize to prevent unnecessary re-renders
export default memo(NotificationCenter);
