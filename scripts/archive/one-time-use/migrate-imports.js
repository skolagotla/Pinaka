#!/usr/bin/env node

/**
 * Import Migration Script
 * 
 * Helps migrate relative imports to path aliases
 * Run with: node scripts/migrate-imports.js
 */

const fs = require('fs');
const path = require('path');

const ALIAS_MAPPINGS = {
  '../../../components/': '@/components/',
  '../../../lib/': '@/lib/',
  '../../components/': '@/components/',
  '../../lib/': '@/lib/',
  '../components/': '@/components/',
  '../lib/': '@/lib/',
  './components/': '@/components/',
  './lib/': '@/lib/',
};

function migrateFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace relative imports with aliases
    for (const [oldPath, newPath] of Object.entries(ALIAS_MAPPINGS)) {
      const regex = new RegExp(`from ['"]${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, `from '${newPath}`);
        modified = true;
      }
      
      // Also handle double quotes
      const regex2 = new RegExp(`from ["']${oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g');
      if (regex2.test(content)) {
        content = content.replace(regex2, `from "${newPath}`);
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error migrating ${filePath}:`, error.message);
    return false;
  }
}

function scanDirectory(dir, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const results = { migrated: 0, total: 0 };
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip node_modules, .next, etc.
    if (entry.name.startsWith('.') || entry.name === 'node_modules') {
      continue;
    }

    if (entry.isDirectory()) {
      const subResults = scanDirectory(fullPath, extensions);
      results.migrated += subResults.migrated;
      results.total += subResults.total;
    } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
      results.total++;
      if (migrateFile(fullPath)) {
        results.migrated++;
        console.log(`✓ Migrated: ${fullPath}`);
      }
    }
  }

  return results;
}

// Main execution
if (require.main === module) {
  console.log('🔄 Migrating imports to path aliases...\n');
  
  const appDir = path.join(process.cwd(), 'app');
  const componentsDir = path.join(process.cwd(), 'components');
  
  const appResults = scanDirectory(appDir);
  const componentsResults = scanDirectory(componentsDir);
  
  console.log(`\n✅ Migration complete!`);
  console.log(`   App files: ${appResults.migrated}/${appResults.total} migrated`);
  console.log(`   Component files: ${componentsResults.migrated}/${componentsResults.total} migrated`);
  console.log(`   Total: ${appResults.migrated + componentsResults.migrated} files updated\n`);
}

module.exports = { migrateFile, scanDirectory };

