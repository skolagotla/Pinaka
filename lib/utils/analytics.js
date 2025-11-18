/**
 * Analytics Utility
 * Simple client-side analytics tracking for unified pages
 */

/**
 * Track page view
 * @param {string} page - Page name (e.g., 'documents', 'financials', 'operations', 'partners')
 * @param {string} tab - Active tab (optional)
 * @param {string} userRole - User role
 */
export function trackPageView(page, tab = null, userRole = null) {
  if (typeof window === 'undefined') return;

  try {
    const event = {
      type: 'page_view',
      page,
      tab,
      userRole,
      timestamp: new Date().toISOString(),
      path: window.location.pathname,
    };

    // Store in localStorage for batch sending (or send immediately)
    const analytics = JSON.parse(localStorage.getItem('analytics') || '[]');
    analytics.push(event);
    
    // Keep only last 100 events
    if (analytics.length > 100) {
      analytics.shift();
    }
    
    localStorage.setItem('analytics', JSON.stringify(analytics));

    // Analytics tracking disabled - endpoints not implemented
    // TODO: Implement /api/v1/analytics/track if analytics tracking is needed
  } catch (error) {
    // Silently fail - analytics should not break the app
    console.debug('[Analytics] Error tracking page view:', error);
  }
}

/**
 * Track tab switch
 * @param {string} page - Page name
 * @param {string} fromTab - Previous tab
 * @param {string} toTab - New tab
 * @param {string} userRole - User role
 */
export function trackTabSwitch(page, fromTab, toTab, userRole = null) {
  if (typeof window === 'undefined') return;

  try {
    const event = {
      type: 'tab_switch',
      page,
      fromTab,
      toTab,
      userRole,
      timestamp: new Date().toISOString(),
    };

    const analytics = JSON.parse(localStorage.getItem('analytics') || '[]');
    analytics.push(event);
    
    if (analytics.length > 100) {
      analytics.shift();
    }
    
    localStorage.setItem('analytics', JSON.stringify(analytics));

    // Analytics tracking disabled - endpoints not implemented
    // TODO: Implement /api/v1/analytics/track if analytics tracking is needed
  } catch (error) {
    console.debug('[Analytics] Error tracking tab switch:', error);
  }
}

/**
 * Flush analytics queue (send all pending events)
 */
export function flushAnalytics() {
  if (typeof window === 'undefined') return;

  try {
    const analytics = JSON.parse(localStorage.getItem('analytics') || '[]');
    if (analytics.length === 0) return;

    // Analytics tracking disabled - endpoints not implemented
    // TODO: Implement /api/v1/analytics/batch if analytics tracking is needed
    // For now, clear the queue to prevent localStorage from growing
    localStorage.setItem('analytics', '[]');
  } catch (error) {
    console.debug('[Analytics] Error flushing analytics:', error);
  }
}

