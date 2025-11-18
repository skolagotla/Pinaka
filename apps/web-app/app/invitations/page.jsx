import { withAuth } from '@/lib/utils/page-wrapper';
import { serializePrismaData } from '@/lib/utils/serialize-prisma-data';
import dynamicImport from 'next/dynamic';

// Lazy load invitations client (PMC-only)
const PMCInvitationsClient = dynamicImport(() => import('@/components/pages/pmc/invitations/ui').then(mod => mod.default));

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const runtime = 'nodejs';

export default withAuth(async ({ user, userRole, prisma }) => {
  if (userRole === 'pmc') {
    // PMC invitations logic - reuse existing page logic
    let serializedInvitations = [];
    
    try {
      if (!user || !user.id) {
        return (
          <main className="page">
            <PMCInvitationsClient initialInvitations={[]} />
          </main>
        );
      }

      // Fetch invitations sent by this PMC
      const invitations = await prisma.invitation.findMany({
        where: {
          invitedByPMCId: user.id,
        },
        orderBy: { createdAt: 'desc' },
      });

      // Serialize dates for client component
      serializedInvitations = invitations.map(inv => ({
        id: inv.id,
        email: inv.email,
        token: inv.token,
        type: inv.type,
        status: inv.status,
        expiresAt: inv.expiresAt ? inv.expiresAt.toISOString() : null,
        openedAt: inv.openedAt ? inv.openedAt.toISOString() : null,
        completedAt: inv.completedAt ? inv.completedAt.toISOString() : null,
        createdAt: inv.createdAt ? inv.createdAt.toISOString() : null,
        updatedAt: inv.updatedAt ? inv.updatedAt.toISOString() : null,
        invitedBy: inv.invitedBy,
        invitedByRole: inv.invitedByRole,
        invitedByName: inv.invitedByName,
        invitedByEmail: inv.invitedByEmail,
        metadata: inv.metadata,
      }));
    } catch (error) {
      console.error('[Invitations Page] Error:', error);
      serializedInvitations = [];
    }

    return (
      <main className="page">
        <PMCInvitationsClient initialInvitations={serializedInvitations} />
      </main>
    );
  }

  // Not a PMC, redirect to dashboard
  return null;
}, { role: 'pmc' });

