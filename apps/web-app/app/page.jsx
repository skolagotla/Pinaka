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
    // Wrap in try-catch to handle any errors gracefully
    try {
      const authModule = await import('@/lib/auth');
      const { getSession } = authModule;
      const session = await getSession();
      email = session?.user?.email || null;
      
      if (process.env.NODE_ENV === 'development' && email) {
        console.log('[Home] Session retrieved:', { email });
      }
    } catch (authError) {
      // Auth can fail - catch and continue
      // Don't log DYNAMIC_SERVER_USAGE errors - these are expected during build/static generation
      const errorMessage = authError?.message || String(authError || '');
      if (!errorMessage.includes('DYNAMIC_SERVER_USAGE') && 
          !errorMessage.includes('cookies()') &&
          !errorMessage.includes('Route')) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[Home] Auth error (non-critical):', errorMessage);
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
    
    // Log which database we're using (for debugging)
    if (process.env.NODE_ENV === 'development') {
      try {
        const dbConfig = require('@/lib/utils/db-config');
        const activeDb = dbConfig.getActiveDatabase();
        const dbUrl = dbConfig.getDatabaseUrl();
        console.log('[Home] Database connection info:', {
          activeDatabase: activeDb,
          databaseUrl: dbUrl ? dbUrl.replace(/:[^:@]+@/, ':****@') : 'NOT SET',
        });
      } catch (e) {
        console.log('[Home] Could not get database config:', e?.message);
      }
    }
    
    // Normalize email (same logic as login API)
    // Allow "pmcadmin1" through "pmcadmin5" as user IDs (old format)
    // Allow "pmc1-admin" and "pmc2-admin" as user IDs (new format for AB Homes)
    // Allow "pmc1-lld1" through "pmc1-lld10" as user IDs (landlords for AB Homes)
    let searchEmail = email.toLowerCase().trim();
    if (searchEmail.match(/^pmcadmin[1-5]$/)) {
      searchEmail = `${searchEmail}@pmc.local`;
    } else if (searchEmail.match(/^pmc[12]-admin$/)) {
      // Map pmc1-admin -> pmc1-admin@pmc.local, pmc2-admin -> pmc2-admin@pmc.local
      searchEmail = `${searchEmail}@pmc.local`;
    } else if (searchEmail.match(/^pmc1-lld([1-9]|10)$/)) {
      // Map pmc1-lld1 -> pmc1-lld1@pmc.local, pmc1-lld2 -> pmc1-lld2@pmc.local, etc.
      searchEmail = `${searchEmail}@pmc.local`;
    }
    // If already in correct format (pmc1-admin@pmc.local), use as-is
    
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
            where: { email: searchEmail },
            select: { id: true, approvalStatus: true }
          }).catch((err) => {
            console.error('[Home] Error fetching landlord:', err?.message);
            return null;
          }),
          prisma.tenant.findUnique({ 
            where: { email: searchEmail },
            select: { id: true, hasAccess: true, approvalStatus: true }
          }).catch((err) => {
            console.error('[Home] Error fetching tenant:', err?.message);
            return null;
          }),
          prisma.serviceProvider.findFirst({ 
            where: { email: searchEmail, type: 'vendor', isDeleted: false },
            select: { id: true }
          }).catch((err) => {
            console.error('[Home] Error fetching vendor:', err?.message);
            return null;
          }),
          prisma.serviceProvider.findFirst({ 
            where: { email: searchEmail, type: 'contractor', isDeleted: false },
            select: { id: true }
          }).catch((err) => {
            console.error('[Home] Error fetching contractor:', err?.message);
            return null;
          }),
          prisma.propertyManagementCompany.findUnique({ 
            where: { email: searchEmail },
            select: { id: true, approvalStatus: true }
          }).catch((err) => {
            console.error('[Home] Error fetching PMC:', err?.message);
            return null;
          }),
          // Check for Admin user with PMC_ADMIN RBAC role
          prisma.admin.findUnique({
            where: { email: searchEmail },
            select: { id: true, isActive: true, isLocked: true, email: true }
          }).then(async (admin) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('[Home] Admin lookup result:', {
                searchEmail,
                found: !!admin,
                adminId: admin?.id,
                adminEmail: admin?.email,
                isActive: admin?.isActive,
                isLocked: admin?.isLocked,
              });
              
              // If not found, try to find any admin with similar email
              if (!admin) {
                const allAdmins = await prisma.admin.findMany({
                  select: { id: true, email: true, isActive: true },
                  take: 5,
                }).catch(() => []);
                console.log('[Home] Sample admin emails in database:', allAdmins.map(a => a.email));
              }
            }
            
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
              }).catch((err) => {
                if (process.env.NODE_ENV === 'development') {
                  console.log('[Home] Error checking PMC_ADMIN role:', err?.message);
                }
                return null;
              });
              
              if (process.env.NODE_ENV === 'development') {
                console.log('[Home] PMC Admin role check:', {
                  adminId: admin.id,
                  foundRole: !!pmcAdminRole,
                  pmcId: pmcAdminRole?.pmcId,
                });
              }
              
              if (pmcAdminRole) {
                return {
                  id: pmcAdminRole.pmcId || admin.id,
                  approvalStatus: 'APPROVED', // PMC Admin users are always approved
                };
              }
              
              // If no role found but email matches PMC admin pattern, still treat as PMC admin
              // This handles cases where the role might not be assigned yet but user can login
              if (searchEmail.match(/^pmc[12]-admin@pmc\.local$/) || 
                  searchEmail.match(/^pmcadmin[1-5]@pmc\.local$/)) {
                if (process.env.NODE_ENV === 'development') {
                  console.log('[Home] Using PMC admin pattern fallback for:', searchEmail);
                }
                return {
                  id: admin.id,
                  approvalStatus: 'APPROVED', // PMC Admin users are always approved
                };
              }
            }
            return null;
          }).catch((err) => {
            if (process.env.NODE_ENV === 'development') {
              console.error('[Home] Error fetching admin:', err?.message);
            }
            return null;
          }),
          prisma.invitation.findFirst({
            where: {
              email: searchEmail,
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
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Home] User lookup results:', {
        email: searchEmail,
        landlord: !!landlord,
        tenant: !!tenant,
        vendor: !!vendor,
        contractor: !!contractor,
        pmc: !!pmc,
        pmcAdmin: !!pmcAdmin,
        invitation: !!invitation,
        pmcAdminDetails: pmcAdmin,
      });
    }
    
    // Redirect based on role priority: Landlord > Tenant > PMC (including PMC Admin) > Vendor > Contractor
    // Only redirect if user is APPROVED
    if (landlord && landlord.approvalStatus === 'APPROVED') {
      redirect("/dashboard");
    } else if (tenant && tenant.hasAccess && tenant.approvalStatus === 'APPROVED') {
      redirect("/dashboard");
    } else if ((pmc && pmc.approvalStatus === 'APPROVED') || pmcAdmin) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[Home] Redirecting PMC admin to dashboard:', { pmcAdmin });
      }
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
        if (process.env.NODE_ENV === 'development') {
          console.log('[Home] No user found - showing invitation error:', {
            searchEmail,
            landlord: !!landlord,
            tenant: !!tenant,
            pmc: !!pmc,
            pmcAdmin: !!pmcAdmin,
            invitation: !!invitation,
          });
        }
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
