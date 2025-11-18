/**
 * DELETE /api/admin/invitations/:id
 * Delete an admin invitation
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');

async function deleteInvitation(req: NextApiRequest, res: NextApiResponse, admin: any) {
  const { id } = req.query;

  try {
    const invitation = await prisma.invitation.findUnique({
      where: { id: id as string },
    });

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: 'Invitation not found',
      });
    }

    // Check authorization - only the admin who created it can delete it
    if (invitation.invitedBy !== admin.id || invitation.invitedByRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to delete this invitation',
      });
    }

    // Only allow deletion if invitation is not completed or if it's rejected
    if (invitation.status === 'completed' && invitation.approvalStatus === 'APPROVED') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete an approved invitation',
      });
    }

    // Delete the invitation
    await prisma.invitation.delete({
      where: { id: id as string },
    });

    return res.status(200).json({
      success: true,
      message: 'Invitation deleted successfully',
    });
  } catch (error: any) {
    console.error('[Admin Delete Invitation] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete invitation',
      message: error.message,
    });
  }
}

export default withAdminAuth(deleteInvitation, { allowedMethods: ['DELETE'] });

