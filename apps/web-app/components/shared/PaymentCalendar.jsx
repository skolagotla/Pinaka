/**
 * Shared Payment Calendar Component
 * Displays payment calendar with upcoming, paid, and overdue dates
 */

import { Calendar, Badge } from 'antd';
import { CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

export default function PaymentCalendar({ 
  payments = [], 
  onDateSelect,
  onPaymentClick 
}) {
  // Process calendar data - only show upcoming and paid dates
  const calendarData = {};
  const today = dayjs().startOf('day');
  
  payments.forEach(payment => {
    const dueDate = dayjs(payment.dueDate).startOf('day');
    const paidDate = payment.paidDate ? dayjs(payment.paidDate).startOf('day') : null;
    const isPaid = payment.status === 'Paid' || payment.status === 'Partial';
    const isOverdue = !isPaid && dueDate.isBefore(today);
    const isUpcoming = !isPaid && (dueDate.isAfter(today) || dueDate.isSame(today));
    
    // Only include if paid or upcoming
    if (isPaid && paidDate) {
      const paidDateStr = paidDate.format('YYYY-MM-DD');
      if (!calendarData[paidDateStr]) {
        calendarData[paidDateStr] = [];
      }
      calendarData[paidDateStr].push({ ...payment, type: 'paid', date: paidDateStr });
    } else if (isUpcoming) {
      const dueDateStr = dueDate.format('YYYY-MM-DD');
      if (!calendarData[dueDateStr]) {
        calendarData[dueDateStr] = [];
      }
      calendarData[dueDateStr].push({ ...payment, type: 'upcoming', date: dueDateStr });
    } else if (isOverdue) {
      // Show overdue payments in red
      const dueDateStr = dueDate.format('YYYY-MM-DD');
      if (!calendarData[dueDateStr]) {
        calendarData[dueDateStr] = [];
      }
      calendarData[dueDateStr].push({ ...payment, type: 'overdue', date: dueDateStr });
    }
  });

  // Calendar cell renderer
  const dateCellRender = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const dayData = calendarData[dateStr];
    if (!dayData || dayData.length === 0) return null;

    return (
      <div style={{ fontSize: '11px' }}>
        {dayData.map((item, index) => {
          const isOverdue = item.type === 'overdue';
          const isPaid = item.type === 'paid';
          const isUpcoming = item.type === 'upcoming';
          
          return (
            <div
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                // If paid and has receipt, open receipt
                if (isPaid && item.receiptNumber && item.receiptSent && onPaymentClick) {
                  onPaymentClick(item);
                } else if (onDateSelect) {
                  onDateSelect(value);
                }
              }}
              style={{
                marginBottom: '2px',
                padding: '2px 4px',
                borderRadius: '2px',
                backgroundColor: isOverdue ? '#ff4d4f' : isPaid ? '#52c41a' : '#1890ff',
                color: 'white',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                cursor: (isPaid && item.receiptNumber && item.receiptSent) ? 'pointer' : 'default'
              }}
              title={isPaid && item.receiptNumber ? 'Click to view receipt' : ''}
            >
              {isOverdue ? '⚠️ ' : isPaid ? '✓ ' : ''}
              ${item.amount.toFixed(0)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Calendar 
      cellRender={dateCellRender}
      onSelect={onDateSelect}
    />
  );
}

