/**
 * Custom hook for clipboard operations
 * Provides copy to clipboard functionality with feedback
 * 
 * @param {number} resetDelay - Time in ms before resetting copied state (default: 2000)
 * @returns {Object} - Clipboard state and control functions
 */

import { useState, useCallback } from 'react';

export function useClipboard(resetDelay = 2000) {
  const [copiedText, setCopiedText] = useState(null);
  const [error, setError] = useState(null);

  /**
   * Copy text to clipboard
   */
  const copy = useCallback(async (text) => {
    if (!navigator?.clipboard) {
      setError('Clipboard not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setError(null);

      // Reset copied state after delay
      if (resetDelay > 0) {
        setTimeout(() => {
          setCopiedText(null);
        }, resetDelay);
      }

      return true;
    } catch (err) {
      setError(err.message || 'Failed to copy');
      setCopiedText(null);
      return false;
    }
  }, [resetDelay]);

  /**
   * Read text from clipboard
   */
  const read = useCallback(async () => {
    if (!navigator?.clipboard) {
      setError('Clipboard not supported');
      return null;
    }

    try {
      const text = await navigator.clipboard.readText();
      setError(null);
      return text;
    } catch (err) {
      setError(err.message || 'Failed to read clipboard');
      return null;
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setCopiedText(null);
    setError(null);
  }, []);

  return {
    // State
    copiedText,
    error,
    isCopied: copiedText !== null,
    
    // Controls
    copy,
    read,
    reset,
  };
}

