/**
 * Application Intake & Screening Feature
 * Phase 4: Feature Implementation (RBAC-Enabled)
 * 
 * Implements tenant application intake with RBAC integration
 */

import { PrismaClient } from '@prisma/client';
import { hasPermission, canAccessResource } from '../rbac';
import { logDataAccess } from '../rbac/auditLogging';
import { createLeaseApproval, approveLease } from '../rbac/approvalWorkflows';
import { ResourceCategory, PermissionAction } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Application status enum
 */
export enum ApplicationStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  WITHDRAWN = 'withdrawn',
}

/**
 * Create tenant application
 * RBAC: Tenant/co-applicant can create and edit (within 1-week deadline)
 */
export async function createApplication(
  unitId: string,
  applicantId: string | null,
  applicantType: string,
  applicantEmail: string,
  applicantName: string,
  applicantPhone?: string | null,
  coApplicantIds?: string[]
): Promise<string> {
  // Check permission (use unitId as fallback if applicantId is null)
  const canCreate = applicantId
    ? await hasPermission(
        applicantId,
        applicantType,
        'applications',
        PermissionAction.CREATE,
        ResourceCategory.LEASING_APPLICATIONS
      )
    : true; // Allow creation if no applicantId (new applicant)

  if (!canCreate) {
    throw new Error('You do not have permission to create applications');
  }

  // Get unit to find propertyId
  const unit = await prisma.unit.findUnique({
    where: { id: unitId },
    include: {
      property: true,
    },
  });

  if (!unit) {
    throw new Error('Unit not found');
  }

  // Create application using Application model
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 7); // 1-week deadline

  const application = await prisma.application.create({
    data: {
      unitId,
      propertyId: unit.propertyId,
      applicantId: applicantId || null,
      applicantEmail,
      applicantName,
      applicantPhone: applicantPhone || null,
      coApplicantIds: coApplicantIds || [],
      status: 'draft',
      deadline,
    },
  });

  // Log application creation
  await prisma.rBACAuditLog.create({
    data: {
      userId: applicantId || application.id, // Use application ID if no applicantId
      userType: applicantType,
      userEmail: applicantEmail,
      userName: applicantName,
      action: 'application_created',
      resource: 'application',
      resourceId: application.id,
      details: {
        unitId,
        coApplicantIds,
        deadline: deadline.toISOString(),
      },
    },
  });

  return application.id;
}

/**
 * Update application (within 1-week deadline)
 * RBAC: Tenant/co-applicant can edit before deadline
 */
export async function updateApplication(
  applicationId: string,
  updates: any,
  userId: string,
  userType: string,
  userEmail: string,
  userName: string
): Promise<void> {
  // Get application
  const application = await prisma.invitation.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new Error('Application not found');
  }

  // Check if within deadline (1 week from creation)
  const deadline = new Date(application.createdAt);
  deadline.setDate(deadline.getDate() + 7);

  if (new Date() > deadline) {
    throw new Error('Application deadline has passed. Cannot edit.');
  }

  // Check if user is applicant or co-applicant
  if (application.email !== userEmail && userType !== 'tenant') {
    throw new Error('Only the applicant or co-applicants can edit this application');
  }

  // Check permission
  const canUpdate = await hasPermission(
    userId,
    userType,
    'applications',
    PermissionAction.UPDATE,
    ResourceCategory.LEASING_APPLICATIONS
  );

  if (!canUpdate) {
    throw new Error('You do not have permission to update applications');
  }

  // Update application
  await prisma.application.update({
    where: { id: applicationId },
    data: {
      ...updates,
      updatedAt: new Date(),
    },
  });

  // Log update
  await prisma.rBACAuditLog.create({
    data: {
      userId,
      userType,
      userEmail,
      userName,
      action: 'application_updated',
      resource: 'application',
      resourceId: applicationId,
      details: {
        updates,
      },
    },
  });
}

/**
 * Submit application for review
 * RBAC: Tenant/co-applicant can submit
 */
export async function submitApplication(
  applicationId: string,
  userId: string,
  userType: string,
  userEmail: string,
  userName: string
): Promise<void> {
  // Get application
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
  });

  if (!application) {
    throw new Error('Application not found');
  }

  if (application.status !== 'draft') {
    throw new Error('Application has already been submitted or processed');
  }

  // Check permission
  const canSubmit = await hasPermission(
    userId,
    userType,
    'applications',
    PermissionAction.SUBMIT,
    ResourceCategory.LEASING_APPLICATIONS
  );

  if (!canSubmit) {
    throw new Error('You do not have permission to submit applications');
  }

  // Update status to submitted
  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: 'submitted',
    },
  });

  // Log submission
  await prisma.rBACAuditLog.create({
    data: {
      userId,
      userType,
      userEmail,
      userName,
      action: 'application_submitted',
      resource: 'application',
      resourceId: applicationId,
    },
  });
}

/**
 * Request tenant screening
 * RBAC: PM/Leasing/Landlord can request screening
 */
export async function requestScreening(
  applicationId: string,
  requestedBy: string,
  requestedByType: string,
  requestedByEmail: string,
  requestedByName: string
): Promise<string> {
  // Check permission
  const canRequest = await hasPermission(
    requestedBy,
    requestedByType,
    'applications',
    PermissionAction.CREATE,
    ResourceCategory.LEASING_APPLICATIONS
  );

  if (!canRequest) {
    throw new Error('You do not have permission to request screening');
  }

  // Request screening from third-party (integration would go here)
  // For now, log the request
  await prisma.rBACAuditLog.create({
    data: {
      userId: requestedBy,
      userType: requestedByType,
      userEmail: requestedByEmail,
      userName: requestedByName,
      action: 'screening_requested',
      resource: 'application',
      resourceId: applicationId,
      details: {
        secureChannel: true,
        thirdPartyIntegration: true,
      },
    },
  });

  return `screening-${applicationId}`;
}

/**
 * Approve application and create lease
 * RBAC: Owner approval ALWAYS required
 */
export async function approveApplicationAndCreateLease(
  applicationId: string,
  leaseData: any,
  approvedBy: string,
  approvedByType: string,
  approvedByEmail: string,
  approvedByName: string,
  landlordId: string
): Promise<{ leaseId: string; approvalRequestId: string }> {
  // Check permission
  const canApprove = await hasPermission(
    approvedBy,
    approvedByType,
    'applications',
    PermissionAction.APPROVE,
    ResourceCategory.LEASING_APPLICATIONS
  );

  if (!canApprove) {
    throw new Error('You do not have permission to approve applications');
  }

  // Create lease (draft status)
  const lease = await prisma.lease.create({
    data: {
      ...leaseData,
      status: 'Draft', // Not official until approved
    },
  });

  // Create lease approval request (ALWAYS required)
  const approvalRequestId = await createLeaseApproval(
    lease.id,
    approvedBy,
    approvedByType,
    landlordId
  );

  // Update application status
  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: 'approved',
      approvedAt: new Date(),
      approvedBy: approvedBy,
      approvedByType: approvedByType,
      approvedByEmail: approvedByEmail,
      approvedByName: approvedByName,
      leaseId: lease.id,
    },
  });

  return {
    leaseId: lease.id,
    approvalRequestId,
  };
}

/**
 * Reject application
 * RBAC: PM/Leasing/Landlord can reject
 */
export async function rejectApplication(
  applicationId: string,
  rejectionReason: string,
  rejectedBy: string,
  rejectedByType: string,
  rejectedByEmail: string,
  rejectedByName: string
): Promise<void> {
  // Check permission
  const canReject = await hasPermission(
    rejectedBy,
    rejectedByType,
    'applications',
    PermissionAction.APPROVE, // Using APPROVE action for reject (would have REJECT action)
    ResourceCategory.LEASING_APPLICATIONS
  );

  if (!canReject) {
    throw new Error('You do not have permission to reject applications');
  }

  // Update application status (archived for reporting)
  await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: 'rejected',
      rejectedAt: new Date(),
      rejectedBy: rejectedBy,
      rejectedByType: rejectedByType,
      rejectedByEmail: rejectedByEmail,
      rejectedByName: rejectedByName,
      rejectionReason: rejectionReason,
      isArchived: true, // Archived for reporting
    },
  });

  // Log rejection
  await prisma.rBACAuditLog.create({
    data: {
      userId: rejectedBy,
      userType: rejectedByType,
      userEmail: rejectedByEmail,
      userName: rejectedByName,
      action: 'application_rejected',
      resource: 'application',
      resourceId: applicationId,
      details: {
        rejectionReason,
        archived: true, // Kept for reporting
      },
    },
  });
}

