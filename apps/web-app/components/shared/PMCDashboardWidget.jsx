"use client";

import { useState, useEffect } from 'react';
import { Alert, Button, Badge, Card } from 'flowbite-react';
import { 
  HiInformationCircle, 
  HiBell, 
  HiCheckCircle,
  HiXCircle,
  HiCurrencyDollar,
} from 'react-icons/hi';
import { ProCard } from './LazyProComponents';
import { useRouter } from 'next/navigation';

/**
 * PMC Dashboard Widget
 * Shows PMC status, pending approvals, and quick actions
 */
export default function PMCDashboardWidget({ pmcName, landlordId }) {
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (landlordId) {
      fetchPendingApprovals();
    }
  }, [landlordId]);

  const fetchPendingApprovals = async () => {
    try {
      setLoading(true);
      // Use adminApi for approvals
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getApprovals({ status: 'PENDING' });
      
      if (data.success || data.data) {
        setPendingApprovals(data.data || data.approvals || []);
      } else {
        setPendingApprovals([]);
      }
    } catch (error) {
      // Silently handle errors for optional widget
      console.debug('[PMC Dashboard Widget] Approvals endpoint not available:', error.message);
      setPendingApprovals([]);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = pendingApprovals.length;
  const approvedCount = pendingApprovals.filter(a => a.status === 'APPROVED').length;
  const rejectedCount = pendingApprovals.filter(a => a.status === 'REJECTED').length;

  if (!pmcName) {
    return null;
  }

  return (
    <div className="mb-6">
      <Alert color="info" className="mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HiInformationCircle className="h-5 w-5" />
            <span>
              <strong>Managed by {pmcName}</strong>
              {pendingCount > 0 && (
                <Badge color="blue" className="ml-2">
                  {pendingCount} pending
                </Badge>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <Button
                color="blue"
                onClick={() => router.push('/verifications')}
                className="flex items-center gap-2"
              >
                <HiBell className="h-4 w-4" />
                Review Approvals ({pendingCount})
              </Button>
            )}
            <Button
              color="light"
              onClick={() => router.push('/activity-logs')}
            >
              View Activity Log
            </Button>
          </div>
        </div>
      </Alert>

      {pendingCount > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <div className="flex items-center gap-2">
              <HiBell className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-semibold">{pendingCount}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-2">
              <HiCheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-gray-500">Approved</p>
                <p className="text-2xl font-semibold">{approvedCount}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-2">
              <HiXCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-sm text-gray-500">Rejected</p>
                <p className="text-2xl font-semibold">{rejectedCount}</p>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
