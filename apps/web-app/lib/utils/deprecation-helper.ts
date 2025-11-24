/**
 * Deprecation Helper
 * 
 * Utilities for adding deprecation warnings to legacy API endpoints
 */

export interface DeprecationInfo {
  deprecated: boolean;
  deprecatedSince: string;
  replacement: string;
  sunsetDate: string;
}

/**
 * Get deprecation headers for legacy API endpoints
 */
export function getDeprecationHeaders(replacement: string): Record<string, string> {
  const deprecatedSince = '2025-01-XX';
  const sunsetDate = '2025-04-XX'; // 90 days from deprecation

  return {
    'X-API-Deprecated': 'true',
    'X-API-Deprecated-Since': deprecatedSince,
    'X-API-Replacement': replacement,
    'X-API-Sunset': sunsetDate,
  };
}

/**
 * Get deprecation info object for response body
 */
export function getDeprecationInfo(replacement: string): DeprecationInfo {
  return {
    deprecated: true,
    deprecatedSince: '2025-01-XX',
    replacement,
    sunsetDate: '2025-04-XX',
  };
}

/**
 * Log deprecation warning
 */
export function logDeprecationWarning(endpoint: string, replacement: string) {
  console.warn(
    `[DEPRECATED] ${endpoint} is deprecated. Use ${replacement} instead. ` +
    `This endpoint will be removed on 2025-04-XX.`
  );
}

