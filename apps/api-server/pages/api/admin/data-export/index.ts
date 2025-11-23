/**
 * ═══════════════════════════════════════════════════════════════
 * ADMIN DATA EXPORT API
 * ═══════════════════════════════════════════════════════════════
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { withAdminAuth } from '@/lib/middleware/adminAuth';
const { prisma } = require('@/lib/prisma');

async function exportData(req: NextApiRequest, res: NextApiResponse, admin: any) {
  try {
    const { type, format = 'json', startDate, endDate } = req.query;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: 'Export type is required',
      });
    }

    let data: any = {};
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate as string);
    if (endDate) dateFilter.lte = new Date(endDate as string);
    const hasDateFilter = Object.keys(dateFilter).length > 0;

    switch (type) {
      case 'users':
        const [landlords, tenants] = await Promise.all([
          prisma.landlord.findMany({
            where: hasDateFilter ? { createdAt: dateFilter } : {},
            select: {
              id: true,
              landlordId: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              city: true,
              provinceState: true,
              postalZip: true,
              country: true,
              createdAt: true,
            },
          }),
          prisma.tenant.findMany({
            where: hasDateFilter ? { createdAt: dateFilter } : {},
            select: {
              id: true,
              tenantId: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              city: true,
              provinceState: true,
              postalZip: true,
              country: true,
              hasAccess: true,
              createdAt: true,
            },
          }),
        ]);
        data = { landlords, tenants };
        break;

      case 'properties':
        data = await prisma.property.findMany({
          where: hasDateFilter ? { createdAt: dateFilter } : {},
          include: {
            units: {
              include: {
                leases: true,
              },
            },
          },
        });
        break;

      case 'audit-logs':
        data = await prisma.adminAuditLog.findMany({
          where: hasDateFilter ? { createdAt: dateFilter } : {},
          include: {
            admin: {
              select: {
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        });
        break;

      case 'support-tickets':
        data = await prisma.supportTicket.findMany({
          where: hasDateFilter ? { createdAt: dateFilter } : {},
          include: {
            notes: true,
          },
        });
        break;

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid export type',
        });
    }

    // Log export action
    await prisma.adminAuditLog.create({
      data: {
        id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        adminId: admin.id,
        action: 'export_data',
        resource: type as string,
        details: { format, startDate, endDate },
        ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        success: true,
      },
    });

    if (format === 'csv') {
      // Convert to CSV
      const csv = convertToCSV(data, type as string);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-export-${new Date().toISOString().split('T')[0]}.csv"`);
      return res.status(200).send(csv);
    } else {
      // JSON format
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-export-${new Date().toISOString().split('T')[0]}.json"`);
      return res.status(200).json({
        success: true,
        data,
        exportedAt: new Date().toISOString(),
        exportedBy: admin.email,
      });
    }
  } catch (error: any) {
    console.error('[Admin Data Export] Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to export data',
      message: error.message,
    });
  }
}

function convertToCSV(data: any, type: string): string {
  if (!Array.isArray(data) || data.length === 0) {
    return '';
  }

  const headers = Object.keys(data[0]);
  const rows = data.map((item: any) =>
    headers.map((header) => {
      const value = item[header];
      if (value === null || value === undefined) return '';
      if (typeof value === 'object') return JSON.stringify(value);
      return String(value).replace(/"/g, '""');
    })
  );

  return [
    headers.map((h) => `"${h}"`).join(','),
    ...rows.map((row) => row.map((cell: any) => `"${cell}"`).join(',')),
  ].join('\n');
}

export default withAdminAuth(exportData, { requireRole: 'super_admin' });

