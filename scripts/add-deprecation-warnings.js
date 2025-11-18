/**
 * Script to add deprecation warnings to legacy API endpoints
 * 
 * Usage: node scripts/add-deprecation-warnings.js
 */

const fs = require('fs');
const path = require('path');

const DEPRECATION_MAP = {
  '/api/properties': '/api/v1/properties',
  '/api/tenants': '/api/v1/tenants',
  '/api/leases': '/api/v1/leases',
  '/api/rent-payments': '/api/v1/rent-payments',
  '/api/maintenance': '/api/v1/maintenance',
  '/api/documents': '/api/v1/documents',
  '/api/expenses': '/api/v1/expenses',
  '/api/inspections': '/api/v1/inspections',
  '/api/vendors': '/api/v1/vendors',
  '/api/conversations': '/api/v1/conversations',
  '/api/applications': '/api/v1/applications',
  '/api/notifications': '/api/v1/notifications',
  '/api/tasks': '/api/v1/tasks',
  '/api/analytics/property-performance': '/api/v1/analytics/property-performance',
  '/api/analytics/portfolio-performance': '/api/v1/analytics/portfolio-performance',
  '/api/analytics/tenant-delinquency-risk': '/api/v1/analytics/tenant-delinquency-risk',
  '/api/analytics/cash-flow-forecast': '/api/v1/analytics/cash-flow-forecast',
};

const DEPRECATION_CODE = `
  // ⚠️ DEPRECATION WARNING
  // This endpoint is deprecated. Use {REPLACEMENT} instead.
  // This endpoint will be removed on 2025-04-XX (90 days from deprecation).
  res.setHeader('X-API-Deprecated', 'true');
  res.setHeader('X-API-Deprecated-Since', '2025-01-XX');
  res.setHeader('X-API-Replacement', '{REPLACEMENT}');
  res.setHeader('X-API-Sunset', '2025-04-XX');
  
  if (process.env.NODE_ENV === 'development') {
    console.warn('[DEPRECATED] {ENDPOINT} is deprecated. Use {REPLACEMENT} instead.');
  }
`;

function addDeprecationWarning(filePath, endpoint, replacement) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if deprecation warning already exists
    if (content.includes('X-API-Deprecated')) {
      console.log(`⚠️  ${filePath} already has deprecation warning`);
      return false;
    }
    
    // Find the handler function start
    const handlerPattern = /export default withAuth\(async \(req: NextApiRequest, res: NextApiResponse/;
    const match = content.match(handlerPattern);
    
    if (!match) {
      // Try alternative pattern
      const altPattern = /async function handler\(req: NextApiRequest, res: NextApiResponse/;
      const altMatch = content.match(altPattern);
      
      if (!altMatch) {
        console.log(`❌ Could not find handler pattern in ${filePath}`);
        return false;
      }
      
      const insertPos = altMatch.index + altMatch[0].length;
      const deprecationCode = DEPRECATION_CODE
        .replace(/{REPLACEMENT}/g, replacement)
        .replace(/{ENDPOINT}/g, endpoint);
      
      content = content.slice(0, insertPos) + '\n' + deprecationCode + '\n  ' + content.slice(insertPos);
    } else {
      const insertPos = match.index + match[0].length;
      const deprecationCode = DEPRECATION_CODE
        .replace(/{REPLACEMENT}/g, replacement)
        .replace(/{ENDPOINT}/g, endpoint);
      
      content = content.slice(0, insertPos) + '\n' + deprecationCode + '\n  ' + content.slice(insertPos);
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Added deprecation warning to ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
const apiDir = path.join(__dirname, '../pages/api');
let processed = 0;
let skipped = 0;
let errors = 0;

for (const [endpoint, replacement] of Object.entries(DEPRECATION_MAP)) {
  const endpointPath = endpoint.replace('/api/', '');
  const filePath = path.join(apiDir, endpointPath, 'index.ts');
  
  if (fs.existsSync(filePath)) {
    if (addDeprecationWarning(filePath, endpoint, replacement)) {
      processed++;
    } else {
      skipped++;
    }
  } else {
    // Try alternative paths for analytics
    if (endpoint.startsWith('/api/analytics/')) {
      const altPath = path.join(apiDir, endpointPath + '.ts');
      if (fs.existsSync(altPath)) {
        if (addDeprecationWarning(altPath, endpoint, replacement)) {
          processed++;
        } else {
          skipped++;
        }
      } else {
        console.log(`⚠️  File not found: ${filePath} or ${altPath}`);
        errors++;
      }
    } else {
      console.log(`⚠️  File not found: ${filePath}`);
      errors++;
    }
  }
}

console.log('\n📊 Summary:');
console.log(`✅ Processed: ${processed}`);
console.log(`⏭️  Skipped: ${skipped}`);
console.log(`❌ Errors: ${errors}`);

