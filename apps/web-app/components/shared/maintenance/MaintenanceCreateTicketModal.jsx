/**
 * Maintenance Create Ticket Modal Component (Landlord)
 * 
 * Handles ticket creation for landlords
 * Extracted from MaintenanceClient.jsx to reduce component size
 */

"use client";
import { Select, Button, TextInput, Textarea, Tooltip, Label } from 'flowbite-react';
import { HiSave } from 'react-icons/hi';
import { MAINTENANCE_PRIORITIES } from '@/lib/constants/statuses';
import { useFormState } from '@/lib/hooks/useFormState';

const LANDLORD_CATEGORIES = ['Rent', 'N4 Notice', 'N8 Notice', 'N12 Notice', 'Others'];

/**
 * Maintenance Create Ticket Modal Component
 * 
 * @param {Object} props
 * @param {boolean} props.open - Modal open state
 * @param {Function} props.onCancel - Close modal handler
 * @param {Function} props.onSubmit - Submit handler
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
  const form = useFormState({
    tenantId: '',
    propertyId: '',
    priority: 'Normal',
    category: '',
    title: '',
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const values = form.getFieldsValue();
    
    // Validation
    if (!values.tenantId) {
      alert('Please select a tenant');
      return;
    }
    if (!values.propertyId) {
      alert('Property is required');
      return;
    }
    if (!values.category) {
      alert('Please select a category');
      return;
    }
    if (!values.title) {
      alert('Please enter a subject');
      return;
    }
    if (!values.description) {
      alert('Please enter details');
      return;
    }
    
    onSubmit(values);
  };

  const handleTenantChange = (e) => {
    const tenantId = e.target.value;
    form.setFieldsValue({ tenantId });
    if (onTenantChange) {
      onTenantChange(tenantId);
    }
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    form.setFieldsValue({ category });
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="tenantId" className="mb-2 block">
          Tenant <span className="text-red-500">*</span>
        </Label>
        <Select
          id="tenantId"
          value={form.values.tenantId}
          onChange={handleTenantChange}
          onFocus={() => {
            if ((!Array.isArray(tenants) || tenants.length === 0) && fetchTenants) {
              fetchTenants();
            }
          }}
          required
        >
          <option value="">Select tenant</option>
          {Array.isArray(tenants) 
            ? tenants
                .filter(t => t && t.id != null)
                .map(t => (
                  <option key={t.id} value={t.id}>
                    {t.firstName} {t.lastName} ({t.email})
                  </option>
                ))
            : null}
        </Select>
      </div>

      <div>
        <Label htmlFor="propertyId" className="mb-2 block">
          Property <span className="text-red-500">*</span>
        </Label>
        {isPropertyEditable && (
          <Tooltip content={
            Array.isArray(tenantProperties) && tenantProperties.length > 1 
              ? "Select from tenant's properties" 
              : "Select property manually"
          }>
            <span className="text-xs text-gray-500 ml-1">ℹ️</span>
          </Tooltip>
        )}
        <Select
          id="propertyId"
          value={form.values.propertyId}
          onChange={(e) => form.setFieldsValue({ propertyId: e.target.value })}
          disabled={!isPropertyEditable}
          required
        >
          <option value="">
            {isPropertyEditable ? "Select property" : "Auto-populated"}
          </option>
          {(Array.isArray(tenantProperties) && tenantProperties.length > 0 
            ? tenantProperties 
            : (Array.isArray(allProperties) ? allProperties : []))
              .filter(p => p && p.id != null)
              .map(p => (
                <option key={p.id} value={p.id}>
                  {p.propertyName || p.addressLine1}
                </option>
              ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            {MAINTENANCE_PRIORITIES.map(priority => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="category" className="mb-2 block">
            Category <span className="text-red-500">*</span>
          </Label>
          {selectedCategoryDesc && (
            <div className="text-xs text-gray-500 mb-1">
              📋 {selectedCategoryDesc}
            </div>
          )}
          <Select 
            id="category"
            value={form.values.category}
            onChange={handleCategoryChange}
            required
          >
            <option value="">Select category</option>
            {LANDLORD_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="title" className="mb-2 block">
          Subject <span className="text-red-500">*</span>
        </Label>
        <TextInput
          id="title"
          value={form.values.title}
          onChange={(e) => form.setFieldsValue({ title: e.target.value })}
          placeholder="Brief description of the issue"
          required
        />
      </div>

      <div>
        <Label htmlFor="description" className="mb-2 block">
          Details <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="description"
          value={form.values.description}
          onChange={(e) => form.setFieldsValue({ description: e.target.value })}
          rows={4}
          placeholder="Please provide detailed information about this request"
          required
        />
      </div>

      <div className="flex justify-end">
        <Tooltip content="Create Ticket">
          <Button 
            type="submit"
            color="blue"
            size="lg"
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <span className="animate-spin">⏳</span>
                Creating...
              </>
            ) : (
              <>
                <HiSave className="h-5 w-5" />
                Create Ticket
              </>
            )}
          </Button>
        </Tooltip>
      </div>
    </form>
  );
}
