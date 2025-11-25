/**
 * Focus Management Hook
 * WCAG 2.2 AA: Manages focus for modals, route changes, etc.
 */

import { useEffect, useRef } from 'react';

interface UseFocusManagementOptions {
  isOpen?: boolean;
  returnFocusOnClose?: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
}

export function useFocusManagement({
  isOpen = false,
  returnFocusOnClose = true,
  initialFocus,
}: UseFocusManagementOptions = {}) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus initial element or first focusable
      if (initialFocus?.current) {
        initialFocus.current.focus();
      } else {
        // Find first focusable element
        const focusable = document.querySelector<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      }
    } else if (returnFocusOnClose && previousFocusRef.current) {
      // Return focus to previous element
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
  }, [isOpen, returnFocusOnClose, initialFocus]);
}

/**
 * Hook to focus on page heading on route change
 */
export function usePageFocus(headingRef: React.RefObject<HTMLHeadingElement>) {
  useEffect(() => {
    headingRef.current?.focus();
  }, [headingRef]);
}

