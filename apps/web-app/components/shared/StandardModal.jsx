"use client";

/**
 * StandardModal Component
 * 
 * A reusable modal component that wraps Ant Design Modal with Form,
 * providing consistent patterns for forms across the application.
 * 
 * Features:
 * - Automatic form validation
 * - Loading states
 * - Standardized footer buttons (Save/Cancel)
 * - Form reset on cancel
 * - Error handling
 * 
 * @param {Object} props
 * @param {string} props.title - Modal title
 * @param {boolean} props.open - Modal visibility
 * @param {function} props.onCancel - Cancel handler
 * @param {function} props.onFinish - Form submission handler (receives form values)
 * @param {React.ReactNode} props.children - Form content (Form.Item components)
 * @param {object} props.form - Ant Design Form instance (from Form.useForm())
 * @param {boolean} props.loading - Loading state for submit button
 * @param {string} props.submitText - Submit button text (default: 'Save')
 * @param {string} props.cancelText - Cancel button text (default: 'Cancel')
 * @param {boolean} props.showCancel - Show cancel button (default: true)
 * @param {number} props.width - Modal width (default: 600)
 * @param {string} props.layout - Form layout: 'vertical' | 'horizontal' | 'inline' (default: 'vertical')
 * @param {function} props.onFinishFailed - Handler for form validation failures
 * @param {object} props.initialValues - Initial form values
 * @param {boolean} props.destroyOnClose - Destroy form on close (default: true)
 * 
 * @example
 * const [form] = Form.useForm();
 * const [loading, setLoading] = useState(false);
 * 
 * <StandardModal
 *   title="Add User"
 *   open={modalVisible}
 *   form={form}
 *   loading={loading}
 *   onCancel={() => setModalVisible(false)}
 *   onFinish={async (values) => {
 *     setLoading(true);
 *     try {
 *       await createUser(values);
 *       setModalVisible(false);
 *       form.resetFields();
 *     } finally {
 *       setLoading(false);
 *     }
 *   }}
 * >
 *   <Form.Item name="name" label="Name" rules={[{ required: true }]}>
 *     <Input />
 *   </Form.Item>
 * </StandardModal>
 */

import React from 'react';
import { Modal, Form, Button, Space, message } from 'antd';
import { ActionButton } from './buttons';

export default function StandardModal({
  title,
  open,
  onCancel,
  onFinish,
  children,
  form,
  loading = false,
  submitText = 'Save',
  cancelText = 'Cancel',
  showCancel = true,
  width = 600,
  layout = 'vertical',
  onFinishFailed,
  initialValues,
  destroyOnClose = true,
  ...modalProps
}) {
  const handleCancel = () => {
    if (!loading && form) {
      form.resetFields();
    }
    onCancel?.();
  };

  const handleFinish = async (values) => {
    try {
      await onFinish?.(values);
    } catch (error) {
      console.error('[StandardModal] Form submission error:', error);
      // Error handling is done by the parent component
    }
  };

  const handleFinishFailed = (errorInfo) => {
    if (onFinishFailed) {
      onFinishFailed(errorInfo);
    } else {
      // Default error handling
      const firstError = errorInfo.errorFields?.[0];
      const firstErrorMsg = firstError?.errors?.[0]?.message || 'Please fill in all required fields';
      message.error(firstErrorMsg);
    }
  };

  const footer = (
    <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
      {showCancel && (
        <Button
          onClick={handleCancel}
          disabled={loading}
        >
          {cancelText}
        </Button>
      )}
      <Button
        type="primary"
        loading={loading}
        onClick={() => form?.submit()}
      >
        {submitText}
      </Button>
    </Space>
  );

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleCancel}
      footer={footer}
      width={width}
      destroyOnClose={destroyOnClose}
      {...modalProps}
    >
      <Form
        form={form}
        layout={layout}
        onFinish={handleFinish}
        onFinishFailed={handleFinishFailed}
        initialValues={initialValues}
        preserve={!destroyOnClose}
      >
        {children}
      </Form>
    </Modal>
  );
}

