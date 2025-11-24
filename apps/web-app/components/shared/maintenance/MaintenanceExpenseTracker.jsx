/**
 * Maintenance Expense Tracker Component
 * 
 * Handles expense tracking for maintenance requests (landlord only)
 * Extracted from MaintenanceClient.jsx to reduce component size
 */

"use client";
import { useState } from 'react';
import {
  Modal, Select, TextInput, Textarea, Button, Label, Spinner
} from 'flowbite-react';
import { HiSave, HiCloudUpload } from 'react-icons/hi';
import dayjs from 'dayjs';
import CurrencyInput from '@/components/rules/CurrencyInput';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useCreateExpense } from '@/lib/hooks/useV2Data';
import { useFormState } from '@/lib/hooks/useFormState';
import { notify } from '@/lib/utils/notification-helper';

/**
 * Maintenance Expense Tracker Component
 * 
 * @param {Object} props
 * @param {boolean} props.open - Modal open state
 * @param {Function} props.onCancel - Close modal handler
 * @param {Object} props.selectedRequest - Selected maintenance request
 * @param {Array} props.vendors - Available vendors
 * @param {Function} props.onExpenseAdded - Callback when expense is added
 */
export default function MaintenanceExpenseTracker({
  open,
  onCancel,
  selectedRequest,
  vendors = [],
  onExpenseAdded
}) {
  const { user } = useV2Auth();
  const organizationId = user?.organization_id;
  const createExpense = useCreateExpense();
  const form = useFormState({
    vendorId: '',
    paidTo: '',
    paymentMethod: 'Cash',
    amount: '',
    date: dayjs().format('YYYY-MM-DD'),
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    
    const values = form.getFieldsValue();
    
    // Validation
    if (!values.paymentMethod) {
      notify.error('Please select payment method');
      return;
    }
    if (!values.amount || parseFloat(values.amount) <= 0) {
      notify.error('Please enter a valid amount');
      return;
    }
    if (!values.date) {
      notify.error('Please select date');
      return;
    }
    if (!values.description) {
      notify.error('Please enter description');
      return;
    }
    
    setLoading(true);
    try {
      // Extract local date components to avoid UTC conversion
      let dateString = values.date;
      if (dayjs.isDayjs(values.date)) {
        dateString = values.date.format('YYYY-MM-DD');
      } else if (values.date instanceof Date) {
        const d = new Date(values.date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dateString = `${year}-${month}-${day}`;
      }
      
      // Upload invoice file if present
      let receiptUrl = null;
      if (invoiceFile) {
        try {
          const formData = new FormData();
          formData.append('invoice', invoiceFile);
          
          // Use v1 API for expense invoice upload
          const uploadResponse = await fetch(
            '/api/v1/expenses/upload-invoice',
            {
              method: 'POST',
              credentials: 'include',
              body: formData,
            }
          );
          
          if (!uploadResponse.ok) {
            const error = await uploadResponse.json().catch(() => ({}));
            throw new Error(error.error || error.message || 'Failed to upload invoice');
          }
          
          const uploadData = await uploadResponse.json();
          if (uploadData.success && uploadData.receiptUrl) {
            receiptUrl = uploadData.receiptUrl;
          }
        } catch (uploadError) {
          console.error('[Add Expense] Invoice upload failed:', uploadError);
          notify.warning('Expense created but invoice upload failed. You can add it later.');
        }
      }
      
      const expenseData = {
        ...values,
        amount: parseFloat(values.amount),
        date: dateString,
        receiptUrl: receiptUrl
      };
      
      if (!organizationId) {
        notify.error('Organization ID is required');
        return;
      }
      
      // Use v2Api to create expense
      const data = await createExpense.mutateAsync({
        ...expenseData,
        organization_id: organizationId,
        work_order_id: selectedRequest.id,
      });
      notify.success('Expense recorded successfully');
      form.resetForm();
      setInvoiceFile(null);
      onCancel();
      
      if (onExpenseAdded) {
        onExpenseAdded(data.expense);
      }
      
      // Broadcast expense update
      if (typeof window !== 'undefined' && data.expense) {
        window.dispatchEvent(new CustomEvent('expenseUpdated', {
          detail: {
            eventType: 'added',
            expense: data.expense,
            timestamp: new Date().toISOString()
          }
        }));
      }
    } catch (error) {
      console.error('[MaintenanceExpenseTracker] Error:', error);
      notify.error(error.message || 'Failed to record expense');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetForm();
    setInvoiceFile(null);
    onCancel();
  };

  return (
    <Modal
      show={open}
      onClose={handleCancel}
      size="lg"
    >
      <Modal.Header>Record Expense</Modal.Header>
      <Modal.Body>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vendorId" className="mb-2 block">
                Vendor/Contractor
              </Label>
              <Select
                id="vendorId"
                value={form.values.vendorId}
                onChange={(e) => form.setFieldsValue({ vendorId: e.target.value })}
              >
                <option value="">Select vendor (optional)</option>
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.businessName || v.name}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="paidTo" className="mb-2 block">
                Paid To (if not a vendor)
              </Label>
              <TextInput
                id="paidTo"
                value={form.values.paidTo}
                onChange={(e) => form.setFieldsValue({ paidTo: e.target.value })}
                placeholder="Name or company"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="paymentMethod" className="mb-2 block">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select
                id="paymentMethod"
                value={form.values.paymentMethod}
                onChange={(e) => form.setFieldsValue({ paymentMethod: e.target.value })}
                required
              >
                <option value="Cash">Cash</option>
                <option value="Check">Check</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount" className="mb-2 block">
                Amount <span className="text-red-500">*</span>
              </Label>
              <CurrencyInput
                id="amount"
                country={selectedRequest?.property?.country || 'CA'}
                value={form.values.amount}
                onChange={(value) => form.setFieldsValue({ amount: value })}
                placeholder="0.00"
                min={0.01}
                required
              />
            </div>
            <div>
              <Label htmlFor="date" className="mb-2 block">
                Payment Date <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id="date"
                type="date"
                value={form.values.date}
                onChange={(e) => form.setFieldsValue({ date: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="mb-2 block">
              Description <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="description"
              rows={3}
              value={form.values.description}
              onChange={(e) => form.setFieldsValue({ description: e.target.value })}
              placeholder="Describe the expense (e.g., Plumbing repair, HVAC service, etc.)"
              required
            />
          </div>

          <div>
            <Label htmlFor="invoice" className="mb-2 block">
              Upload Invoice
            </Label>
            <input
              type="file"
              id="invoice"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {invoiceFile && (
              <p className="mt-2 text-sm text-gray-600">
                Selected: {invoiceFile.name}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button color="gray" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              type="submit"
              color="blue"
              disabled={loading}
              className="flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Spinner size="sm" />
                  Recording...
                </>
              ) : (
                <>
                  <HiSave className="h-4 w-4" />
                  Record Expense
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal.Body>
    </Modal>
  );
}
