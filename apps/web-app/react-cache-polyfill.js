// React.cache polyfill for React 18 compatibility with Next.js 14.2.25
// This polyfill is needed because Next.js 14.2.25 uses React.cache which is a React 19 feature
// We need to add it to React 18 before any Next.js code tries to use it

// This file is loaded by webpack ProvidePlugin to inject React.cache globally

// For CommonJS (Node.js/server-side)
if (typeof require !== 'undefined') {
  try {
    const React = require('react');
    if (React && !React.cache) {
      // Polyfill React.cache for React 18
      // This is a simplified version - React 19's cache is more sophisticated
      React.cache = function cache(fn) {
        const cache = new Map();
        return function cached(...args) {
          const key = JSON.stringify(args);
          if (cache.has(key)) {
            return cache.get(key);
          }
          const result = fn(...args);
          cache.set(key, result);
          return result;
        };
      };
    }
  } catch (e) {
    // React not available yet, will be patched later
  }
}

// For ES modules (client-side)
if (typeof window !== 'undefined') {
  // Patch React on the client side too
  import('react').then((ReactModule) => {
    const React = ReactModule.default || ReactModule;
    if (React && !React.cache) {
      React.cache = function cache(fn) {
        const cache = new Map();
        return function cached(...args) {
          const key = JSON.stringify(args);
          if (cache.has(key)) {
            return cache.get(key);
          }
          const result = fn(...args);
          cache.set(key, result);
          return result;
        };
      };
    }
  }).catch(() => {
    // Ignore errors
  });
}

// Export for webpack ProvidePlugin
module.exports = {};
