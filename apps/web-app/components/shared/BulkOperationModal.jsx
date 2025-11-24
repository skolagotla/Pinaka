"use client";

import { useState } from 'react';
import { Modal, Select, TextInput, Textarea, Label, Button, Spinner, Alert, Table } from 'flowbite-react';
import { HiCheckCircle, HiXCircle, HiCurrencyDollar } from 'react-icons/hi';
import ApprovalRequestModal from '@/components/shared/ApprovalRequestModal';
import { useFormState } from '@/lib/hooks/useFormState';
import { notify } from '@/lib/utils/notification-helper';

/**
 * Bulk Operation Modal for PMC
 * Allows PMCs to request bulk changes with approval workflow
 */
export default function BulkOperationModal({
  visible,
  onCancel,
  onSuccess,
  landlordId,
  operationType = 'rent_update', // rent_update, status_change, etc.
  selectedItems = [], // Items to apply bulk operation to
}) {
  const form = useFormState({
    operationType,
    newValue: '',
    status: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState([]);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);

  const operationTypes = [
    { value: 'rent_update', label: 'Update Rent', icon: <HiCurrencyDollar /> },
    { value: 'status_change', label: 'Change Status', icon: <HiCheckCircle /> },
    { value: 'lease_modification', label: 'Modify Leases', icon: <HiCheckCircle /> },
  ];

  const handlePreview = async (e) => {
    e.preventDefault();
    const values = form.getFieldsValue();

    try {
      // Generate preview of changes
      const preview = selectedItems.map(item => ({
        id: item.id,
        name: item.name || item.propertyName || item.unitName,
        currentValue: item.currentValue || item.rentAmount || item.status,
        newValue: values.newValue || values.status,
        change: operationType === 'rent_update' 
          ? `$${((values.newValue || 0) - (item.rentAmount || 0)).toLocaleString()}`
          : values.status,
      }));

      setPreviewData(preview);
      setPreviewVisible(true);
    } catch (error) {
      console.error('[Bulk Operation] Preview error:', error);
      notify.error('Failed to generate preview');
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Create approval request for bulk operation
      const formValues = form.getFieldsValue();
      // Use adminApi for approvals
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.createApproval({
        landlordId,
        approvalType: 'WORK_ORDER',
        entityType: 'bulk_operation',
        entityId: `bulk_${Date.now()}`,
        title: `Bulk ${operationTypes.find(t => t.value === operationType)?.label || 'Operation'}`,
        amount: operationType === 'rent_update' 
          ? previewData.reduce((sum, item) => sum + (item.newValue - item.currentValue), 0)
          : null,
        description: formValues.description || `Bulk operation on ${selectedItems.length} items`,
        metadata: {
          operationType,
          items: previewData,
          formValues,
        },
      });

      if (data.success || data) {
        notify.success('Bulk operation request sent for approval');
        form.resetForm();
        setPreviewVisible(false);
        if (onSuccess) {
          onSuccess(data.data || data);
        }
        onCancel();
      }
    } catch (error) {
      console.error('[Bulk Operation] Error:', error);
      notify.error(error.message || 'Failed to submit bulk operation request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal
        show={visible}
        onClose={onCancel}
        size="xl"
      >
        <Modal.Header>
          Bulk {operationTypes.find(t => t.value === operationType)?.label || 'Operation'}
        </Modal.Header>
        <Modal.Body>
          <Alert color="info" className="mb-4">
            This will affect {selectedItems.length} item(s). All changes require landlord approval before being applied.
          </Alert>

          <form onSubmit={handlePreview} className="space-y-4">
            <div>
              <Label htmlFor="operationType" className="mb-2 block">
                Operation Type
              </Label>
              <Select
                id="operationType"
                value={form.values.operationType}
                disabled
              >
                {operationTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </Select>
            </div>

            {operationType === 'rent_update' && (
              <div>
                <Label htmlFor="newValue" className="mb-2 block">
                  New Rent Amount <span className="text-red-500">*</span>
                </Label>
                <TextInput
                  id="newValue"
                  type="number"
                  step="0.01"
                  prefix="$"
                  placeholder="0.00"
                  value={form.values.newValue}
                  onChange={(e) => form.setFieldsValue({ newValue: e.target.value })}
                  required
                />
              </div>
            )}

            {operationType === 'status_change' && (
              <div>
                <Label htmlFor="status" className="mb-2 block">
                  New Status <span className="text-red-500">*</span>
                </Label>
                <Select
                  id="status"
                  value={form.values.status}
                  onChange={(e) => form.setFieldsValue({ status: e.target.value })}
                  required
                >
                  <option value="">Select status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                </Select>
              </div>
            )}

            <div>
              <Label htmlFor="description" className="mb-2 block">
                Description <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Explain the reason for this bulk operation..."
                value={form.values.description}
                onChange={(e) => form.setFieldsValue({ description: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button color="gray" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" color="blue">
                Preview Changes
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Preview Modal */}
      <Modal
        show={previewVisible}
        onClose={() => setPreviewVisible(false)}
        size="3xl"
      >
        <Modal.Header>Preview Changes</Modal.Header>
        <Modal.Body>
          <Alert color="warning" className="mb-4">
            Review the changes below. Click 'Request Approval' to send this bulk operation to the landlord for approval.
          </Alert>

          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                <Table.HeadCell>Item</Table.HeadCell>
                <Table.HeadCell>Current Value</Table.HeadCell>
                <Table.HeadCell>New Value</Table.HeadCell>
                <Table.HeadCell>Change</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {previewData.map((item) => (
                  <Table.Row key={item.id}>
                    <Table.Cell>{item.name}</Table.Cell>
                    <Table.Cell>
                      <Badge color="gray">{item.currentValue}</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color="success">{item.newValue}</Badge>
                    </Table.Cell>
                    <Table.Cell>
                      <Badge color={item.change > 0 ? 'success' : 'failure'}>
                        {item.change}
                      </Badge>
                    </Table.Cell>
                  </Table.Row>
                ))}
                <Table.Row>
                  <Table.Cell colSpan={3} className="font-semibold">
                    Total: {previewData.length} items
                  </Table.Cell>
                  <Table.Cell>
                    {operationType === 'rent_update' && (
                      <Badge color="blue">
                        Total Change: ${previewData.reduce((sum, item) => 
                          sum + (item.newValue - item.currentValue), 0
                        ).toLocaleString()}
                      </Badge>
                    )}
                  </Table.Cell>
                </Table.Row>
              </Table.Body>
            </Table>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button color="gray" onClick={() => setPreviewVisible(false)}>
              Back
            </Button>
            <Button
              color="blue"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  Submitting...
                </>
              ) : (
                'Request Approval'
              )}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
