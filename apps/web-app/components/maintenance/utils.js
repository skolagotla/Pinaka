/**
 * Maintenance Utilities
 * 
 * Shared utility functions for maintenance pages
 */

import {
  WarningOutlined,
  ClockCircleOutlined,
  ToolOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { formatDate as formatDateUtil } from '@/lib/utils/date-formatters';

/**
 * Get color for priority level
 */
export function getPriorityColor(priority) {
  switch (priority) {
    case "Urgent":
      return "error.main";
    case "High":
      return "warning.main";
    case "Medium":
      return "info.main";
    case "Low":
    default:
      return "success.main";
  }
}

/**
 * Get icon for status
 */
export function getStatusIcon(status) {
  switch (status) {
    case "New":
      return <WarningOutlined />;
    case "Pending":
      return <ClockCircleOutlined />;
    case "In Progress":
      return <ToolOutlined />;
    case "Completed":
      return <CheckCircleOutlined />;
    default:
      return <ToolOutlined />;
  }
}

/**
 * Get color for status
 */
export function getStatusColor(status) {
  switch (status) {
    case "New":
      return "warning";
    case "Pending":
      return "info";
    case "In Progress":
      return "info";
    case "Completed":
      return "success";
    default:
      return "default";
  }
}

/**
 * Format date for display
 * @deprecated Use formatDate from '@/lib/utils/date-formatters' directly
 */
export function formatDate(date) {
  const formatted = formatDateUtil.date(date);
  return formatted || "—";
}

/**
 * Format date with time for display
 * @deprecated Use formatDate.datetime from '@/lib/utils/date-formatters' directly
 */
export function formatDateTime(date) {
  const formatted = formatDateUtil.datetime(date);
  return formatted || "—";
}

/**
 * Get priority badge props
 */
export function getPriorityBadgeProps(priority) {
  const colorMap = {
    'Urgent': { color: 'error', icon: '🔥' },
    'High': { color: 'warning', icon: '⚠️' },
    'Medium': { color: 'info', icon: 'ℹ️' },
    'Low': { color: 'success', icon: '✓' }
  };
  
  return colorMap[priority] || colorMap['Medium'];
}

/**
 * Get ticket number display
 */
export function getTicketNumber(request) {
  return `#${request.id.slice(-6).toUpperCase()}`;
}

/**
 * Check if user can approve (landlord-specific check)
 */
export function canApprove(request, userRole) {
  return (
    userRole === 'landlord' &&
    request.status === 'Completed' &&
    !request.landlordApproved
  );
}

/**
 * Check if user can reject (landlord-specific check)
 */
export function canReject(request, userRole) {
  return canApprove(request, userRole);
}

/**
 * Check if waiting for approval
 */
export function isWaitingForApproval(request) {
  return request.status === 'Completed' && 
         (!request.landlordApproved || !request.tenantApproved);
}

