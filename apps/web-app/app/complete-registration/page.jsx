import { auth0 } from '@/lib/auth0';
import { redirect } from "next/navigation";
import CompleteRegistrationForm from "./ui";
const { prisma } = require('@/lib/prisma');

// Mark as dynamic since we use getSession which requires headers
export const dynamic = 'force-dynamic';

export default async function CompleteRegistration() {
  const session = await auth0.getSession();
  
  if (!session?.user) {
    redirect("/");
  }
  
  const email = session.user.email || "";
  
  // Check if user already exists or has valid invitation
  if (email) {
    try {
      // Check all user types (including admin)
      const [landlord, tenant, pmc, vendor, contractor, admin, invitation] = await Promise.all([
        prisma.landlord.findUnique({
          where: { email },
          select: { id: true, approvalStatus: true }
        }).catch(() => null),
        prisma.tenant.findUnique({
          where: { email },
          select: { id: true, approvalStatus: true }
        }).catch(() => null),
        prisma.propertyManagementCompany.findUnique({
          where: { email },
          select: { id: true, approvalStatus: true }
        }).catch(() => null),
        prisma.serviceProvider.findFirst({
          where: { email, type: 'vendor', isDeleted: false },
          select: { id: true }
        }).catch(() => null),
        prisma.serviceProvider.findFirst({
          where: { email, type: 'contractor', isDeleted: false },
          select: { id: true }
        }).catch(() => null),
        prisma.admin.findUnique({
          where: { email },
          select: { id: true, isActive: true, isLocked: true }
        }).catch(() => null),
        prisma.invitation.findFirst({
          where: {
            email,
            status: { in: ['pending', 'sent', 'opened'] },
            expiresAt: { gt: new Date() }
          },
          select: { id: true, type: true, status: true }
        }).catch(() => null),
      ]);
      
      // If user exists, redirect based on role and approval status
      if (admin) {
        // Admin users should use admin login, not Auth0 registration
        redirect("/admin/login");
      }
      
      if (landlord) {
        if (landlord.approvalStatus === 'APPROVED') {
          redirect("/dashboard");
        } else {
          redirect("/pending-approval");
        }
      }
      
      if (tenant || pmc || vendor || contractor) {
        redirect("/dashboard");
      }
      
      // If no user exists and no valid invitation, show error message
      if (!invitation) {
        // No valid invitation - show error message instead of redirecting (to avoid loop)
        return (
          <main className="page">
            <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 16px' }}>
              <div style={{ 
                background: '#fff3cd', 
                border: '1px solid #ffc107', 
                borderRadius: '8px', 
                padding: '24px', 
                textAlign: 'center'
              }}>
                <h2 style={{ color: '#856404', marginBottom: '12px' }}>No Invitation Found</h2>
                <p style={{ color: '#856404', margin: 0 }}>
                  You don't have a valid invitation to complete registration. Please contact your administrator to receive an invitation.
                </p>
              </div>
            </div>
          </main>
        );
      }
      
    } catch (error) {
      console.error('[Complete Registration] Error checking user status:', error);
      // On error, redirect to home instead of logout
      redirect("/?error=registration_error");
    }
  }
  
  // Parse name from Auth0 (format: "First Last" or "First Middle Last")
  const fullName = session.user.name || "";
  const nameParts = fullName.trim().split(/\s+/);
  
  let firstName = "";
  let middleName = "";
  let lastName = "";
  
  if (nameParts.length === 1) {
    firstName = nameParts[0];
  } else if (nameParts.length === 2) {
    firstName = nameParts[0];
    lastName = nameParts[1];
  } else if (nameParts.length >= 3) {
    firstName = nameParts[0];
    lastName = nameParts[nameParts.length - 1];
    middleName = nameParts.slice(1, -1).join(" ");
  }
  
  return (
    <main className="page">
      <CompleteRegistrationForm
        firstName={firstName}
        middleName={middleName}
        lastName={lastName}
        email={email}
      />
    </main>
  );
}

