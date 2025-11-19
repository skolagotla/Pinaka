const fs = require('fs');
const path = require('path');

// Find the actual index files (they might be nested)
function findAndMoveFiles(dir, targetDir, depth = 0) {
  if (depth > 5) return; // Safety limit
  
  if (!fs.existsSync(dir)) return;
  
  const entries = fs.readdirSync(dir);
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      findAndMoveFiles(fullPath, targetDir, depth + 1);
      // Try to remove empty directory
      try {
        if (fs.readdirSync(fullPath).length === 0) {
          fs.rmdirSync(fullPath);
        }
      } catch (e) {
        // Directory not empty or other error, skip
      }
    } else if (entry === 'index.js' || entry === 'index.d.ts' || entry === 'generated-types.js' || entry === 'generated-types.d.ts') {
      // Move index and generated-types files to target
      const targetPath = path.join(targetDir, entry);
      if (fullPath !== targetPath) {
        if (fs.existsSync(targetPath)) {
          fs.unlinkSync(targetPath); // Remove existing file
        }
        fs.renameSync(fullPath, targetPath);
      }
    } else if (entry.endsWith('.js') || entry.endsWith('.d.ts')) {
      // Move other files, preserving structure if needed
      const relPath = path.relative(path.join(__dirname, 'dist'), fullPath);
      const targetPath = path.join(targetDir, relPath);
      const targetParent = path.dirname(targetPath);
      if (!fs.existsSync(targetParent)) {
        fs.mkdirSync(targetParent, { recursive: true });
      }
      if (fullPath !== targetPath) {
        fs.renameSync(fullPath, targetPath);
      }
    }
  });
}

const distDir = path.join(__dirname, 'dist');
findAndMoveFiles(distDir, distDir);

// Clean up empty nested directories
function cleanupEmptyDirs(dir, depth = 0) {
  if (depth > 5) return;
  if (!fs.existsSync(dir)) return;
  
  try {
    const entries = fs.readdirSync(dir);
    entries.forEach(entry => {
      const fullPath = path.join(dir, entry);
      if (fs.statSync(fullPath).isDirectory()) {
        cleanupEmptyDirs(fullPath, depth + 1);
        try {
          if (fs.readdirSync(fullPath).length === 0) {
            fs.rmdirSync(fullPath);
          }
        } catch (e) {
          // Skip
        }
      }
    });
  } catch (e) {
    // Skip
  }
}

cleanupEmptyDirs(distDir);
console.log('✅ Fixed dist directory structure');

