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
import { Select, Label, Spinner } from 'flowbite-react';
import { HiClock, HiCheckCircle } from 'react-icons/hi';
import { ALL_TIMEZONES, getTimezoneLabel, getTimezoneAbbreviation } from '@/lib/constants/timezones';
import { useTimezone } from '@/lib/context/TimezoneContext';
import { useRouter } from 'next/navigation';
import { notify } from '@/lib/utils/notification-helper';

export default function TimezoneSelector({ currentTimezone, userId, userRole }) {
  const router = useRouter();
  const { setTimezone } = useTimezone();
  const [selectedTimezone, setSelectedTimezone] = useState(currentTimezone);
  const [saving, setSaving] = useState(false);

  const handleChange = async (newTimezone) => {
    try {
      setSaving(true);
      setSelectedTimezone(newTimezone);

      // Use v2Api to update timezone for both tenants and landlords
      const { v2Api } = await import('@/lib/api/v2-client');
      if (userRole === 'tenant') {
        await v2Api.tenants.update(userId, { timezone: newTimezone });
      } else {
        // For landlords, use v2Api.landlords
        await v2Api.landlords.update(userId, { timezone: newTimezone });
      }

      // Update app-wide timezone context
      setTimezone(newTimezone);

      notify.success('Timezone updated successfully. All dates will now display in your selected timezone.');

      // Refresh the page to apply timezone changes everywhere
      router.refresh();
    } catch (error) {
      console.error('[TimezoneSelector] Error:', error);
      notify.error(error.message || 'Failed to update timezone');
      // Revert to previous selection on error
      setSelectedTimezone(currentTimezone);
    } finally {
      setSaving(false);
    }
  };

  // Get current timezone abbreviation (e.g., EST, PST)
  const currentAbbr = getTimezoneAbbreviation(selectedTimezone);

  // Flatten timezone options for Select
  const timezoneOptions = ALL_TIMEZONES.flatMap(group => 
    group.options.map(tz => ({
      label: `${tz.label} (${tz.offset})`,
      value: tz.value,
    }))
  );

  return (
    <div>
      <div className="mb-4">
        <Label className="text-sm font-semibold flex items-center gap-2 mb-2">
          <HiClock className="h-4 w-4" />
          Select Your Timezone
        </Label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          All dates and times throughout the app will display in your selected timezone.
          Your current timezone is <strong>{currentAbbr}</strong>.
        </p>
      </div>

      <Select
        value={selectedTimezone}
        onChange={(e) => handleChange(e.target.value)}
        disabled={saving}
        className="w-full"
      >
        <option value="">Search for a timezone...</option>
        {timezoneOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      {saving && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <Spinner size="sm" />
          <span>Saving timezone...</span>
        </div>
      )}

      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
          <strong>Selected:</strong> {getTimezoneLabel(selectedTimezone)}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Current time: <strong>{new Date().toLocaleString('en-US', { timeZone: selectedTimezone })}</strong>
        </p>
      </div>
    </div>
  );
}
