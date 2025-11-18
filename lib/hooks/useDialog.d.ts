/**
 * TypeScript type definitions for useDialog hook
 */

export interface DialogOptions<T = any> {
  onOpen?: (params: { mode: 'add' | 'edit'; item?: T }) => void;
  onClose?: () => void;
  defaultFormData?: T;
}

export interface DialogReturn<T = any> {
  isOpen: boolean;
  isEditing: boolean;
  selectedItem: T | null;
  formData: T;
  openAdd: () => void;
  openEdit: (item: T) => void;
  close: () => void;
  updateFormData: (updates: Partial<T>) => void;
  handleFieldChange: <K extends keyof T>(fieldName: K, value: T[K]) => void;
  resetForm: () => void;
  setFormData: (data: T) => void;
}

export function useDialog<T = any>(options?: DialogOptions<T>): DialogReturn<T>;

