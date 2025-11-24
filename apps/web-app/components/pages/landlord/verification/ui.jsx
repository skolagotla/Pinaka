"use client";

import { useState, useCallback } from 'react';
import {
  Button,
  Badge,
  FileInput,
  Label,
  Modal,
  Alert,
  Textarea,
  TextInput,
  Spinner,
} from 'flowbite-react';
import { StandardModal, FormTextInput, FormSelect, FormDatePicker, PageLayout, TableWrapper, FlowbiteTable, EmptyState } from '@/components/shared';
import { renderStatus, renderDate } from '@/components/shared/TableRenderers';
import { STANDARD_COLUMNS, customizeColumn } from '@/lib/constants/standard-columns';
import { notify } from '@/lib/utils/notification-helper';
import { useLoading } from '@/lib/hooks/useLoading';
import { useFormState } from '@/lib/hooks/useFormState';
import { useModalState } from '@/lib/hooks/useModalState';
import {
  HiUpload,
  HiDocument,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiEye,
} from 'react-icons/hi';
// useUnifiedApi removed - use v2Api from @/lib/api/v2-client';
import dayjs from 'dayjs';

const DOCUMENT_TYPES = [
  { value: 'GOVERNMENT_ID', label: 'Government ID (Driver\'s License/Passport)' },
  { value: 'PROPERTY_TAX', label: 'Property Tax Document' },
  { value: 'DEED_TITLE', label: 'Deed/Title Document' },
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

export default function VerificationClient({ user, pmcRelationships }) {
  const { formData, updateField, resetForm } = useFormState({
    documentType: '',
    propertyId: '',
    expirationDate: '',
    documentNumber: '',
    issuedBy: '',
    issuedDate: '',
    notes: '',
    pmcRelationshipId: '',
  });
  const { isOpen: uploadModalVisible, open: openUploadModal, close: closeUploadModal, openForCreate: openUploadModalForCreate } = useModalState();
  const { isOpen: viewModalVisible, open: openViewModal, close: closeViewModal, editingItem: selectedVerification, openForEdit: openViewModalForEdit } = useModalState();
  const [selectedRelationship, setSelectedRelationship] = useState(null);
  const { loading: uploading, withLoading: withUploading } = useLoading();
  const [selectedFile, setSelectedFile] = useState(null);
  // useUnifiedApi removed - use v2Api

  // Flatten all verifications from all relationships
  const allVerifications = pmcRelationships.flatMap(rel =>
    rel.ownershipVerifications.map(ver => ({
      ...ver,
      pmcName: rel.pmc.companyName,
      relationshipId: rel.id,
    }))
  );

  // Calculate statistics
  const stats = {
    total: allVerifications.length,
    pending: allVerifications.filter(v => v.status === 'PENDING').length,
    verified: allVerifications.filter(v => v.status === 'VERIFIED').length,
    rejected: allVerifications.filter(v => v.status === 'REJECTED').length,
  };

  const handleUpload = useCallback(async () => {
    if (!formData.documentType) {
      notify.error('Please select a document type');
      return;
    }
    if (!selectedFile) {
      notify.error('Please select a file to upload');
      return;
    }
    if (!selectedRelationship) {
      notify.error('Please select a PMC relationship');
      return;
    }

    await withUploading(async () => {
      const formDataObj = new FormData();
      formDataObj.append('pmcLandlordId', selectedRelationship.id);
      formDataObj.append('documentType', formData.documentType);
      if (formData.propertyId) formDataObj.append('propertyId', formData.propertyId);
      if (formData.expirationDate) formDataObj.append('expirationDate', formData.expirationDate);
      if (formData.documentNumber) formDataObj.append('documentNumber', formData.documentNumber);
      if (formData.issuedBy) formDataObj.append('issuedBy', formData.issuedBy);
      if (formData.issuedDate) formDataObj.append('issuedDate', formData.issuedDate);
      if (formData.notes) formDataObj.append('notes', formData.notes);
      formDataObj.append('file', selectedFile);

      const response = await fetch(
        '/api/ownership-verification/upload',
        {
          method: 'POST',
          body: formDataObj,
        },
        { operation: 'Upload verification document', showUserMessage: true }
      );

      if (response.ok) {
        notify.success('Document uploaded successfully');
        closeUploadModal();
        resetForm();
        setSelectedFile(null);
        // Reload page to refresh data
        window.location.reload();
      }
    });
  }, [formData, selectedFile, selectedRelationship, fetch, withUploading, closeUploadModal, resetForm]);

  const handleViewDocument = useCallback(async (verification) => {
    openViewModalForEdit(verification);
  }, [openViewModalForEdit]);

  const columns = [
    {
      header: 'Document Type',
      accessorKey: 'documentType',
      cell: ({ row }) => {
        const docType = DOCUMENT_TYPES.find(dt => dt.value === row.original.documentType);
        return docType?.label || row.original.documentType;
      },
    },
    {
      header: 'PMC',
      accessorKey: 'pmcName',
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
      header: 'Verified/Rejected',
      accessorKey: 'verifiedAt',
      cell: ({ row }) => {
        if (row.original.status === 'VERIFIED' && row.original.verifiedAt) {
          return renderDate(row.original.verifiedAt);
        }
        if (row.original.status === 'REJECTED' && row.original.rejectedAt) {
          return renderDate(row.original.rejectedAt);
        }
        return <span className="text-gray-400">—</span>;
      },
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
          {row.original.status === 'REJECTED' && (
            <Button
              color="light"
              onClick={() => {
                setSelectedRelationship(pmcRelationships.find(r => r.id === row.original.relationshipId));
                updateField('documentType', row.original.documentType);
                updateField('propertyId', row.original.propertyId || '');
                openUploadModalForCreate();
              }}
            >
              <HiUpload className="mr-2 h-4 w-4" />
              Re-upload
            </Button>
          )}
        </div>
      ),
    },
  ];

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

  return (
    <PageLayout
      headerTitle={<><HiDocument className="inline mr-2" /> Property Ownership Verification</>}
      headerActions={
        pmcRelationships.length > 0 && (
          <Button
            key="upload"
            color="blue"
            onClick={() => {
              if (pmcRelationships.length === 1) {
                setSelectedRelationship(pmcRelationships[0]);
                updateField('pmcRelationshipId', pmcRelationships[0].id);
              }
              openUploadModalForCreate();
            }}
          >
            <HiUpload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        ),
      }
      stats={pmcRelationships.length > 0 ? statsData : [}
      statsCols={4}
      contentStyle={{ maxWidth: 1400, margin: '0 auto' }}
    >
      {pmcRelationships.length === 0 ? (
        <Alert color="info">
          <div>
            <div className="font-semibold mb-2">No PMC Relationship</div>
            <div>You are not currently managed by a Property Management Company. Verification documents are only required when you have an active PMC relationship.</div>
          </div>
        </Alert>
      ) : (
        <TableWrapper>
          {allVerifications.length === 0 ? (
            <EmptyState
              icon={<HiDocument className="h-12 w-12 text-gray-400" />}
              title="No verification documents uploaded yet"
              description="Upload your first verification document to get started"
            >
              <Button
                color="blue"
                onClick={() => openUploadModalForCreate()}
              >
                <HiUpload className="mr-2 h-4 w-4" />
                Upload Your First Document
              </Button>
            </EmptyState>
          ) : (
            <FlowbiteTable
              data={allVerifications}
              columns={columns}
              keyField="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </TableWrapper>
      )}

      {/* Upload Modal */}
      <StandardModal
        title="Upload Verification Document"
        open={uploadModalVisible}
        loading={uploading}
        submitText="Upload"
        onCancel={() => {
          closeUploadModal();
          resetForm();
          setSelectedFile(null);
        }}
        onFinish={handleUpload}
        width={600}
      >
        {pmcRelationships.length > 1 ? (
          <FormSelect
            name="pmcRelationshipId"
            label="PMC"
            required
            value={formData.pmcRelationshipId}
            onChange={(e) => {
              updateField('pmcRelationshipId', e.target.value);
              setSelectedRelationship(pmcRelationships.find(r => r.id === e.target.value));
            }}
            options={pmcRelationships.map(rel => ({
              label: rel.pmc.companyName,
              value: rel.id
            }))}
            placeholder="Select PMC"
          />
        ) : (
          <div>
            <Label htmlFor="pmc-display" className="mb-2 block">PMC</Label>
            <TextInput
              id="pmc-display"
              value={selectedRelationship?.pmc?.companyName || ''}
              disabled
            />
          </div>
        )}

        <FormSelect
          name="documentType"
          label="Document Type"
          required
          value={formData.documentType}
          onChange={(e) => updateField('documentType', e.target.value)}
          options={DOCUMENT_TYPES.map(dt => ({
            label: dt.label,
            value: dt.value
          }))}
          placeholder="Select document type"
        />

        <FormSelect
          name="propertyId"
          label="Property (Optional)"
          value={formData.propertyId}
          onChange={(e) => updateField('propertyId', e.target.value)}
          options={[}
          placeholder="Select property (optional)"
        />

        <div>
          <Label htmlFor="file" className="mb-2 block">
            Document File <span className="text-red-500">*</span>
          </Label>
          <FileInput
            id="file"
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
          <p className="mt-1 text-sm text-gray-500">
            Accepted formats: PDF, JPEG, PNG, WebP (Max 10MB)
          </p>
        </div>

        <FormDatePicker
          name="expirationDate"
          label="Expiration Date (Optional)"
          value={formData.expirationDate}
          onChange={(e) => updateField('expirationDate', e.target.value)}
        />

        <FormTextInput
          name="documentNumber"
          label="Document Number (Optional)"
          placeholder="e.g., License number, Passport number"
          value={formData.documentNumber}
          onChange={(e) => updateField('documentNumber', e.target.value)}
        />

        <FormTextInput
          name="issuedBy"
          label="Issued By (Optional)"
          placeholder="e.g., Ontario Ministry of Transportation"
          value={formData.issuedBy}
          onChange={(e) => updateField('issuedBy', e.target.value)}
        />

        <FormDatePicker
          name="issuedDate"
          label="Issued Date (Optional)"
          value={formData.issuedDate}
          onChange={(e) => updateField('issuedDate', e.target.value)}
        />

        <div>
          <Label htmlFor="notes" className="mb-2 block">Additional Notes (Optional)</Label>
          <Textarea
            id="notes"
            rows={3}
            placeholder="Any additional information about this document"
            value={formData.notes}
            onChange={(e) => updateField('notes', e.target.value)}
          />
        </div>
      </StandardModal>

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
                  <div className="font-semibold mb-1">Document Type:</div>
                  <div>
                    {DOCUMENT_TYPES.find(dt => dt.value === selectedVerification.documentType)?.label || selectedVerification.documentType}
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
                  <div className="font-semibold mb-1">PMC:</div>
                  <div>{selectedVerification.pmcName}</div>
                </div>
                <div>
                  <div className="font-semibold mb-1">Uploaded:</div>
                  <div>{new Date(selectedVerification.uploadedAt).toLocaleString()}</div>
                </div>
              </div>

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
          <Button color="gray" onClick={closeViewModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </PageLayout>
  );
}
