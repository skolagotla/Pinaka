/**
 * Utility to remove console.log statements in production builds
 * This should be run as a build step or via webpack/next.js config
 */

// For Next.js, add this to next.config.js:
// const removeConsoleLogs = require('./lib/utils/remove-console-logs');

// In next.config.js webpack config:
// if (process.env.NODE_ENV === 'production') {
//   config.plugins.push(removeConsoleLogs);
// }

// Simple regex-based approach (for build-time)
function removeConsoleLogs() {
  return {
    name: 'remove-console-logs',
    transform(code, id) {
      if (process.env.NODE_ENV === 'production' && !id.includes('node_modules')) {
        // Remove console.log, console.debug, console.warn (keep console.error)
        code = code.replace(/console\.(log|debug|warn)\([^)]*\);?/g, '');
        // Remove debugger statements
        code = code.replace(/debugger;?/g, '');
        return { code, map: null };
      }
      return null;
    },
  };
}

module.exports = removeConsoleLogs;

