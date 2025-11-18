/**
 * Safe JSON Parser Utility
 * Safely parses JSON from fetch responses, handling HTML error pages and other non-JSON responses
 */

/**
 * Safely parse JSON from a Response object
 * @param {Response} response - Fetch Response object
 * @returns {Promise<Object|null>} - Parsed JSON data or null if parsing fails
 */
export async function safeJsonParse(response) {
  if (!response || typeof response !== 'object') {
    console.error('[safeJsonParse] Invalid response object');
    return null;
  }

  // Check content type first
  const contentType = response.headers.get('content-type');
  
  // If content type indicates JSON, try to parse it
  if (contentType && contentType.includes('application/json')) {
    try {
      // Clone response first so we can read text to check for HTML before parsing
      const clonedResponse = response.clone();
      
      // Read as text first to check if it's HTML
      const text = await clonedResponse.text();
      const trimmedText = text.trim();
      
      // Check if response is HTML (common error page indicators)
      if (trimmedText.startsWith('<!DOCTYPE') || trimmedText.startsWith('<html') || trimmedText.startsWith('<')) {
        console.error('[safeJsonParse] Response is HTML, not JSON. Status:', response.status, 'URL:', response.url);
        console.error('[safeJsonParse] HTML preview:', trimmedText.substring(0, 300));
        return null;
      }
      
      // Not HTML, try to parse as JSON
      try {
        const data = JSON.parse(text);
        return data;
      } catch (jsonError) {
        // Not valid JSON - log the error
        console.error('[safeJsonParse] Error parsing JSON (content-type was application/json):', jsonError);
        console.error('[safeJsonParse] Response text preview:', text.substring(0, 200));
        return null;
      }
    } catch (cloneError) {
      // If cloning fails, try to read as text first, then parse
      try {
        const text = await response.text();
        const trimmedText = text.trim();
        
        // Check if HTML
        if (trimmedText.startsWith('<!DOCTYPE') || trimmedText.startsWith('<html') || trimmedText.startsWith('<')) {
          console.error('[safeJsonParse] Response is HTML, not JSON. Status:', response.status);
          return null;
        }
        
        // Try to parse as JSON
        const data = JSON.parse(text);
        return data;
      } catch (parseError) {
        console.error('[safeJsonParse] Error parsing response:', parseError);
        return null;
      }
    }
  }
  
  // Not JSON content type - log what we got
  try {
    const clonedResponse = response.clone();
    const text = await clonedResponse.text();
    console.error('[safeJsonParse] Non-JSON response received:', {
      contentType,
      status: response.status,
      statusText: response.statusText,
      preview: text.substring(0, 200)
    });
  } catch (textError) {
    console.error('[safeJsonParse] Non-JSON response (could not read text):', {
      contentType,
      status: response.status,
      statusText: response.statusText
    });
  }
  
  return null;
}

/**
 * Safely parse JSON with a fallback value
 * @param {Response} response - Fetch Response object
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {Promise<*>} - Parsed JSON data or fallback value
 */
export async function safeJsonParseWithFallback(response, fallback = null) {
  const data = await safeJsonParse(response);
  return data !== null ? data : fallback;
}

