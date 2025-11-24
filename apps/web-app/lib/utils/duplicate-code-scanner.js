/**
 * Duplicate Code Scanner
 * 
 * Utility to identify duplicate code patterns in the codebase
 * Run with: node lib/utils/duplicate-code-scanner.js
 */

const fs = require('fs');
const path = require('path');

/**
 * Find duplicate functions across files
 */
function findDuplicateFunctions(dir, extensions = ['.js', '.jsx', '.ts', '.tsx']) {
  const functions = new Map();
  const duplicates = [];

  function scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Match function declarations
      const functionRegex = /(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*=>|export\s+(?:async\s+)?function\s+(\w+))/g;
      let match;
      
      while ((match = functionRegex.exec(content)) !== null) {
        const funcName = match[1] || match[2] || match[3];
        if (funcName && !funcName.startsWith('_')) {
          if (!functions.has(funcName)) {
            functions.set(funcName, []);
          }
          functions.get(funcName).push(filePath);
        }
      }
    } catch (error) {
      console.error(`Error scanning ${filePath}:`, error.message);
    }
  }

  function scanDirectory(dirPath) {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      // Skip node_modules, .next, etc.
      if (entry.name.startsWith('.') || entry.name === 'node_modules') {
        continue;
      }
      
      if (entry.isDirectory()) {
        scanDirectory(fullPath);
      } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
        scanFile(fullPath);
      }
    }
  }

  scanDirectory(dir);

  // Find duplicates
  for (const [funcName, files] of functions.entries()) {
    if (files.length > 1) {
      duplicates.push({
        name: funcName,
        files: files,
        count: files.length,
      });
    }
  }

  return duplicates.sort((a, b) => b.count - a.count);
}

/**
 * Main execution
 */
if (require.main === module) {
  console.log('🔍 Scanning for duplicate code...\n');
  
  const duplicates = findDuplicateFunctions(process.cwd());
  
  if (duplicates.length === 0) {
    console.log('✅ No duplicate functions found!');
  } else {
    console.log(`⚠️  Found ${duplicates.length} potential duplicates:\n`);
    
    duplicates.slice(0, 20).forEach(dup => {
      console.log(`Function: ${dup.name} (appears in ${dup.count} files)`);
      dup.files.forEach(file => {
        console.log(`  - ${file}`);
      });
      console.log('');
    });
    
    if (duplicates.length > 20) {
      console.log(`... and ${duplicates.length - 20} more\n`);
    }
  }
}

module.exports = { findDuplicateFunctions };

