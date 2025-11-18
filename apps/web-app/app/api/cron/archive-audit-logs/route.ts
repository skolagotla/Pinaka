/**
 * Cron Job: Archive Audit Logs
 * Phase 6: Audit & Compliance
 * 
 * Runs weekly/monthly to archive audit logs older than 30 days
 * Moves logs to cold storage (7-year retention policy)
 */

import { NextRequest, NextResponse } from 'next/server';
import { archiveAuditLogs, deleteOldAuditLogs } from '@/lib/rbac/auditLogging';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
  // Verify cron secret (if set)
  const authHeader = request.headers.get('authorization');
  if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Archive logs older than 30 days
    await archiveAuditLogs();

    // Delete logs older than 7 years (after archiving)
    await deleteOldAuditLogs();

    return NextResponse.json({
      success: true,
      message: 'Audit logs archived and cleaned',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Archive Audit Logs Cron] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to archive audit logs',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Also allow POST for manual triggers
  return GET(request);
}

