/**
 * Shared Payment Status Tag Component
 * Displays payment status with appropriate color and icon
 * Supports retry, dispute, and queued statuses
 * Memoized for performance to prevent unnecessary re-renders
 */

import React from 'react';
import { Tag, Tooltip } from 'antd';
import { 
  CheckCircleOutlined, 
  WarningOutlined, 
  CloseCircleOutlined,
  ClockCircleOutlined,
  SyncOutlined,
  ExclamationCircleOutlined,
  PauseCircleOutlined
} from '@ant-design/icons';
import { getPaymentStatusColor, getPaymentStatusIcon } from '@/lib/utils/rent-display-helpers';

const PaymentStatusTag = React.memo(({ payment, showIcon = true, stripePayment = null }) => {
  // Check for retry status
  if (stripePayment?.retryCount > 0 && stripePayment?.retryCount < 3) {
    if (stripePayment?.requiresTenantApproval && stripePayment?.tenantApprovedRetry === null) {
      return (
        <Tooltip title={`Retry #${stripePayment.retryCount} pending your approval. Scheduled for ${stripePayment.retryScheduledAt ? new Date(stripePayment.retryScheduledAt).toLocaleString() : 'soon'}`}>
          <Tag icon={showIcon ? <ClockCircleOutlined /> : null} color="orange">
            Retry Pending Approval
          </Tag>
        </Tooltip>
      );
    }
    if (stripePayment?.retryScheduledAt && new Date(stripePayment.retryScheduledAt) > new Date()) {
      return (
        <Tooltip title={`Retry #${stripePayment.retryCount} scheduled for ${new Date(stripePayment.retryScheduledAt).toLocaleString()}`}>
          <Tag icon={showIcon ? <SyncOutlined spin /> : null} color="blue">
            Retry Scheduled
          </Tag>
        </Tooltip>
      );
    }
  }

  // Check for dispute/chargeback status
  if (stripePayment?.disputeStatus) {
    const disputeStatus = stripePayment.disputeStatus;
    if (disputeStatus === 'chargeback_pending') {
      return (
        <Tooltip title="Payment is under dispute. Late fees are frozen until resolved.">
          <Tag icon={showIcon ? <ExclamationCircleOutlined /> : null} color="red">
            Chargeback Pending
          </Tag>
        </Tooltip>
      );
    }
    if (disputeStatus === 'chargeback_won') {
      return (
        <Tooltip title="Dispute resolved in your favor. Payment restored.">
          <Tag icon={showIcon ? <CheckCircleOutlined /> : null} color="green">
            Dispute Won
          </Tag>
        </Tooltip>
      );
    }
    if (disputeStatus === 'chargeback_lost') {
      return (
        <Tooltip title="Dispute resolved against you. Payment permanently lost.">
          <Tag icon={showIcon ? <CloseCircleOutlined /> : null} color="red">
            Dispute Lost
          </Tag>
        </Tooltip>
      );
    }
  }

  // Check for queued status (gateway failure)
  if (payment.notes?.includes('queued due to gateway failure')) {
    return (
      <Tooltip title="Payment queued due to gateway outage. Will be processed automatically when gateway recovers.">
        <Tag icon={showIcon ? <PauseCircleOutlined /> : null} color="default">
          Queued - Gateway Down
        </Tag>
      </Tooltip>
    );
  }

  // Default status display
  const statusColor = getPaymentStatusColor(payment);
  const StatusIcon = getPaymentStatusIcon(payment.status);
  
  return (
    <Tag 
      icon={showIcon && StatusIcon ? <StatusIcon /> : null} 
      color={statusColor}
    >
      {payment.status}
    </Tag>
  );
});

PaymentStatusTag.displayName = 'PaymentStatusTag';

export default PaymentStatusTag;

