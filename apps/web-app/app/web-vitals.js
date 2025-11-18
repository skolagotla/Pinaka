/**
 * Web Vitals Reporting
 * 
 * Reports Core Web Vitals to analytics and console
 */

export function reportWebVital(metric) {
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('[Web Vital]', {
      name: metric.name,
      value: metric.value,
      id: metric.id,
      rating: metric.rating,
    });
  }

  // Send to analytics (Google Analytics, etc.)
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
    });
  }
}

