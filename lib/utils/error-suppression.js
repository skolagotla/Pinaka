/**
 * Error Suppression Utility
 * 
 * Suppresses harmless browser extension errors that clutter the console.
 * These errors are from browser extensions (password managers, autocomplete, etc.)
 * trying to access form controls that don't exist or aren't properly initialized.
 * 
 * This is NOT an application error - it's a browser extension compatibility issue.
 */

/**
 * Suppress browser extension errors in console
 * Call this once in your app initialization
 */
export function suppressBrowserExtensionErrors() {
  if (typeof window === 'undefined') return;

  const originalError = console.error;
  const originalWarn = console.warn;

  // List of known browser extension error patterns
  const extensionErrorPatterns = [
    /Cannot read properties of undefined \(reading 'control'\)/,
    /content_script\.js/,
    /shouldOfferCompletionListForField/,
    /elementWasFocused/,
    /focusInEventHandler/,
  ];

  // List of known Next.js redirect patterns (not real errors)
  const redirectPatterns = [
    /NEXT_REDIRECT/,
    /Error: NEXT_REDIRECT/,
  ];

  console.error = function(...args) {
    const errorMessage = args.join(' ');
    
    // Check if this is a browser extension error
    const isExtensionError = extensionErrorPatterns.some(pattern => 
      pattern.test(errorMessage)
    );

    if (isExtensionError) {
      // Suppress the error (don't log it)
      // Optionally, you can log it at debug level if needed
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Suppressed] Browser extension error:', ...args);
      }
      return;
    }

    // Check if this is a Next.js redirect (not a real error)
    const isRedirect = redirectPatterns.some(pattern => 
      pattern.test(errorMessage)
    ) || args.some(arg => arg?.digest?.includes('NEXT_REDIRECT'));

    if (isRedirect) {
      // Suppress redirect "errors" - they're expected behavior
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Suppressed] Next.js redirect:', ...args);
      }
      return;
    }

    // Suppress Ant Design CSS-in-JS cleanup warnings (harmless)
    // These occur when components unmount during render, which is common in React 18+
    // Ant Design logs these as errors but they're actually harmless warnings
    if (errorMessage.includes('[Ant Design CSS-in-JS]') && 
        errorMessage.includes('cleanup function after unmount')) {
      // Suppress the warning - it's harmless and doesn't affect functionality
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Suppressed] Ant Design CSS-in-JS cleanup warning:', ...args);
      }
      return;
    }

    // Log all other errors normally
    originalError.apply(console, args);
  };

  console.warn = function(...args) {
    const warnMessage = args.join(' ');
    
    // Check if this is a browser extension warning
    const isExtensionWarning = extensionErrorPatterns.some(pattern => 
      pattern.test(warnMessage)
    );

    if (isExtensionWarning) {
      // Suppress the warning
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Suppressed] Browser extension warning:', ...args);
      }
      return;
    }

    // Suppress Ant Design CSS-in-JS cleanup warnings (harmless)
    // These occur when components unmount during render, which is common in React 18+
    if (warnMessage.includes('[Ant Design CSS-in-JS]') && 
        warnMessage.includes('cleanup function after unmount')) {
      // Suppress the warning - it's harmless and doesn't affect functionality
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Suppressed] Ant Design CSS-in-JS cleanup warning:', ...args);
      }
      return;
    }

    // Log all other warnings normally
    originalWarn.apply(console, args);
  };

  // Also catch unhandled promise rejections from extensions
  window.addEventListener('unhandledrejection', (event) => {
    const errorMessage = event.reason?.message || String(event.reason || '');
    
    if (extensionErrorPatterns.some(pattern => pattern.test(errorMessage))) {
      event.preventDefault(); // Suppress the error
      if (process.env.NODE_ENV === 'development') {
        console.debug('[Suppressed] Browser extension promise rejection:', event.reason);
      }
    }
  });
}

/**
 * Add defensive attributes to form inputs to prevent extension interference
 * This is a helper to add to Input components
 */
export function getDefensiveInputProps(type = 'text') {
  return {
    autoComplete: type === 'email' ? 'email' : type === 'password' ? 'current-password' : 'off',
    'data-form-type': type,
    'data-lpignore': 'true', // LastPass ignore
    'data-1p-ignore': 'true', // 1Password ignore
    'data-dashlane-ignore': 'true', // Dashlane ignore
  };
}

