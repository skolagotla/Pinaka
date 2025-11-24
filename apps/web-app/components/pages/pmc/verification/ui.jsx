"use client";

import { useState, useCallback } from 'react';
import {
  Button,
  Badge,
  Modal,
  Alert,
  Textarea,
  Select,
  Label,
} from 'flowbite-react';
import { StandardModal, FormTextInput, PageLayout, TableWrapper, FilterBar, FlowbiteTable, EmptyState } from '@/components/shared';
import { renderStatus, renderDate } from '@/components/shared/TableRenderers';
import { STANDARD_COLUMNS, customizeColumn } from '@/lib/constants/standard-columns';
import { notify } from '@/lib/utils/notification-helper';
import { useLoading } from '@/lib/hooks/useLoading';
import { useFormState } from '@/lib/hooks/useFormState';
import { useModalState } from '@/lib/hooks/useModalState';
import {
  HiDocument,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiEye,
  HiCheck,
  HiX,
} from 'react-icons/hi';
// useUnifiedApi removed - use v2Api from @/lib/api/v2-client';

const DOCUMENT_TYPES = [
  { value: 'GOVERNMENT_ID', label: 'Government ID' },
  { value: 'PROPERTY_TAX', label: 'Property Tax' },
  { value: 'DEED_TITLE', label: 'Deed/Title' },
  { value: 'MORTGAGE_STATEMENT', label: 'Mortgage Statement' },
  { value: 'BANK_STATEMENT', label: 'Bank Statement' },
  { value: 'INSURANCE_POLICY', label: 'Insurance Policy' },
  { value: 'ASSESSMENT_RECORD', label: 'Assessment Record' },
  { value: 'PURCHASE_AGREEMENT', label: 'Purchase Agreement' },
  { value: 'OTHER', label: 'Other' },
];

const STATUS_COLORS = {
  PENDING: 'warning',
  VERIFIED: 'success',
  REJECTED: 'failure',
  EXPIRED: 'gray',
};

const STATUS_ICONS = {
  PENDING: <HiClock className="h-4 w-4" />,
  VERIFIED: <HiCheckCircle className="h-4 w-4" />,
  REJECTED: <HiXCircle className="h-4 w-4" />,
  EXPIRED: <HiClock className="h-4 w-4" />,
};

export default function VerificationClient({ pmc, pmcRelationships }) {
  const { formData: verifyFormData, updateField: updateVerifyField, resetForm: resetVerifyForm } = useFormState({
    verificationNotes: '',
  });
  const { formData: rejectFormData, updateField: updateRejectField, resetForm: resetRejectForm } = useFormState({
    rejectionReason: '',
  });
  const { isOpen: viewModalVisible, open: openViewModal, close: closeViewModal, editingItem: selectedVerification, openForEdit: openViewModalForEdit } = useModalState();
  const { isOpen: verifyModalVisible, open: openVerifyModal, close: closeVerifyModal, openForEdit: openVerifyModalForEdit } = useModalState();
  const { isOpen: rejectModalVisible, open: openRejectModal, close: closeRejectModal, openForEdit: openRejectModalForEdit } = useModalState();
  const [statusFilter, setStatusFilter] = useState('all');
  const [landlordFilter, setLandlordFilter] = useState('all');
  const { loading: verifying, withLoading: withVerifying } = useLoading();
  const { loading: rejecting, withLoading: withRejecting } = useLoading();
  // useUnifiedApi removed - use v2Api from @/lib/api/v2-client

  // Flatten all verifications from all relationships
  const allVerifications = pmcRelationships.flatMap(rel =>
    rel.ownershipVerifications.map(ver => ({
      ...ver,
      landlordName: `${rel.landlord.firstName} ${rel.landlord.lastName}`,
      landlordEmail: rel.landlord.email,
      relationshipId: rel.id,
    }))
  );

  // Filter verifications
  const filteredVerifications = allVerifications.filter(ver => {
    if (statusFilter !== 'all' && ver.status !== statusFilter) return false;
    if (landlordFilter !== 'all' && ver.relationshipId !== landlordFilter) return false;
    return true;
  });

  // Calculate statistics
  const stats = {
    total: allVerifications.length,
    pending: allVerifications.filter(v => v.status === 'PENDING').length,
    verified: allVerifications.filter(v => v.status === 'VERIFIED').length,
    rejected: allVerifications.filter(v => v.status === 'REJECTED').length,
  };

  const handleVerify = useCallback(async () => {
    if (!selectedVerification) return;

    await withVerifying(async () => {
      try {
        const response = await fetch(
          `/api/ownership-verification/${selectedVerification.id}/verify`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              verificationNotes: verifyFormData.verificationNotes || null,
            }),
          },
          { operation: 'Verify document', showUserMessage: true }
        );

        if (response.ok) {
          notify.success('Document verified successfully');
          closeVerifyModal();
          resetVerifyForm();
          // Reload page to refresh data
          window.location.reload();
        }
      } catch (error) {
        console.error('[Verification Verify] Error:', error);
      }
    });
  }, [verifyFormData, selectedVerification, fetch, withVerifying, closeVerifyModal, resetVerifyForm]);

  const handleReject = useCallback(async () => {
    if (!selectedVerification) return;
    if (!rejectFormData.rejectionReason) {
      notify.error('Please provide a rejection reason');
      return;
    }

    await withRejecting(async () => {
      try {
        const response = await fetch(
          `/api/ownership-verification/${selectedVerification.id}/reject`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              rejectionReason: rejectFormData.rejectionReason,
            }),
          },
          { operation: 'Reject document', showUserMessage: true }
        );

        if (response.ok) {
          notify.success('Document rejected');
          closeRejectModal();
          resetRejectForm();
          // Reload page to refresh data
          window.location.reload();
        }
      } catch (error) {
        console.error('[Verification Reject] Error:', error);
      }
    });
  }, [rejectFormData, selectedVerification, fetch, withRejecting, closeRejectModal, resetRejectForm]);

  const handleViewDocument = useCallback((verification) => {
    openViewModalForEdit(verification);
  }, [openViewModalForEdit]);

  const handleVerifyClick = useCallback((verification) => {
    openVerifyModalForEdit(verification);
  }, [openVerifyModalForEdit]);

  const handleRejectClick = useCallback((verification) => {
    openRejectModalForEdit(verification);
  }, [openRejectModalForEdit]);

  const columns = [
    {
      header: 'Landlord',
      accessorKey: 'landlord',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold">{row.original.landlordName}</div>
          <div className="text-sm text-gray-500">
            {row.original.landlordEmail}
          </div>
        </div>
      ),
    },
    {
      header: 'Document Type',
      accessorKey: 'documentType',
      cell: ({ row }) => {
        const docType = DOCUMENT_TYPES.find(dt => dt.value === row.original.documentType);
        return docType?.label || row.original.documentType;
      },
    },
    {
      header: 'Property',
      accessorKey: 'property',
      cell: ({ row }) => row.original.property ? (row.original.property.propertyName || row.original.property.addressLine1) : '-',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => renderStatus(row.original.status, { customColors: STATUS_COLORS }),
    },
    {
      header: 'Uploaded',
      accessorKey: 'uploadedAt',
      cell: ({ row }) => renderDate(row.original.uploadedAt),
    },
    {
      header: 'Actions',
      accessorKey: 'actions',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            color="light"
            onClick={() => handleViewDocument(row.original)}
          >
            <HiEye className="mr-2 h-4 w-4" />
            View
          </Button>
          {row.original.status === 'PENDING' && (
            <>
              <Button
                color="success"
                onClick={() => handleVerifyClick(row.original)}
              >
                <HiCheck className="mr-2 h-4 w-4" />
                Verify
              </Button>
              <Button
                color="failure"
                onClick={() => handleRejectClick(row.original)}
              >
                <HiX className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Get unique landlords for filter
  const landlords = pmcRelationships.map(rel => ({
    id: rel.id,
    name: `${rel.landlord.firstName} ${rel.landlord.lastName}`,
  }));

  const statsData = [
    {
      title: 'Total Documents',
      value: stats.total,
      prefix: <HiDocument className="h-5 w-5" />,
    },
    {
      title: 'Pending Review',
      value: stats.pending,
      prefix: <HiClock className="h-5 w-5" />,
      valueStyle: { color: '#faad14' },
    },
    {
      title: 'Verified',
      value: stats.verified,
      prefix: <HiCheckCircle className="h-5 w-5" />,
      valueStyle: { color: '#52c41a' },
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      prefix: <HiXCircle className="h-5 w-5" />,
      valueStyle: { color: '#ff4d4f' },
    },
  ];

  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: >{
        { label: 'All Status', value: 'all' },
        { label: 'Pending', value: 'PENDING' },
        { label: 'Verified', value: 'VERIFIED' },
        { label: 'Rejected', value: 'REJECTED' },
      ],
    },
    {
      key: 'landlord',
      label: 'Landlord',
      type: 'select',
      options: >{
        { label: 'All Landlords', value: 'all' },
        ...landlords.map(landlord => ({
          label: landlord.name,
          value: landlord.id,
        })),
      ],
    },
  ];

  const activeFilters = {
    status: statusFilter || 'all',
    landlord: landlordFilter || 'all',
  };

  return (
    <PageLayout
      headerTitle={<><HiDocument className="inline mr-2" /> Property Ownership Verification</>}
      stats={statsData}
      statsCols={4}
      contentStyle={{ maxWidth: 1400, margin: '0 auto', padding: 0, display: 'flex', flexDirection: 'column' }}
    >
      <FilterBar
        filters={filterConfig}
        activeFilters={activeFilters}
        onFilterChange={(newFilters) => {
          if (newFilters.status !== undefined) {
            setStatusFilter(newFilters.status || 'all');
          }
          if (newFilters.landlord !== undefined) {
            setLandlordFilter(newFilters.landlord || 'all');
          }
        }}
        onReset={() => {
          setStatusFilter('all');
          setLandlordFilter('all');
        }}
        showSearch={false}
      />

      {/* Documents Table */}
      <TableWrapper>
        {filteredVerifications.length === 0 ? (
          <EmptyState
            icon={<HiDocument className="h-12 w-12 text-gray-400" />}
            title="No verification documents found"
            description="No verification documents match the current filters"
          />
        ) : (
          <FlowbiteTable
            data={filteredVerifications}
            columns={columns}
            keyField="id"
            pagination={{ pageSize: 20 }}
          />
        )}
      </TableWrapper>

      {/* View Document Modal */}
      <Modal
        show={viewModalVisible}
        onClose={closeViewModal}
        size="xl"
      >
        <Modal.Header>Verification Document Details</Modal.Header>
        <Modal.Body>
          {selectedVerification && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold mb-1">Landlord:</div>
                  <div>{selectedVerification.landlordName}</div>
                  <div className="text-sm text-gray-500">
                    {selectedVerification.landlordEmail}
                  </div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Status:</div>
                  <div>
                    <Badge color={STATUS_COLORS[selectedVerification.status} icon={STATUS_ICONS[selectedVerification.status}>
                      {selectedVerification.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="font-semibold mb-1">Document Type:</div>
                  <div>
                    {DOCUMENT_TYPES.find(dt => dt.value === selectedVerification.documentType)?.label || selectedVerification.documentType}
                  </div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Uploaded:</div>
                  <div>{new Date(selectedVerification.uploadedAt).toLocaleString()}</div>
                </div>
              </div>

              {selectedVerification.property && (
                <div>
                  <div className="font-semibold mb-1">Property:</div>
                  <div>
                    {selectedVerification.property.propertyName || selectedVerification.property.addressLine1}
                  </div>
                </div>
              )}

              {selectedVerification.documentNumber && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-semibold mb-1">Document Number:</div>
                    <div>{selectedVerification.documentNumber}</div>
                  </div>
                  {selectedVerification.issuedBy && (
                    <div>
                      <div className="font-semibold mb-1">Issued By:</div>
                      <div>{selectedVerification.issuedBy}</div>
                    </div>
                  )}
                </div>
              )}

              {selectedVerification.notes && (
                <div>
                  <div className="font-semibold mb-1">Notes from Landlord:</div>
                  <div>{selectedVerification.notes}</div>
                </div>
              )}

              {selectedVerification.status === 'VERIFIED' && (
                <Alert color="success">
                  <div>
                    <div className="font-semibold mb-2">Verified</div>
                    <div>Verified by: {selectedVerification.verifiedByName}</div>
                    <div>Verified at: {new Date(selectedVerification.verifiedAt).toLocaleString()}</div>
                    {selectedVerification.verificationNotes && (
                      <div className="mt-2">
                        <div className="font-semibold">Notes:</div>
                        <div>{selectedVerification.verificationNotes}</div>
                      </div>
                    )}
                  </div>
                </Alert>
              )}

              {selectedVerification.status === 'REJECTED' && (
                <Alert color="failure">
                  <div>
                    <div className="font-semibold mb-2">Rejected</div>
                    <div>Rejected by: {selectedVerification.rejectedByName}</div>
                    <div>Rejected at: {new Date(selectedVerification.rejectedAt).toLocaleString()}</div>
                    {selectedVerification.rejectionReason && (
                      <div className="mt-2">
                        <div className="font-semibold">Reason:</div>
                        <div>{selectedVerification.rejectionReason}</div>
                      </div>
                    )}
                  </div>
                </Alert>
              )}

              <div className="mt-4">
                <Button
                  color="blue"
                  href={`/api/ownership-verification/files/${selectedVerification.fileName}`}
                  target="_blank"
                >
                  <HiEye className="mr-2 h-4 w-4" />
                  View Document
                </Button>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          {selectedVerification?.status === 'PENDING' && (
            <>
              <Button
                color="failure"
                onClick={() => {
                  closeViewModal();
                  handleRejectClick(selectedVerification);
                }}
              >
                <HiX className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button
                color="success"
                onClick={() => {
                  closeViewModal();
                  handleVerifyClick(selectedVerification);
                }}
              >
                <HiCheck className="mr-2 h-4 w-4" />
                Verify
              </Button>
            </>
          )}
          <Button color="gray" onClick={closeViewModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Verify Modal */}
      <StandardModal
        title="Verify Document"
        open={verifyModalVisible}
        loading={verifying}
        submitText="Verify"
        onCancel={() => {
          closeVerifyModal();
          resetVerifyForm();
        }}
        onFinish={handleVerify}
      >
        <Alert color="info" className="mb-4">
          <div>
            <div className="font-semibold mb-2">Verify this document</div>
            <div>Please review the document carefully before verifying. Once verified, the landlord will be notified.</div>
          </div>
        </Alert>
        <div>
          <Label htmlFor="verificationNotes" className="mb-2 block">Verification Notes (Optional)</Label>
          <Textarea
            id="verificationNotes"
            rows={4}
            placeholder="Add any notes about the verification (e.g., 'All information verified and matches records')"
            value={verifyFormData.verificationNotes}
            onChange={(e) => updateVerifyField('verificationNotes', e.target.value)}
          />
        </div>
      </StandardModal>

      {/* Reject Modal */}
      <StandardModal
        title="Reject Document"
        open={rejectModalVisible}
        loading={rejecting}
        submitText="Reject"
        submitColor="failure"
        onCancel={() => {
          closeRejectModal();
          resetRejectForm();
        }}
        onFinish={handleReject}
      >
        <Alert color="warning" className="mb-4">
          <div>
            <div className="font-semibold mb-2">Reject this document</div>
            <div>Please provide a clear reason for rejection. The landlord will be notified and can re-upload the document.</div>
          </div>
        </Alert>
        <div>
          <Label htmlFor="rejectionReason" className="mb-2 block">
            Rejection Reason <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="rejectionReason"
            rows={4}
            required
            placeholder="e.g., 'Property tax document is expired. Please upload current year document.'"
            value={rejectFormData.rejectionReason}
            onChange={(e) => updateRejectField('rejectionReason', e.target.value)}
          />
        </div>
      </StandardModal>
    </PageLayout>
  );
}
