/**
 * ID Generation Utility
 * Generates unique IDs for database records
 */

import { randomBytes } from 'crypto';

/**
 * Generate a custom UID (CUID) similar format
 * Format: 2-char prefix + timestamp + random hex
 */
export function generateCUID(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = randomBytes(8).toString('hex');
  return `${timestamp}${randomPart}`;
}

/**
 * Generate a short random ID
 */
export function generateShortID(length: number = 8): string {
  return randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
}

