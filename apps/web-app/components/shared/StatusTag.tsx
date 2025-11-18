import React from 'react';
import { Tag } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ClockCircleOutlined, 
  WarningOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';

export type StatusType = 
  | 'verified' 
  | 'rejected' 
  | 'pending' 
  | 'active' 
  | 'inactive' 
  | 'warning'
  | 'expired'
  | 'urgent'
  | 'success'
  | 'error'
  | 'info'
  | 'default';

export interface StatusTagProps {
  /**
   * Status type - determines color and icon
   */
  status: StatusType;
  
  /**
   * Custom text to display (overrides default)
   */
  text?: string;
  
  /**
   * Show icon (default: true)
   */
  icon?: boolean;
  
  /**
   * Custom icon to use
   */
  customIcon?: React.ReactNode;
  
  /**
   * Additional styles
   */
  style?: React.CSSProperties;
  
  /**
   * Additional className
   */
  className?: string;
}

const STATUS_CONFIG: Record<StatusType, { 
  color: string; 
  icon: React.ComponentType; 
  defaultText: string;
}> = {
  verified: { 
    color: 'success', 
    icon: CheckCircleOutlined, 
    defaultText: 'Verified' 
  },
  rejected: { 
    color: 'error', 
    icon: CloseCircleOutlined, 
    defaultText: 'Rejected' 
  },
  pending: { 
    color: 'warning', 
    icon: ClockCircleOutlined, 
    defaultText: 'Pending' 
  },
  active: { 
    color: 'success', 
    icon: CheckCircleOutlined, 
    defaultText: 'Active' 
  },
  inactive: { 
    color: 'default', 
    icon: CloseCircleOutlined, 
    defaultText: 'Inactive' 
  },
  warning: { 
    color: 'warning', 
    icon: WarningOutlined, 
    defaultText: 'Warning' 
  },
  expired: { 
    color: 'error', 
    icon: ExclamationCircleOutlined, 
    defaultText: 'Expired' 
  },
  urgent: { 
    color: 'error', 
    icon: WarningOutlined, 
    defaultText: 'Urgent' 
  },
  success: { 
    color: 'success', 
    icon: CheckCircleOutlined, 
    defaultText: 'Success' 
  },
  error: { 
    color: 'error', 
    icon: CloseCircleOutlined, 
    defaultText: 'Error' 
  },
  info: { 
    color: 'blue', 
    icon: InfoCircleOutlined, 
    defaultText: 'Info' 
  },
  default: { 
    color: 'default', 
    icon: InfoCircleOutlined, 
    defaultText: 'Status' 
  },
};

/**
 * StatusTag Component
 * 
 * Reusable status tag with consistent styling and icons
 * 
 * Usage:
 * ```tsx
 * <StatusTag status="verified" />
 * <StatusTag status="pending" text="Awaiting Approval" />
 * <StatusTag status="error" text="Failed" icon={false} />
 * ```
 */
export function StatusTag({ 
  status, 
  text, 
  icon = true, 
  customIcon,
  style,
  className,
}: StatusTagProps) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <Tag 
      color={config.color} 
      icon={icon && (customIcon || <Icon />)}
      style={style}
      className={className}
    >
      {text || config.defaultText}
    </Tag>
  );
}

/**
 * Document Status Tag
 * Specialized tag for document verification status
 */
export function DocumentStatusTag({ 
  isVerified, 
  isRejected 
}: { 
  isVerified: boolean; 
  isRejected: boolean; 
}) {
  if (isRejected) {
    return <StatusTag status="rejected" />;
  }
  
  if (isVerified) {
    return <StatusTag status="verified" />;
  }
  
  return <StatusTag status="pending" text="Pending Verification" />;
}

/**
 * Lease Status Tag
 * Specialized tag for lease status
 */
export function LeaseStatusTag({ status }: { status: string }) {
  const statusMap: Record<string, StatusType> = {
    'Active': 'active',
    'Expired': 'expired',
    'Terminated': 'inactive',
    'Pending': 'pending',
  };
  
  return <StatusTag status={statusMap[status] || 'default'} text={status} />;
}

/**
 * Payment Status Tag
 * Specialized tag for payment status
 */
export function PaymentStatusTag({ status }: { status: string }) {
  const statusMap: Record<string, StatusType> = {
    'Paid': 'success',
    'Partial': 'warning',
    'Unpaid': 'error',
    'Pending': 'pending',
    'Overdue': 'urgent',
  };
  
  return <StatusTag status={statusMap[status] || 'default'} text={status} />;
}

/**
 * Maintenance Status Tag
 * Specialized tag for maintenance ticket status
 */
export function MaintenanceStatusTag({ status }: { status: string }) {
  const statusMap: Record<string, StatusType> = {
    'Open': 'pending',
    'In Progress': 'info',
    'Resolved': 'success',
    'Closed': 'default',
    'Urgent': 'urgent',
  };
  
  return <StatusTag status={statusMap[status] || 'default'} text={status} />;
}

export default StatusTag;

