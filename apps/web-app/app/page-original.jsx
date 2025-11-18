import SignInCard from '@/components/SignInCard';
import { redirect } from "next/navigation";

// Load prisma at module level
let prismaLib;

try {
  prismaLib = require('@/lib/prisma');
} catch (error) {
  console.error('[Home] Module load: Failed to load prisma:', error?.message || error);
  // Don't throw - allow app to continue without Prisma
  prismaLib = null;
}

// Mark as dynamic since we use getSession which requires headers
export const dynamic = 'force-dynamic';

export default async function Home() {
  try {
    let email = null;
    
    // Get session using unified auth interface
    try {
      const { getSession } = require('@/lib/auth');
      const session = await getSession();
      email = session?.user?.email || null;
      
      if (process.env.NODE_ENV === 'development' && email) {
        console.log('[Home] Session retrieved:', { email });
      }
    } catch (authError) {
      // Auth can fail - catch and continue
      // Don't log DYNAMIC_SERVER_USAGE errors - these are expected during build/static generation
      const errorMessage = authError?.message || String(authError || '');
      if (!errorMessage.includes('DYNAMIC_SERVER_USAGE') && !errorMessage.includes('cookies()')) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Home] Auth error:', errorMessage);
        }
      }
      // Continue without session - user is not authenticated
      email = null;
    }
    
    // If no email, show sign-in card
    if (!email) {
      return (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '70vh',
            }}
          >
            <SignInCard />
          </div>
        </div>
      );
    }
    
    if (!prismaLib) {
      console.error('[Home] Prisma not available - cannot check user roles');
      // Show sign-in card if Prisma is not available
      return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 16px' }}>
          <div style={{ 
            background: '#fff3cd', 
            border: '1px solid #ffc107', 
            borderRadius: '8px', 
            padding: '24px', 
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <h2 style={{ color: '#856404', marginBottom: '12px' }}>Database Not Available</h2>
            <p style={{ color: '#856404', margin: 0 }}>
              The database connection is not available. Please check your configuration.
            </p>
          </div>
          <SignInCard />
        </div>
      );
    }
    
    const { prisma } = prismaLib;
    
    // Check all roles: Landlord > Tenant > PMC (including PMC Admin) > Vendor > Contractor
    let landlord = null;
    let tenant = null;
    let vendor = null;
    let contractor = null;
    let pmc = null;
    let pmcAdmin = null;
    let invitation = null;
    
    try {
      [landlord, tenant, vendor, contractor, pmc, pmcAdmin, invitation] = await Promise.all([
          prisma.landlord.findUnique({ 
            where: { email },
            select: { id: true, approvalStatus: true }
          }).catch((err) => {
            console.error('[Home] Error fetching landlord:', err?.message);
            return null;
          }),
          prisma.tenant.findUnique({ 
            where: { email },
            select: { id: true, hasAccess: true, approvalStatus: true }
          }).catch((err) => {
            console.error('[Home] Error fetching tenant:', err?.message);
            return null;
          }),
          prisma.serviceProvider.findFirst({ 
            where: { email, type: 'vendor', isDeleted: false },
            select: { id: true }
          }).catch((err) => {
            console.error('[Home] Error fetching vendor:', err?.message);
            return null;
          }),
          prisma.serviceProvider.findFirst({ 
            where: { email, type: 'contractor', isDeleted: false },
            select: { id: true }
          }).catch((err) => {
            console.error('[Home] Error fetching contractor:', err?.message);
            return null;
          }),
          prisma.propertyManagementCompany.findUnique({ 
            where: { email },
            select: { id: true, approvalStatus: true }
          }).catch((err) => {
            console.error('[Home] Error fetching PMC:', err?.message);
            return null;
          }),
          // Check for Admin user with PMC_ADMIN RBAC role
          prisma.admin.findUnique({
            where: { email },
            select: { id: true, isActive: true, isLocked: true }
          }).then(async (admin) => {
            if (admin && admin.isActive && !admin.isLocked) {
              // Check if admin has PMC_ADMIN role
              const pmcAdminRole = await prisma.userRole.findFirst({
                where: {
                  userId: admin.id,
                  userType: 'admin',
                  isActive: true,
                  role: {
                    name: 'PMC_ADMIN',
                  },
                },
              }).catch(() => null);
              
              if (pmcAdminRole) {
                return {
                  id: pmcAdminRole.pmcId || admin.id,
                  approvalStatus: 'APPROVED', // PMC Admin users are always approved
                };
              }
            }
            return null;
          }).catch(() => null),
          prisma.invitation.findFirst({
            where: {
              email,
              status: { in: ['pending', 'sent', 'opened'] },
              expiresAt: { gt: new Date() }
            },
            select: { id: true, type: true, status: true }
          }).catch((err) => {
            console.error('[Home] Error fetching invitation:', err?.message);
            return null;
          }),
        ]);
    } catch (queryError) {
      console.error('[Home] Error in Promise.all queries:', queryError);
      console.error('[Home] Query error stack:', queryError?.stack);
      // Continue with null values - don't crash
      // Set all to null to prevent further errors
      landlord = null;
      tenant = null;
      vendor = null;
      contractor = null;
      pmc = null;
      pmcAdmin = null;
      invitation = null;
    }
    
    // Redirect based on role priority: Landlord > Tenant > PMC (including PMC Admin) > Vendor > Contractor
    // Only redirect if user is APPROVED
    if (landlord && landlord.approvalStatus === 'APPROVED') {
      redirect("/dashboard");
    } else if (tenant && tenant.hasAccess && tenant.approvalStatus === 'APPROVED') {
      redirect("/dashboard");
    } else if ((pmc && pmc.approvalStatus === 'APPROVED') || pmcAdmin) {
      redirect("/dashboard");
    } else if (vendor) {
      redirect("/vendor/dashboard");
    } else if (contractor) {
      redirect("/contractor/dashboard");
    } else {
      // User not found or pending approval
      if (landlord || tenant || pmc || pmcAdmin) {
        redirect("/pending-approval");
      } else if (invitation) {
        // User has valid invitation - redirect to registration
        redirect("/complete-registration");
      } else {
        // No user and no invitation - show error message (don't redirect to avoid loop)
        return (
          <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 16px' }}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '70vh',
              }}
            >
              <div style={{ 
                background: '#fff3cd', 
                border: '1px solid #ffc107', 
                borderRadius: '8px', 
                padding: '24px', 
                marginBottom: '24px',
                textAlign: 'center',
                maxWidth: 500
              }}>
                <h2 style={{ color: '#856404', marginBottom: '12px' }}>No Invitation Found</h2>
                <p style={{ color: '#856404', margin: 0 }}>
                  You don't have a valid invitation to access this system. Please contact your administrator to receive an invitation.
                </p>
              </div>
              <SignInCard />
            </div>
          </div>
        );
      }
    }
    
    return (
      <div style={{ maxWidth: 600, margin: '0 auto' }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '70vh',
          }}
        >
          <SignInCard />
        </div>
      </div>
    );
  } catch (error) {
    // NEXT_REDIRECT is not a real error - it's how Next.js handles redirects
    if (error?.message === 'NEXT_REDIRECT' || error?.digest?.startsWith('NEXT_REDIRECT')) {
      throw error; // Re-throw redirects - don't log them as errors
    }
    
    console.error('[Home] ERROR in Home component:', error);
    console.error('[Home] Error stack:', error?.stack);
    // Return error page instead of throwing to prevent 500
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 16px' }}>
        <div style={{ 
          background: '#f8d7da', 
          border: '1px solid #f5c6cb', 
          borderRadius: '8px', 
          padding: '24px', 
          marginBottom: '24px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#721c24', marginBottom: '12px' }}>Error Loading Page</h2>
          <p style={{ color: '#721c24', margin: 0 }}>
            {process.env.NODE_ENV === 'development' 
              ? `Error: ${error?.message || 'Unknown error'}` 
              : 'An error occurred while loading the page. Please try again later.'}
          </p>
        </div>
        <SignInCard />
      </div>
    );
  }
}
