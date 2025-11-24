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
export { default as PageHeader } from './PageHeader';
export { default as StatCard } from './StatCard';
export { PageSkeleton, TableSkeleton, CardSkeleton, StatCardSkeleton } from './LoadingSkeleton';
export { default as StandardModal } from './StandardModal';
export { default as FilterBar } from './FilterBar';
export * from './FormFields';
export { default as LoadingWrapper } from './LoadingWrapper';
export { default as TableActionsColumn } from './TableActionsColumn';
export { default as TabbedContent } from './TabbedContent';
export { default as FormActions } from './FormActions';
export { default as DeleteConfirmButton } from './DeleteConfirmButton';

