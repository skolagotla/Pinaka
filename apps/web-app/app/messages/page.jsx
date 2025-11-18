import { withAuth } from '@/lib/utils/page-wrapper';
import dynamic from 'next/dynamic';

// Lazy load message clients
const LandlordMessagesClient = dynamic(() => import('@/components/pages/landlord/messages/ui').then(mod => mod.default));
const PMCMessagesClient = dynamic(() => import('@/components/pages/pmc/messages/ui').then(mod => mod.default));
const TenantMessagesClient = dynamic(() => import('@/components/pages/tenant/messages/ui').then(mod => mod.default));

export default withAuth(async ({ user, userRole, prisma, email }) => {
  try {
    if (userRole === 'landlord') {
      // Landlord messages - component handles all data fetching internally
      return <LandlordMessagesClient />;
    } else if (userRole === 'pmc') {
      // PMC messages - component handles all data fetching internally
      return <PMCMessagesClient />;
    } else if (userRole === 'tenant') {
      // Tenant messages - component handles all data fetching internally
      return <TenantMessagesClient />;
    }

    return null;
  } catch (error) {
    console.error('[Messages Page] Error:', error);
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Error Loading Messages</h2>
        <p>An error occurred while loading messages. Please try again later.</p>
        <p style={{ color: '#999', fontSize: '12px', marginTop: '20px' }}>
          {error?.message || 'Unknown error'}
        </p>
      </div>
    );
  }
});

