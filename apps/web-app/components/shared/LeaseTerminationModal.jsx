/**
 * Lease Termination Modal Component
 * Allows landlord or tenant to initiate early lease termination
 * Migrated to v2 FastAPI + Flowbite
 */

"use client";

import { useState } from 'react';
import { Modal, Label, TextInput, Textarea, Select, Button, Alert, Spinner } from 'flowbite-react';
import { v2Api } from '@/lib/api/v2-client';
import { notify } from '@/lib/utils/notification-helper';
import dayjs from 'dayjs';

export default function LeaseTerminationModal({ 
  visible, 
  onCancel, 
  onSuccess, 
  lease,
  userRole 
}) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [terminationDate, setTerminationDate] = useState('');
  const [actualLoss, setActualLoss] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!lease?.id) {
        throw new Error('Lease ID is required');
      }

      if (!reason) {
        throw new Error('Please provide a termination reason');
      }

      if (!terminationDate) {
        throw new Error('Please select termination date');
      }

      const payload = {
        reason,
        termination_date: new Date(terminationDate).toISOString().split('T')[0],
      };

      if (actualLoss && actualLoss !== '') {
        payload.actual_loss = parseFloat(actualLoss);
      }

      await v2Api.terminateLease(lease.id, payload);
      notify.success('Termination request submitted successfully');
      setReason('');
      setTerminationDate('');
      setActualLoss('');
      setNotes('');
      onSuccess?.();
      onCancel();
    } catch (error) {
      console.error('[LeaseTerminationModal] Error:', error);
      notify.error(error.message || 'Failed to terminate lease');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setReason('');
    setTerminationDate('');
    setActualLoss('');
    setNotes('');
    onCancel();
  };

  // Don't render if lease is not provided
  if (!lease) {
    return null;
  }

  return (
    <Modal show={visible} onClose={handleCancel} size="md">
      <Modal.Header>Early Lease Termination</Modal.Header>
      <Modal.Body>
        <Alert color="warning" className="mb-4">
          <div>
            <p className="font-medium">Ontario-Compliant Termination</p>
            <p className="text-sm">
              No flat fees allowed. Only actual losses can be charged. For domestic violence (N15), 28 days notice with no penalty.
            </p>
          </div>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="reason" value="Termination Reason" className="mb-2 block" />
            <Select
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            >
              <option value="">Select reason</option>
              <option value="mutual_agreement">Mutual Agreement (N11)</option>
              <option value="tenant_initiated">Tenant-Initiated (N9)</option>
              <option value="domestic_violence">Domestic Violence (N15 - 28 days, no penalty)</option>
              <option value="other">Other</option>
            </Select>
          </div>

          <div>
            <Label htmlFor="terminationDate" value="Proposed Termination Date" className="mb-2 block" />
            <TextInput
              id="terminationDate"
              type="date"
              value={terminationDate}
              onChange={(e) => setTerminationDate(e.target.value)}
              min={dayjs().format('YYYY-MM-DD')}
              required
            />
          </div>

          <div>
            <Label htmlFor="actualLoss" value="Actual Loss Amount (Optional)" className="mb-2 block" />
            <p className="text-sm text-gray-500 mb-2">Enter actual financial loss. No flat fees allowed per Ontario law.</p>
            <TextInput
              id="actualLoss"
              type="number"
              value={actualLoss}
              onChange={(e) => setActualLoss(e.target.value)}
              placeholder="0.00"
              addon="$"
            />
          </div>

          <div>
            <Label htmlFor="notes" value="Additional Notes" className="mb-2 block" />
            <Textarea
              id="notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional information..."
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <Button color="gray" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" color="failure" disabled={loading}>
              {loading ? <Spinner size="sm" className="mr-2" /> : null}
              Submit Termination Request
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}

