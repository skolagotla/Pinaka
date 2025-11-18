import { withAuth } from '@/lib/utils/page-wrapper';
import { serializePrismaData } from '@/lib/utils/serialize-prisma-data';
import dynamic from 'next/dynamic';

// Lazy load settings clients
const LandlordSettingsClient = dynamic(() => import('@/components/pages/landlord/settings/ui').then(mod => mod.default));
const PMCSettingsClient = dynamic(() => import('@/components/pages/pmc/settings/ui').then(mod => mod.default));
const TenantSettingsClient = dynamic(() => import('@/components/pages/tenant/settings/ui').then(mod => mod.default));

export default withAuth(async ({ user, userRole, prisma, email }) => {
  if (userRole === 'landlord') {
    return (
      <LandlordSettingsClient
        landlord={serializePrismaData(user)}
      />
    );
  } else if (userRole === 'pmc') {
    return (
      <PMCSettingsClient
        pmc={serializePrismaData(user)}
      />
    );
  } else if (userRole === 'tenant') {
    const tenant = await prisma.tenant.findUnique({
      where: { email },
    });

    return (
      <TenantSettingsClient
        tenant={serializePrismaData(tenant)}
      />
    );
  }

  return null;
});
