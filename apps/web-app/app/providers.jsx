"use client";
// Providers - Flowbite-compatible (no Ant Design ConfigProvider needed)
import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { TimezoneProvider } from '@/lib/context/TimezoneContext';
import { PropertyProvider } from '@/lib/contexts/PropertyContext';
import { initializeApiInterceptors } from '@/lib/utils/api-interceptors';
import { suppressBrowserExtensionErrors } from '@/lib/utils/error-suppression';
import { reportWebVital } from './web-vitals';

// Create a client for React Query with optimized caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes (increased from 1 minute for better performance)
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime - keep data in cache longer)
      refetchOnWindowFocus: false, // Don't refetch on window focus (better UX)
      refetchOnMount: false, // Don't refetch if data is fresh
      refetchOnReconnect: true, // Refetch on reconnect (network recovery)
      retry: (failureCount, error) => {
        // Retry on network errors, not 4xx/5xx
        if (error?.status >= 400 && error?.status < 500) {
          return false; // Don't retry client errors
        }
        return failureCount < 2; // Retry up to 2 times for network errors
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    },
    mutations: {
      retry: false, // Don't retry mutations
    },
  },
});

// Configure dayjs locale to English (must be done before any dayjs imports)
if (typeof window !== 'undefined') {
  const dayjs = require('dayjs');
  require('dayjs/locale/en');
  dayjs.locale('en');
}

// Suppress browser extension errors
if (typeof window !== 'undefined') {
  const originalError = console.error;
  console.error = function(...args) {
    if (args && args[0] && typeof args[0] === 'string') {
      // Suppress hydration errors for aria-describedby (Tooltip dynamic IDs)
      if (args[0].includes('aria-describedby')) {
        return;
      }
      // Suppress general hydration mismatch warnings
      if (args[0].includes('A tree hydrated but some attributes')) {
        return;
      }
      // Suppress React hydration mismatch errors
      if (args[0].includes('hydration-mismatch')) {
        return;
      }
      // Suppress browser extension errors (password managers, autocomplete, etc.)
      if (args[0].includes('Cannot read properties of undefined') && 
          (args[0].includes("reading 'control'") || args[0].includes('content_script'))) {
        return;
      }
      // Suppress NEXT_REDIRECT errors - these are expected in Next.js when using redirect()
      const errorStr = typeof args[0] === 'string' ? args[0] : (args[0]?.message || String(args[0] || ''));
      if (errorStr.includes('NEXT_REDIRECT') || 
          (args[0]?.digest && String(args[0].digest).includes('NEXT_REDIRECT'))) {
        return;
      }
      // Suppress redirect-related error messages from page-wrapper
      if (errorStr.includes('[page-wrapper]') && errorStr.includes('NEXT_REDIRECT')) {
        return;
      }
    }
    originalError.apply(console, args);
  };
  
  // Initialize browser extension error suppression
  suppressBrowserExtensionErrors();
}

export default function Providers({ children, userTheme = 'default', userTimezone = null, userRole = null, initialProperties = [], useAuth0 = false }) {
  // Initialize API interceptors once on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeApiInterceptors();
      
      // Initialize Web Vitals tracking
      import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
        onCLS(reportWebVital);
        onFID(reportWebVital);
        onFCP(reportWebVital);
        onLCP(reportWebVital);
        onTTFB(reportWebVital);
      }).catch(() => {
        // web-vitals not installed, skip
      });
      
      // Register service worker for caching and offline support (production only)
      if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
        import('@/lib/utils/service-worker-register').then(({ registerServiceWorker }) => {
          registerServiceWorker();
        }).catch(() => {
          // Service worker registration failed, skip
        });
      }
    }
  }, []);

  // Conditionally wrap with providers
  const content = (
    <QueryClientProvider client={queryClient}>
      <TimezoneProvider initialTimezone={userTimezone}>
        <PropertyProvider userRole={userRole} initialProperties={initialProperties}>
          {children}
          {process.env.NODE_ENV === 'development' && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}
        </PropertyProvider>
      </TimezoneProvider>
    </QueryClientProvider>
  );

  return content;
}
