"use client";

import PageLayout from '@/components/shared/PageLayout';
import LTBDocumentsGrid from '@/components/shared/LTBDocumentsGrid';

export default function AdminLibraryPage() {
  return (
    <PageLayout
      headerTitle="Library"
      style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <LTBDocumentsGrid userRole="admin" showFilters={true} showTitle={false} />
    </PageLayout>
  );
}
