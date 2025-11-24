"use client";

import { useState } from 'react';
import { Modal, Select, TextInput, Textarea, Label, Button, Spinner, Alert } from 'flowbite-react';
import { HiCurrencyDollar, HiWrench } from 'react-icons/hi';
import { useFormState } from '@/lib/hooks/useFormState';
import { notify } from '@/lib/utils/notification-helper';

/**
 * Modal for PMC to request approval from landlord
 */
export default function ApprovalRequestModal({
  visible,
  onCancel,
  onSuccess,
  landlordId,
  entityType,
  entityId,
  initialData = {},
}) {
  const form = useFormState({
    approvalType: initialData.approvalType || 'OTHER',
    title: initialData.title || '',
    amount: initialData.amount || '',
    description: initialData.description || '',
  });
  const [loading, setLoading] = useState(false);

  const approvalTypes = [
    { value: 'EXPENSE', label: 'Expense', icon: <HiCurrencyDollar /> },
    { value: 'MAINTENANCE_REQUEST', label: 'Maintenance Request', icon: <HiWrench /> },
    { value: 'WORK_ORDER', label: 'Work Order', icon: <HiWrench /> },
    { value: 'TENANT_REQUEST', label: 'Tenant Request', icon: <HiWrench /> },
    { value: 'LEASE_MODIFICATION', label: 'Lease Modification', icon: <HiWrench /> },
    { value: 'VENDOR_ASSIGNMENT', label: 'Vendor Assignment', icon: <HiWrench /> },
    { value: 'CONTRACTOR_ASSIGNMENT', label: 'Contractor Assignment', icon: <HiWrench /> },
    { value: 'OTHER', label: 'Other', icon: <HiWrench /> },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    const values = form.getFieldsValue();

    try {
      setLoading(true);

      // Use adminApi for approvals
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.createApproval({
        landlordId,
        approvalType: values.approvalType,
        entityType: entityType || 'other',
        entityId: entityId || null,
        title: values.title,
        amount: values.amount ? parseFloat(values.amount) : null,
        description: values.description || null,
        metadata: {
          ...initialData,
          ...values.metadata,
        },
      });

      if (data.success || data) {
        notify.success('Approval request sent successfully');
        form.resetForm();
        if (onSuccess) {
          onSuccess(data.data || data);
        }
        onCancel();
      }
    } catch (error) {
      console.error('[Approval Request Modal] Error:', error);
      notify.error(error.message || 'Failed to send approval request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      show={visible}
      onClose={onCancel}
      size="lg"
    >
      <Modal.Header>Request Approval from Landlord</Modal.Header>
      <Modal.Body>
        <Alert color="info" className="mb-4">
          This request will be sent to the property owner for approval
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="approvalType" className="mb-2 block">
              Approval Type <span className="text-red-500">*</span>
            </Label>
            <Select
              id="approvalType"
              value={form.values.approvalType}
              onChange={(e) => form.setFieldsValue({ approvalType: e.target.value })}
              required
            >
              {approvalTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <Label htmlFor="title" className="mb-2 block">
              Title <span className="text-red-500">*</span>
            </Label>
            <TextInput
              id="title"
              value={form.values.title}
              onChange={(e) => form.setFieldsValue({ title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="amount" className="mb-2 block">
              Amount (if applicable)
            </Label>
            <TextInput
              id="amount"
              type="number"
              step="0.01"
              value={form.values.amount}
              onChange={(e) => form.setFieldsValue({ amount: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="description" className="mb-2 block">
              Description
            </Label>
            <Textarea
              id="description"
              rows={4}
              value={form.values.description}
              onChange={(e) => form.setFieldsValue({ description: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button color="gray" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              type="submit"
              color="blue"
              disabled={loading || !form.values.title}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
