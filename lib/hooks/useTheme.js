/**
 * useTheme Hook
 * Centralized theme management for Ant Design theme customization
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
import { App } from 'antd';
import { getAllThemes } from '../themes/theme-config';

export function useTheme() {
  const { message } = App.useApp();
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
      const res = await fetch('/api/user/theme');
      
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
        message.success('Theme updated successfully! Refreshing page...');
        
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
      message.error(err.message || 'Failed to update theme');
      return false;
    } finally {
      setLoading(false);
    }
  }, [message]);

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

