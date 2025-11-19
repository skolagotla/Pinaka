/**
 * LTB Document View API v1
 * 
 * Proxy endpoint to fetch and serve LTB PDF documents
 * Bypasses CORS restrictions by serving from same origin
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, UserContext } from '@/lib/middleware/apiMiddleware';
import { ltbFormNumberSchema } from '@/lib/schemas';
import { ltbDocumentService } from '@/lib/domains/ltb-document';
import { z } from 'zod';

/**
 * GET /api/v1/ltb-documents/[formNumber]/view
 * Proxy LTB PDF document for viewing
 */
async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse,
  user: UserContext
) {
  try {
    const { formNumber } = req.query;

    if (!formNumber || typeof formNumber !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Form number is required',
      });
    }

    // Normalize form number (uppercase for validation, but service handles case-insensitive)
    const normalizedFormNumber = formNumber.toUpperCase();
    
    // Validate form number format (case-insensitive)
    try {
      ltbFormNumberSchema.parse(normalizedFormNumber);
    } catch (validationError) {
      // If validation fails, try to find document anyway (might be a valid form number with different format)
      console.warn(`[LTB Document View API] Form number validation warning:`, formNumber);
    }

    // Get document (service handles case-insensitive lookup)
    const document = await ltbDocumentService.getByFormNumber(formNumber);
    if (!document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      });
    }

    // Fetch PDF from LTB website
    try {
      console.log(`[LTB Document View API] Fetching PDF from: ${document.pdfUrl}`);
      
      // Create abort controller for timeout (compatible with older Node.js versions)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      // URLs in constants are already properly encoded, use as-is
      const response = await fetch(document.pdfUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/pdf,application/octet-stream,*/*',
          'Accept-Language': 'en-US,en;q=0.9',
          'Referer': 'https://tribunalsontario.ca/',
        },
        signal: controller.signal,
        redirect: 'follow', // Follow redirects
      });
      
      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => '');
        console.error(`[LTB Document View API] Failed to fetch PDF from LTB:`, {
          url: document.pdfUrl,
          status: response.status,
          statusText: response.statusText,
          errorText: errorText.substring(0, 200),
        });
        
        // Return a more helpful error message
        return res.status(502).json({
          success: false,
          error: `Failed to fetch PDF from LTB website: ${response.status} ${response.statusText}`,
          details: 'The LTB website may be temporarily unavailable or the PDF link may have changed.',
        });
      }

      const contentType = response.headers.get('content-type') || '';
      
      // Check if we got HTML instead of PDF (might be an error page or redirect)
      if (contentType.includes('text/html')) {
        const htmlContent = await response.text();
        console.error(`[LTB Document View API] Received HTML instead of PDF for ${document.formNumber}:`, {
          url: document.pdfUrl,
          contentType,
          htmlPreview: htmlContent.substring(0, 500),
        });
        
        return res.status(502).json({
          success: false,
          error: 'LTB website returned HTML instead of PDF',
          details: 'The PDF link may have changed or the LTB website may be blocking automated requests. Please try downloading directly from the LTB website.',
        });
      }
      
      if (!contentType.includes('pdf') && !contentType.includes('octet-stream')) {
        console.warn(`[LTB Document View API] Unexpected content type: ${contentType} for ${document.pdfUrl}`);
      }

      const buffer = await response.arrayBuffer();
      
      if (buffer.byteLength === 0) {
        console.error(`[LTB Document View API] Empty response from LTB for: ${document.pdfUrl}`);
        return res.status(502).json({
          success: false,
          error: 'Received empty PDF from LTB website',
        });
      }

      const pdfBuffer = Buffer.from(buffer);

      // Set headers for PDF viewing
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${document.formNumber}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours

      console.log(`[LTB Document View API] Successfully fetched PDF: ${document.formNumber} (${pdfBuffer.length} bytes)`);
      return res.status(200).send(pdfBuffer);
    } catch (fetchError: any) {
      console.error(`[LTB Document View API] Fetch error for ${document.formNumber}:`, {
        error: fetchError.message,
        stack: fetchError.stack,
        url: document.pdfUrl,
      });
      
      // Handle timeout specifically
      if (fetchError.name === 'TimeoutError' || fetchError.name === 'AbortError') {
        return res.status(504).json({
          success: false,
          error: 'Request timeout - The LTB website took too long to respond',
        });
      }
      
      return res.status(502).json({
        success: false,
        error: `Failed to fetch PDF: ${fetchError.message}`,
        details: 'Please try again later or download directly from the LTB website.',
      });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid form number',
        details: error.issues,
      });
    }
    console.error(`[LTB Document View API] GET Error:`, error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch LTB document',
    });
  }
}

/**
 * Handler
 */
export default withAuth(async (req: NextApiRequest, res: NextApiResponse, user: UserContext) => {
  if (req.method === 'GET') {
    return handleGet(req, res, user);
  }

  return res.status(405).json({
    success: false,
    error: 'Method not allowed',
  });
});

