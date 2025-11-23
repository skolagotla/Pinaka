/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN LANDLORD APPROVAL API
 * ═══════════════════════════════════════════════════════════════
 * GET /api/admin/approvals/landlords - List pending landlords
 * POST /api/admin/approvals/landlords/[id]/approve - Approve landlord
 * POST /api/admin/approvals/landlords/[id]/reject - Reject landlord
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');
const { APPROVAL_CONFIG, listEntities } = require('@/lib/services/approval-service');

async function listPendingLandlords(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const config = APPROVAL_CONFIG.landlord;
    const result = await listEntities(prisma, config, {
      status: req.query.status,
      search: req.query.search,
      page: req.query.page,
      limit: req.query.limit,
      selectFields: {
        landlordId: true,
      },
    });

    return res.status(200).json({
      success: true,
      data: result.entities,
      counts: result.counts,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error('[Admin Approvals] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch pending landlords',
      message: error.message,
    });
  }
}

export default withAdminAuth(listPendingLandlords, { requireRole: 'super_admin' });
