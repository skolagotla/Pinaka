import { withAuth } from '@/lib/utils/page-wrapper';
import { serializePrismaData } from '@/lib/utils/serialize-prisma-data';
import dynamic from 'next/dynamic';

// Lazy load estimator client (tenant-only)
const TenantEstimatorClient = dynamic(() => import('@/components/pages/tenant/estimator/ui').then(mod => mod.default));

export default withAuth(async ({ user, userRole, prisma, email }) => {
  if (userRole === 'tenant') {
    const tenant = await prisma.tenant.findUnique({
      where: { email },
    });

    return (
      <TenantEstimatorClient
        tenant={serializePrismaData(tenant)}
      />
    );
  }

  return null;
}, { role: 'tenant' });

