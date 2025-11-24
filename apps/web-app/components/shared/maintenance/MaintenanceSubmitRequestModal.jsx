/**
 * Maintenance Submit Request Modal Component (Tenant)
 * 
 * Handles maintenance request submission for tenants
 * Extracted from MaintenanceClient.jsx to reduce component size
 */

"use client";
import { Select, TextInput, Textarea, Label } from 'flowbite-react';
import { MAINTENANCE_CATEGORIES, MAINTENANCE_PRIORITIES } from '@/lib/constants/statuses';
import { useFormState } from '@/lib/hooks/useFormState';

/**
 * Maintenance Submit Request Modal Component
 * 
 * @param {Object} props
 * @param {Function} props.onSubmit - Submit handler
 * @param {Array} props.properties - Available properties
 * @param {Object} props.selectedPropertyAddress - Selected property address
 * @param {Function} props.onPropertyChange - Handler when property changes
 * @param {Function} props.renderFormButtons - Render form buttons function
 */
export default function MaintenanceSubmitRequestModal({
  onSubmit,
  properties = [],
  selectedPropertyAddress = { addressLine: '', cityStateZip: '' },
  onPropertyChange,
  renderFormButtons
}) {
  const form = useFormState({
    propertyId: '',
    category: '',
    priority: '',
    title: '',
    description: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const values = form.getFieldsValue();
    
    // Validation
    if (!values.propertyId) {
      alert('Please select property');
      return;
    }
    if (!values.category) {
      alert('Please select category');
      return;
    }
    if (!values.priority) {
      alert('Please select priority');
      return;
    }
    if (!values.title) {
      alert('Please enter title');
      return;
    }
    if (!values.description) {
      alert('Please enter description');
      return;
    }
    
    onSubmit(values);
  };

  const handlePropertyChange = (e) => {
    const propertyId = e.target.value;
    form.setFieldsValue({ propertyId });
    if (onPropertyChange) {
      onPropertyChange(propertyId);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="propertyId" className="mb-2 block">
            Property <span className="text-red-500">*</span>
          </Label>
          {selectedPropertyAddress.addressLine && (
            <div className="text-xs text-gray-500 mb-2">
              <div>📍 {selectedPropertyAddress.addressLine}</div>
              {selectedPropertyAddress.cityStateZip && (
                <div className="ml-5">{selectedPropertyAddress.cityStateZip}</div>
              )}
            </div>
          )}
          <Select 
            id="propertyId"
            value={form.values.propertyId}
            onChange={handlePropertyChange}
            required
          >
            <option value="">Select property</option>
            {properties.map(prop => (
              <option key={prop.id} value={prop.id}>
                {prop.propertyName || prop.addressLine1}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="category" className="mb-2 block">
            Category <span className="text-red-500">*</span>
          </Label>
          <Select
            id="category"
            value={form.values.category}
            onChange={(e) => form.setFieldsValue({ category: e.target.value })}
            required
          >
            <option value="">Select category</option>
            {MAINTENANCE_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </Select>
        </div>
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
            <option value="">Select priority</option>
            {MAINTENANCE_PRIORITIES.map(pri => (
              <option key={pri} value={pri}>{pri}</option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="title" className="mb-2 block">
          Title <span className="text-red-500">*</span>
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
          Description <span className="text-red-500">*</span>
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

      {renderFormButtons && renderFormButtons()}
    </form>
  );
}
