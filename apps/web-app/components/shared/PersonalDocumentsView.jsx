/**
 * Personal Documents View Component
 * 
 * Displays personal documents (checklist and table) without tabs or PageBanner
 * Used in admin/library page and can be embedded in other components
 */

"use client";

import { Card, Table, Spinner } from 'flowbite-react';
import { Empty } from '@/components/shared';
import { HiDocumentText } from 'react-icons/hi';

export default function PersonalDocumentsView({
  userRole,
  renderDocumentChecklist,
  displayDocuments,
  library,
  documentsSearch,
  tableProps,
  selectedTenant,
}) {
  return (
    <div className="p-6">
      {renderDocumentChecklist && renderDocumentChecklist()}

      <Card>
        <div className="flex items-center gap-2 mb-4">
          <HiDocumentText className="h-5 w-5" />
          <h5 className="font-semibold text-base">
            Documents: {displayDocuments.length}
          </h5>
        </div>
        {library.loading ? (
          <div className="text-center py-12">
            <Spinner size="xl" />
            <p className="mt-4 text-gray-500">Loading documents...</p>
          </div>
        ) : displayDocuments.length === 0 ? (
          <Empty description={
            userRole === 'landlord'
              ? (selectedTenant 
                  ? "No documents uploaded yet for this tenant." 
                  : "No documents found. Upload documents using the + button above.")
              : "No documents uploaded yet. Upload documents using the + button above."
          } />
        ) : (
          <div className="overflow-x-auto">
            <Table hoverable>
              <Table.Head>
                {tableProps.columns?.map((col, idx) => (
                  <Table.HeadCell key={col.key || idx}>{col.title}</Table.HeadCell>
                ))}
              </Table.Head>
              <Table.Body className="divide-y">
                {documentsSearch.filteredData.map((record, idx) => (
                  <Table.Row key={record.id || idx}>
                    {tableProps.columns?.map((col, colIdx) => (
                      <Table.Cell key={col.key || colIdx}>
                        {col.render ? col.render(record[col.dataIndex], record, idx) : record[col.dataIndex]}
                      </Table.Cell>
                    ))}
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
