/**
 * Live Region Component
 * WCAG 2.2 AA: Announces dynamic content changes to screen readers
 */

"use client";

import { useEffect, useRef } from 'react';

interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
  id?: string;
}

export default function LiveRegion({ 
  message, 
  priority = 'polite',
  id = 'live-region'
}: LiveRegionProps) {
  const regionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (message && regionRef.current) {
      // Clear previous message to ensure announcement
      regionRef.current.textContent = '';
      // Force reflow
      void regionRef.current.offsetHeight;
      // Set new message
      regionRef.current.textContent = message;
    }
  }, [message]);

  return (
    <div
      ref={regionRef}
      id={id}
      role="status"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    />
  );
}

