import { withAuth } from '@/lib/utils/page-wrapper';
import { serializePrismaData } from '@/lib/utils/serialize-prisma-data';
import dynamic from 'next/dynamic';

// Lazy load calendar clients
const LandlordCalendarClient = dynamic(() => import('@/components/pages/landlord/calendar/ui').then(mod => mod.default));
const PMCCalendarClient = dynamic(() => import('@/components/pages/pmc/calendar/ui').then(mod => mod.default));

export default withAuth(async ({ user, userRole, prisma, email }) => {
  if (userRole === 'landlord') {
    // Landlord calendar - reuse existing logic
    const properties = await prisma.property.findMany({
      where: {
        landlordId: user.id,
      },
      select: {
        id: true,
        propertyName: true,
        addressLine1: true,
      },
    });

    return (
      <LandlordCalendarClient
        landlord={serializePrismaData(user)}
        properties={properties.map(p => ({
          ...p,
          createdAt: p.createdAt?.toISOString(),
          updatedAt: p.updatedAt?.toISOString(),
        }))}
      />
    );
  } else if (userRole === 'pmc') {
    // PMC calendar logic
    const pmcRelationships = await prisma.pMCLandlord.findMany({
      where: {
        pmcId: user.id,
        status: 'active',
      },
      select: {
        landlordId: true,
      },
    });

    const landlordIds = pmcRelationships.map(rel => rel.landlordId);

    const properties = await prisma.property.findMany({
      where: {
        landlordId: {
          in: landlordIds,
        },
      },
      select: {
        id: true,
        propertyName: true,
        addressLine1: true,
      },
    });

    return (
      <PMCCalendarClient
        pmc={serializePrismaData(user)}
        properties={properties.map(p => ({
          ...p,
          createdAt: p.createdAt?.toISOString(),
          updatedAt: p.updatedAt?.toISOString(),
        }))}
      />
    );
  }

  return null;
}, { role: 'both' }); // 'both' allows landlord and PMC

