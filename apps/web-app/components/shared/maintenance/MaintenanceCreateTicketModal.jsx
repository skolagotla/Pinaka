/**
 * Maintenance Create Ticket Modal Component (Landlord)
 * 
 * Handles ticket creation for landlords
 * Extracted from MaintenanceClient.jsx to reduce component size
 */

"use client";
import { Form, Input, Select, Button, Row, Col, Tooltip } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { MAINTENANCE_PRIORITIES } from '@/lib/constants/statuses';

const { TextArea } = Input;

const LANDLORD_CATEGORIES = ['Rent', 'N4 Notice', 'N8 Notice', 'N12 Notice', 'Others'];

/**
 * Maintenance Create Ticket Modal Component
 * 
 * @param {Object} props
 * @param {boolean} props.open - Modal open state
 * @param {Function} props.onCancel - Close modal handler
 * @param {Function} props.onSubmit - Submit handler
 * @param {Object} props.form - Form instance
 * @param {Array} props.tenants - Available tenants
 * @param {Array} props.tenantProperties - Properties for selected tenant
 * @param {Array} props.allProperties - All properties
 * @param {boolean} props.isPropertyEditable - Whether property can be edited
 * @param {string} props.selectedCategoryDesc - Description for selected category
 * @param {Function} props.onTenantChange - Handler when tenant changes
 * @param {Function} props.onCategoryChange - Handler when category changes
 * @param {Function} props.fetchTenants - Fetch tenants function
 * @param {boolean} props.loading - Loading state
 */
export default function MaintenanceCreateTicketModal({
  open,
  onCancel,
  onSubmit,
  form,
  tenants = [],
  tenantProperties = [],
  allProperties = [],
  isPropertyEditable = false,
  selectedCategoryDesc = '',
  onTenantChange,
  onCategoryChange,
  fetchTenants,
  loading = false
}) {
  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
    >
      <Form.Item
        name="tenantId"
        label="Tenant"
        rules={[{ required: true, message: 'Please select a tenant' }}
      >
        <Select
          placeholder="Select tenant"
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={Array.isArray(tenants) 
            ? tenants
                .filter(t => t && t.id != null)
                .map(t => ({
                  value: t.id,
                  label: `${t.firstName} ${t.lastName} (${t.email})`
                }))
            : [}
          onChange={onTenantChange}
          onDropdownVisibleChange={(open) => {
            if (open && (!Array.isArray(tenants) || tenants.length === 0)) {
              fetchTenants();
            }
          }}
        />
      </Form.Item>

      <Form.Item
        name="propertyId"
        label="Property"
        rules={[{ required: true, message: 'Property is required' }}
        tooltip={
          isPropertyEditable 
            ? (Array.isArray(tenantProperties) && tenantProperties.length > 1 
                ? "Select from tenant's properties" 
                : "Select property manually")
            : "Auto-populated from tenant's active lease"
        }
      >
        <Select
          placeholder={
            isPropertyEditable
              ? "Select property"
              : "Auto-populated"
          }
          disabled={!isPropertyEditable}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
          }
          options={
            (Array.isArray(tenantProperties) && tenantProperties.length > 0 
              ? tenantProperties 
              : (Array.isArray(allProperties) ? allProperties : []))
              .filter(p => p && p.id != null)
              .map(p => ({
                value: p.id,
                label: p.propertyName || p.addressLine1
              }))
          }
        />
      </Form.Item>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="priority"
            label="Priority"
            initialValue="Normal"
            rules={[{ required: true, message: 'Please select priority' }}
          >
            <Select placeholder="Select priority">
              {MAINTENANCE_PRIORITIES.map(priority => (
                <Select.Option key={priority} value={priority}priority}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col span={12}>
          <Form.Item
            name="category"
            label="Category"
            rules={[{ required: true, message: 'Please select a category' }}
            extra={selectedCategoryDesc && (
              <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                📋 {selectedCategoryDesc}
              </div>
            )}
          >
            <Select 
              placeholder="Select category"
              onChange={onCategoryChange}
            >
              {LANDLORD_CATEGORIES.map(cat => (
                <Select.Option key={cat} value={cat}cat}</Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="title"
        label="Subject"
        rules={[{ required: true, message: 'Please enter a subject' }}
      >
        <Input placeholder="Brief description of the issue" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Details"
        rules={[{ required: true, message: 'Please enter details' }}
      >
        <TextArea
          rows={4}
          placeholder="Please provide detailed information about this request"
        />
      </Form.Item>

      <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
        <Tooltip title="Create Ticket">
          <Button 
            type="primary" 
            size="large"
            htmlType="submit" 
            loading={loading}
            icon={<SaveOutlined />}
          />
        </Tooltip>
      </Form.Item>
    </Form>
  );
}

