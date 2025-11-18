/**
 * Bulk Operations Service
 * Handles bulk operations for approvals, status updates, emails, and exports
 */

const { prisma } = require('../prisma');
const { createNotification, NOTIFICATION_TYPES } = require('./notification-service');

/**
 * Bulk approve/reject approval requests
 */
async function bulkApproveRejectApprovals(approvalIds, action, userId, userRole, notes = null) {
  try {
    const approvals = await prisma.pMCLandlordApproval.findMany({
      where: {
        id: { in: approvalIds },
        status: 'PENDING',
      },
      include: {
        pmcLandlord: {
          include: {
            pmc: true,
            landlord: true,
          },
        },
      },
    });

    if (approvals.length === 0) {
      return { success: false, error: 'No pending approvals found' };
    }

    const updateData = {
      status: action === 'approve' ? 'APPROVED' : 'REJECTED',
      [action === 'approve' ? 'approvedBy' : 'rejectedBy']: userId,
      [action === 'approve' ? 'approvedAt' : 'rejectedAt']: new Date(),
    };

    if (notes) {
      updateData.notes = notes;
    }

    const result = await prisma.pMCLandlordApproval.updateMany({
      where: {
        id: { in: approvalIds },
        status: 'PENDING',
      },
      data: updateData,
    });

    // Send notifications
    for (const approval of approvals) {
      await createNotification({
        userId: approval.pmcLandlord.pmcId,
        userRole: 'pmc',
        userEmail: approval.pmcLandlord.pmc.email,
        type: NOTIFICATION_TYPES.APPROVAL_RESPONSE,
        title: `Approval ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        message: `Your approval request "${approval.title}" has been ${action === 'approve' ? 'approved' : 'rejected'}.`,
        priority: 'normal',
        entityType: 'approval_request',
        entityId: approval.id,
        actionUrl: `/financials`,
        actionLabel: 'View Details',
      });
    }

    return {
      success: true,
      count: result.count,
      action,
    };
  } catch (error) {
    console.error('[Bulk Operations] Error:', error);
    throw error;
  }
}

/**
 * Bulk update status for maintenance requests
 */
async function bulkUpdateMaintenanceStatus(requestIds, status, userId, userRole, notes = null) {
  try {
    const requests = await prisma.maintenanceRequest.findMany({
      where: {
        id: { in: requestIds },
      },
      include: {
        tenant: true,
        property: true,
      },
    });

    if (requests.length === 0) {
      return { success: false, error: 'No requests found' };
    }

    const updateData = {
      status,
      updatedAt: new Date(),
    };

    if (notes) {
      updateData.notes = notes;
    }

    const result = await prisma.maintenanceRequest.updateMany({
      where: {
        id: { in: requestIds },
      },
      data: updateData,
    });

    // Send notifications to tenants
    for (const request of requests) {
      await createNotification({
        userId: request.tenantId,
        userRole: 'tenant',
        userEmail: request.tenant.email,
        type: NOTIFICATION_TYPES.MAINTENANCE_UPDATE,
        title: 'Maintenance Request Updated',
        message: `Your maintenance request for ${request.property.addressLine1} has been updated to "${status}".`,
        priority: 'normal',
        entityType: 'maintenance_request',
        entityId: request.id,
        actionUrl: `/operations?tab=maintenance`,
        actionLabel: 'View Request',
      });
    }

    return {
      success: true,
      count: result.count,
      status,
    };
  } catch (error) {
    console.error('[Bulk Operations] Error:', error);
    throw error;
  }
}

/**
 * Bulk update rent payment status
 */
async function bulkUpdateRentPaymentStatus(paymentIds, status, userId, userRole) {
  try {
    const result = await prisma.rentPayment.updateMany({
      where: {
        id: { in: paymentIds },
      },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

    return {
      success: true,
      count: result.count,
      status,
    };
  } catch (error) {
    console.error('[Bulk Operations] Error:', error);
    throw error;
  }
}

/**
 * Export data to CSV
 */
function exportToCSV(data, headers, filename) {
  const csvHeaders = headers.join(',');
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escape commas and quotes
      if (value === null || value === undefined) return '';
      const stringValue = String(value).replace(/"/g, '""');
      return `"${stringValue}"`;
    }).join(',');
  });

  const csvContent = [csvHeaders, ...csvRows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export data to JSON
 */
function exportToJSON(data, filename) {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

module.exports = {
  bulkApproveRejectApprovals,
  bulkUpdateMaintenanceStatus,
  bulkUpdateRentPaymentStatus,
  exportToCSV,
  exportToJSON,
};

