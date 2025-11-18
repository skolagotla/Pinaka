"use client";

import { useState, useCallback } from 'react';
import {
  Typography,
  Table,
  Tag,
  Button,
  Upload,
  Form,
  Select,
  DatePicker,
  Input,
  Space,
  Alert,
  Empty,
  Tooltip,
} from 'antd';
import { StandardModal, FormTextInput, FormSelect, FormDatePicker, PageLayout, TableWrapper, StatCard } from '@/components/shared';
import { renderStatus, renderDate } from '@/components/shared/TableRenderers';
import { STANDARD_COLUMNS, customizeColumn } from '@/lib/constants/standard-columns';
import { notify } from '@/lib/utils/notification-helper';
import { useLoading } from '@/lib/hooks/useLoading';
import { rules } from '@/lib/utils/validation-rules';
import {
  UploadOutlined,
  FileOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

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

export default function VerificationClient({ user, pmcRelationships }) {
  const [form] = Form.useForm();
  const { isOpen: uploadModalVisible, open: openUploadModal, close: closeUploadModal, openForCreate: openUploadModalForCreate } = useModalState();
  const { isOpen: viewModalVisible, open: openViewModal, close: closeViewModal, editingItem: selectedVerification, openForEdit: openViewModalForEdit } = useModalState();
  const [selectedRelationship, setSelectedRelationship] = useState(null);
  const { loading: uploading, withLoading: withUploading } = useLoading();
  const [fileList, setFileList] = useState([]);
  const { fetch } = useUnifiedApi({ showUserMessage: true });

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
    try {
      const values = await form.validateFields();
      if (fileList.length === 0) {
        notify.error('Please select a file to upload');
        return;
      }

      await withUploading(async () => {
        const formData = new FormData();
        formData.append('pmcLandlordId', selectedRelationship.id);
        formData.append('documentType', values.documentType);
        if (values.propertyId) formData.append('propertyId', values.propertyId);
        if (values.expirationDate) formData.append('expirationDate', values.expirationDate.format('YYYY-MM-DD'));
        if (values.documentNumber) formData.append('documentNumber', values.documentNumber);
        if (values.issuedBy) formData.append('issuedBy', values.issuedBy);
        if (values.issuedDate) formData.append('issuedDate', values.issuedDate.format('YYYY-MM-DD'));
        if (values.notes) formData.append('notes', values.notes);
        formData.append('file', fileList[0].originFileObj);

        const response = await fetch(
          '/api/ownership-verification/upload',
          {
            method: 'POST',
            body: formData,
          },
          { operation: 'Upload verification document', showUserMessage: true }
        );

        if (response.ok) {
          notify.success('Document uploaded successfully');
          closeUploadModal();
          form.resetFields();
          setFileList([]);
          // Reload page to refresh data
          window.location.reload();
        }
      });
    } catch (error) {
      console.error('[Verification Upload] Error:', error);
    }
  }, [form, fileList, selectedRelationship, fetch]);

  const handleViewDocument = useCallback(async (verification) => {
    openViewModalForEdit(verification);
  }, [openViewModalForEdit]);

  const columns = [
    customizeColumn(STANDARD_COLUMNS.TYPE, {
      title: 'Document Type',
      dataIndex: 'documentType',
      render: (type) => {
        const docType = DOCUMENT_TYPES.find(dt => dt.value === type);
        return docType?.label || type;
      },
    }),
    {
      title: 'PMC',
      dataIndex: 'pmcName',
      key: 'pmcName',
    },
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
      title: 'Verified/Rejected',
      key: 'verifiedAt',
      render: (_, record) => {
        if (record.status === 'VERIFIED' && record.verifiedAt) {
          return renderDate(record.verifiedAt);
        }
        if (record.status === 'REJECTED' && record.rejectedAt) {
          return renderDate(record.rejectedAt);
        }
        return <Text type="secondary">—</Text>;
      },
    },
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
          {record.status === 'REJECTED' && (
            <Button
              type="link"
              icon={<UploadOutlined />}
              onClick={() => {
                setSelectedRelationship(pmcRelationships.find(r => r.id === record.relationshipId));
                form.setFieldsValue({
                  documentType: record.documentType,
                  propertyId: record.propertyId,
                });
                openUploadModalForCreate();
              }}
            >
              Re-upload
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Get properties for property selector
  const getPropertiesForRelationship = (relationshipId) => {
    // This would need to fetch properties from the relationship
    // For now, return empty array - can be enhanced
    return [];
  };

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

  return (
    <PageLayout
      headerTitle={<><FileOutlined /> Property Ownership Verification</>}
      headerActions={[
        pmcRelationships.length > 0 && (
          <Button
            key="upload"
            type="primary"
            icon={<UploadOutlined />}
            onClick={() => {
              if (pmcRelationships.length === 1) {
                setSelectedRelationship(pmcRelationships[0]);
                form.setFieldsValue({ pmcRelationshipId: pmcRelationships[0].id });
              }
              openUploadModalForCreate();
            }}
          >
            Upload Document
          </Button>
        ),
      ]}
      stats={pmcRelationships.length > 0 ? statsData : []}
      statsCols={4}
      contentStyle={{ maxWidth: 1400, margin: '0 auto' }}
    >
      {pmcRelationships.length === 0 ? (
        <Alert
          message="No PMC Relationship"
          description="You are not currently managed by a Property Management Company. Verification documents are only required when you have an active PMC relationship."
          type="info"
          showIcon
        />
      ) : (
        <TableWrapper>
          {allVerifications.length === 0 ? (
            <Empty
              description="No verification documents uploaded yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => openUploadModalForCreate()}
              >
                Upload Your First Document
              </Button>
            </Empty>
          ) : (
            <Table
              dataSource={allVerifications}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          )}
        </TableWrapper>
      )}

      {/* Upload Modal */}
      <StandardModal
        title="Upload Verification Document"
        open={uploadModalVisible}
        form={form}
        loading={uploading}
        submitText="Upload"
        onCancel={() => {
          closeUploadModal();
          form.resetFields();
          setFileList([]);
        }}
        onFinish={handleUpload}
        width={600}
      >
          {pmcRelationships.length > 1 ? (
            <Form.Item
              name="pmcRelationshipId"
              label="PMC"
              rules={[rules.required('PMC')]}
            >
              <Select
                placeholder="Select PMC"
                onChange={(value) => {
                  setSelectedRelationship(pmcRelationships.find(r => r.id === value));
                }}
              >
                {pmcRelationships.map(rel => (
                  <Select.Option key={rel.id} value={rel.id}>
                    {rel.pmc.companyName}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <Form.Item label="PMC">
              <Input
                value={selectedRelationship?.pmc?.companyName || ''}
                disabled
              />
            </Form.Item>
          )}

        <FormSelect
          name="documentType"
          label="Document Type"
          required
          options={DOCUMENT_TYPES.map(dt => ({
            label: dt.label,
            value: dt.value
          }))}
          placeholder="Select document type"
        />

        <FormSelect
          name="propertyId"
          label="Property (Optional)"
          tooltip="Leave blank if this document applies to all properties"
          options={[]}
          allowClear
          placeholder="Select property (optional)"
        />

          <Form.Item
            name="file"
            label="Document File"
            rules={[rules.required('Document file')]}
          >
            <Upload
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Select File</Button>
            </Upload>
          </Form.Item>
          <Form.Item label=" " colon={false}>
            <Text type="secondary" style={{ display: 'block' }}>
              Accepted formats: PDF, JPEG, PNG, WebP (Max 10MB)
            </Text>
          </Form.Item>

        <FormDatePicker
          name="expirationDate"
          label="Expiration Date (Optional)"
        />

        <FormTextInput
          name="documentNumber"
          label="Document Number (Optional)"
          placeholder="e.g., License number, Passport number"
        />

        <FormTextInput
          name="issuedBy"
          label="Issued By (Optional)"
          placeholder="e.g., Ontario Ministry of Transportation"
        />

        <FormDatePicker
          name="issuedDate"
          label="Issued Date (Optional)"
        />

        <FormTextInput
          name="notes"
          label="Additional Notes (Optional)"
          textArea
          rows={3}
          placeholder="Any additional information about this document"
        />
      </StandardModal>

      {/* View Document Modal */}
      <Modal
        title="Verification Document Details"
        open={viewModalVisible}
        onCancel={() => {
          closeViewModal();
          // selectedVerification is managed by useModalState;
        }}
        footer={[
          <Button key="close" onClick={() => {
            closeViewModal();
            // selectedVerification is managed by useModalState;
          }}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {selectedVerification && (
          <div>
            <Row gutter={16} style={{ marginBottom: 16 }}>
              <Col span={12}>
                <Text strong>Document Type:</Text>
                <div>
                  {DOCUMENT_TYPES.find(dt => dt.value === selectedVerification.documentType)?.label || selectedVerification.documentType}
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
                <Text strong>PMC:</Text>
                <div>{selectedVerification.pmcName}</div>
              </Col>
              <Col span={12}>
                <Text strong>Uploaded:</Text>
                <div>{new Date(selectedVerification.uploadedAt).toLocaleString()}</div>
              </Col>
            </Row>

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
    </PageLayout>
  );
}

