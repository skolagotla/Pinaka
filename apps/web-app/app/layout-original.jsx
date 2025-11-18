import './globals.css';
import Providers from './providers';
import LayoutClient from './LayoutClient';

// Load prisma at module level
// Wrap in try-catch to prevent crashes if database is unavailable
let prismaLib;
try {
  prismaLib = require('@/lib/prisma');
} catch (error) {
  // Don't throw - allow app to continue without Prisma
  // This is especially important for db-switcher page or when database is unavailable
  console.warn('[Layout] Module load: Failed to load prisma (may be expected for db-switcher):', error?.message || error);
  prismaLib = null;
}

// Mark as dynamic since we use getSession which requires headers
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Pinaka - Property Management',
  description: 'Modern property management system for landlords and tenants',
};

export default async function RootLayout({ children }) {
  try {
    // First, check for admin session
    let firstName = '';
    let lastName = '';
    let showNav = false;
    let userRole = null; // 'landlord', 'tenant', 'pmc', 'vendor', 'contractor', or 'admin'
    let userTheme = 'default'; // Default theme
    let userTimezone = null; // User's preferred timezone
    
    // Check for admin session first - wrap in try-catch to prevent crashes
    // Skip if Prisma is not available (e.g., database connection issues)
    // IMPORTANT: cookies() must be called at the top level, not conditionally
    // But we need to be very careful - if it fails, we should continue gracefully
    let cookieStore = null;
    let adminSessionToken = null;
    
    try {
      // Try to get cookies - this might fail in some contexts
      const { cookies } = await import('next/headers');
      cookieStore = await cookies();
      if (cookieStore) {
        adminSessionToken = cookieStore.get('admin_session')?.value || null;
      }
    } catch (cookieError) {
      // If cookies() fails, that's okay - we'll just skip admin session check
      // This is expected in some contexts (build time, static generation, etc.)
      cookieStore = null;
      adminSessionToken = null;
      // Don't log expected errors
      const errorMsg = cookieError?.message || String(cookieError || '');
      if (process.env.NODE_ENV === 'development' && 
          !errorMsg.includes('DYNAMIC_SERVER_USAGE') && 
          !errorMsg.includes('Route') &&
          !errorMsg.includes('cookies()')) {
        console.log('[Layout] Could not access cookies (this is okay):', errorMsg);
      }
    }
    
    if (prismaLib && adminSessionToken) {
      try {
        const { validateSession } = require('@/lib/admin/session');
        
        try {
          const sessionData = await validateSession(adminSessionToken);
          if (sessionData && sessionData.admin) {
            const admin = sessionData.admin;
            firstName = admin.firstName;
            lastName = admin.lastName;
            showNav = true;
            userRole = 'admin';
            userTheme = 'default';
            userTimezone = 'America/Toronto';
          }
        } catch (validateError) {
          // Session validation failed - continue
          const errorMsg = validateError?.message || String(validateError || '');
          if (process.env.NODE_ENV === 'development' && !errorMsg.includes('DYNAMIC_SERVER_USAGE')) {
            console.log('[Layout] Admin session validation error:', errorMsg);
          }
        }
      } catch (adminError) {
        // Admin session check failed - continue
        const errorMsg = adminError?.message || String(adminError || '');
        if (process.env.NODE_ENV === 'development' && 
            !errorMsg.includes('DYNAMIC_SERVER_USAGE') && 
            !errorMsg.includes('cookies()')) {
          console.log('[Layout] Admin session check error:', errorMsg);
        }
        // Continue - don't throw
      }
    }
    
    // If not admin, check session using unified auth interface
    if (!showNav) {
      let email = null;
      
      try {
        const { getSession } = require('@/lib/auth');
        const session = await getSession();
        email = session?.user?.email || null;
        
        if (process.env.NODE_ENV === 'development' && email) {
          console.log('[Layout] Session retrieved:', { email });
        }
      } catch (authError) {
        // Auth can fail - catch and continue
        // Don't log DYNAMIC_SERVER_USAGE errors - these are expected during build/static generation
        const errorMessage = authError?.message || String(authError || '');
        if (!errorMessage.includes('DYNAMIC_SERVER_USAGE') && !errorMessage.includes('cookies()')) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[Layout] Auth error:', errorMessage);
          }
        }
        // Continue without session - user is not authenticated
        email = null;
      }
      
      // Don't show navigation if user is not logged in
      if (email) {
        try {
          if (!prismaLib) {
            console.error('[Layout] Prisma not available - cannot fetch user data');
            // Continue without user data
          } else {
            const { prisma } = prismaLib;
          
            // Check all roles: Landlord > Tenant > PMC (including PMC Admin) > Vendor > Contractor
            // BUG FIX: Updated to use ServiceProvider model (Vendor and Contractor models were removed)
            // BUG FIX: Added .catch() to each query to prevent one failure from crashing the entire Promise.all
            // BUG FIX: Also check for Admin users with PMC_ADMIN RBAC role (PMC Admin users)
            const [landlord, tenant, vendor, contractor, pmc, pmcAdmin] = await Promise.all([
              prisma.landlord.findUnique({ 
                where: { email },
                select: { id: true, email: true, firstName: true, lastName: true, theme: true, timezone: true }
              }).catch(() => null),
              prisma.tenant.findUnique({ 
                where: { email },
                select: { id: true, email: true, firstName: true, lastName: true, hasAccess: true, theme: true, timezone: true }
              }).catch(() => null),
              prisma.serviceProvider.findFirst({ 
                where: { 
                  email,
                  type: 'vendor',
                  isDeleted: false
                },
                select: { id: true, email: true, name: true, businessName: true }
              }).catch(() => null),
              prisma.serviceProvider.findFirst({ 
                where: { 
                  email,
                  type: 'contractor',
                  isDeleted: false
                },
                select: { id: true, email: true, name: true, businessName: true, contactName: true }
              }).catch(() => null),
              prisma.propertyManagementCompany.findUnique({ 
                where: { email },
                select: { id: true, email: true, companyName: true }
              }).catch(() => null),
              // Check for Admin user with PMC_ADMIN RBAC role
              prisma.admin.findUnique({
                where: { email },
                select: { id: true, email: true, firstName: true, lastName: true, isActive: true, isLocked: true }
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
                    include: {
                      role: true,
                    },
                  }).catch(() => null);
                  
                  if (pmcAdminRole) {
                    // Get the PMC company info
                    const pmcCompany = pmcAdminRole.pmcId ? await prisma.propertyManagementCompany.findUnique({
                      where: { id: pmcAdminRole.pmcId },
                      select: { id: true, companyName: true, email: true }
                    }).catch(() => null) : null;
                    
                    return {
                      admin,
                      pmcAdminRole,
                      pmcCompany,
                    };
                  }
                }
                return null;
              }).catch(() => null),
            ]);
            
            // Determine user role and info (priority: Landlord > Tenant > PMC (including PMC Admin) > Vendor > Contractor)
            if (landlord) {
              firstName = landlord.firstName;
              lastName = landlord.lastName;
              showNav = true;
              userRole = 'landlord';
              userTheme = landlord.theme || 'default';
              userTimezone = landlord.timezone || 'America/Toronto';
            } else if (tenant && tenant.hasAccess) {
              firstName = tenant.firstName;
              lastName = tenant.lastName;
              showNav = true;
              userRole = 'tenant';
              userTheme = tenant.theme || 'default';
              userTimezone = tenant.timezone || 'America/New_York';
            } else if (pmcAdmin && pmcAdmin.admin) {
              // PMC Admin user (Admin with PMC_ADMIN RBAC role)
              firstName = pmcAdmin.admin.firstName;
              lastName = pmcAdmin.admin.lastName;
              showNav = true;
              userRole = 'pmc';
              userTheme = 'default';
              userTimezone = 'America/Toronto';
            } else if (pmc) {
              // Regular PMC (PropertyManagementCompany)
              const nameParts = pmc.companyName.split(' ');
              firstName = nameParts[0] || 'PMC';
              lastName = nameParts.slice(1).join(' ') || 'User';
              showNav = true;
              userRole = 'pmc';
              userTheme = 'default';
              userTimezone = 'America/Toronto';
            } else if (vendor) {
              // Extract name from vendor name or business name
              // BUG FIX: Updated to use ServiceProvider fields (name or businessName)
              const vendorName = vendor.name || vendor.businessName || 'Vendor';
              const nameParts = vendorName.split(' ');
              firstName = nameParts[0] || 'Vendor';
              lastName = nameParts.slice(1).join(' ') || 'User';
              showNav = true;
              userRole = 'vendor';
              userTheme = 'default';
              userTimezone = 'America/Toronto';
            } else if (contractor) {
              // Use contact name, name, or business name for contractor
              // BUG FIX: Updated to use ServiceProvider fields
              const contractorName = contractor.contactName || contractor.name || contractor.businessName || 'Contractor';
              const nameParts = contractorName.split(' ');
              firstName = nameParts[0] || 'Contractor';
              lastName = nameParts.slice(1).join(' ') || 'User';
              showNav = true;
              userRole = 'contractor';
              userTheme = 'default';
              userTimezone = 'America/Toronto';
            }
            
            // Store available roles for role switcher (if needed in future)
            // This can be passed to LayoutClient if we implement role switching
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }
    }
    
    // Determine if Auth0 should be used based on AUTH_MODE
    const authMode = process.env.AUTH_MODE || 'auto';
    const useAuth0 = authMode === 'auth0';
    
    return (
      <html lang="en">
        <head>
          {/* Load warning suppression FIRST, before any React code */}
          <script src="/suppress-antd-warning.js" />
          {/* Google Fonts for signature styles - Now lazy loaded via SignatureFontProvider */}
          {/* Fonts are only loaded when signature component is actually used, preventing blocking on initial page load */}
        </head>
        <body style={{ margin: 0, padding: 0 }}>
          <Providers 
            userTheme={userTheme} 
            userTimezone={userTimezone}
            userRole={userRole}
            initialProperties={[]} // Properties will be fetched client-side
            useAuth0={useAuth0}
          >
            <LayoutClient 
              firstName={firstName} 
              lastName={lastName} 
              userRole={userRole}
              showNav={showNav}
            >
              {children}
            </LayoutClient>
          </Providers>
        </body>
      </html>
    );
  } catch (error) {
    console.error('[Layout] ERROR in RootLayout:', error);
    console.error('[Layout] Error message:', error?.message);
    console.error('[Layout] Error stack:', error?.stack);
    
    // Check if this is a database connection error
    const errorMessage = error?.message || String(error || 'Unknown error');
    const errorStack = error?.stack || '';
    const isDbError = errorMessage.includes('database') || 
                     errorMessage.includes('Prisma') ||
                     error?.code?.startsWith('P');
    
    // Return error page instead of throwing
    return (
      <html lang="en">
        <head>
          <title>Error - Pinaka</title>
        </head>
        <body style={{ margin: 0, padding: 0 }}>
          <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
            <h1 style={{ color: '#ff4d4f', marginBottom: '16px' }}>Error Loading Application</h1>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>
              {process.env.NODE_ENV === 'development' ? errorMessage : 'An error occurred while loading the application.'}
            </p>
            {isDbError && (
              <p style={{ marginTop: 16, color: '#ff4d4f', fontSize: '14px' }}>
                Database connection error. Please check your database configuration or use /db-switcher to switch databases.
              </p>
            )}
            {process.env.NODE_ENV === 'development' && errorStack && (
              <details style={{ marginTop: 20, textAlign: 'left', maxWidth: 800, margin: '20px auto' }}>
                <summary style={{ cursor: 'pointer', color: '#1890ff', marginBottom: '8px' }}>Error Details (Click to expand)</summary>
                <pre style={{ background: '#f5f5f5', padding: 16, borderRadius: 4, fontSize: '12px', overflow: 'auto', whiteSpace: 'pre-wrap' }}>
                  {errorStack}
                </pre>
              </details>
            )}
            <p style={{ marginTop: 24, fontSize: '14px', color: '#666' }}>
              <a href="/" style={{ color: '#1890ff', textDecoration: 'none' }}>Try again</a> | 
              <a href="/db-switcher" style={{ color: '#1890ff', textDecoration: 'none', marginLeft: '8px' }}>Switch Database</a>
            </p>
          </div>
        </body>
      </html>
    );
  }
}
