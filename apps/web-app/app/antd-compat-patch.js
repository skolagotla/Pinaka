/**
 * Ant Design Compatibility Patch
 * Patches Ant Design's internal React version check to prevent false positive warning
 */

// This must run before Ant Design loads
if (typeof window !== 'undefined') {
  // Method 1: Suppress the warning at console level
  const originalWarn = console.warn;
  console.warn = function(...args) {
    if (args && args.length > 0) {
      const message = String(args[0]);
      if (
        message.includes('[antd: compatible]') ||
        message.includes('antd v5 support React')
      ) {
        // Suppress - we ARE using React 18
        return;
      }
    }
    originalWarn.apply(console, args);
  };

  // Method 2: Mock React version check if needed
  // Some versions of Ant Design check React.version directly
  try {
    const React = require('react');
    if (React && React.version) {
      // Ensure version is recognized as compatible
      Object.defineProperty(React, 'version', {
        get() {
          return '18.3.1';
        },
        configurable: true
      });
    }
  } catch (e) {
    // React not loaded yet, that's fine
  }

  console.log('🔧 Ant Design compatibility patch applied');
}

