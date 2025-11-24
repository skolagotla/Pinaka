/**
 * Hooks Index
 * Central export for all custom hooks
 */

// ========================================
// COMPOSITE HOOKS (Feature-Level)
// ========================================
// These hooks combine multiple base hooks for complete features
// Use these for cleaner code and consistent behavior

export { useDocumentVaultFeature } from './useDocumentVaultFeature';
export { useRentPaymentFeature } from './useRentPaymentFeature';
export { useAddressForm } from './useAddressForm';
export { usePageBanner } from './usePageBanner';

// ========================================
// BASE HOOKS (Building Blocks)
// ========================================
// Document Vault Hooks
export { useDocumentVault } from './useDocumentVault';
export { useDocumentUpload } from './useDocumentUpload';
export { useDocumentModals } from './useDocumentModals';
export { useMutualApproval } from './useMutualApproval';

// Regional Input Hooks
export { 
  usePhoneInput, 
  usePostalCodeInput, 
  useRegionalInput, 
  useFormatValue, 
  useValidateRegional 
} from './useRegionalInput';

// Table Hooks
export { useResizableTable, withSorter, sortFunctions } from './useResizableTable';

// Date Utility Hooks
export {
  useDateUtils,
  useDateFormat,
  useDateComparison,
  useToday,
  useRentDueDate,
  useDaysBetween,
  useMonthName,
  useDateComponents
} from './useDateUtils';

// Search Hooks
export { 
  useSearch, 
  useAdvancedFilter, 
  useSearchAndFilter 
} from './useSearch';

// Other Hooks
export { useRentReceipts } from './useRentReceipts';
export { useRentPayments } from './useRentPayments';
export { useMaintenanceTicket } from './useMaintenanceTicket';
export { useDashboardMetrics } from './useDashboardMetrics';
export { useSettings } from './useSettings';
export { useReferenceData } from './useReferenceData';
export { useCountryRegion } from './useCountryRegion';
export { usePinakaCRUD } from './usePinakaCRUD';
export { usePinakaCRUDWithAddress } from './usePinakaCRUDWithAddress';
export { useCRUD } from './useCRUD';
export { useFormButtons } from './useFormButtons';
export { useMessage } from './useMessage';
export { useTheme } from './useTheme';
export { useClipboard } from './useClipboard';
export { useDebounce } from './useDebounce';
export { useDebouncedCallback } from './useDebouncedCallback';
export { useNotification } from './useNotification';
export { useLocalStorage } from './useLocalStorage';
export { useToast } from './useToast';
export { useConfirmDialog } from './useConfirmDialog';
export { useFormValidation } from './useFormValidation';
export { useDialog } from './useDialog';
export { useFormDataSanitizer } from './useFormDataSanitizer';
// useUnifiedApi removed - use v2Api from @/lib/api/v2-client instead
export { useMaintenanceRequests } from './useMaintenanceRequests';
export { useMaintenanceActions } from './useMaintenanceActions';
export { useTenantFormData } from './useTenantFormData';
export { useChartComponents } from './useChartComponents';
export { useDataLoader } from './useDataLoader';
export { useTabNavigation } from './useTabNavigation';
export { useModalState } from './useModalState';
export { useFormSubmission } from './useFormSubmission';
export { usePolling } from './usePolling';
export { useLoadingState } from './useLoadingState';
export { useBulkOperations } from './useBulkOperations';
export { useActionButtons } from './useActionButtons';
export { useFloatingActions } from './useFloatingActions';
export { configureTableColumns, createStandardTableConfig } from '../utils/table-config';
