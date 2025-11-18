"use client";

import { useState, useCallback } from 'react';
import {
  Typography,
  Card,
  Table,
  Tag,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Alert,
  Empty,
  Row,
  Col,
  Statistic,
  Select,
  Tooltip,
} from 'antd';
import { StandardModal, FormTextInput, FormSelect, PageLayout, TableWrapper, FilterBar } from '@/components/shared';
import { renderStatus, renderDate } from '@/components/shared/TableRenderers';
import { STANDARD_COLUMNS, customizeColumn } from '@/lib/constants/standard-columns';
import { notify } from '@/lib/utils/notification-helper';
import { useLoading } from '@/lib/hooks/useLoading';
import {
  FileOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  CheckOutlined,
  StopOutlined,
} from '@ant-design/icons';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import { useModalState } from '@/lib/hooks/useModalState';

const { Text } = Typography;
const { TextArea } = Input;

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
  PENDING: 'orange',
  VERIFIED: 'green',
  REJECTED: 'red',
  EXPIRED: 'default',
};

const STATUS_ICONS = {
  PENDING: <ClockCircleOutlined />,
  VERIFIED: <CheckCircleOutlined />,
  REJECTED: <CloseCircleOutlined />,
  EXPIRED: <ClockCircleOutlined />,
};

export default function VerificationClient({ pmc, pmcRelationships }) {
  const [verifyForm] = Form.useForm();
  const [rejectForm] = Form.useForm();
  const { isOpen: viewModalVisible, open: openViewModal, close: closeViewModal, editingItem: selectedVerification, openForEdit: openViewModalForEdit } = useModalState();
  const { isOpen: verifyModalVisible, open: openVerifyModal, close: closeVerifyModal, openForEdit: openVerifyModalForEdit } = useModalState();
  const { isOpen: rejectModalVisible, open: openRejectModal, close: closeRejectModal, openForEdit: openRejectModalForEdit } = useModalState();
  const [statusFilter, setStatusFilter] = useState('all');
  const [landlordFilter, setLandlordFilter] = useState('all');
  const { loading: verifying, withLoading: withVerifying } = useLoading();
  const { loading: rejecting, withLoading: withRejecting } = useLoading();
  const { fetch } = useUnifiedApi({ showUserMessage: true });

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

  const handleVerify = useCallback(async (values) => {
    await withVerifying(async () => {
      try {
        const response = await fetch(
          `/api/ownership-verification/${selectedVerification.id}/verify`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              verificationNotes: values.verificationNotes || null,
            }),
          },
          { operation: 'Verify document', showUserMessage: true }
        );

        if (response.ok) {
          notify.success('Document verified successfully');
          closeVerifyModal();
          verifyForm.resetFields();
          // selectedVerification is managed by useModalState;
          // Reload page to refresh data
          window.location.reload();
        }
      } catch (error) {
        console.error('[Verification Verify] Error:', error);
      }
    });
  }, [verifyForm, selectedVerification, fetch, withVerifying]);

  const handleReject = useCallback(async (values) => {
    await withRejecting(async () => {
      try {
        const response = await fetch(
          `/api/ownership-verification/${selectedVerification.id}/reject`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              rejectionReason: values.rejectionReason,
            }),
          },
          { operation: 'Reject document', showUserMessage: true }
        );

        if (response.ok) {
          notify.success('Document rejected');
          closeRejectModal();
          rejectForm.resetFields();
          // selectedVerification is managed by useModalState;
          // Reload page to refresh data
          window.location.reload();
        }
      } catch (error) {
        console.error('[Verification Reject] Error:', error);
      }
    });
  }, [rejectForm, selectedVerification, fetch, withRejecting]);

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
      title: 'Landlord',
      key: 'landlord',
      render: (_, record) => (
        <div>
          <Text strong>{record.landlordName}</Text>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {record.landlordEmail}
          </div>
        </div>
      ),
    },
    customizeColumn(STANDARD_COLUMNS.TYPE, {
      title: 'Document Type',
      dataIndex: 'documentType',
      render: (type) => {
        const docType = DOCUMENT_TYPES.find(dt => dt.value === type);
        return docType?.label || type;
      },
    }),
    customizeColumn(STANDARD_COLUMNS.PROPERTY_NAME, {
      title: 'Property',
      dataIndex: 'property',
      render: (property) => property ? property.propertyName || property.addressLine1 : '-',
    }),
    customizeColumn(STANDARD_COLUMNS.STATUS, {
      render: (status) => renderStatus(status, { customColors: STATUS_COLORS }),
    }),
    customizeColumn(STANDARD_COLUMNS.UPLOADED_DATE, {
      render: (_, record) => renderDate(record.uploadedAt),
    }),
    {
      ...STANDARD_COLUMNS.ACTIONS,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDocument(record)}
          >
            View
          </Button>
          {record.status === 'PENDING' && (
            <>
              <Button
                type="link"
                icon={<CheckOutlined />}
                onClick={() => handleVerifyClick(record)}
                style={{ color: '#52c41a' }}
              >
                Verify
              </Button>
              <Button
                type="link"
                icon={<StopOutlined />}
                onClick={() => handleRejectClick(record)}
                danger
              >
                Reject
              </Button>
            </>
          )}
        </Space>
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
      prefix: <FileOutlined />,
    },
    {
      title: 'Pending Review',
      value: stats.pending,
      prefix: <ClockCircleOutlined />,
      valueStyle: { color: '#faad14' },
    },
    {
      title: 'Verified',
      value: stats.verified,
      prefix: <CheckCircleOutlined />,
      valueStyle: { color: '#52c41a' },
    },
    {
      title: 'Rejected',
      value: stats.rejected,
      prefix: <CloseCircleOutlined />,
      valueStyle: { color: '#ff4d4f' },
    },
  ];

  const filterConfig = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
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
      options: [
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
      headerTitle={<><FileOutlined /> Property Ownership Verification</>}
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
          <Empty
            description="No verification documents found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            dataSource={filteredVerifications}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 20 }}
          />
        )}
      </TableWrapper>

      {/* View Document Modal */}
      <Modal
        title="Verification Document Details"
        open={viewModalVisible}
        onCancel={() => {
          closeViewModal();
          // selectedVerification is managed by useModalState;
        }}
        footer={[
          selectedVerification?.status === 'PENDING' && (
            <Button
              key="reject"
              danger
              icon={<StopOutlined />}
              onClick={() => {
                closeViewModal();
                handleRejectClick(selectedVerification);
              }}
            >
              Reject
            </Button>
          ),
          selectedVerification?.status === 'PENDING' && (
            <Button
              key="verify"
              type="primary"
              icon={<CheckOutlined />}
              onClick={() => {
                closeViewModal();
                handleVerifyClick(selectedVerification);
              }}
            >
              Verify
            </Button>
          ),
          <Button
            key="close"
            onClick={() => {
              closeViewModal();
              // selectedVerification is managed by useModalState;
            }}
          >
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedVerification && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text strong>Landlord:</Text>
                <div>{selectedVerification.landlordName}</div>
                <div style={{ fontSize: '12px', color: '#999' }}>
                  {selectedVerification.landlordEmail}
                </div>
              </Col>
              <Col span={12}>
                <Text strong>Status:</Text>
                <div>
                  <Tag icon={STATUS_ICONS[selectedVerification.status]} color={STATUS_COLORS[selectedVerification.status]}>
                    {selectedVerification.status}
                  </Tag>
                </div>
              </Col>
            </Row>

            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text strong>Document Type:</Text>
                <div>
                  {DOCUMENT_TYPES.find(dt => dt.value === selectedVerification.documentType)?.label || selectedVerification.documentType}
                </div>
              </Col>
              <Col span={12}>
                <Text strong>Uploaded:</Text>
                <div>{new Date(selectedVerification.uploadedAt).toLocaleString()}</div>
              </Col>
            </Row>

            {selectedVerification.property && (
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={24}>
                  <Text strong>Property:</Text>
                  <div>
                    {selectedVerification.property.propertyName || selectedVerification.property.addressLine1}
                  </div>
                </Col>
              </Row>
            )}

            {selectedVerification.documentNumber && (
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={12}>
                  <Text strong>Document Number:</Text>
                  <div>{selectedVerification.documentNumber}</div>
                </Col>
                {selectedVerification.issuedBy && (
                  <Col span={12}>
                    <Text strong>Issued By:</Text>
                    <div>{selectedVerification.issuedBy}</div>
                  </Col>
                )}
              </Row>
            )}

            {selectedVerification.notes && (
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col span={24}>
                  <Text strong>Notes from Landlord:</Text>
                  <div>{selectedVerification.notes}</div>
                </Col>
              </Row>
            )}

            {selectedVerification.status === 'VERIFIED' && (
              <Alert
                message="Verified"
                description={
                  <div>
                    <div>Verified by: {selectedVerification.verifiedByName}</div>
                    <div>Verified at: {new Date(selectedVerification.verifiedAt).toLocaleString()}</div>
                    {selectedVerification.verificationNotes && (
                      <div style={{ marginTop: 8 }}>
                        <Text strong>Notes:</Text>
                        <div>{selectedVerification.verificationNotes}</div>
                      </div>
                    )}
                  </div>
                }
                type="success"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {selectedVerification.status === 'REJECTED' && (
              <Alert
                message="Rejected"
                description={
                  <div>
                    <div>Rejected by: {selectedVerification.rejectedByName}</div>
                    <div>Rejected at: {new Date(selectedVerification.rejectedAt).toLocaleString()}</div>
                    {selectedVerification.rejectionReason && (
                      <div style={{ marginTop: 8 }}>
                        <Text strong>Reason:</Text>
                        <div>{selectedVerification.rejectionReason}</div>
                      </div>
                    )}
                  </div>
                }
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <div style={{ marginTop: 16 }}>
              <Button
                type="primary"
                icon={<EyeOutlined />}
                href={`/api/ownership-verification/files/${selectedVerification.fileName}`}
                target="_blank"
              >
                View Document
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Verify Modal */}
      <StandardModal
        title="Verify Document"
        open={verifyModalVisible}
        form={verifyForm}
        loading={verifying}
        submitText="Verify"
        onCancel={() => {
          closeVerifyModal();
          verifyForm.resetFields();
          // selectedVerification is managed by useModalState;
        }}
        onFinish={handleVerify}
      >
        <Alert
          message="Verify this document"
          description="Please review the document carefully before verifying. Once verified, the landlord will be notified."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <FormTextInput
          name="verificationNotes"
          label="Verification Notes (Optional)"
          textArea
          rows={4}
          placeholder="Add any notes about the verification (e.g., 'All information verified and matches records')"
        />
      </StandardModal>

      {/* Reject Modal */}
      <StandardModal
        title="Reject Document"
        open={rejectModalVisible}
        form={rejectForm}
        loading={rejecting}
        submitText="Reject"
        onCancel={() => {
          closeRejectModal();
          rejectForm.resetFields();
          // selectedVerification is managed by useModalState;
        }}
        onFinish={handleReject}
      >
        <Alert
          message="Reject this document"
          description="Please provide a clear reason for rejection. The landlord will be notified and can re-upload the document."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <FormTextInput
          name="rejectionReason"
          label="Rejection Reason"
          textArea
          rows={4}
          required
          placeholder="e.g., 'Property tax document is expired. Please upload current year document.'"
        />
      </StandardModal>
    </PageLayout>
  );
}

