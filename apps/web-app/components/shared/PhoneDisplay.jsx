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

import { Typography } from 'antd';
import { formatPhoneNumber } from '@/lib/utils/formatters';

const { Text } = Typography;

export default function PhoneDisplay({ phone, fallback = '—', ...props }) {
  if (!phone || (typeof phone === 'string' && phone.trim() === '')) {
    return <Text type="secondary" {...props}>{fallback}</Text>;
  }
  
  // Handle object phone values (from forms)
  let phoneValue = phone;
  if (typeof phone === 'object' && phone !== null) {
    phoneValue = phone.value || phone.phone || phone.formatted || '';
  }
  
  // Format phone number (handles both formatted and unformatted)
  const formatted = formatPhoneNumber(phoneValue);
  
  if (!formatted) {
    return <Text type="secondary" {...props}>{fallback}</Text>;
  }
  
  return <Text {...props}>{formatted}</Text>;
}

