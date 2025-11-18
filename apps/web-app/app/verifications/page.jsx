import { withAuth } from '@/lib/utils/page-wrapper';
import { serializePrismaData } from '@/lib/utils/serialize-prisma-data';
import VerificationsClient from './ui';

/**
 * Unified Verifications Page
 * Works for all roles: Admin, PMC, Landlord, Tenant
 */
export default withAuth(async ({ user, userRole, prisma, email }) => {
  // Get verification stats for the user
  const { getVerificationStats } = require('@/lib/services/unified-verification-service');
  
  let stats = {
    pending: 0,
    verified: 0,
    rejected: 0,
    expired: 0,
    total: 0,
  };

  try {
    stats = await getVerificationStats(prisma, {
      userId: user.id,
      userRole: userRole || 'landlord',
    });
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

