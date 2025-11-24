/**
 * Shared Payment Status Tag Component
 * Displays payment status with appropriate color and icon
 * Supports retry, dispute, and queued statuses
 * Memoized for performance to prevent unnecessary re-renders
 */

import React from 'react';
import { Badge, Tooltip } from 'flowbite-react';
import { 
  HiCheckCircle, 
  HiExclamation, 
  HiXCircle,
  HiClock,
  HiRefresh,
  HiExclamationCircle,
  HiPause
} from 'react-icons/hi';
import { getPaymentStatusColor, getPaymentStatusIcon } from '@/lib/utils/rent-display-helpers';

const PaymentStatusTag = React.memo(({ payment, showIcon = true, stripePayment = null }) => {
  // Check for retry status
  if (stripePayment?.retryCount > 0 && stripePayment?.retryCount < 3) {
    if (stripePayment?.requiresTenantApproval && stripePayment?.tenantApprovedRetry === null) {
      return (
        <Tooltip content={`Retry #${stripePayment.retryCount} pending your approval. Scheduled for ${stripePayment.retryScheduledAt ? new Date(stripePayment.retryScheduledAt).toLocaleString() : 'soon'}`}>
          <Badge color="warning" icon={showIcon ? <HiClock className="h-3 w-3" /> : undefined}>
            Retry Pending Approval
          </Badge>
        </Tooltip>
      );
    }
    if (stripePayment?.retryScheduledAt && new Date(stripePayment.retryScheduledAt) > new Date()) {
      return (
        <Tooltip content={`Retry #${stripePayment.retryCount} scheduled for ${new Date(stripePayment.retryScheduledAt).toLocaleString()}`}>
          <Badge color="info" icon={showIcon ? <HiRefresh className="h-3 w-3 animate-spin" /> : undefined}>
            Retry Scheduled
          </Badge>
        </Tooltip>
      );
    }
  }

  // Check for dispute/chargeback status
  if (stripePayment?.disputeStatus) {
    const disputeStatus = stripePayment.disputeStatus;
    if (disputeStatus === 'chargeback_pending') {
      return (
        <Tooltip content="Payment is under dispute. Late fees are frozen until resolved.">
          <Badge color="failure" icon={showIcon ? <HiExclamationCircle className="h-3 w-3" /> : undefined}>
            Chargeback Pending
          </Badge>
        </Tooltip>
      );
    }
    if (disputeStatus === 'chargeback_won') {
      return (
        <Tooltip content="Dispute resolved in your favor. Payment restored.">
          <Badge color="success" icon={showIcon ? <HiCheckCircle className="h-3 w-3" /> : undefined}>
            Dispute Won
          </Badge>
        </Tooltip>
      );
    }
    if (disputeStatus === 'chargeback_lost') {
      return (
        <Tooltip content="Dispute resolved against you. Payment permanently lost.">
          <Badge color="failure" icon={showIcon ? <HiXCircle className="h-3 w-3" /> : undefined}>
            Dispute Lost
          </Badge>
        </Tooltip>
      );
    }
  }

  // Check for queued status (gateway failure)
  if (payment.notes?.includes('queued due to gateway failure')) {
    return (
      <Tooltip content="Payment queued due to gateway outage. Will be processed automatically when gateway recovers.">
        <Badge color="gray" icon={showIcon ? <HiPause className="h-3 w-3" /> : undefined}>
          Queued - Gateway Down
        </Badge>
      </Tooltip>
    );
  }

  // Default status display
  const statusColor = getPaymentStatusColor(payment);
  const StatusIcon = getPaymentStatusIcon(payment.status);
  
  // Map Ant Design colors to Flowbite colors
  const colorMap = {
    'green': 'success',
    'red': 'failure',
    'orange': 'warning',
    'blue': 'info',
    'default': 'gray',
  };
  
  const flowbiteColor = colorMap[statusColor] || 'gray';
  
  return (
    <Badge 
      color={flowbiteColor}
      icon={showIcon && StatusIcon ? <StatusIcon className="h-3 w-3" /> : undefined}
    >
      {payment.status}
    </Badge>
  );
});

PaymentStatusTag.displayName = 'PaymentStatusTag';

export default PaymentStatusTag;
