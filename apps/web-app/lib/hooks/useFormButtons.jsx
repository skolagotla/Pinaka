/**
 * useFormButtons Hook
 * 
 * Provides consistent Save icon button for all forms
 * across the application with tooltip.
 * Uses standardized ActionButton component for consistency.
 * 
 * Note: No Cancel button needed - modals have X close button
 * 
 * Usage:
 *   const { renderFormButtons } = useFormButtons({
 *     isEditing,
 *     loading,
 *     entityName: 'Property' // e.g., 'Property', 'Unit', 'Lease', etc.
 *   });
 * 
 *   // In your form:
 *   <Form.Item style={{ marginBottom: 0 }}>
 *     {renderFormButtons()}
 *   </Form.Item>
 */

import { ActionButton } from '@/components/shared/buttons';

export function useFormButtons({ isEditing = false, loading = false, entityName = 'Item' }) {
  const renderFormButtons = () => (
    <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
      <ActionButton
        action="save"
        htmlType="submit"
        loading={loading}
        tooltip={isEditing ? 'Save Changes' : `Add ${entityName}`}
        size="large"
      />
    </div>
  );

  return { renderFormButtons };
}

