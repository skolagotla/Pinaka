/**
 * Timezone Constants for US and Canada
 * 
 * Organized by region for easy selection
 * Includes all major timezones used in USA and Canada
 */

export const US_TIMEZONES = [
  // Eastern Time
  { value: 'America/New_York', label: 'Eastern Time (ET) - New York', offset: 'UTC-5/-4' },
  { value: 'America/Detroit', label: 'Eastern Time (ET) - Detroit', offset: 'UTC-5/-4' },
  { value: 'America/Kentucky/Louisville', label: 'Eastern Time (ET) - Louisville', offset: 'UTC-5/-4' },
  
  // Central Time
  { value: 'America/Chicago', label: 'Central Time (CT) - Chicago', offset: 'UTC-6/-5' },
  { value: 'America/Indiana/Knox', label: 'Central Time (CT) - Knox, Indiana', offset: 'UTC-6/-5' },
  { value: 'America/North_Dakota/Center', label: 'Central Time (CT) - North Dakota', offset: 'UTC-6/-5' },
  
  // Mountain Time
  { value: 'America/Denver', label: 'Mountain Time (MT) - Denver', offset: 'UTC-7/-6' },
  { value: 'America/Phoenix', label: 'Mountain Time (MT) - Phoenix (No DST)', offset: 'UTC-7' },
  { value: 'America/Boise', label: 'Mountain Time (MT) - Boise', offset: 'UTC-7/-6' },
  
  // Pacific Time
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT) - Los Angeles', offset: 'UTC-8/-7' },
  { value: 'America/Anchorage', label: 'Alaska Time (AKT) - Anchorage', offset: 'UTC-9/-8' },
  { value: 'Pacific/Honolulu', label: 'Hawaii-Aleutian Time (HST) - Honolulu', offset: 'UTC-10' },
];

export const CANADA_TIMEZONES = [
  // Newfoundland Time
  { value: 'America/St_Johns', label: 'Newfoundland Time (NT) - St. Johns', offset: 'UTC-3:30/-2:30' },
  
  // Atlantic Time
  { value: 'America/Halifax', label: 'Atlantic Time (AT) - Halifax', offset: 'UTC-4/-3' },
  { value: 'America/Moncton', label: 'Atlantic Time (AT) - Moncton', offset: 'UTC-4/-3' },
  { value: 'America/Glace_Bay', label: 'Atlantic Time (AT) - Glace Bay', offset: 'UTC-4/-3' },
  
  // Eastern Time
  { value: 'America/Toronto', label: 'Eastern Time (ET) - Toronto', offset: 'UTC-5/-4' },
  { value: 'America/Montreal', label: 'Eastern Time (ET) - Montreal', offset: 'UTC-5/-4' },
  { value: 'America/Nipigon', label: 'Eastern Time (ET) - Nipigon', offset: 'UTC-5/-4' },
  { value: 'America/Thunder_Bay', label: 'Eastern Time (ET) - Thunder Bay', offset: 'UTC-5/-4' },
  { value: 'America/Iqaluit', label: 'Eastern Time (ET) - Iqaluit', offset: 'UTC-5/-4' },
  
  // Central Time
  { value: 'America/Winnipeg', label: 'Central Time (CT) - Winnipeg', offset: 'UTC-6/-5' },
  { value: 'America/Regina', label: 'Central Time (CT) - Regina (No DST)', offset: 'UTC-6' },
  { value: 'America/Rankin_Inlet', label: 'Central Time (CT) - Rankin Inlet', offset: 'UTC-6/-5' },
  
  // Mountain Time
  { value: 'America/Edmonton', label: 'Mountain Time (MT) - Edmonton', offset: 'UTC-7/-6' },
  { value: 'America/Calgary', label: 'Mountain Time (MT) - Calgary', offset: 'UTC-7/-6' },
  { value: 'America/Cambridge_Bay', label: 'Mountain Time (MT) - Cambridge Bay', offset: 'UTC-7/-6' },
  { value: 'America/Yellowknife', label: 'Mountain Time (MT) - Yellowknife', offset: 'UTC-7/-6' },
  { value: 'America/Inuvik', label: 'Mountain Time (MT) - Inuvik', offset: 'UTC-7/-6' },
  
  // Pacific Time
  { value: 'America/Vancouver', label: 'Pacific Time (PT) - Vancouver', offset: 'UTC-8/-7' },
  { value: 'America/Dawson_Creek', label: 'Pacific Time (PT) - Dawson Creek (No DST)', offset: 'UTC-7' },
  { value: 'America/Whitehorse', label: 'Pacific Time (PT) - Whitehorse', offset: 'UTC-8/-7' },
];

// Combined list for dropdown
export const ALL_TIMEZONES = [
  { label: '🇺🇸 United States', options: US_TIMEZONES },
  { label: '🇨🇦 Canada', options: CANADA_TIMEZONES },
];

// Flat list for validation
export const ALL_TIMEZONE_VALUES = [
  ...US_TIMEZONES.map(tz => tz.value),
  ...CANADA_TIMEZONES.map(tz => tz.value),
];

// Default timezone (Eastern Time - most common)
export const DEFAULT_TIMEZONE = 'America/Toronto';

// Get timezone display name
export function getTimezoneLabel(value) {
  const allTimezones = [...US_TIMEZONES, ...CANADA_TIMEZONES];
  const timezone = allTimezones.find(tz => tz.value === value);
  return timezone ? timezone.label : value;
}

// Get user's browser timezone (for initial default)
export function getBrowserTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    return DEFAULT_TIMEZONE;
  }
}

// Check if timezone is valid
export function isValidTimezone(timezone) {
  return ALL_TIMEZONE_VALUES.includes(timezone);
}

// Get timezone abbreviation (e.g., "EST", "PST")
export function getTimezoneAbbreviation(timezone) {
  try {
    const date = new Date();
    const formatted = date.toLocaleString('en-US', { 
      timeZone: timezone, 
      timeZoneName: 'short' 
    });
    const parts = formatted.split(' ');
    return parts[parts.length - 1]; // Gets the timezone abbreviation
  } catch (error) {
    return timezone;
  }
}

