import './globals.css';
import Providers from './providers';
import LayoutClient from './LayoutClient';

// Mark as dynamic since we use client-side auth
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pinaka - Property Management',
  description: 'Modern property management system for landlords and tenants',
};

/**
 * Root Layout - Migrated to v2 FastAPI Auth
 * 
 * This layout no longer uses Prisma or Next.js API routes.
 * Authentication is handled client-side via useV2Auth hook in LayoutClient.
 * The layout passes minimal props and lets the client handle auth state.
 */
export default async function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Load warning suppression FIRST, before any React code */}
        <script src="/suppress-antd-warning.js" />
      </head>
      <body style={{ margin: 0, padding: 0 }}>
        <Providers>
          <LayoutClient>
            {children}
          </LayoutClient>
        </Providers>
      </body>
    </html>
  );
}
