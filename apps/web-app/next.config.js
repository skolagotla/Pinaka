/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: true,
  
  // Transpile packages from monorepo workspace
  // Note: pdf-lib and pdfkit are in serverExternalPackages (server-only)
  transpilePackages: [
    'antd',
    'dayjs',
    'lodash',
    'react-pdf',
    'react-resizable',
    'react-signature-canvas',
    'web-vitals',
    'json-rules-engine',
    'dotenv',
    '@ant-design/charts',
    '@ant-design/icons',
    '@ant-design/pro-card',
    '@ant-design/pro-components',
    '@ant-design/pro-layout',
    '@pinaka/domain-common',
    '@pinaka/generated',
    '@pinaka/schemas',
    '@pinaka/shared-utils',
    '@pinaka/ui',
  ],
  
  // Path aliases - relative to app root
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
  
  compress: true,
  output: 'standalone',
  
  experimental: {
    optimizePackageImports: [
      'antd',
      '@ant-design/icons',
      '@ant-design/pro-components',
      '@ant-design/pro-layout',
      '@ant-design/charts',
      'dayjs',
      'recharts',
      'lodash',
    ],
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  
  serverExternalPackages: [
    '@prisma/client',
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
  
  webpack: (config, { isServer, dev }) => {
    const webpack = require('webpack');
    const path = require('path');
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.IgnorePlugin({
        checkResource(resource, context) {
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
              return true;
            }
          }
          return false;
        },
      })
    );
    
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      'dayjs/locale/zh-cn': require.resolve('../../lib/dayjs-locale-stub.js'),
      'dayjs/locale/zh': require.resolve('../../lib/dayjs-locale-stub.js'),
    };
    
    // Add workspace root node_modules to module resolution
    // This allows lib/ directory (at root) to import packages from workspace root
    config.resolve.modules = [
      ...(config.resolve.modules || ['node_modules']),
      path.resolve(__dirname, '../../node_modules'), // Workspace root node_modules
    ];
    
    // Enable symlink resolution for pnpm workspaces
    config.resolve.symlinks = true;
    
    if (!isServer && !dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            antdPro: {
              name: 'antd-pro',
              test: /[\\/]node_modules[\\/]@ant-design[\\/]pro-/,
              chunks: 'all',
              priority: 30,
              reuseExistingChunk: true,
            },
            antd: {
              name: 'antd',
              test: /[\\/]node_modules[\\/]antd[\\/]/,
              chunks: 'all',
              priority: 25,
              reuseExistingChunk: true,
            },
            charts: {
              name: 'charts',
              test: /[\\/]node_modules[\\/](@ant-design[\\/]charts|recharts)[\\/]/,
              chunks: 'all',
              priority: 25,
              reuseExistingChunk: true,
            },
            pdf: {
              name: 'pdf',
              test: /[\\/]node_modules[\\/](react-pdf|pdf-lib|pdfkit)[\\/]/,
              chunks: 'all',
              priority: 25,
              reuseExistingChunk: true,
            },
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /[\\/]node_modules[\\/]/,
              priority: 20,
              reuseExistingChunk: true,
              maxSize: 200000,
            },
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
        concatenateModules: true,
      };
    }
    
    return config;
  },
  
  turbopack: {
    resolveAlias: {
      'dayjs/locale/zh-cn': '../../lib/dayjs-locale-stub.js',
      'dayjs/locale/zh': '../../lib/dayjs-locale-stub.js',
    },
  },
  
  async rewrites() {
    return [
      // Map admin auth endpoints to FastAPI v2
      {
        source: '/api/admin/auth/:path*',
        destination: 'http://localhost:8000/api/v2/auth/:path*',
      },
      // Map all other API endpoints to FastAPI v2
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/v2/:path*',
      },
    ];
  },
  
  async headers() {
    return [
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

