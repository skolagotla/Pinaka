/**
 * Shared Payment Calendar Component
 * Displays payment calendar with upcoming, paid, and overdue dates
 */

"use client";
import { Badge } from 'flowbite-react';
import { HiCheckCircle, HiExclamationCircle } from 'react-icons/hi';
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

  // Calendar cell renderer - simplified version
  // Note: Flowbite doesn't have a Calendar component, so we'll create a simple grid
  const renderCalendarGrid = () => {
    const currentMonth = dayjs();
    const daysInMonth = currentMonth.daysInMonth();
    const firstDay = currentMonth.startOf('month').day();
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = currentMonth.date(day);
      const dateStr = date.format('YYYY-MM-DD');
      const dayData = calendarData[dateStr] || [];

      days.push(
        <div
          key={day}
          className="p-2 border border-gray-200 dark:border-gray-700 min-h-[80px] cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
          onClick={() => onDateSelect && onDateSelect(date)}
        >
          <div className="text-sm font-semibold mb-1">{day}</div>
          <div className="space-y-1">
            {dayData.map((item, index) => {
              const isOverdue = item.type === 'overdue';
              const isPaid = item.type === 'paid';
              
              return (
                <div
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPaid && item.receiptNumber && item.receiptSent && onPaymentClick) {
                      onPaymentClick(item);
                    }
                  }}
                  className={`text-xs p-1 rounded ${
                    isOverdue 
                      ? 'bg-red-500 text-white' 
                      : isPaid 
                      ? 'bg-green-500 text-white' 
                      : 'bg-blue-500 text-white'
                  } ${(isPaid && item.receiptNumber && item.receiptSent) ? 'cursor-pointer hover:opacity-80' : ''}`}
                  title={isPaid && item.receiptNumber ? 'Click to view receipt' : ''}
                >
                  {isOverdue ? '⚠️ ' : isPaid ? '✓ ' : ''}
                  ${item.amount.toFixed(0)}
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-semibold text-sm text-gray-600 dark:text-gray-400">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">{dayjs().format('MMMM YYYY')}</h3>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Paid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Upcoming</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Overdue</span>
          </div>
        </div>
      </div>
      {renderCalendarGrid()}
    </div>
  );
}
