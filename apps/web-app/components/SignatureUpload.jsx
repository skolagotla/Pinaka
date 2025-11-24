/**
 * SignatureUpload Component
 * Allows landlords to upload and manage their digital signature for N4 forms
 * Supports both drawing signatures and uploading image files
 */

import { useState, useEffect, useRef } from 'react';
import { Upload, Button, message, Image, Card, Typography, Space, Alert, Tabs, Input, Select } from 'antd';
import { UploadOutlined, DeleteOutlined, EditOutlined, EditFilled, ClearOutlined, FontSizeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import SignatureCanvas from 'react-signature-canvas';
import SignatureFontProvider from './SignatureFontProvider';

const { Title, Text, Paragraph } = Typography;

function SignatureUploadContent() {
  const [loading, setLoading] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [activeTab, setActiveTab] = useState('type');
  const sigCanvas = useRef(null);
  const typeCanvas = useRef(null);
  
  // State for typed signature
  const [typedName, setTypedName] = useState('');
  const [selectedFont, setSelectedFont] = useState('Dancing Script');

  // Load existing signature on mount
  useEffect(() => {
    fetchSignature();
  }, []);

  const fetchSignature = async () => {
    try {
      // Use v1Api client for signature operations
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.signatures.getSignature();
      const data = response.data || response;
      setSignatureUrl(data.signatureUrl);
      setHasSignature(true);
    } catch (error) {
      console.error('[SignatureUpload] Error fetching signature:', error);
      setHasSignature(false);
    }
  };

  const handleClearCanvas = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  const handleSaveDrawnSignature = async () => {
    if (sigCanvas.current.isEmpty()) {
      message.warning('Please draw your signature first');
      return;
    }

    setLoading(true);

    try {
      // Convert canvas to blob
      const canvas = sigCanvas.current.getCanvas();
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('signature', blob, 'signature.png');

        // Use v1Api client for signature upload
        const { v1Api } = await import('@/lib/api/v1-client');
        const response = await v1Api.signatures.uploadSignature(blob);
        const data = response.data || response;
        setSignatureUrl(data.signatureUrl);
        setHasSignature(true);
        message.success('✅ Signature saved successfully');
        handleClearCanvas();
        setLoading(false);
      }, 'image/png');
    } catch (error) {
      console.error('Save error:', error);
      message.error('Failed to save signature');
      setLoading(false);
    }
  };

  const handleUpload = async ({ file }) => {
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('signature', file);

      // Use v1Api client for signature upload
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.signatures.uploadSignature(file);
      const data = response.data || response;
      setSignatureUrl(data.signatureUrl);
      setHasSignature(true);
      message.success('✅ Signature uploaded successfully');
    } catch (error) {
      console.error('[SignatureUpload] Error uploading signature:', error);
      message.error(error.message || 'Failed to upload signature');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    
    try {
      // Use v1Api client for signature deletion
      const { v1Api } = await import('@/lib/api/v1-client');
      await v1Api.signatures.deleteSignature();

      setSignatureUrl(null);
      setHasSignature(false);
      message.success('✅ Signature removed successfully');
    } catch (error) {
      console.error('[SignatureUpload] Error deleting signature:', error);
      message.error(error.message || 'Failed to delete signature');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTypedSignature = async () => {
    if (!typedName.trim()) {
      message.warning('Please enter your name');
      return;
    }

    setLoading(true);

    try {
      // Create a canvas with dimensions optimized for signature sizing
      // The API will crop white space automatically
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');

      // Set background to white
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text properties - use smaller font size for more compact signature
      // The signature will be cropped and scaled in the PDF, so smaller font = smaller final image
      ctx.fillStyle = 'black';
      ctx.font = `50px "${selectedFont}", cursive`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Draw the text
      ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        const formData = new FormData();
        formData.append('signature', blob, 'signature.png');

        // Use v1Api client for signature upload
        const { v1Api } = await import('@/lib/api/v1-client');
        const response = await v1Api.signatures.uploadSignature(blob);
        const data = response.data || response;
        setSignatureUrl(data.signatureUrl);
        setHasSignature(true);
        message.success('✅ Signature saved successfully');
        setTypedName('');
        setLoading(false);
      }, 'image/png');
    } catch (error) {
      console.error('Save error:', error);
      message.error('Failed to save signature');
      setLoading(false);
    }
  };

  // Available signature fonts
  const signatureFonts = [
    { value: 'Dancing Script', label: 'Dancing Script (Elegant)' },
    { value: 'Great Vibes', label: 'Great Vibes (Flowing)' },
    { value: 'Pacifico', label: 'Pacifico (Bold)' },
    { value: 'Allura', label: 'Allura (Graceful)' },
    { value: 'Alex Brush', label: 'Alex Brush (Classic)' },
    { value: 'Sacramento', label: 'Sacramento (Modern)' },
    { value: 'Satisfy', label: 'Satisfy (Casual)' },
    { value: 'Tangerine', label: 'Tangerine (Professional)' },
  ];

  // Tabs for drawing or uploading signature
  const signatureTabs = [
    {
      key: 'type',
      label: (
        <span>
          <FontSizeOutlined /> Type Signature
        </span>
      ),
      children: (
        <div style={{ padding: '16px' }}>
          <Alert
            message="Type Your Signature"
            description="Enter your name and choose a font style. Your signature will be generated automatically in your selected font."
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Text strong>Enter Your Name:</Text>
              <Input
                size="large"
                placeholder="e.g., John Smith"
                value={typedName}
                onChange={(e) => setTypedName(e.target.value)}
                style={{ marginTop: '8px' }}
                maxLength={50}
              />
            </div>

            <div>
              <Text strong>Choose Font Style:</Text>
              <Select
                size="large"
                value={selectedFont}
                onChange={setSelectedFont}
                style={{ width: '100%', marginTop: '8px' }}
                options={signatureFonts}
              />
            </div>

            {typedName && (
              <div>
                <Text strong>Preview:</Text>
                <div
                  style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '4px',
                    background: 'white',
                    padding: '32px',
                    textAlign: 'center',
                    marginTop: '8px',
                  }}
                >
                  <div
                    style={{
                      fontFamily: `"${selectedFont}", cursive`,
                      fontSize: '48px',
                      color: 'black',
                    }}
                  >
                    {typedName}
                  </div>
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleSaveTypedSignature}
                loading={loading}
                size="large"
                disabled={!typedName.trim()}
              >
                Save Signature
              </Button>
            </div>
          </Space>

          <div style={{ marginTop: '16px' }}>
            <Text type="secondary">
              💡 Tip: Try different fonts to find the style that best represents your signature.
            </Text>
          </div>
        </div>
      ),
    },
    {
      key: 'draw',
      label: (
        <span>
          <EditFilled /> Draw Signature
        </span>
      ),
      children: (
        <div style={{ padding: '16px' }}>
          <Alert
            message="Draw Your Signature"
            description="Use your mouse, touchpad, or stylus to sign your name below. For best results, sign naturally as you would on paper."
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          
          <div
            style={{
              border: '2px dashed #d9d9d9',
              borderRadius: '4px',
              background: 'white',
              padding: '16px',
              textAlign: 'center',
            }}
          >
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                width: 500,
                height: 200,
                className: 'signature-canvas',
                style: {
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  width: '100%',
                  maxWidth: '500px',
                  height: '200px',
                },
              }}
              backgroundColor="white"
            />
          </div>

          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <Space>
              <Button
                icon={<ClearOutlined />}
                onClick={handleClearCanvas}
                disabled={loading}
              >
                Clear
              </Button>
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleSaveDrawnSignature}
                loading={loading}
                size="large"
              >
                Save Signature
              </Button>
            </Space>
          </div>

          <div style={{ marginTop: '16px' }}>
            <Text type="secondary">
              💡 Tip: Sign naturally as you would on paper. You can clear and redraw as many times as needed.
            </Text>
          </div>
        </div>
      ),
    },
    {
      key: 'upload',
      label: (
        <span>
          <UploadOutlined /> Upload Image
        </span>
      ),
      children: (
        <div style={{ padding: '16px' }}>
          <Alert
            message="Upload Signature Image"
            description="Upload a PNG, JPG, or GIF file (max 5MB). For best results, use a scanned image of your handwritten signature."
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />
          
          <div style={{ textAlign: 'center', padding: '24px' }}>
            <Upload
              accept="image/png,image/jpeg,image/jpg,image/gif"
              showUploadList={false}
              customRequest={handleUpload}
              disabled={loading}
            >
              <Button
                type="primary"
                icon={<UploadOutlined />}
                size="large"
                loading={loading}
              >
                Choose File
              </Button>
            </Upload>
          </div>

          <Card
            title="📝 Preparation Tips"
            style={{ background: '#fafafa' }}
            size="small"
          >
            <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
              <li><Text>Sign your name on white paper with a dark pen</Text></li>
              <li><Text>Take a clear photo or scan it</Text></li>
              <li><Text>Crop the image to show only your signature</Text></li>
              <li><Text>For best quality, use a transparent PNG file</Text></li>
            </ul>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Title level={4} style={{ marginBottom: 8 }}>
          <EditOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          Digital Signature
        </Title>
        <Paragraph type="secondary" style={{ fontSize: 15 }}>
          Create or upload your signature to automatically sign N4 forms. Your signature will be added to all generated N4 notices with a professional DocuSign-like experience.
        </Paragraph>
      </div>

      {hasSignature && signatureUrl ? (
        <>
          <Card
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>Signature Active</span>
              </Space>
            }
            extra={
              <Space>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => {
                    setHasSignature(false);
                    setActiveTab('type');
                  }}
                  disabled={loading}
                >
                  Replace
                </Button>
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleDelete}
                  loading={loading}
                >
                  Remove
                </Button>
              </Space>
            }
            style={{ marginTop: '24px', border: '2px solid #52c41a' }}
          >
            <div style={{ textAlign: 'left', padding: '24px' }}>
              <div
                style={{
                  width: '240px',
                  height: '75px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  padding: '8px',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-start',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <Image
                  src={signatureUrl}
                  alt="Your Signature"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    objectPosition: 'left center',
                  }}
                  preview={false}
                />
              </div>
              <Alert
                message="Signature Ready"
                description="Your signature will be automatically placed on all N4 forms when you download them. The signing process includes a guided review and confirmation step."
                type="success"
                showIcon
                style={{ marginTop: '16px' }}
              />
            </div>
          </Card>
        </>
      ) : (
        <Card style={{ marginTop: '24px' }}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={signatureTabs}
            size="large"
          />
        </Card>
      )}
    </div>
  );
}

// Wrap with font provider to lazy load fonts only when signature component is used
export default function SignatureUpload() {
  return (
    <SignatureFontProvider>
      <SignatureUploadContent />
    </SignatureFontProvider>
  );
}

