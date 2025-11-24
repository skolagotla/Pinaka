/**
 * ═══════════════════════════════════════════════════════════════
 * PHONE DISPLAY COMPONENT
 * ═══════════════════════════════════════════════════════════════
 * 
 * ALWAYS USE THIS COMPONENT TO DISPLAY PHONE NUMBERS
 * 
 * This component automatically formats phone numbers consistently
 * across the entire application. No manual formatting needed
 * 
 * Usage:
 *   <PhoneDisplay phone={user.phone} />
 *   <PhoneDisplay phone={record.phone} fallback="—" />
 * 
 * ═══════════════════════════════════════════════════════════════
 */

"use client";
import { formatPhoneNumber } from '@/lib/utils/formatters';

export default function PhoneDisplay({ phone, fallback = '—', className = '', ...props }) {
  if (!phone || (typeof phone === 'string' && phone.trim() === '')) {
    return <span className={`text-gray-500 dark:text-gray-400 ${className}`} {...props}>{fallback}</span>;
  }
  
  // Handle object phone values (from forms)
  let phoneValue = phone;
  if (typeof phone === 'object' && phone !== null) {
    phoneValue = phone.value || phone.phone || phone.formatted || '';
  }
  
  // Format phone number (handles both formatted and unformatted)
  const formatted = formatPhoneNumber(phoneValue);
  
  if (!formatted) {
    return <span className={`text-gray-500 dark:text-gray-400 ${className}`} {...props}>{fallback}</span>;
  }
  
  return <span className={className} {...props}>{formatted}</span>;
}
