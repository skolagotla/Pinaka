/**
 * Shared API Utilities
 * 
 * Consolidated API-related utilities
 */

/**
 * Build query string from object
 */
export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        value.forEach((v) => searchParams.append(key, String(v)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  }
  return searchParams.toString();
}

/**
 * Handle API errors consistently
 */
export function handleApiError(error: unknown): { message: string; status?: number } {
  if (error instanceof Error) {
    return { message: error.message };
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return { 
      message: String(error.message),
      status: 'status' in error ? Number(error.status) : undefined,
    };
  }
  return { message: 'An unknown error occurred' };
}

