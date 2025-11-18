/**
 * Cron Job: Check Expired Approvals
 * Phase 5 & 6: Approval Workflows & Audit
 * 
 * Runs daily to check and process expired approval requests
 * Auto-reverts property edits that weren't approved within 3 days
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkExpiredApprovals } from '@/lib/rbac/approvalWorkflows';

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
    await checkExpiredApprovals();

    return NextResponse.json({
      success: true,
      message: 'Expired approvals processed',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Expired Approvals Cron] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to process expired approvals',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Also allow POST for manual triggers
  return GET(request);
}

