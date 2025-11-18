#!/usr/bin/env node
/**
 * Check for Large Files
 * 
 * Identifies files that might be too large and could benefit from splitting
 */

const fs = require('fs');
const path = require('path');

const LARGE_FILE_THRESHOLD = 500; // lines
const VERY_LARGE_FILE_THRESHOLD = 1000; // lines

function countLines(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return content.split('\n').length;
  } catch (error) {
    return 0;
  }
}

function findLargeFiles(dir, extensions = ['.js', '.jsx', '.ts', '.tsx'], excludeDirs = ['node_modules', '.next', 'dist']) {
  const largeFiles = [];
  
  function scanDirectory(currentDir) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);
      
      if (entry.isDirectory()) {
        if (!excludeDirs.includes(entry.name)) {
          scanDirectory(fullPath);
        }
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name);
        if (extensions.includes(ext)) {
          const lineCount = countLines(fullPath);
          if (lineCount >= LARGE_FILE_THRESHOLD) {
            largeFiles.push({
              path: fullPath,
              lines: lineCount,
              size: lineCount >= VERY_LARGE_FILE_THRESHOLD ? 'VERY_LARGE' : 'LARGE'
            });
          }
        }
      }
    }
  }
  
  scanDirectory(dir);
  return largeFiles.sort((a, b) => b.lines - a.lines);
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📊 LARGE FILE ANALYSIS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

const webAppFiles = findLargeFiles('apps/web-app', ['.js', '.jsx', '.ts', '.tsx']);
const apiServerFiles = findLargeFiles('apps/api-server', ['.js', '.jsx', '.ts', '.tsx']);

console.log(`Found ${webAppFiles.length} large files in web-app (>= ${LARGE_FILE_THRESHOLD} lines)`);
console.log(`Found ${apiServerFiles.length} large files in api-server (>= ${LARGE_FILE_THRESHOLD} lines)\n`);

if (webAppFiles.length > 0) {
  console.log('📦 Web App Large Files:\n');
  webAppFiles.slice(0, 10).forEach((file, i) => {
    console.log(`${i + 1}. [${file.size}] ${file.path}`);
    console.log(`   Lines: ${file.lines}`);
    if (file.size === 'VERY_LARGE') {
      console.log(`   ⚠️  Consider splitting into smaller components`);
    }
    console.log('');
  });
}

if (apiServerFiles.length > 0) {
  console.log('📦 API Server Large Files:\n');
  apiServerFiles.slice(0, 10).forEach((file, i) => {
    console.log(`${i + 1}. [${file.size}] ${file.path}`);
    console.log(`   Lines: ${file.lines}`);
    if (file.size === 'VERY_LARGE') {
      console.log(`   ⚠️  Consider splitting into smaller modules`);
    }
    console.log('');
  });
}

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('✅ Analysis complete!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

