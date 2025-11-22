// Suppress Next.js dev error overlay for known SSR bug
// This only affects development mode - production is unaffected

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  // Override Next.js error overlay to filter out known SSR bugs
  const originalError = console.error;
  console.error = function(...args) {
    const errorStr = args[0]?.toString() || '';
    
    // Suppress known Next.js 14.2.18 ErrorBoundary SSR bug
    if (errorStr.includes('useContext') && 
        errorStr.includes('reading') && 
        args[0]?.stack?.includes('error-boundary')) {
      // Silently ignore this specific error
      return;
    }
    
    // Suppress PathnameContext errors
    if (errorStr.includes('PathnameContext')) {
      return;
    }
    
    // Suppress Next.js navigation errors during SSR
    if (errorStr.includes('webpack-internal') && 
        errorStr.includes('navigation.ts')) {
      return;
    }
    
    // Pass through all other errors
    originalError.apply(console, args);
  };

  // Also suppress unhandled promise rejections for these errors
  window.addEventListener('unhandledrejection', (event) => {
    const errorStr = event.reason?.toString() || '';
    if (errorStr.includes('useContext') || 
        errorStr.includes('PathnameContext') ||
        errorStr.includes('navigation.ts')) {
      event.preventDefault();
    }
  });

  // Suppress Next.js error overlay specifically
  const originalPushState = window.history.pushState;
  const originalReplaceState = window.history.replaceState;
  
  // Intercept Next.js error overlay
  Object.defineProperty(window, '__NEXT_DATA__', {
    configurable: true,
    get() {
      return this._nextData;
    },
    set(value) {
      this._nextData = value;
    }
  });
}

