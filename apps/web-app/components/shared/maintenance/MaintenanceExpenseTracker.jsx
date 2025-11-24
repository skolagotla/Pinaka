/**
 * Maintenance Expense Tracker Component
 * 
 * Handles expense tracking for maintenance requests (landlord only)
 * Extracted from MaintenanceClient.jsx to reduce component size
 */

"use client";
import { useState } from 'react';
import {
  Modal, Form, Input, Select, DatePicker, Button, Space, Row, Col,
  Upload, message, App
} from 'antd';
import { SaveOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import CurrencyInput from '@/components/rules/CurrencyInput';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { useCreateExpense } from '@/lib/hooks/useV2Data';

const { TextArea } = Input;

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
  const { message: messageApi } = App.useApp();
  const { user } = useV2Auth();
  const organizationId = user?.organization_id;
  const createExpense = useCreateExpense();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [invoiceFileList, setInvoiceFileList] = useState([]);

  const handleSubmit = async (values) => {
    if (!selectedRequest) return;
    setLoading(true);
    try {
      // Extract local date components to avoid UTC conversion
      let dateString;
      if (values.date) {
        if (dayjs.isDayjs(values.date)) {
          dateString = values.date.format('YYYY-MM-DD');
        } else if (values.date instanceof Date) {
          const d = new Date(values.date);
          const year = d.getFullYear();
          const month = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          dateString = `${year}-${month}-${day}`;
        } else {
          dateString = values.date;
        }
      } else {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        dateString = `${year}-${month}-${day}`;
      }
      
      // Upload invoice file if present
      let receiptUrl = null;
      if (invoiceFileList && invoiceFileList.length > 0 && invoiceFileList[0].originFileObj) {
        try {
          const formData = new FormData();
          formData.append('invoice', invoiceFileList[0].originFileObj);
          
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
          messageApi.warning('Expense created but invoice upload failed. You can add it later.');
        }
      }
      
      const expenseData = {
        ...values,
        amount: parseFloat(values.amount),
        date: dateString,
        receiptUrl: receiptUrl
      };
      
      delete expenseData.invoice;
      
      if (!organizationId) {
        messageApi.error('Organization ID is required');
        return;
      }
      
      // Use v2Api to create expense
      const data = await createExpense.mutateAsync({
        ...expenseData,
        organization_id: organizationId,
        work_order_id: selectedRequest.id,
      });
      messageApi.success('Expense recorded successfully');
      form.resetFields();
      setInvoiceFileList([]);
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
      messageApi.error(error.message || 'Failed to record expense');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setInvoiceFileList([]);
    onCancel();
  };

  return (
    <Modal
      title="Record Expense"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          date: dayjs(),
          paymentMethod: 'Cash'
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="vendorId"
              label="Vendor/Contractor"
            >
              <Select
                placeholder="Select vendor (optional)"
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={vendors.map(v => ({
                  value: v.id,
                  label: v.businessName || v.name
                }))}
                allowClear
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="paidTo"
              label="Paid To (if not a vendor)"
            >
              <Input placeholder="Name or company" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="paymentMethod"
              label="Payment Method"
              rules={[{ required: true, message: 'Please select payment method' }}
            >
              <Select>
                <Select.Option value="Cash">Cash</Select.Option>
                <Select.Option value="Check">Check</Select.Option>
                <Select.Option value="Credit Card">Credit Card</Select.Option>
                <Select.Option value="Debit Card">Debit Card</Select.Option>
                <Select.Option value="Bank Transfer">Bank Transfer</Select.Option>
                <Select.Option value="Other">Other</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="amount"
              label="Amount"
              rules={
                { required: true, message: 'Please enter amount' },
                { 
                  type: 'number', 
                  min: 0.01, 
                  message: 'Amount must be greater than 0' 
                }
              }
            >
              <CurrencyInput
                country={selectedRequest?.property?.country || 'CA'}
                style={{ width: '100%' }}
                placeholder="0.00"
                min={0.01}
              />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="date"
              label="Payment Date"
              rules={[{ required: true, message: 'Please select date' }}
            >
              <DatePicker style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="description"
          label="Description"
          rules={[{ required: true, message: 'Please enter description' }}
        >
          <TextArea
            rows={3}
            placeholder="Describe the expense (e.g., Plumbing repair, HVAC service, etc.)"
          />
        </Form.Item>

        <Form.Item
          name="invoice"
          label="Upload Invoice"
          valuePropName="fileList"
          getValueFromEvent={(e) => {
            if (Array.isArray(e)) {
              return e;
            }
            return e?.fileList;
          }}
        >
          <Upload
            beforeUpload={() => false}
            maxCount={1}
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            fileList={invoiceFileList}
            onChange={({ fileList }) => {
              setInvoiceFileList(fileList);
              form.setFieldsValue({ invoice: fileList });
            }}
            onRemove={() => {
              setInvoiceFileList([]);
              form.setFieldsValue({ invoice: [] });
            }}
          >
            <Button icon={<UploadOutlined />}>Upload Invoice</Button>
          </Upload>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
          <Space>
            <Button onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<SaveOutlined />}
            >
              Record Expense
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}

