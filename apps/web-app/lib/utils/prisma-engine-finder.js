/**
 * Prisma Query Engine Finder
 * 
 * Finds the Prisma query engine binary in pnpm workspace structures.
 * Works across different Prisma versions and platforms.
 * 
 * This utility ensures Prisma can find its query engine in monorepo setups
 * where node_modules might be in different locations.
 */

const path = require('path');
const fs = require('fs');
const os = require('os');

/**
 * Get the platform-specific query engine filename
 */
function getEngineFilename() {
  const platform = os.platform();
  const arch = os.arch();
  
  const platformMap = {
    'darwin': {
      'x64': 'libquery_engine-darwin.dylib.node',
      'arm64': 'libquery_engine-darwin-arm64.dylib.node',
    },
    'linux': {
      'x64': 'libquery_engine-linux-musl-openssl-3.0.x.so.node',
      'arm64': 'libquery_engine-linux-arm64-openssl-3.0.x.so.node',
    },
    'win32': {
      'x64': 'query_engine-windows.dll.node',
      'arm64': 'query_engine-windows.dll.node',
    },
  };
  
  const archMap = platformMap[platform];
  if (!archMap) {
    // Fallback: try to find any engine file
    return 'libquery_engine-*.node';
  }
  
  return archMap[arch] || archMap['x64'] || 'libquery_engine-*.node';
}

/**
 * Find Prisma query engine in workspace
 * @param {string} rootDir - Root directory of the workspace
 * @returns {string|null} - Absolute path to query engine, or null if not found
 */
function findPrismaEngine(rootDir) {
  const engineFilename = getEngineFilename();
  const engineName = engineFilename.replace('*', '');
  
  // Possible locations in pnpm workspace
  const possiblePaths = [
    // Direct .prisma/client location
    path.join(rootDir, 'node_modules/.prisma/client', engineName),
    
    // pnpm hoisted location
    path.join(rootDir, 'node_modules/@prisma/client', engineName),
  ];
  
  // Search in .pnpm directory (pnpm's content-addressable store)
  try {
    const pnpmDir = path.join(rootDir, 'node_modules/.pnpm');
    if (fs.existsSync(pnpmDir)) {
      const entries = fs.readdirSync(pnpmDir);
      
      // Find any @prisma+client directory (version-agnostic)
      const prismaDirs = entries.filter(e => e.startsWith('@prisma+client@'));
      
      for (const prismaDir of prismaDirs) {
        // Try .prisma/client location
        const enginePath1 = path.join(
          pnpmDir,
          prismaDir,
          'node_modules/.prisma/client',
          engineName
        );
        if (fs.existsSync(enginePath1)) {
          possiblePaths.push(enginePath1);
        }
        
        // Try @prisma/client location
        const enginePath2 = path.join(
          pnpmDir,
          prismaDir,
          'node_modules/@prisma/client',
          engineName
        );
        if (fs.existsSync(enginePath2)) {
          possiblePaths.push(enginePath2);
        }
      }
    }
  } catch (e) {
    // Ignore errors during search
  }
  
  // Also try wildcard search as fallback (if exact filename not found)
  if (engineFilename.includes('*')) {
    try {
      const { execSync } = require('child_process');
      // Search for any query engine file
      const found = execSync(
        `find "${rootDir}/node_modules" -name "*query_engine*.node" -o -name "*query_engine*.so.node" -o -name "*query_engine*.dll.node" 2>/dev/null | head -1`,
        { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 }
      ).trim();
      
      if (found) {
        possiblePaths.push(found);
      }
    } catch (e) {
      // Ignore if find command fails
    }
  }
  
  // Check each path and return the first that exists
  for (const enginePath of possiblePaths) {
    if (fs.existsSync(enginePath)) {
      return path.resolve(enginePath);
    }
  }
  
  return null;
}

/**
 * Set PRISMA_QUERY_ENGINE_LIBRARY environment variable
 * @param {string} rootDir - Root directory of the workspace (optional, defaults to lib parent)
 * @returns {string|null} - Path that was set, or null if not found
 */
function setPrismaEnginePath(rootDir = null) {
  if (!rootDir) {
    // Default: assume this file is in lib/utils, so root is lib/../ (workspace root)
    rootDir = path.resolve(__dirname, '../..');
  }
  
  const enginePath = findPrismaEngine(rootDir);
  
  if (enginePath) {
    process.env.PRISMA_QUERY_ENGINE_LIBRARY = enginePath;
    return enginePath;
  }
  
  return null;
}

module.exports = {
  findPrismaEngine,
  setPrismaEnginePath,
  getEngineFilename,
};

