/**
 * Stub module to replace dayjs/locale/zh-cn
 * This prevents ProProvider from trying to load the Chinese locale
 * which causes HMR issues with Turbopack
 */

// Return an empty object to satisfy the require
module.exports = {};

