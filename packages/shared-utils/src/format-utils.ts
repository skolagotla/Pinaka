/**
 * Shared Formatting Utilities
 * 
 * Consolidated formatting utilities
 */

/**
 * Format currency
 */
export function formatCurrency(amount: number | null | undefined, currency: string = 'CAD'): string {
  if (amount === null || amount === undefined) return 'N/A';
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

