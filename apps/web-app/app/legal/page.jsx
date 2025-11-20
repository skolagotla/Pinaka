import { redirect } from 'next/navigation';
import { withAuth } from '@/lib/utils/page-wrapper';
import { serializePrismaData } from '@/lib/utils/serialize-prisma-data';
import LegalClient from './ui';

/**
 * Legal Page
 * Hosts Generated Forms functionality
 * Works for Landlord and PMC roles
 * Other roles redirect to /library
 */
export default withAuth(async ({ user, userRole, prisma, email }) => {
  // Redirect non-landlord/pmc users to /library
  if (userRole !== 'landlord' && userRole !== 'pmc') {
    redirect('/library');
  }

  // For landlord/pmc, we need to load user data
  let legalData = null;

  if (userRole === 'landlord') {
    const { getLandlordWithFullRelations } = require('@/lib/utils/landlord-data-loader');
    try {
      const landlord = await getLandlordWithFullRelations(prisma, email, {
        includeProperties: true,
        includeUnits: true,
        includeLeases: true,
        includeTenants: true,
        includeDocuments: true,
        autoCreateUnits: true
      });

      if (landlord) {
        legalData = {
          landlord: serializePrismaData(landlord),
        };
      }
    } catch (error) {
      console.error('[Legal Page] Error loading landlord data:', error);
    }
  } else if (userRole === 'pmc') {
    // For PMC, we might need PMC data
    try {
      const pmc = await prisma.pMC.findUnique({
        where: { email },
      });
      if (pmc) {
        legalData = {
          pmc: serializePrismaData(pmc),
        };
      }
    } catch (error) {
      console.error('[Legal Page] Error loading PMC data:', error);
    }
  }

  // Serialize user data
  const serializedUser = serializePrismaData({
    ...user,
    role: userRole || 'landlord',
  });

  return (
    <main className="page">
      <LegalClient
        user={serializedUser}
        userRole={userRole || 'landlord'}
        legalData={legalData}
      />
    </main>
  );
}, { role: ['landlord', 'pmc'], redirectTo: '/library' }); // Allow landlord/pmc, redirect others

