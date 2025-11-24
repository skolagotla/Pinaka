/**
 * Lease Renewal Modal Component
 * Allows landlord or tenant to renew lease or convert to month-to-month
 * Migrated to v2 FastAPI + Flowbite
 */

"use client";

import { useState } from 'react';
import { Modal, Label, TextInput, Radio, Button, Alert, Spinner } from 'flowbite-react';
import { v2Api } from '@/lib/api/v2-client';
import { notify } from '@/lib/utils/notification-helper';
import dayjs from 'dayjs';

export default function LeaseRenewalModal({ 
  visible, 
  onCancel, 
  onSuccess, 
  lease,
  userRole 
}) {
  const [loading, setLoading] = useState(false);
  const [decision, setDecision] = useState('month-to-month');
  const [newLeaseEnd, setNewLeaseEnd] = useState('');
  const [newRentAmount, setNewRentAmount] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!lease?.id) {
        throw new Error('Lease ID is required');
      }

      const payload = {
        decision: decision === 'month_to_month' ? 'month-to-month' : decision,
      };

      if (decision === 'renew') {
        if (!newLeaseEnd) {
          throw new Error('Please select end date for renewal');
        }
        payload.new_lease_end = new Date(newLeaseEnd).toISOString().split('T')[0];
        if (newRentAmount) {
          payload.new_rent_amount = parseFloat(newRentAmount);
        }
      }

      await v2Api.renewLease(lease.id, payload);
      notify.success('Lease renewal decision saved successfully');
      setDecision('month-to-month');
      setNewLeaseEnd('');
      setNewRentAmount('');
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error('[LeaseRenewalModal] Error:', error);
      notify.error(error.message || 'Failed to renew lease');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDecision('month-to-month');
    setNewLeaseEnd('');
    setNewRentAmount('');
    onCancel();
  };

  // Don't render if lease is not provided
  if (!lease) {
    return null;
  }

  return (
    <Modal show={visible} onClose={handleCancel} size="md">
      <Modal.Header>Lease Renewal Decision</Modal.Header>
      <Modal.Body>
        <Alert color="info" className="mb-4">
          <div>
            <p className="font-medium">Lease Expiring Soon</p>
            <p className="text-sm">
              Your lease expires on {lease?.end_date ? new Date(lease.end_date).toLocaleDateString() : 'N/A'}. Please choose how you'd like to proceed.
            </p>
          </div>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="decision" value="Renewal Decision" className="mb-2 block" />
            <div className="space-y-2">
              <div className="flex items-center">
                <Radio
                  id="renew"
                  name="decision"
                  value="renew"
                  checked={decision === 'renew'}
                  onChange={(e) => setDecision(e.target.value)}
                />
                <Label htmlFor="renew" className="ml-2">
                  <strong>Renew Lease</strong>
                  <p className="text-sm text-gray-500 ml-6">Create a new fixed-term lease</p>
                </Label>
              </div>
              <div className="flex items-center">
                <Radio
                  id="month-to-month"
                  name="decision"
                  value="month-to-month"
                  checked={decision === 'month-to-month'}
                  onChange={(e) => setDecision(e.target.value)}
                />
                <Label htmlFor="month-to-month" className="ml-2">
                  <strong>Convert to Month-to-Month</strong>
                  <p className="text-sm text-gray-500 ml-6">Continue on a month-to-month basis (Ontario law)</p>
                </Label>
              </div>
              <div className="flex items-center">
                <Radio
                  id="terminate"
                  name="decision"
                  value="terminate"
                  checked={decision === 'terminate'}
                  onChange={(e) => setDecision(e.target.value)}
                />
                <Label htmlFor="terminate" className="ml-2">
                  <strong>Terminate Lease</strong>
                  <p className="text-sm text-gray-500 ml-6">End the lease (requires N11 form)</p>
                </Label>
              </div>
            </div>
          </div>

          {decision === 'renew' && (
            <>
              <div>
                <Label htmlFor="newLeaseEnd" value="New Lease End Date" className="mb-2 block" />
                <TextInput
                  id="newLeaseEnd"
                  type="date"
                  value={newLeaseEnd}
                  onChange={(e) => setNewLeaseEnd(e.target.value)}
                  min={dayjs().format('YYYY-MM-DD')}
                  required
                />
              </div>
              <div>
                <Label htmlFor="newRentAmount" value="New Rent Amount (Optional)" className="mb-2 block" />
                <p className="text-sm text-gray-500 mb-2">Leave empty to keep current rent</p>
                <TextInput
                  id="newRentAmount"
                  type="number"
                  value={newRentAmount}
                  onChange={(e) => setNewRentAmount(e.target.value)}
                  placeholder={lease?.rent_amount?.toString() || '0.00'}
                  addon="$"
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button color="gray" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Spinner size="sm" className="mr-2" /> : null}
              Submit Decision
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}

