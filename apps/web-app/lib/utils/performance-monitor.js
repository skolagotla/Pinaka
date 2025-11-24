/**
 * Performance Monitoring Utility
 * 
 * Tracks Web Vitals and custom performance metrics
 * Integrates with analytics services
 */

/**
 * Report Web Vitals to analytics
 * @param {Object} metric - Web Vital metric
 */
export function reportWebVital(metric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vital]', metric.name, metric.value, metric.id);
  }

  // Send to analytics service (e.g., Google Analytics, Sentry)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

/**
 * Measure function execution time
 * @param {string} name - Name of the operation
 * @param {Function} fn - Function to measure
 * @returns {Promise<any>} Function result
 */
export async function measurePerformance(name, fn) {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[Performance] ${name}: ${duration.toFixed(2)}ms`);
    }
    
    // Report to analytics if duration is significant
    if (duration > 1000 && typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'slow_operation', {
        event_category: 'Performance',
        value: Math.round(duration),
        event_label: name,
      });
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[Performance] ${name} failed after ${duration.toFixed(2)}ms:`, error);
    throw error;
  }
}

/**
 * Track page load time
 */
export function trackPageLoad() {
  if (typeof window === 'undefined') return;

  window.addEventListener('load', () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.fetchStart;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('[Performance] Page Load Time:', loadTime, 'ms');
      }
      
      if (typeof window.gtag !== 'undefined') {
        window.gtag('event', 'page_load_time', {
          event_category: 'Performance',
          value: Math.round(loadTime),
        });
      }
    }
  });
}

/**
 * Track API call performance
 * @param {string} endpoint - API endpoint
 * @param {number} duration - Request duration in ms
 * @param {boolean} success - Whether request succeeded
 */
export function trackAPICall(endpoint, duration, success = true) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[API Performance] ${endpoint}: ${duration}ms (${success ? 'success' : 'failed'})`);
  }

  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'api_call', {
      event_category: 'Performance',
      value: Math.round(duration),
      event_label: endpoint,
      success: success,
    });
  }
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  // Track page load
  trackPageLoad();

  // Report Web Vitals if available
  if (typeof window.reportWebVital === 'function') {
    // Already initialized
    return;
  }

  // Make reportWebVital available globally
  window.reportWebVital = reportWebVital;
}

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  initPerformanceMonitoring();
}

