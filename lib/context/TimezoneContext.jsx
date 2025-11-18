/**
 * Timezone Context Provider
 * 
 * Makes the current user's timezone available throughout the app
 * Usage: const { timezone, setTimezone } = useTimezone();
 */

"use client";
import { createContext, useContext, useState, useEffect } from 'react';
import { DEFAULT_TIMEZONE, getBrowserTimezone } from '../constants/timezones';

const TimezoneContext = createContext({
  timezone: DEFAULT_TIMEZONE,
  setTimezone: () => {},
});

export function TimezoneProvider({ children, initialTimezone = null }) {
  const [timezone, setTimezone] = useState(() => {
    // Priority order:
    // 1. Explicitly provided initialTimezone (from user profile)
    // 2. Browser timezone (if valid)
    // 3. Default timezone (fallback)
    return initialTimezone || getBrowserTimezone() || DEFAULT_TIMEZONE;
  });

  // Update timezone when initialTimezone prop changes (e.g., after user login)
  useEffect(() => {
    if (initialTimezone && initialTimezone !== timezone) {
      setTimezone(initialTimezone);
    }
  }, [initialTimezone]);

  return (
    <TimezoneContext.Provider value={{ timezone, setTimezone }}>
      {children}
    </TimezoneContext.Provider>
  );
}

/**
 * Hook to access timezone context
 * @returns {{ timezone: string, setTimezone: (tz: string) => void }}
 */
export function useTimezone() {
  const context = useContext(TimezoneContext);
  if (!context) {
    // Return default if used outside provider (for backwards compatibility)
    console.warn('useTimezone() called outside TimezoneProvider, using default timezone');
    return { timezone: DEFAULT_TIMEZONE, setTimezone: () => {} };
  }
  return context;
}

