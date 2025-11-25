/**
 * Announcement Hook
 * WCAG 2.2 AA: Announces messages to screen readers
 */

import { useState, useEffect } from 'react';

export function useAnnouncement() {
  const [message, setMessage] = useState<string>('');
  const [priority, setPriority] = useState<'polite' | 'assertive'>('polite');

  const announce = (msg: string, pri: 'polite' | 'assertive' = 'polite') => {
    setPriority(pri);
    setMessage(msg);
  };

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return { message, priority, announce };
}

