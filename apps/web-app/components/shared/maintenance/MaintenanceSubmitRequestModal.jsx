/**
 * Maintenance Submit Request Modal Component (Tenant)
 * 
 * Handles maintenance request submission for tenants
 * Extracted from MaintenanceClient.jsx to reduce component size
 */

"use client";
import { Form, Input, Select, Row, Col } from 'antd';
import { MAINTENANCE_CATEGORIES, MAINTENANCE_PRIORITIES } from '@/lib/constants/statuses';

const { TextArea } = Input;

/**
 * Maintenance Submit Request Modal Component
 * 
 * @param {Object} props
 * @param {Function} props.onSubmit - Submit handler
 * @param {Object} props.form - Form instance
 * @param {Array} props.properties - Available properties
 * @param {Object} props.selectedPropertyAddress - Selected property address
 * @param {Function} props.onPropertyChange - Handler when property changes
 * @param {Function} props.renderFormButtons - Render form buttons function
 */
export default function MaintenanceSubmitRequestModal({
  onSubmit,
  form,
  properties = [],
  selectedPropertyAddress = { addressLine: '', cityStateZip: '' },
  onPropertyChange,
  renderFormButtons
}) {
  return (
    <Form form={form} layout="vertical" onFinish={onSubmit}>
      <Row gutter={16}>
        <Col span={8}>
          <Form.Item
            name="propertyId"
            label="Property"
            rules={[{ required: true, message: 'Please select property' }]}
            extra={selectedPropertyAddress.addressLine && (
              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                <div>📍 {selectedPropertyAddress.addressLine}</div>
                {selectedPropertyAddress.cityStateZip && (
                  <div style={{ marginLeft: 20 }}>{selectedPropertyAddress.cityStateZip}</div>
                )}
              </div>
            )}
          >
            <Select 
              placeholder="Select property"
              onChange={onPropertyChange}
            >
              {properties.map(prop => (
                <Select.Option key={prop.id} value={prop.id}>
                  {prop.propertyName || prop.addressLine1}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true }]}
          >
            <Select>
              {MAINTENANCE_CATEGORIES.map(cat => (
                <Select.Option key={cat} value={cat}>{cat}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={8}>
          <Form.Item
            name="priority"
            label="Priority"
            rules={[{ required: true }]}
          >
            <Select>
              {MAINTENANCE_PRIORITIES.map(pri => (
                <Select.Option key={pri} value={pri}>{pri}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true, message: 'Please enter title' }]}
      >
        <Input placeholder="Brief description of the issue" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: 'Please enter description' }]}
      >
        <TextArea rows={4} placeholder="Detailed description of the maintenance issue" />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0 }}>
        {renderFormButtons()}
      </Form.Item>
    </Form>
  );
}

