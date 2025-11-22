"use client";
// Auth0 Provider (conditional - only imported when needed)
import { ConfigProvider, App, theme as antdTheme } from 'antd';
import enUS from 'antd/locale/en_US';
import { useEffect } from 'react';
import { getThemeById } from '@/lib/themes/theme-config';
import { TimezoneProvider } from '@/lib/context/TimezoneContext';
import { PropertyProvider } from '@/lib/contexts/PropertyContext';
import { initializeApiInterceptors } from '@/lib/utils/api-interceptors';
import { suppressBrowserExtensionErrors } from '@/lib/utils/error-suppression';
import { reportWebVital } from './web-vitals';

// Configure dayjs locale to English (must be done before any dayjs imports)
if (typeof window !== 'undefined') {
  const dayjs = require('dayjs');
  require('dayjs/locale/en');
  dayjs.locale('en');
}

// Suppress Ant Design false positive warning at ALL levels
if (typeof window !== 'undefined') {
  // 1. Suppress console.warn
  const originalWarn = console.warn;
  console.warn = function(...args) {
    if (args && args[0] && typeof args[0] === 'string') {
      if (args[0].includes('[antd: compatible]') || args[0].includes('antd v5 support React')) {
        return; // Suppress - we ARE using React 18
      }
    }
    originalWarn.apply(console, args);
  };

  // 2. Suppress console.error (some warnings use error)
  const originalError = console.error;
  console.error = function(...args) {
    if (args && args[0] && typeof args[0] === 'string') {
      // Suppress Ant Design React version warnings
      if (args[0].includes('[antd: compatible]') || args[0].includes('antd v5 support React')) {
        return; // Suppress - we ARE using React 18
      }
      // Suppress hydration errors for aria-describedby (Ant Design Tooltip dynamic IDs)
      if (args[0].includes('aria-describedby')) {
        return; // Suppress - known issue with Ant Design Tooltip IDs
      }
      // Suppress general hydration mismatch warnings
      if (args[0].includes('A tree hydrated but some attributes')) {
        return; // Suppress - React hydration mismatch (non-critical)
      }
      // Suppress React hydration mismatch errors
      if (args[0].includes('hydration-mismatch')) {
        return; // Suppress - known issue with dynamic content
      }
      // Suppress Ant Design Form useForm warning (forms created but not yet rendered)
      if (args[0].includes('Instance created by `useForm` is not connected')) {
        return; // Suppress - forms are connected but initialized before modal opens
      }
      // Suppress Ant Design message static function warning
      if (args[0].includes('Static function can not consume context like dynamic theme')) {
        return; // Suppress - static message API works fine for our use case
      }
      // Suppress browser extension errors (password managers, autocomplete, etc.)
      if (args[0].includes('Cannot read properties of undefined') && 
          (args[0].includes("reading 'control'") || args[0].includes('content_script'))) {
        return; // Suppress - browser extension trying to access form controls
      }
      // Suppress NEXT_REDIRECT errors - these are expected in Next.js when using redirect()
      const errorStr = typeof args[0] === 'string' ? args[0] : (args[0]?.message || String(args[0] || ''));
      if (errorStr.includes('NEXT_REDIRECT') || 
          (args[0]?.digest && String(args[0].digest).includes('NEXT_REDIRECT'))) {
        return; // Suppress - this is how Next.js handles redirects, not an error
      }
      // Suppress redirect-related error messages from page-wrapper
      if (errorStr.includes('[page-wrapper]') && errorStr.includes('NEXT_REDIRECT')) {
        return; // Suppress - redirect is working as intended
      }
    }
    originalError.apply(console, args);
  };
  
  // Initialize browser extension error suppression
  suppressBrowserExtensionErrors();
}

export default function Providers({ children, userTheme = 'default', userTimezone = null, userRole = null, initialProperties = [], useAuth0 = false }) {
  // AUTH0 DISABLED: Commented out to use password-based authentication only
  // const [Auth0ProviderComponent, setAuth0ProviderComponent] = useState(null);

  // // Dynamically load Auth0Provider only when useAuth0 is true
  // useEffect(() => {
  //   if (useAuth0) {
  //     import('@auth0/nextjs-auth0/client').then((module) => {
  //       setAuth0ProviderComponent(() => module.Auth0Provider);
  //     }).catch((error) => {
  //       console.error('Failed to load Auth0Provider:', error);
  //     });
  //   }
  // }, [useAuth0]);

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
  
  useEffect(() => {
    // Suppress Ant Design notification system warnings
    // Override App.notification to filter out compatibility warnings
    if (typeof window !== 'undefined' && window.antd) {
      const originalNotification = window.antd.notification;
      if (originalNotification) {
        const originalError = originalNotification.error;
        originalNotification.error = function(config) {
          // Check if this is the compatibility warning
          if (config && config.message && typeof config.message === 'string') {
            if (config.message.includes('[antd: compatible]') || config.message.includes('antd v5 support React')) {
              return; // Suppress notification
            }
          }
          if (config && config.description && typeof config.description === 'string') {
            if (config.description.includes('[antd: compatible]') || config.description.includes('antd v5 support React')) {
              return; // Suppress notification
            }
          }
          return originalError.call(this, config);
        };
      }
    }
  }, [userTheme]);

  // Get theme configuration based on user preference
  const themeConfig = getThemeById(userTheme);
  const isDarkMode = themeConfig.config.algorithm === 'dark';

  // Conditionally wrap with Auth0Provider only when using Auth0
  const content = (
    <TimezoneProvider initialTimezone={userTimezone}>
      <PropertyProvider userRole={userRole} initialProperties={initialProperties}>
        <ConfigProvider 
          locale={enUS}
          theme={{
            ...themeConfig.config,
            algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
          }}
          warning={{
            // Disable React version compatibility warning
            strict: false
          }}
        >
          <App>
            {children}
          </App>
        </ConfigProvider>
      </PropertyProvider>
    </TimezoneProvider>
  );

  // AUTH0 DISABLED: Using password-based authentication only
  // if (useAuth0 && Auth0ProviderComponent) {
  //   return <Auth0ProviderComponent>{content}</Auth0ProviderComponent>;
  // }

  return content;
}

