import { withAuth } from '@/lib/utils/page-wrapper';
import { serializePrismaData } from '@/lib/utils/serialize-prisma-data';
import dynamic from 'next/dynamic';

// Lazy load checklist client (tenant-only)
const TenantChecklistClient = dynamic(() => import('@/components/pages/tenant/checklist/ui').then(mod => mod.default));

export default withAuth(async ({ user, userRole, prisma, email }) => {
  if (userRole === 'tenant') {
    const tenant = await prisma.tenant.findUnique({
      where: { email },
    });

    return (
      <TenantChecklistClient
        tenant={serializePrismaData(tenant)}
      />
    );
  }

  // Not a tenant, redirect to dashboard
  return null;
}, { role: 'tenant' });

