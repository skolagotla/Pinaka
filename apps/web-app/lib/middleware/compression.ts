/**
 * Response Compression Middleware
 * Compresses API responses to reduce bandwidth usage
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { gzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);

const MIN_COMPRESSION_SIZE = 1024; // Only compress responses > 1KB

/**
 * Compress response if applicable
 */
export async function compressResponse(
  req: NextApiRequest,
  res: NextApiResponse,
  data: any
): Promise<void> {
  // Check if client accepts gzip encoding
  const acceptEncoding = req.headers['accept-encoding'] || '';
  if (!acceptEncoding.includes('gzip')) {
    return;
  }

  // Convert data to JSON string
  const jsonString = JSON.stringify(data);
  const originalSize = Buffer.byteLength(jsonString, 'utf8');

  // Only compress if response is large enough
  if (originalSize < MIN_COMPRESSION_SIZE) {
    return;
  }

  try {
    // Compress the response
    const compressed = await gzipAsync(Buffer.from(jsonString, 'utf8'));
    const compressedSize = compressed.length;

    // Only use compression if it actually reduces size
    if (compressedSize < originalSize) {
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Content-Length', compressedSize.toString());
      res.setHeader('Vary', 'Accept-Encoding');
      return res.send(compressed);
    }
  } catch (error) {
    console.error('[Compression] Error compressing response:', error);
    // Fall through to send uncompressed response
  }
}

/**
 * Middleware wrapper for compression
 */
export function withCompression(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Store original json method
    const originalJson = res.json.bind(res);
    
    // Override json method to compress before sending
    res.json = async function(data: any) {
      // Check if response already sent
      if (res.headersSent) {
        return originalJson(data);
      }

      // Try to compress
      try {
        await compressResponse(req, res, data);
        // If compression was applied, response is already sent
        if (res.headersSent) {
          return res;
        }
      } catch (error) {
        // If compression fails, send uncompressed
        console.error('[Compression] Failed to compress, sending uncompressed:', error);
      }

      // Send uncompressed response
      return originalJson(data);
    };

    // Call original handler
    return handler(req, res);
  };
}

