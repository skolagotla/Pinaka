/**
 * Timezone Selector Component
 * 
 * Allows users to select their preferred timezone from a list of US & Canada timezones
 * Automatically saves to the database and updates the app-wide timezone context
 * 
 * Usage:
 * ```jsx
 * <TimezoneSelector 
 *   currentTimezone="America/Toronto" 
 *   userId="123" 
 *   userRole="landlord"
 * />
 * ```
 */

"use client";
import { useState } from 'react';
import { Select, App, Typography, Spin } from 'antd';
import { ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { ALL_TIMEZONES, getTimezoneLabel, getTimezoneAbbreviation } from '@/lib/constants/timezones';
import { useTimezone } from '@/lib/context/TimezoneContext';
import { useRouter } from 'next/navigation';

const { Text, Paragraph } = Typography;

export default function TimezoneSelector({ currentTimezone, userId, userRole }) {
  const router = useRouter();
  const { message } = App.useApp();
  const { setTimezone } = useTimezone();
  const [selectedTimezone, setSelectedTimezone] = useState(currentTimezone);
  const [saving, setSaving] = useState(false);

  const handleChange = async (newTimezone) => {
    try {
      setSaving(true);
      setSelectedTimezone(newTimezone);

      // Determine the API endpoint based on userRole
      const endpoint = userRole === 'landlord' 
        ? `/api/landlords/${userId}`
        : `/api/tenants/${userId}`;

      // Use direct fetch for timezone update (no v1 equivalent yet)
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          timezone: newTimezone,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error || error.message || 'Failed to update timezone');
      }

      // Update app-wide timezone context
      setTimezone(newTimezone);

      message.success({
        content: 'Timezone updated successfully! All dates will now display in your selected timezone.',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
        duration: 3,
      });

      // Refresh the page to apply timezone changes everywhere
      router.refresh();
    } catch (error) {
      console.error('[TimezoneSelector] Error:', error);
      message.error(error.message || 'Failed to update timezone');
      // Revert to previous selection on error
      setSelectedTimezone(currentTimezone);
    } finally {
      setSaving(false);
    }
  };

  // Convert timezone groups to Ant Design Select format
  const options = ALL_TIMEZONES.map(group => ({
    label: group.label,
    options: group.options.map(tz => ({
      label: `${tz.label} (${tz.offset})`,
      value: tz.value,
      searchLabel: `${tz.label} ${tz.offset} ${tz.value}`.toLowerCase(),
    })),
  }));

  // Get current timezone abbreviation (e.g., EST, PST)
  const currentAbbr = getTimezoneAbbreviation(selectedTimezone);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Text strong style={{ fontSize: 14, display: 'block', marginBottom: 8 }}>
          <ClockCircleOutlined /> Select Your Timezone
        </Text>
        <Paragraph type="secondary" style={{ fontSize: 12, marginBottom: 12 }}>
          All dates and times throughout the app will display in your selected timezone.
          Your current timezone is <strong>{currentAbbr}</strong>.
        </Paragraph>
      </div>

      <Select
        value={selectedTimezone}
        onChange={handleChange}
        options={options}
        showSearch
        filterOption={(input, option) => {
          // Search across label and value
          return option.searchLabel?.includes(input.toLowerCase()) || false;
        }}
        placeholder="Search for a timezone..."
        style={{ width: '100%' }}
        size="large"
        disabled={saving}
        suffixIcon={saving ? <Spin size="small" /> : undefined}
        optionLabelProp="label"
      />

      <div style={{ 
        marginTop: 12, 
        padding: '12px 16px', 
        backgroundColor: '#f5f5f5', 
        borderRadius: 8,
        border: '1px solid #d9d9d9'
      }}>
        <Text type="secondary" style={{ fontSize: 12 }}>
          <strong>Selected:</strong> {getTimezoneLabel(selectedTimezone)}
        </Text>
        <br />
        <Text type="secondary" style={{ fontSize: 11 }}>
          Current time: <strong>{new Date().toLocaleString('en-US', { timeZone: selectedTimezone })}</strong>
        </Text>
      </div>
    </div>
  );
}

