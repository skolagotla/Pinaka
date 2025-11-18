/**
 * ═══════════════════════════════════════════════════════════════
 * UNIFIED VERIFICATION MIGRATION SCRIPT
 * ═══════════════════════════════════════════════════════════════
 * 
 * Migrates existing verification data to the unified UnifiedVerification model
 * 
 * Migration Types:
 * 1. PropertyOwnershipVerification → PROPERTY_OWNERSHIP
 * 2. Document (isVerified=false) → TENANT_DOCUMENT
 * 3. Invitation (approvalStatus=PENDING) → APPLICATION
 * 4. Landlord/Tenant/PMC (approvalStatus=PENDING) → ENTITY_APPROVAL
 * 5. PMCLandlordApprovalRequest → FINANCIAL_APPROVAL
 * 6. InspectionChecklist (pending/submitted) → INSPECTION
 * 
 * Usage:
 *   node scripts/migrate-verifications-to-unified.js
 * 
 * ═══════════════════════════════════════════════════════════════
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Migration statistics
const stats = {
  propertyOwnership: { created: 0, skipped: 0, errors: 0 },
  tenantDocuments: { created: 0, skipped: 0, errors: 0 },
  applications: { created: 0, skipped: 0, errors: 0 },
  entityApprovals: { created: 0, skipped: 0, errors: 0 },
  financialApprovals: { created: 0, skipped: 0, errors: 0 },
  inspections: { created: 0, skipped: 0, errors: 0 },
};

/**
 * Check if verification already exists
 */
async function verificationExists(verificationType, entityType, entityId) {
  try {
    const existing = await prisma.unifiedVerification.findUnique({
      where: {
        verificationType_entityType_entityId: {
          verificationType,
          entityType,
          entityId,
        },
      },
    });
    return !!existing;
  } catch (error) {
    // If unique constraint doesn't exist yet, return false
    return false;
  }
}

/**
 * Create verification with history
 */
async function createUnifiedVerification(data) {
  const {
    verificationType,
    entityType,
    entityId,
    requestedBy,
    requestedByRole,
    requestedByEmail,
    requestedByName,
    assignedTo = null,
    assignedToRole = null,
    assignedToEmail = null,
    assignedToName = null,
    title,
    description = null,
    notes = null,
    fileName = null,
    originalName = null,
    fileUrl = null,
    fileSize = null,
    mimeType = null,
    metadata = null,
    priority = 'normal',
    dueDate = null,
    status = 'PENDING',
    verifiedBy = null,
    verifiedByRole = null,
    verifiedByEmail = null,
    verifiedByName = null,
    verificationNotes = null,
    verifiedAt = null,
    rejectedBy = null,
    rejectedByRole = null,
    rejectedByEmail = null,
    rejectedByName = null,
    rejectionReason = null,
    rejectedAt = null,
  } = data;

  // Check if already exists
  const exists = await verificationExists(verificationType, entityType, entityId);
  if (exists) {
    return { created: false, skipped: true };
  }

  try {
    // Create verification
    const verification = await prisma.unifiedVerification.create({
      data: {
        verificationType,
        entityType,
        entityId,
        requestedBy,
        requestedByRole,
        requestedByEmail,
        requestedByName,
        assignedTo,
        assignedToRole,
        assignedToEmail,
        assignedToName,
        title,
        description,
        notes,
        fileName,
        originalName,
        fileUrl,
        fileSize,
        mimeType,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
        priority,
        dueDate,
        status,
        requestedAt: new Date(),
        verifiedBy,
        verifiedByRole,
        verifiedByEmail,
        verifiedByName,
        verificationNotes,
        verifiedAt: verifiedAt ? new Date(verifiedAt) : null,
        rejectedBy,
        rejectedByRole,
        rejectedByEmail,
        rejectedByName,
        rejectionReason,
        rejectedAt: rejectedAt ? new Date(rejectedAt) : null,
      },
    });

    // Create history entries
    const historyActions = [];
    historyActions.push({
      action: 'created',
      performedBy: requestedBy,
      performedByRole: requestedByRole,
      performedByEmail: requestedByEmail,
      performedByName: requestedByName,
      newStatus: status,
      notes: 'Migrated from legacy verification system',
    });

    // If already verified, add verification history
    if (status === 'VERIFIED' && verifiedBy) {
      historyActions.push({
        action: 'verified',
        performedBy: verifiedBy,
        performedByRole: verifiedByRole || 'unknown',
        performedByEmail: verifiedByEmail,
        performedByName: verifiedByName,
        previousStatus: 'PENDING',
        newStatus: 'VERIFIED',
        notes: verificationNotes || 'Verified during migration',
      });
    }

    // If already rejected, add rejection history
    if (status === 'REJECTED' && rejectedBy) {
      historyActions.push({
        action: 'rejected',
        performedBy: rejectedBy,
        performedByRole: rejectedByRole || 'unknown',
        performedByEmail: rejectedByEmail,
        performedByName: rejectedByName,
        previousStatus: 'PENDING',
        newStatus: 'REJECTED',
        notes: rejectionReason || 'Rejected during migration',
      });
    }

    // Create all history entries
    for (const historyData of historyActions) {
      await prisma.unifiedVerificationHistory.create({
        data: {
          verificationId: verification.id,
          ...historyData,
          performedByEmail: historyData.performedByEmail || '',
          performedByName: historyData.performedByName || 'System',
          metadata: {
            migration: true,
            migratedAt: new Date().toISOString(),
          },
        },
      });
    }

    return { created: true, verification };
  } catch (error) {
    console.error(`[Migration] Error creating verification:`, error);
    return { created: false, error: error.message };
  }
}

/**
 * Migrate PropertyOwnershipVerification records
 */
async function migratePropertyOwnershipVerifications() {
  console.log('\n📄 Migrating Property Ownership Verifications...');
  
  try {
    const verifications = await prisma.propertyOwnershipVerification.findMany({
      where: {
        status: {
          in: ['PENDING', 'REJECTED'], // Only migrate pending/rejected (verified ones are historical)
        },
      },
      include: {
        landlord: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        pmcLandlord: {
          include: {
            pmc: {
              select: {
                id: true,
                email: true,
                companyName: true,
              },
            },
          },
        },
      },
    });

    console.log(`   Found ${verifications.length} property ownership verifications to migrate`);

    for (const ver of verifications) {
      const status = ver.status === 'REJECTED' ? 'REJECTED' : 'PENDING';
      
      const result = await createUnifiedVerification({
        verificationType: 'PROPERTY_OWNERSHIP',
        entityType: 'PropertyOwnershipVerification',
        entityId: ver.id,
        requestedBy: ver.landlordId,
        requestedByRole: 'landlord',
        requestedByEmail: ver.uploadedByEmail,
        requestedByName: ver.uploadedByName,
        assignedTo: ver.pmcLandlord.pmc.id,
        assignedToRole: 'pmc',
        assignedToEmail: ver.pmcLandlord.pmc.email,
        assignedToName: ver.pmcLandlord.pmc.companyName,
        title: `Property Ownership: ${ver.documentType.replace(/_/g, ' ')}`,
        description: `Property ownership verification document: ${ver.documentType}`,
        notes: ver.notes,
        fileName: ver.fileName,
        originalName: ver.originalName,
        fileUrl: ver.fileUrl,
        fileSize: ver.fileSize,
        mimeType: ver.mimeType,
        metadata: {
          documentType: ver.documentType,
          propertyId: ver.propertyId,
          pmcLandlordId: ver.pmcLandlordId,
          expirationDate: ver.expirationDate?.toISOString() || null,
          documentNumber: ver.documentNumber,
          issuedBy: ver.issuedBy,
          issuedDate: ver.issuedDate?.toISOString() || null,
        },
        priority: 'normal',
        dueDate: ver.expirationDate,
        status,
        // If already verified/rejected, copy that info
        verifiedBy: ver.verifiedBy || null,
        verifiedByRole: ver.verifiedBy ? 'pmc' : null,
        verifiedByEmail: ver.verifiedByEmail || null,
        verifiedByName: ver.verifiedByName || null,
        verificationNotes: ver.verificationNotes || null,
        verifiedAt: ver.verifiedAt || null,
        rejectedBy: ver.rejectedBy || null,
        rejectedByRole: ver.rejectedBy ? 'pmc' : null,
        rejectedByEmail: ver.rejectedByEmail || null,
        rejectedByName: ver.rejectedByName || null,
        rejectionReason: ver.rejectionReason || null,
        rejectedAt: ver.rejectedAt || null,
      });

      if (result.created) {
        stats.propertyOwnership.created++;
      } else if (result.skipped) {
        stats.propertyOwnership.skipped++;
      } else {
        stats.propertyOwnership.errors++;
      }
    }

    console.log(`   ✅ Created: ${stats.propertyOwnership.created}, Skipped: ${stats.propertyOwnership.skipped}, Errors: ${stats.propertyOwnership.errors}`);
  } catch (error) {
    console.error('   ❌ Error migrating property ownership verifications:', error);
    stats.propertyOwnership.errors++;
  }
}

/**
 * Migrate Tenant Document verifications
 */
async function migrateTenantDocuments() {
  console.log('\n📄 Migrating Tenant Document Verifications...');
  
  try {
    const documents = await prisma.document.findMany({
      where: {
        isVerified: false,
        isDeleted: false,
        isRejected: false, // Only pending ones
      },
      include: {
        tenant: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        property: {
          include: {
            landlord: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    console.log(`   Found ${documents.length} tenant documents to migrate`);

    for (const doc of documents) {
      // Determine who should verify (landlord or PMC if landlord is managed)
      let assignedTo = null;
      let assignedToRole = null;
      let assignedToEmail = null;
      let assignedToName = null;

      if (doc.property?.landlord) {
        // Check if landlord is PMC-managed
        const pmcRelationship = await prisma.pMCLandlord.findFirst({
          where: {
            landlordId: doc.property.landlord.id,
            status: 'active',
            OR: [
              { endedAt: null },
              { endedAt: { gt: new Date() } },
            ],
          },
          include: {
            pmc: {
              select: {
                id: true,
                email: true,
                companyName: true,
              },
            },
          },
        });

        if (pmcRelationship) {
          assignedTo = pmcRelationship.pmc.id;
          assignedToRole = 'pmc';
          assignedToEmail = pmcRelationship.pmc.email;
          assignedToName = pmcRelationship.pmc.companyName;
        } else {
          assignedTo = doc.property.landlord.id;
          assignedToRole = 'landlord';
          assignedToEmail = doc.property.landlord.email;
          assignedToName = `${doc.property.landlord.firstName} ${doc.property.landlord.lastName}`;
        }
      }

      const result = await createUnifiedVerification({
        verificationType: 'TENANT_DOCUMENT',
        entityType: 'Document',
        entityId: doc.id,
        requestedBy: doc.tenantId,
        requestedByRole: 'tenant',
        requestedByEmail: doc.uploadedByEmail,
        requestedByName: doc.uploadedByName,
        assignedTo,
        assignedToRole,
        assignedToEmail,
        assignedToName,
        title: `${doc.category}: ${doc.originalName || doc.fileName}`,
        description: doc.description || `Document: ${doc.category}`,
        notes: doc.description,
        fileName: doc.fileName,
        originalName: doc.originalName || doc.fileName,
        fileUrl: doc.storagePath,
        fileSize: doc.fileSize,
        mimeType: doc.fileType,
        metadata: {
          category: doc.category,
          subcategory: doc.subcategory,
          tenantId: doc.tenantId,
          propertyId: doc.propertyId,
          isRequired: doc.isRequired,
          expirationDate: doc.expirationDate?.toISOString() || null,
        },
        priority: doc.isRequired ? 'high' : 'normal',
        dueDate: doc.expirationDate,
        status: 'PENDING',
      });

      if (result.created) {
        stats.tenantDocuments.created++;
      } else if (result.skipped) {
        stats.tenantDocuments.skipped++;
      } else {
        stats.tenantDocuments.errors++;
      }
    }

    console.log(`   ✅ Created: ${stats.tenantDocuments.created}, Skipped: ${stats.tenantDocuments.skipped}, Errors: ${stats.tenantDocuments.errors}`);
  } catch (error) {
    console.error('   ❌ Error migrating tenant documents:', error);
    stats.tenantDocuments.errors++;
  }
}

/**
 * Migrate Application verifications (Invitations)
 */
async function migrateApplications() {
  console.log('\n📄 Migrating Application Verifications...');
  
  try {
    const invitations = await prisma.invitation.findMany({
      where: {
        status: 'pending', // Invitation uses 'status' field, not 'approvalStatus'
      },
      include: {
        landlord: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        tenant: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
        pmc: {
          select: {
            id: true,
            email: true,
            companyName: true,
          },
        },
      },
    });

    console.log(`   Found ${invitations.length} applications to migrate`);

    for (const inv of invitations) {
      // Determine requester and verifier based on invitation type
      let requestedBy = null;
      let requestedByRole = null;
      let requestedByEmail = null;
      let requestedByName = null;
      let assignedTo = null;
      let assignedToRole = null;
      let assignedToEmail = null;
      let assignedToName = null;

      if (inv.type === 'landlord') {
        // Landlord application - verified by admin
        if (inv.landlord) {
          requestedBy = inv.landlord.id;
          requestedByRole = 'landlord';
          requestedByEmail = inv.landlord.email;
          requestedByName = `${inv.landlord.firstName} ${inv.landlord.lastName}`;
        }
        // Admin verifies (no specific assignment)
        assignedToRole = 'admin';
      } else if (inv.type === 'tenant') {
        // Tenant application - verified by landlord or PMC
        if (inv.tenant) {
          requestedBy = inv.tenant.id;
          requestedByRole = 'tenant';
          requestedByEmail = inv.tenant.email;
          requestedByName = `${inv.tenant.firstName} ${inv.tenant.lastName}`;
        }
        // Will be assigned based on who invited
        if (inv.invitedByLandlordId) {
          const landlord = await prisma.landlord.findUnique({
            where: { id: inv.invitedByLandlordId },
            select: { id: true, email: true, firstName: true, lastName: true },
          });
          if (landlord) {
            assignedTo = landlord.id;
            assignedToRole = 'landlord';
            assignedToEmail = landlord.email;
            assignedToName = `${landlord.firstName} ${landlord.lastName}`;
          }
        } else if (inv.invitedByPMCId) {
          const pmc = await prisma.propertyManagementCompany.findUnique({
            where: { id: inv.invitedByPMCId },
            select: { id: true, email: true, companyName: true },
          });
          if (pmc) {
            assignedTo = pmc.id;
            assignedToRole = 'pmc';
            assignedToEmail = pmc.email;
            assignedToName = pmc.companyName;
          }
        }
      } else if (inv.type === 'pmc') {
        // PMC application - verified by admin
        if (inv.pmc) {
          requestedBy = inv.pmc.id;
          requestedByRole = 'pmc';
          requestedByEmail = inv.pmc.email;
          requestedByName = inv.pmc.companyName;
        }
        assignedToRole = 'admin';
      }

      if (!requestedBy) {
        stats.applications.skipped++;
        continue;
      }

      const result = await createUnifiedVerification({
        verificationType: 'APPLICATION',
        entityType: 'Invitation',
        entityId: inv.id,
        requestedBy,
        requestedByRole,
        requestedByEmail,
        requestedByName,
        assignedTo,
        assignedToRole,
        assignedToEmail,
        assignedToName,
        title: `${inv.type.charAt(0).toUpperCase() + inv.type.slice(1)} Application: ${inv.email}`,
        description: `Application for ${inv.type} account`,
        metadata: {
          invitationType: inv.type,
          email: inv.email,
          invitedBy: inv.invitedBy,
          invitedByRole: inv.invitedByRole,
        },
        priority: 'normal',
        status: 'PENDING',
      });

      if (result.created) {
        stats.applications.created++;
      } else if (result.skipped) {
        stats.applications.skipped++;
      } else {
        stats.applications.errors++;
      }
    }

    console.log(`   ✅ Created: ${stats.applications.created}, Skipped: ${stats.applications.skipped}, Errors: ${stats.applications.errors}`);
  } catch (error) {
    console.error('   ❌ Error migrating applications:', error);
    stats.applications.errors++;
  }
}

/**
 * Migrate Entity Approval verifications (Landlord, Tenant, PMC)
 */
async function migrateEntityApprovals() {
  console.log('\n📄 Migrating Entity Approval Verifications...');
  
  try {
    // Migrate Landlords
    const landlords = await prisma.landlord.findMany({
      where: {
        approvalStatus: 'PENDING',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      },
    });

    console.log(`   Found ${landlords.length} landlord approvals to migrate`);

    for (const landlord of landlords) {
      const result = await createUnifiedVerification({
        verificationType: 'ENTITY_APPROVAL',
        entityType: 'Landlord',
        entityId: landlord.id,
        requestedBy: landlord.id,
        requestedByRole: 'landlord',
        requestedByEmail: landlord.email,
        requestedByName: `${landlord.firstName} ${landlord.lastName}`,
        assignedToRole: 'admin', // Admin verifies landlords
        title: `Landlord Approval: ${landlord.firstName} ${landlord.lastName}`,
        description: `Landlord account approval request`,
        metadata: {
          entityType: 'Landlord',
          email: landlord.email,
        },
        priority: 'normal',
        status: 'PENDING',
      });

      if (result.created) {
        stats.entityApprovals.created++;
      } else if (result.skipped) {
        stats.entityApprovals.skipped++;
      } else {
        stats.entityApprovals.errors++;
      }
    }

    // Migrate Tenants
    const tenants = await prisma.tenant.findMany({
      where: {
        approvalStatus: 'PENDING',
      },
      include: {
        leaseTenants: {
          include: {
            lease: {
              include: {
                unit: {
                  include: {
                    property: {
                      include: {
                        landlord: {
                          select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    console.log(`   Found ${tenants.length} tenant approvals to migrate`);

    for (const tenant of tenants) {
      // Find landlord who should verify (from first lease)
      let assignedTo = null;
      let assignedToRole = null;
      let assignedToEmail = null;
      let assignedToName = null;

      const firstLease = tenant.leaseTenants?.[0]?.lease;
      if (firstLease?.unit?.property?.landlord) {
        const landlord = firstLease.unit.property.landlord;
        assignedTo = landlord.id;
        assignedToRole = 'landlord';
        assignedToEmail = landlord.email;
        assignedToName = `${landlord.firstName} ${landlord.lastName}`;
      }

      const result = await createUnifiedVerification({
        verificationType: 'ENTITY_APPROVAL',
        entityType: 'Tenant',
        entityId: tenant.id,
        requestedBy: tenant.id,
        requestedByRole: 'tenant',
        requestedByEmail: tenant.email,
        requestedByName: `${tenant.firstName} ${tenant.lastName}`,
        assignedTo,
        assignedToRole,
        assignedToEmail,
        assignedToName,
        title: `Tenant Approval: ${tenant.firstName} ${tenant.lastName}`,
        description: `Tenant account approval request`,
        metadata: {
          entityType: 'Tenant',
          email: tenant.email,
        },
        priority: 'normal',
        status: 'PENDING',
      });

      if (result.created) {
        stats.entityApprovals.created++;
      } else if (result.skipped) {
        stats.entityApprovals.skipped++;
      } else {
        stats.entityApprovals.errors++;
      }
    }

    // Migrate PMCs
    const pmcs = await prisma.propertyManagementCompany.findMany({
      where: {
        approvalStatus: 'PENDING',
      },
      select: {
        id: true,
        email: true,
        companyName: true,
      },
    });

    console.log(`   Found ${pmcs.length} PMC approvals to migrate`);

    for (const pmc of pmcs) {
      const result = await createUnifiedVerification({
        verificationType: 'ENTITY_APPROVAL',
        entityType: 'PropertyManagementCompany',
        entityId: pmc.id,
        requestedBy: pmc.id,
        requestedByRole: 'pmc',
        requestedByEmail: pmc.email,
        requestedByName: pmc.companyName,
        assignedToRole: 'admin', // Admin verifies PMCs
        title: `PMC Approval: ${pmc.companyName}`,
        description: `Property Management Company account approval request`,
        metadata: {
          entityType: 'PropertyManagementCompany',
          email: pmc.email,
        },
        priority: 'normal',
        status: 'PENDING',
      });

      if (result.created) {
        stats.entityApprovals.created++;
      } else if (result.skipped) {
        stats.entityApprovals.skipped++;
      } else {
        stats.entityApprovals.errors++;
      }
    }

    console.log(`   ✅ Created: ${stats.entityApprovals.created}, Skipped: ${stats.entityApprovals.skipped}, Errors: ${stats.entityApprovals.errors}`);
  } catch (error) {
    console.error('   ❌ Error migrating entity approvals:', error);
    stats.entityApprovals.errors++;
  }
}

/**
 * Migrate Financial Approval verifications (PMCLandlordApproval)
 */
async function migrateFinancialApprovals() {
  console.log('\n📄 Migrating Financial Approval Verifications...');
  
  try {
    const approvals = await prisma.pMCLandlordApproval.findMany({
      where: {
        status: 'PENDING',
      },
      include: {
        pmcLandlord: {
          include: {
            landlord: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
            pmc: {
              select: {
                id: true,
                email: true,
                companyName: true,
              },
            },
          },
        },
        expense: {
          select: {
            id: true,
            amount: true,
            description: true,
            category: true, // Use 'category' instead of 'expenseType'
          },
        },
        maintenanceRequest: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    console.log(`   Found ${approvals.length} financial approvals to migrate`);

    for (const approval of approvals) {
      const entityType = approval.entityType === 'Expense' ? 'Expense' : 'MaintenanceRequest';
      const entity = approval.expense || approval.maintenanceRequest;
      
      if (!entity) {
        stats.financialApprovals.skipped++;
        continue;
      }

      const title = approval.entityType === 'Expense'
        ? `Expense Approval: $${approval.amount || entity.amount || 0} - ${entity.description || entity.category || 'Expense'}`
        : `Maintenance Approval: ${entity.title || 'Maintenance Request'}`;

      const result = await createUnifiedVerification({
        verificationType: 'FINANCIAL_APPROVAL',
        entityType,
        entityId: entity.id,
        requestedBy: approval.pmcLandlord.pmc.id,
        requestedByRole: 'pmc',
        requestedByEmail: approval.pmcLandlord.pmc.email,
        requestedByName: approval.pmcLandlord.pmc.companyName,
        assignedTo: approval.pmcLandlord.landlord.id,
        assignedToRole: 'landlord',
        assignedToEmail: approval.pmcLandlord.landlord.email,
        assignedToName: `${approval.pmcLandlord.landlord.firstName} ${approval.pmcLandlord.landlord.lastName}`,
        title,
        description: approval.description || `Financial approval request for ${approval.approvalType}`,
        metadata: {
          approvalType: approval.approvalType,
          amount: approval.amount,
          pmcLandlordId: approval.pmcLandlordId,
        },
        priority: approval.amount && approval.amount > 1000 ? 'high' : 'normal',
        dueDate: approval.dueDate,
        status: 'PENDING',
      });

      if (result.created) {
        stats.financialApprovals.created++;
      } else if (result.skipped) {
        stats.financialApprovals.skipped++;
      } else {
        stats.financialApprovals.errors++;
      }
    }

    console.log(`   ✅ Created: ${stats.financialApprovals.created}, Skipped: ${stats.financialApprovals.skipped}, Errors: ${stats.financialApprovals.errors}`);
  } catch (error) {
    console.error('   ❌ Error migrating financial approvals:', error);
    stats.financialApprovals.errors++;
  }
}

/**
 * Migrate Inspection Checklist verifications
 */
async function migrateInspections() {
  console.log('\n📄 Migrating Inspection Checklist Verifications...');
  
  try {
    const checklists = await prisma.inspectionChecklist.findMany({
      where: {
        status: {
          in: ['pending', 'submitted'],
        },
      },
      include: {
        tenant: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    console.log(`   Found ${checklists.length} inspection checklists to migrate`);

    for (const checklist of checklists) {
      // Find landlord who should verify
      let assignedTo = null;
      let assignedToRole = null;
      let assignedToEmail = null;
      let assignedToName = null;

      if (checklist.propertyId) {
        const property = await prisma.property.findUnique({
          where: { id: checklist.propertyId },
          include: {
            landlord: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });

        if (property?.landlord) {
          // Check if landlord is PMC-managed
          const pmcRelationship = await prisma.pMCLandlord.findFirst({
            where: {
              landlordId: property.landlord.id,
              status: 'active',
              OR: [
                { endedAt: null },
                { endedAt: { gt: new Date() } },
              ],
            },
            include: {
              pmc: {
                select: {
                  id: true,
                  email: true,
                  companyName: true,
                },
              },
            },
          });

          if (pmcRelationship) {
            assignedTo = pmcRelationship.pmc.id;
            assignedToRole = 'pmc';
            assignedToEmail = pmcRelationship.pmc.email;
            assignedToName = pmcRelationship.pmc.companyName;
          } else {
            assignedTo = property.landlord.id;
            assignedToRole = 'landlord';
            assignedToEmail = property.landlord.email;
            assignedToName = `${property.landlord.firstName} ${property.landlord.lastName}`;
          }
        }
      }

      const result = await createUnifiedVerification({
        verificationType: 'INSPECTION',
        entityType: 'InspectionChecklist',
        entityId: checklist.id,
        requestedBy: checklist.tenantId,
        requestedByRole: 'tenant',
        requestedByEmail: checklist.tenant.email,
        requestedByName: `${checklist.tenant.firstName} ${checklist.tenant.lastName}`,
        assignedTo,
        assignedToRole,
        assignedToEmail,
        assignedToName,
        title: `${checklist.checklistType} Inspection Checklist`,
        description: `Inspection checklist for ${checklist.checklistType}`,
        metadata: {
          checklistType: checklist.checklistType,
          propertyId: checklist.propertyId,
          unitId: checklist.unitId,
          leaseId: checklist.leaseId,
        },
        priority: 'normal',
        status: checklist.status === 'submitted' ? 'PENDING' : 'PENDING',
      });

      if (result.created) {
        stats.inspections.created++;
      } else if (result.skipped) {
        stats.inspections.skipped++;
      } else {
        stats.inspections.errors++;
      }
    }

    console.log(`   ✅ Created: ${stats.inspections.created}, Skipped: ${stats.inspections.skipped}, Errors: ${stats.inspections.errors}`);
  } catch (error) {
    console.error('   ❌ Error migrating inspections:', error);
    stats.inspections.errors++;
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  UNIFIED VERIFICATION MIGRATION');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('\nStarting migration...\n');

  try {
    // Run all migrations
    await migratePropertyOwnershipVerifications();
    await migrateTenantDocuments();
    await migrateApplications();
    await migrateEntityApprovals();
    await migrateFinancialApprovals();
    await migrateInspections();

    // Print summary
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('  MIGRATION SUMMARY');
    console.log('═══════════════════════════════════════════════════════════════\n');

    const totalCreated = Object.values(stats).reduce((sum, s) => sum + s.created, 0);
    const totalSkipped = Object.values(stats).reduce((sum, s) => sum + s.skipped, 0);
    const totalErrors = Object.values(stats).reduce((sum, s) => sum + s.errors, 0);

    console.log('Property Ownership:');
    console.log(`  Created: ${stats.propertyOwnership.created}, Skipped: ${stats.propertyOwnership.skipped}, Errors: ${stats.propertyOwnership.errors}`);
    
    console.log('\nTenant Documents:');
    console.log(`  Created: ${stats.tenantDocuments.created}, Skipped: ${stats.tenantDocuments.skipped}, Errors: ${stats.tenantDocuments.errors}`);
    
    console.log('\nApplications:');
    console.log(`  Created: ${stats.applications.created}, Skipped: ${stats.applications.skipped}, Errors: ${stats.applications.errors}`);
    
    console.log('\nEntity Approvals:');
    console.log(`  Created: ${stats.entityApprovals.created}, Skipped: ${stats.entityApprovals.skipped}, Errors: ${stats.entityApprovals.errors}`);
    
    console.log('\nFinancial Approvals:');
    console.log(`  Created: ${stats.financialApprovals.created}, Skipped: ${stats.financialApprovals.skipped}, Errors: ${stats.financialApprovals.errors}`);
    
    console.log('\nInspections:');
    console.log(`  Created: ${stats.inspections.created}, Skipped: ${stats.inspections.skipped}, Errors: ${stats.inspections.errors}`);

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`  TOTAL: Created: ${totalCreated}, Skipped: ${totalSkipped}, Errors: ${totalErrors}`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    if (totalErrors > 0) {
      console.log('⚠️  Some errors occurred during migration. Please review the logs above.');
      process.exit(1);
    } else {
      console.log('✅ Migration completed successfully!');
    }
  } catch (error) {
    console.error('\n❌ Fatal error during migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
if (require.main === module) {
  main();
}

module.exports = { main };

