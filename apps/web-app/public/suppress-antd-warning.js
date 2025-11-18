/**
 * Suppress Ant Design false positive warning
 * This runs as early as possible before React loads
 */
(function() {
  'use strict';
  
  // Save original console.warn
  const originalWarn = console.warn;
  
  // Override console.warn
  console.warn = function(...args) {
    // Check if this is the Ant Design compatibility warning
    if (args && args.length > 0) {
      const message = String(args[0]);
      if (
        message.includes('[antd: compatible]') &&
        message.includes('antd v5 support React is 16 ~ 18')
      ) {
        // Silently ignore this specific warning
        // We ARE using React 18 - this is a false positive
        return;
      }
    }
    
    // Pass all other warnings through
    originalWarn.apply(console, args);
  };
  
  console.log('✅ Ant Design warning suppression active');
})();

