"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Badge, Spinner } from 'flowbite-react';
import { HiClock, HiUser } from 'react-icons/hi';
import { formatDateTimeDisplay as formatDateTimeLocal } from '@/lib/utils/date-utils';

const ACTION_COLORS = {
  create: 'green',
  update: 'blue',
  delete: 'red',
  view: 'gray',
  approve: 'green',
  reject: 'red',
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
      // Use v2Api for activity logs
      const { apiClient } = await import('@/lib/utils/api-client');
      const response = await apiClient(`/api/v2/audit-logs?limit=${limit}`, {
        method: 'GET',
      });

      const data = await response.json().catch(() => ({}));
      
      if (!response.ok) {
        // Endpoint may not exist yet - silently fail and show empty list
        if (response.status === 404 || response.status === 500) {
          setActivities([]);
          return;
        }
        throw new Error(data.error || data.message || 'Failed to load activities');
      }
      
      setActivities(data.data || data.activities || []);
    } catch (error) {
      // Silently handle errors for optional widget
      console.debug('[Activity Log Widget] Activity logs endpoint not available:', error.message);
      setActivities([]);
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
      <Card className="h-full">
        <div className="flex items-center justify-center py-10">
          <Spinner size="xl" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full min-h-[300px]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
        {showViewAll && (
          <a
            onClick={(e) => {
              e.preventDefault();
              router.push('/activity-logs');
            }}
            className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
          >
            View All →
          </a>
        )}
      </div>
      {activities.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p>No recent activity</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {activities.slice(0, limit).map((activity, index) => (
              <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                <div className="flex items-start gap-3">
                  <div className="text-xl w-8 text-center flex-shrink-0">
                    {ENTITY_ICONS[activity.entityType?.toLowerCase()] || '📋'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-sm text-gray-900">
                        {activity.userName || 'System'}
                      </span>
                      <Badge
                        color={
                          activity.userRole === 'landlord'
                            ? 'blue'
                            : activity.userRole === 'tenant'
                            ? 'green'
                            : 'gray'
                        }
                        className="text-xs"
                      >
                        {activity.userRole || 'system'}
                      </Badge>
                      <Badge
                        color={ACTION_COLORS[activity.action?.toLowerCase()] || 'gray'}
                        className="text-xs"
                      >
                        {activity.action || 'action'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{getActionDescription(activity)}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <HiClock className="h-3 w-3" />
                      <span>{formatDateTimeLocal(activity.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {showViewAll && activities.length > limit && (
            <div className="text-center mt-4 pt-4 border-t border-gray-200">
              <a
                onClick={(e) => {
                  e.preventDefault();
                  router.push('/activity-logs');
                }}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm cursor-pointer"
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
