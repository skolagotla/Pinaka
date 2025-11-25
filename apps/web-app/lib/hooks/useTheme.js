/**
 * useTheme Hook
 * Centralized theme management for theme customization
 * 
 * Features:
 * - Get current user's theme
 * - Change theme with API persistence
 * - Loading states
 * - Error handling
 * 
 * Usage:
 * const { currentTheme, availableThemes, changeTheme, loading, error } = useTheme();
 */

import { useState, useCallback } from 'react';
import { getAllThemes } from '../themes/theme-config';
import { notify } from '@/lib/utils/notification-helper';

export function useTheme() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentTheme, setCurrentTheme] = useState('default');

  // Get all available themes
  const availableThemes = getAllThemes();

  // Fetch current theme from API
  const fetchCurrentTheme = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Theme API endpoint - use v2 API
      const baseUrl = process.env.NEXT_PUBLIC_API_V2_BASE_URL || 'http://localhost:8000/api/v2';
      const res = await fetch(`${baseUrl}/users/me`, {
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (res.ok) {
        const data = await res.json();
        setCurrentTheme(data.theme || 'default');
      } else {
        throw new Error('Failed to fetch theme');
      }
    } catch (err) {
      console.error('[useTheme] Error fetching theme:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Change theme and persist to API
  const changeTheme = useCallback(async (themeId) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/user/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themeId }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentTheme(data.theme);
        notify.success('Theme updated successfully! Refreshing page...');
        
        // Reload page to apply new theme
        setTimeout(() => {
          window.location.reload();
        }, 500);
        
        return true;
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update theme');
      }
    } catch (err) {
      console.error('[useTheme] Error changing theme:', err);
      setError(err.message);
      notify.error(err.message || 'Failed to update theme');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    currentTheme,
    availableThemes,
    changeTheme,
    fetchCurrentTheme,
    loading,
    error,
  };
}

export default useTheme;
