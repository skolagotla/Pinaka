/**
 * ═══════════════════════════════════════════════════════════════
 * SHARED COMPONENTS EXPORT
 * ═══════════════════════════════════════════════════════════════
 * 
 * Export all shared/reusable components for easy importing
 * 
 * Usage:
 *   import { PhoneDisplay, ApprovalsTable } from '@/components/shared';
 * 
 * ═══════════════════════════════════════════════════════════════
 */

export { default as PhoneDisplay } from './PhoneDisplay';
export { default as ApprovalsTable } from './ApprovalsTable';
export * from './TableRenderers';
export { default as PageLayout, EmptyState, TableWrapper } from './PageLayout';
export { default as StandardModal } from './StandardModal';
export { default as FilterBar } from './FilterBar';
export * from './FormFields';
export { default as StatCard } from './StatCard';
export { default as LoadingWrapper, TableSkeleton } from './LoadingWrapper';
export { default as TableActionsColumn } from './TableActionsColumn';
export { default as TabbedContent } from './TabbedContent';
export { default as FormActions } from './FormActions';
export { default as DeleteConfirmButton } from './DeleteConfirmButton';

