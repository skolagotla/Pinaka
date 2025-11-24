/**
 * Centralized Application Logger
 * Tracks user actions, API calls, errors, and application state changes
 */

class AppLogger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Keep last 1000 logs in memory
    this.isEnabled = true;
  }

  /**
   * Format log entry with timestamp and context
   */
  formatLog(level, category, message, data = {}) {
    const timestamp = new Date().toISOString();
    const entry = {
      timestamp,
      level,
      category,
      message,
      data,
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server'
    };

    // Add to in-memory logs
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    return entry;
  }

  /**
   * Log user action (click, form submit, etc.)
   */
  action(message, data = {}) {
    const entry = this.formatLog('ACTION', 'user', message, data);
    console.log(`🎯 [ACTION] ${message}`, data);
    return entry;
  }

  /**
   * Log navigation event
   */
  navigation(message, data = {}) {
    const entry = this.formatLog('INFO', 'navigation', message, data);
    console.log(`🧭 [NAV] ${message}`, data);
    return entry;
  }

  /**
   * Log API call
   */
  apiCall(method, url, data = {}) {
    const entry = this.formatLog('INFO', 'api', `${method} ${url}`, data);
    console.log(`📡 [API] ${method} ${url}`, data);
    return entry;
  }

  /**
   * Log API response
   */
  apiResponse(method, url, status, data = {}) {
    const entry = this.formatLog('INFO', 'api', `${method} ${url} - ${status}`, data);
    console.log(`✅ [API RESPONSE] ${method} ${url} - ${status}`, data);
    return entry;
  }

  /**
   * Log API error
   */
  apiError(method, url, error) {
    const entry = this.formatLog('ERROR', 'api', `${method} ${url} - ERROR`, {
      error: error.message,
      stack: error.stack
    });
    console.error(`❌ [API ERROR] ${method} ${url}`, error);
    return entry;
  }

  /**
   * Log form interaction
   */
  form(message, data = {}) {
    const entry = this.formatLog('INFO', 'form', message, data);
    console.log(`📝 [FORM] ${message}`, data);
    return entry;
  }

  /**
   * Log modal interaction
   */
  modal(message, data = {}) {
    const entry = this.formatLog('INFO', 'modal', message, data);
    console.log(`🪟 [MODAL] ${message}`, data);
    return entry;
  }

  /**
   * Log state change
   */
  state(message, data = {}) {
    const entry = this.formatLog('INFO', 'state', message, data);
    console.log(`🔄 [STATE] ${message}`, data);
    return entry;
  }

  /**
   * Log error
   */
  error(message, error, data = {}) {
    const entry = this.formatLog('ERROR', 'error', message, {
      ...data,
      error: error?.message || error,
      stack: error?.stack
    });
    console.error(`❌ [ERROR] ${message}`, error, data);
    return entry;
  }

  /**
   * Log warning
   */
  warn(message, data = {}) {
    const entry = this.formatLog('WARN', 'warning', message, data);
    console.warn(`⚠️ [WARN] ${message}`, data);
    return entry;
  }

  /**
   * Log info
   */
  info(message, data = {}) {
    const entry = this.formatLog('INFO', 'info', message, data);
    console.log(`ℹ️ [INFO] ${message}`, data);
    return entry;
  }

  /**
   * Get all logs
   */
  getLogs() {
    return this.logs;
  }

  /**
   * Get logs by category
   */
  getLogsByCategory(category) {
    return this.logs.filter(log => log.category === category);
  }

  /**
   * Get logs by level
   */
  getLogsByLevel(level) {
    return this.logs.filter(log => log.level === level);
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    console.log('🧹 [LOGGER] Logs cleared');
  }

  /**
   * Export logs as JSON
   */
  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Download logs as file
   */
  downloadLogs() {
    if (typeof window === 'undefined') return;

    const dataStr = this.exportLogs();
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `app-logs-${new Date().toISOString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    console.log('💾 [LOGGER] Logs downloaded');
  }

  /**
   * Enable/disable logging
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
    console.log(`🔧 [LOGGER] Logging ${enabled ? 'enabled' : 'disabled'}`);
  }
}

// Export singleton instance
const logger = new AppLogger();

// Make logger accessible from browser console
if (typeof window !== 'undefined') {
  window.__appLogger = logger;
  console.log('📊 [LOGGER] Initialized - Access via window.__appLogger');
}

module.exports = logger;

