#!/usr/bin/env node

/**
 * Fix Quote Mismatches in Import Statements
 * 
 * Fixes imports that have mismatched quotes (e.g., from '@/path';" or from "@/path';)
 */

const fs = require('fs');
const path = require('path');

function fixQuoteMismatches(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Fix: from '@/path"; -> from '@/path';
    const pattern1 = /from\s+['"]@\/[^'"]+['"];/g;
    const matches1 = content.match(/from\s+['"]@\/[^'"]+['"];/g);
    if (matches1) {
      matches1.forEach(match => {
        // Check if quotes are mismatched
        if (match.startsWith("from '") && match.endsWith('";')) {
          const fixed = match.replace(/";$/, "';");
          content = content.replace(match, fixed);
          modified = true;
        } else if (match.startsWith('from "') && match.endsWith("';")) {
          const fixed = match.replace(/';$/, '";');
          content = content.replace(match, fixed);
          modified = true;
        }
      });
    }

    // More specific pattern: from '@/path"; -> from '@/path';
    content = content.replace(/from\s+('@\/[^']+)";/g, (match, p1) => {
      modified = true;
      return `from ${p1}';`;
    });

    // Fix: from "@/path'; -> from "@/path";
    content = content.replace(/from\s+("@\/[^"]+)';/g, (match, p1) => {
      modified = true;
      return `from ${p1}";`;
    });

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    }
    return false;
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
    return false;
  }
}

function scanDirectory(dir, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const results = { fixed: 0, total: 0 };
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip node_modules, .next, etc.
    if (entry.name.startsWith('.') || entry.name === 'node_modules') {
      continue;
    }

    if (entry.isDirectory()) {
      const subResults = scanDirectory(fullPath, extensions);
      results.fixed += subResults.fixed;
      results.total += subResults.total;
    } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
      results.total++;
      if (fixQuoteMismatches(fullPath)) {
        results.fixed++;
        console.log(`✓ Fixed: ${fullPath}`);
      }
    }
  }

  return results;
}

// Main execution
if (require.main === module) {
  console.log('🔧 Fixing quote mismatches in import statements...\n');
  
  const appDir = path.join(process.cwd(), 'app');
  const results = scanDirectory(appDir);
  
  console.log(`\n✅ Fixed ${results.fixed} files with quote mismatches\n`);
}

module.exports = { fixQuoteMismatches, scanDirectory };

