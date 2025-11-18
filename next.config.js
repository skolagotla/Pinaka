/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: true,
  
  // Path aliases for cleaner imports
  // These work with both TypeScript and JavaScript
  // Usage: import { something } from '@/lib/utils/...'
  // Instead of: import { something } from '@/lib/utils/...'
  
  // Skip TypeScript during production builds
  // This prevents hanging during type checking (was taking 3+ minutes)
  // Type checking is already done by IDE/editor and pre-commit hooks
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Allow images from localhost and API routes
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  
  // Compression
  compress: true,
  
  // Production optimizations
  // Note: swcMinify is enabled by default in Next.js 16+, no need to specify
  
  // Output configuration for better performance
  output: 'standalone',
  
  // Experimental features for performance
  experimental: {
    // Optimize package imports - tree-shake unused exports
    optimizePackageImports: [
      'antd',
      '@ant-design/icons',
      '@ant-design/pro-components',
      '@ant-design/pro-layout',
      '@ant-design/charts',
      'dayjs',
      'recharts', // Chart library optimization
      'lodash', // If used, tree-shake unused functions
    ],
    // Enable partial prerendering for better performance
    ppr: false, // Can enable when stable
    // Optimize server components
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  // Server external packages (moved from experimental in Next.js 16)
  // Externalize server-only dependencies to reduce client bundle size
  serverExternalPackages: [
    '@prisma/client', 
    'bcryptjs',
    'better-sqlite3', // Database driver (server-only)
    'pg', // PostgreSQL client (server-only, for db-switcher)
    'cookie', // Cookie parsing (server-only, for auth/login)
    'sharp', // Image processing (server-only)
    'formidable', // Form parsing (server-only)
    'node-pdftk', // PDF toolkit (server-only)
    'pdfkit', // PDF generation (server-only)
    'pdf-lib', // PDF manipulation (server-only, but some client usage)
    'nodemailer', // Email sending (server-only)
    'google-auth-library', // Google OAuth (server-only)
  ],
  
  // Webpack optimizations (only for webpack, not turbopack)
  // Note: Turbopack handles code splitting automatically, so webpack config is only for production builds
  // Production builds use webpack (not Turbopack), so this ensures clean module resolution
  webpack: (config, { isServer, dev }) => {
    // Exclude diagram files from build (only root-level diagram files)
    // These files are documentation and not part of the application
    const webpack = require('webpack');
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.IgnorePlugin({
        checkResource(resource, context) {
          // Only ignore diagram files in the root directory
          if (context.includes(process.cwd()) && !context.includes('node_modules')) {
            const diagramFiles = [
              'ER_Diagram',
              'ER_Diagram_Updated',
              'ER_Diagram_Complete',
              'Data_Flow_Diagram',
              'Diagram_Viewer',
              'ER_Diagram_Viewer',
              'Data_Flow_Diagram_Viewer',
            ];
            const isDiagramFile = diagramFiles.some(name => resource.includes(name));
            if (isDiagramFile && (resource.endsWith('.mmd') || resource.endsWith('.html'))) {
              return true; // Ignore this file
            }
          }
          return false; // Don't ignore other files
        },
      })
    );
    
    // Add webpack alias to prevent dayjs locale loading
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      // Redirect zh-cn locale to stub module (prevents HMR errors in dev, ensures clean builds in prod)
      'dayjs/locale/zh-cn': require.resolve('./lib/dayjs-locale-stub.js'),
      'dayjs/locale/zh': require.resolve('./lib/dayjs-locale-stub.js'),
    };
    
    // Production builds: ensure clean module resolution and proper code splitting
    // Dev mode uses Turbopack (faster), production uses webpack (more stable)
    if (!isServer && !dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Ant Design Pro components - large library, split separately
            antdPro: {
              name: 'antd-pro',
              test: /[\\/]node_modules[\\/]@ant-design[\\/]pro-/,
              chunks: 'all',
              priority: 30,
              reuseExistingChunk: true,
            },
            // Ant Design - core library
            antd: {
              name: 'antd',
              test: /[\\/]node_modules[\\/]antd[\\/]/,
              chunks: 'all',
              priority: 25,
              reuseExistingChunk: true,
            },
            // Charts libraries - heavy, split separately
            charts: {
              name: 'charts',
              test: /[\\/]node_modules[\\/](@ant-design[\\/]charts|recharts)[\\/]/,
              chunks: 'all',
              priority: 25,
              reuseExistingChunk: true,
            },
            // PDF libraries - heavy, split separately
            pdf: {
              name: 'pdf',
              test: /[\\/]node_modules[\\/](react-pdf|pdf-lib|pdfkit)[\\/]/,
              chunks: 'all',
              priority: 25,
              reuseExistingChunk: true,
            },
            // Vendor chunk - split large vendors into smaller chunks
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
              reuseExistingChunk: true,
              // Split large vendor chunks to improve caching and parallel loading
              maxSize: 200000, // 200KB max per chunk
            },
            // Common chunk - shared code
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
        // Enable module concatenation for better tree-shaking
        concatenateModules: true,
      };
    }
    
    return config;
  },
  
  // Turbopack configuration (required in Next.js 16 when using webpack config)
  turbopack: {
    // Resolve aliases to prevent dayjs locale loading issues
    resolveAlias: {
      // Redirect zh-cn locale to stub module (prevents HMR errors)
      'dayjs/locale/zh-cn': './lib/dayjs-locale-stub.js',
      'dayjs/locale/zh': './lib/dayjs-locale-stub.js',
    },
  },
  
  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);


