"use client";

import { useState } from 'react';
import { Button, Modal, Select, Textarea, Label, Spinner, Alert } from 'flowbite-react';
import { HiExclamation } from 'react-icons/hi';
import { useFormState } from '@/lib/hooks/useFormState';
import { notify } from '@/lib/utils/notification-helper';

/**
 * Escalate Button Component for Maintenance Requests
 * Allows PMCs and landlords to escalate maintenance requests
 */
export default function EscalateButton({ maintenanceRequestId, onSuccess, userRole }) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const form = useFormState({
    priority: 'High',
    reason: '',
  });

  const handleEscalate = async (e) => {
    e.preventDefault();
    const values = form.getFieldsValue();

    if (!values.reason || values.reason.length < 10) {
      notify.error('Please provide a reason for escalation (at least 10 characters)');
      return;
    }

    try {
      setLoading(true);
      // Use v2Api client - escalate endpoint
      const { v2Api } = await import('@/lib/api/v2-client');
      const response = await v2Api.forms.escalateMaintenance(maintenanceRequestId, {
        reason: values.reason,
        priority: values.priority,
      });
      const escalatedRequest = response.data || response;
      
      notify.success('Maintenance request escalated successfully');
      form.resetForm();
      setVisible(false);
      if (onSuccess) {
        onSuccess(escalatedRequest);
      }
    } catch (error) {
      console.error('[Escalate Button] Error:', error);
      notify.error(error.message || 'Failed to escalate maintenance request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        color="failure"
        onClick={() => setVisible(true)}
        className="flex items-center gap-2"
      >
        <HiExclamation className="h-4 w-4" />
        Escalate
      </Button>

      <Modal
        show={visible}
        onClose={() => {
          setVisible(false);
          form.resetForm();
        }}
        size="md"
      >
        <Modal.Header>Escalate Maintenance Request</Modal.Header>
        <Modal.Body>
          <Alert color="warning" className="mb-4">
            <div>
              <h3 className="font-semibold">Escalate this maintenance request</h3>
              <p className="text-sm mt-1">
                {userRole === 'pmc'
                  ? "This will send an approval request to the property owner for review."
                  : "This will increase the priority and notify relevant parties."}
              </p>
            </div>
          </Alert>

          <form onSubmit={handleEscalate} className="space-y-4">
            <div>
              <Label htmlFor="priority" className="mb-2 block">
                Priority <span className="text-red-500">*</span>
              </Label>
              <Select
                id="priority"
                value={form.values.priority}
                onChange={(e) => form.setFieldsValue({ priority: e.target.value })}
                required
              >
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="reason" className="mb-2 block">
                Escalation Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                rows={4}
                placeholder="Explain why this maintenance request needs to be escalated..."
                value={form.values.reason}
                onChange={(e) => form.setFieldsValue({ reason: e.target.value })}
                required
                minLength={10}
              />
              <p className="mt-1 text-xs text-gray-500">
                Minimum 10 characters required
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                color="gray"
                onClick={() => {
                  setVisible(false);
                  form.resetForm();
                }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="failure"
                disabled={loading || !form.values.reason || form.values.reason.length < 10}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <Spinner size="sm" />
                    Escalating...
                  </>
                ) : (
                  'Escalate'
                )}
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </>
  );
}
