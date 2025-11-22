// Suppress Next.js dev error overlay for known SSR bug
// This MUST load before React and Next.js to intercept the error overlay
(function() {
  if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') {
    return;
  }

  // Store original functions
  const originalError = console.error;
  const originalWarn = console.warn;

  // Override console.error to suppress specific Next.js errors
  console.error = function(...args) {
    if (!args || args.length === 0) {
      return originalError.apply(console, args);
    }

    const firstArg = args[0];
    const errorStr = typeof firstArg === 'string' ? firstArg : (firstArg?.toString() || '');
    const stack = firstArg?.stack || '';

    // Suppress Next.js 14.2.18 ErrorBoundary SSR bug
    if (errorStr.includes('Cannot read properties of null') && 
        errorStr.includes('useContext')) {
      console.log('[Dev] Suppressed known Next.js SSR bug:', errorStr.substring(0, 100));
      return;
    }

    // Suppress PathnameContext errors
    if (errorStr.includes('PathnameContext') || stack.includes('PathnameContext')) {
      console.log('[Dev] Suppressed PathnameContext SSR error');
      return;
    }

    // Suppress navigation.ts errors during SSR
    if ((errorStr.includes('webpack-internal') || stack.includes('webpack-internal')) && 
        (errorStr.includes('navigation') || stack.includes('navigation'))) {
      console.log('[Dev] Suppressed navigation SSR error');
      return;
    }

    // Pass through all other errors
    originalError.apply(console, args);
  };

  // Suppress unhandled rejections for these errors
  window.addEventListener('unhandledrejection', function(event) {
    if (!event || !event.reason) return;
    
    const errorStr = event.reason?.toString() || '';
    const message = event.reason?.message || '';
    
    if (errorStr.includes('useContext') || 
        errorStr.includes('PathnameContext') ||
        message.includes('useContext') ||
        message.includes('PathnameContext')) {
      console.log('[Dev] Suppressed unhandled rejection for known Next.js bug');
      event.preventDefault();
    }
  });

  // Try to disable Next.js error overlay for this specific error
  // This is a bit of a hack but should work for dev mode
  let overlayCheckInterval;
  
  function checkAndHideErrorOverlay() {
    // Look for Next.js error overlay
    const overlay = document.querySelector('nextjs-portal');
    if (overlay) {
      const shadowRoot = overlay.shadowRoot;
      if (shadowRoot) {
        const errorContent = shadowRoot.textContent || '';
        if (errorContent.includes('useContext') || errorContent.includes('PathnameContext')) {
          console.log('[Dev] Auto-hiding Next.js error overlay for known SSR bug');
          overlay.remove();
        }
      }
    }
  }

  // Check for overlay once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      overlayCheckInterval = setInterval(checkAndHideErrorOverlay, 100);
      setTimeout(function() {
        if (overlayCheckInterval) {
          clearInterval(overlayCheckInterval);
        }
      }, 5000);
    });
  } else {
    overlayCheckInterval = setInterval(checkAndHideErrorOverlay, 100);
    setTimeout(function() {
      if (overlayCheckInterval) {
        clearInterval(overlayCheckInterval);
      }
    }, 5000);
  }

  console.log('[Dev] Next.js error overlay suppressor loaded');
})();

