const path = require('path');

// Find and set Prisma query engine path using shared utility
const rootDir = path.resolve(__dirname, '..', '..');
const { setPrismaEnginePath } = require('../../lib/utils/prisma-engine-finder');

const enginePath = setPrismaEnginePath(rootDir);
if (enginePath) {
  console.log('[Next.js Config] Set PRISMA_QUERY_ENGINE_LIBRARY to:', enginePath);
} else {
  console.warn('[Next.js Config] Could not find Prisma query engine. Prisma may fail at runtime.');
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // API server doesn't need React
  
  // Transpile packages from monorepo workspace (for lib/ directory imports)
  transpilePackages: [
    'zod',
    '@pinaka/domain-common',
    '@pinaka/generated',
    '@pinaka/schemas',
    '@pinaka/shared-utils',
  ],
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  compress: true,
  output: 'standalone',
  
  // Disable static page generation (API server doesn't need static pages)
  generateBuildId: async () => {
    return 'api-server-build'
  },
  
  webpack: (config, { isServer, dev }) => {
    const path = require('path');
    
    // Add workspace root node_modules to module resolution
    // This allows lib/ directory (at root) to import packages from workspace root
    config.resolve = config.resolve || {};
    config.resolve.modules = [
      ...(config.resolve.modules || ['node_modules']),
      path.resolve(__dirname, '../../node_modules'), // Workspace root node_modules
    ];
    
    // Enable symlink resolution for pnpm workspaces
    config.resolve.symlinks = true;
    
    return config;
  },
  
  // Skip static optimization to avoid React context issues
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  
  // Disable static page generation for all pages
  outputFileTracingIncludes: {
    '/**': [],
  },
  
      serverExternalPackages: [
        '@prisma/client',
        '.prisma/client',
        'bcryptjs',
        'better-sqlite3',
        'pg',
        'cookie',
        'sharp',
        'formidable',
        'node-pdftk',
        'pdfkit',
        'pdf-lib',
      ],
  
  // Configure Turbopack for Prisma resolution (Next.js 16+)
  // Note: Turbopack doesn't support absolute paths in resolveAlias
  // Using relative path instead
  turbopack: {
    resolveAlias: {
      '@prisma/client': '../../node_modules/@prisma/client',
    },
  },
  
  async headers() {
    // Allow credentials from web app in development
    const allowedOrigin = process.env.NODE_ENV === 'production' 
      ? process.env.WEB_APP_URL || 'https://localhost:3000'
      : 'http://localhost:3000';
    
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Access-Control-Allow-Origin',
            value: allowedOrigin,
          },
          {
            key: 'Access-Control-Allow-Credentials',
            value: 'true',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, Cookie',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

