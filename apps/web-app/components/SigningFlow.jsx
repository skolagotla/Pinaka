/**
 * DocuSign-like Signing Flow Component
 * Provides a guided signing experience with document preview and signature placement
 */

"use client";

import { useState, useEffect } from 'react';
import { Modal, Button, Card, Typography, Space, Alert, Progress, Divider, Row, Col, Tag, Tooltip } from 'antd';
import { CheckCircleOutlined, DownloadOutlined, CloseOutlined, EditOutlined } from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

export default function SigningFlow({
  open,
  onClose,
  formId,
  formData,
  onSignComplete,
  signatureUrl,
}) {
  const [signing, setSigning] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [signedPdfUrl, setSignedPdfUrl] = useState(null);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [landlordName, setLandlordName] = useState(null);
  const [isSigned, setIsSigned] = useState(false);
  const [enrichedFormData, setEnrichedFormData] = useState(null);

  useEffect(() => {
    if (open && formId) {
      // Reset state when modal opens
      setIsSigned(false);
      setSignedPdfUrl(null);
      setDownloadComplete(false);
      // Load PDF preview (unsigned)
      loadPDFPreview();
      // Fetch enriched form data with tenant and property info
      fetchEnrichedFormData();
      // Fetch landlord name if not in formData
      fetchLandlordName();
    }
  }, [open, formId]);

  const fetchEnrichedFormData = async () => {
    try {
      // Use v1Api client for generated forms
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.generatedForms.get(formId);
      const data = response.data || response;
      setEnrichedFormData(data.form || data);
      // Also set landlord name if available
      if ((data.form || data)?.formData?.landlordName) {
        setLandlordName((data.form || data).formData.landlordName);
      }
    } catch (error) {
      console.error('[SigningFlow] Error fetching form data:', error);
    }
  };

  const fetchLandlordName = async () => {
    // If landlord name is already in formData, use it
    if (formData?.landlordName || formData?.formData?.landlordName) {
      return;
    }
    
    try {
      // Use v1Api client for generated forms
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.generatedForms.get(formId);
      const data = response.data || response;
      if ((data.form || data)?.formData?.landlordName) {
        setLandlordName((data.form || data).formData.landlordName);
      }
    } catch (error) {
      console.error('[SigningFlow] Error fetching landlord name:', error);
    }
  };

  const loadPDFPreview = async () => {
    try {
      // Use direct fetch for preview endpoint (no v1 equivalent yet)
      const response = await fetch(
        `/api/forms/generated/${formId}/preview`,
        { credentials: 'include' }
      );
      if (!response.ok) {
        throw new Error('Failed to load PDF preview');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
    } catch (error) {
      console.error('[SigningFlow] Error loading PDF preview:', error);
      // Don't block the flow if preview fails
    }
  };


  const handleSign = async () => {
    if (!signatureUrl) {
      alert('Please set up your signature in Settings before signing documents.');
      return null;
    }
    
    setSigning(true);
    try {
      // Use v1Api client for form download
      const { v1Api } = await import('@/lib/api/v1-client');
      const blob = await v1Api.forms.downloadForm(formId);
      const url = URL.createObjectURL(blob);
      
      // Store signed PDF URL for preview and download
      setSignedPdfUrl(url);
      setIsSigned(true);
      
      // Update PDF preview to show signed version
      setPdfPreviewUrl(url);
      
      return url;
    } catch (error) {
      console.error('[SigningFlow] Error signing document:', error);
      alert(error.message || 'Failed to sign document. Please try again.');
      return null;
    } finally {
      setSigning(false);
    }
  };

  const handleDownload = async () => {
    let urlToDownload = signedPdfUrl;
    
    if (!isSigned || !urlToDownload) {
      // If not signed yet, sign first then download
      urlToDownload = await handleSign();
    }
    
    if (urlToDownload) {
      downloadFile(urlToDownload);
    } else {
      alert('Failed to prepare document for download. Please try again.');
    }
  };

  const generateFileName = () => {
    const data = enrichedFormData || formData;
    
    // Get property name (propertyName or addressLine1)
    const propertyName = data?.property?.propertyName || 
                        data?.property?.addressLine1 || 
                        data?.lease?.unit?.property?.propertyName ||
                        data?.lease?.unit?.property?.addressLine1 ||
                        data?.formData?.propertyAddress ||
                        data?.propertyAddress ||
                        'property';
    
    // Clean property name for filename (remove special characters)
    const cleanPropertyName = propertyName
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
    
    // Get unit information
    const unitName = data?.unit?.unitName || 
                   data?.lease?.unit?.unitName ||
                   data?.formData?.unitName ||
                   null;
    
    // Check if property has multiple units
    // If unitName exists and is not "Unit 1" (default for single unit), assume multiple units
    const propertyUnitCount = data?.property?.unitCount || 
                             data?.lease?.unit?.property?.unitCount ||
                             1;
    const hasMultipleUnits = propertyUnitCount > 1;
    
    // Get generation date
    const generatedDate = data?.generatedAt || 
                         data?.formData?.generatedDate || 
                         new Date().toISOString();
    const date = new Date(generatedDate);
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    
    // Format filename based on unit count
    if (hasMultipleUnits && unitName) {
      // Multiple units: unit-number-property-name-n4-date-generated.pdf
      const cleanUnitName = unitName.replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();
      return `${cleanUnitName}-${cleanPropertyName}-n4-${dateStr}.pdf`;
    } else {
      // Single unit: property-name.pdf
      return `${cleanPropertyName}.pdf`;
    }
  };

  const downloadFile = (url) => {
    try {
      // Trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = generateFileName();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setDownloadComplete(true);
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  // Get form data with fallbacks
  const getFormType = () => {
    if (formData?.formType === 'N4') {
      return 'N4 - Notice to End a Tenancy Early';
    }
    return formData?.formType || 'N/A';
  };

  const getLandlordName = () => {
    // Try formData.landlordName first, then formData.formData?.landlordName, then state
    return formData?.landlordName || formData?.formData?.landlordName || landlordName || 'N/A';
  };

  const getTenantName = () => {
    // Use enriched form data first, then fallback to formData
    const data = enrichedFormData || formData;
    
    if (data?.tenant?.firstName && data?.tenant?.lastName) {
      return `${data.tenant.firstName} ${data.tenant.lastName}`;
    }
    if (data?.tenantName) {
      return data.tenantName;
    }
    return 'N/A';
  };

  const getPropertyAddress = () => {
    // Use enriched form data first, then fallback to formData
    const data = enrichedFormData || formData;
    
    if (data?.property?.addressLine1) {
      const address = data.property.addressLine1;
      const city = data.property.city ? `, ${data.property.city}` : '';
      const province = data.property.provinceState ? `, ${data.property.provinceState}` : '';
      return `${address}${city}${province}`;
    }
    if (data?.lease?.unit?.property?.addressLine1) {
      const prop = data.lease.unit.property;
      const address = prop.addressLine1;
      const city = prop.city ? `, ${prop.city}` : '';
      const province = prop.provinceState ? `, ${prop.provinceState}` : '';
      return `${address}${city}${province}`;
    }
    if (data?.propertyAddress) {
      return data.propertyAddress;
    }
    return 'N/A';
  };

  // Simplified single-step experience - just review and download
  const content = (
    <div>
      {/* Document Information - Modern and Compact */}
      <Card 
        style={{ 
          marginBottom: 16, 
          background: '#ffffff',
          border: '1px solid #e8e8e8',
          borderRadius: 8,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}
        bodyStyle={{ padding: '16px 20px' }}
      >
        <Row gutter={[16, 8]}>
          {/* Row 1: Form Type, Generated By, and Sign button */}
          <Col span={9}>
            <Space size={4} align="center" style={{ whiteSpace: 'nowrap' }}>
              <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>Form Type:</Text>
              <Text strong style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{getFormType()}</Text>
            </Space>
          </Col>
          <Col span={9}>
            <Space size={4} align="center" style={{ whiteSpace: 'nowrap' }}>
              <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>Generated By:</Text>
              <Text strong style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{getLandlordName()}</Text>
            </Space>
          </Col>
          <Col span={6} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title={isSigned ? "Document is signed" : signatureUrl ? "Sign document" : "Please set up signature in Settings"}>
              <Button
                type={isSigned ? "default" : "primary"}
                icon={<EditOutlined />}
                onClick={handleSign}
                loading={signing}
                disabled={isSigned || !signatureUrl}
                shape="circle"
                size="small"
                style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              />
            </Tooltip>
          </Col>
          {/* Row 2: Tenant, Property, and Download button */}
          <Col span={9}>
            <Space size={4} align="center" style={{ whiteSpace: 'nowrap' }}>
              <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>Tenant:</Text>
              <Text strong style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{getTenantName()}</Text>
            </Space>
          </Col>
          <Col span={9}>
            <Space size={4} align="center" style={{ whiteSpace: 'nowrap' }}>
              <Text type="secondary" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>Property:</Text>
              <Text strong style={{ fontSize: 13, whiteSpace: 'nowrap' }}>{getPropertyAddress()}</Text>
            </Space>
          </Col>
          <Col span={6} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title={isSigned ? "Download signed document" : "Sign document first to download"}>
              <Button
                type={isSigned ? "primary" : "default"}
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                disabled={!isSigned}
                shape="circle"
                size="small"
                style={{
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isSigned ? '#52c41a' : undefined,
                  borderColor: isSigned ? '#52c41a' : undefined,
                  flexShrink: 0
                }}
              />
            </Tooltip>
          </Col>
        </Row>
      </Card>
      
      {pdfPreviewUrl && (
        <div style={{ 
          border: '2px solid #d9d9d9', 
          borderRadius: 8,
          overflow: 'hidden',
          background: '#f5f5f5',
          minHeight: 500,
          position: 'relative'
        }}>
          <iframe
            src={pdfPreviewUrl}
            style={{
              width: '100%',
              height: '500px',
              border: 'none'
            }}
            title="Document Preview"
          />
          {/* Signed Label at bottom toolbar area - between redo and download icons */}
          {isSigned && (
            <div style={{
              position: 'absolute',
              bottom: 12,
              right: 120, // Position between redo (left) and download (right) icons
              zIndex: 10
            }}>
              <Tag 
                color="#52c41a"
                style={{ 
                  margin: 0,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 4,
                  background: '#52c41a',
                  color: '#ffffff',
                  border: 'none',
                  boxShadow: '0 2px 6px rgba(82, 196, 26, 0.3)'
                }}
              >
                <CheckCircleOutlined style={{ marginRight: 4, fontSize: 11 }} />
                Signed
              </Tag>
            </div>
          )}
        </div>
      )}

      {signing && (
        <Card style={{ background: '#f0f9ff', border: '1px solid #91d5ff', marginTop: 16 }}>
          <Space direction="vertical" size="middle" style={{ width: '100%', textAlign: 'center' }}>
            <Progress type="circle" percent={75} />
            <Text strong>Signing your document...</Text>
            <Text type="secondary">This may take a few seconds</Text>
          </Space>
        </Card>
      )}
    </div>
  );

  return (
    <Modal
      open={open}
      onCancel={onClose}
      width={900}
      footer={null}
      closeIcon={<CloseOutlined />}
      title={
        <div>
          <Title level={4} style={{ margin: 0 }}>Review N4 Form</Title>
          <Text type="secondary">
            Check the document for accuracy. <Text style={{ color: '#ff4d4f' }}>*</Text>
          </Text>
        </div>
      }
    >
      {downloadComplete ? (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 24 }} />
          <Title level={3}>Document Downloaded Successfully!</Title>
          <Paragraph style={{ fontSize: 16, marginBottom: 16 }}>
            Your signed N4 form has been downloaded. This window will close automatically.
          </Paragraph>
        </div>
      ) : (
        <div style={{ minHeight: 400 }}>
          {content}
        </div>
      )}
    </Modal>
  );
}

