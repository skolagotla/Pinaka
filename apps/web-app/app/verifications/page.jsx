import { withAuth } from '@/lib/utils/page-wrapper';
import { serializePrismaData } from '@/lib/utils/serialize-prisma-data';
import VerificationsClient from './ui';

/**
 * Unified Verifications Page
 * Works for all roles: Admin, PMC, Landlord, Tenant
 */
export default withAuth(async ({ user, userRole, prisma, email }) => {
  // Get verification stats from API route (avoids bundling server-only packages)
  let stats = {
    pending: 0,
    verified: 0,
    rejected: 0,
    expired: 0,
    total: 0,
  };

  try {
    // Fetch stats from API route instead of requiring service directly
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const response = await fetch(`${baseUrl}/api/v1/verifications/stats`, {
      credentials: 'include',
      headers: {
        'Cookie': typeof document !== 'undefined' ? document.cookie : '',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        stats = data.data || stats;
      }
    }
  } catch (error) {
    console.error('[Verifications Page] Error loading stats:', error);
    // Continue with default stats
  }

  // Serialize user data
  const serializedUser = serializePrismaData({
    ...user,
    role: userRole || 'landlord',
  });

  return (
    <main className="page">
      <VerificationsClient
        user={serializedUser}
        initialStats={stats}
      />
    </main>
  );
}, { 
  role: 'both', // Allow all roles
  allowAdmin: true // Allow admin users to access this page
});

