/**
 * Clear Rate Limit Store
 * 
 * This script clears the in-memory rate limit store.
 * Useful for development when rate limits are being hit.
 * 
 * Note: This only works if the server is running in the same process.
 * For a running server, you'll need to restart it or use the API endpoint.
 */

console.log('⚠️  Rate limit store is in-memory and cannot be cleared from outside the process.');
console.log('📝 To clear rate limits:');
console.log('   1. Restart the dev server (npm run dev)');
console.log('   2. Or set DISABLE_RATE_LIMIT=true in .env for development');
console.log('');
console.log('💡 Add to .env:');
console.log('   DISABLE_RATE_LIMIT=true');

