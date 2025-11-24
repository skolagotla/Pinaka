/**
 * SignatureUpload Component
 * Allows landlords to upload and manage their digital signature for N4 forms
 * Supports both drawing signatures and uploading image files
 */

import { useState, useEffect, useRef } from 'react';
import { Button, Card, Alert, Tabs, TextInput, Select, Label, FileInput } from 'flowbite-react';
import { HiUpload, HiTrash, HiPencil, HiPencilAlt, HiX, HiPencil as HiFont, HiCheckCircle } from 'react-icons/hi';
import SignatureCanvas from 'react-signature-canvas';
import SignatureFontProvider from './SignatureFontProvider';
import { notify } from '@/lib/utils/notification-helper';
import Image from 'next/image';

function SignatureUploadContent() {
  const [loading, setLoading] = useState(false);
  const [signatureUrl, setSignatureUrl] = useState(null);
  const [hasSignature, setHasSignature] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const sigCanvas = useRef(null);
  
  // State for typed signature
  const [typedName, setTypedName] = useState('');
  const [selectedFont, setSelectedFont] = useState('Dancing Script');

  // Load existing signature on mount
  useEffect(() => {
    fetchSignature();
  }, []);

  const fetchSignature = async () => {
    try {
      // Use v2Api client for signature operations
      const { v2Api } = await import('@/lib/api/v2-client');
      const response = await v2Api.signatures.getSignature();
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
      notify.warning('Please draw your signature first');
      return;
    }

    setLoading(true);

    try {
      // Convert canvas to blob
      const canvas = sigCanvas.current.getCanvas();
      canvas.toBlob(async (blob) => {
        // Use v2Api client for signature upload
        const { v2Api } = await import('@/lib/api/v2-client');
        const response = await v2Api.signatures.uploadSignature(blob);
        const data = response.data || response;
        setSignatureUrl(data.signatureUrl);
        setHasSignature(true);
        notify.success('✅ Signature saved successfully');
        handleClearCanvas();
        setLoading(false);
      }, 'image/png');
    } catch (error) {
      console.error('Save error:', error);
      notify.error('Failed to save signature');
      setLoading(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setLoading(true);
    
    try {
      // Use v2Api client for signature upload
      const { v2Api } = await import('@/lib/api/v2-client');
      const response = await v2Api.signatures.uploadSignature(file);
      const data = response.data || response;
      setSignatureUrl(data.signatureUrl);
      setHasSignature(true);
      notify.success('✅ Signature uploaded successfully');
    } catch (error) {
      console.error('[SignatureUpload] Error uploading signature:', error);
      notify.error(error.message || 'Failed to upload signature');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    
    try {
      // Use v2Api client for signature deletion
      const { v2Api } = await import('@/lib/api/v2-client');
      await v2Api.signatures.deleteSignature();

      setSignatureUrl(null);
      setHasSignature(false);
      notify.success('✅ Signature removed successfully');
    } catch (error) {
      console.error('[SignatureUpload] Error deleting signature:', error);
      notify.error(error.message || 'Failed to delete signature');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTypedSignature = async () => {
    if (!typedName.trim()) {
      notify.warning('Please enter your name');
      return;
    }

    setLoading(true);

    try {
      // Create a canvas with dimensions optimized for signature sizing
      const canvas = document.createElement('canvas');
      canvas.width = 500;
      canvas.height = 150;
      const ctx = canvas.getContext('2d');

      // Set background to white
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Set text properties
      ctx.fillStyle = 'black';
      ctx.font = `50px "${selectedFont}", cursive`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Draw the text
      ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);

      // Convert canvas to blob
      canvas.toBlob(async (blob) => {
        // Use v2Api client for signature upload
        const { v2Api } = await import('@/lib/api/v2-client');
        const response = await v2Api.signatures.uploadSignature(blob);
        const data = response.data || response;
        setSignatureUrl(data.signatureUrl);
        setHasSignature(true);
        notify.success('✅ Signature saved successfully');
        setTypedName('');
        setLoading(false);
      }, 'image/png');
    } catch (error) {
      console.error('Save error:', error);
      notify.error('Failed to save signature');
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

  return (
    <div>
      <div className="mb-6">
        <h4 className="text-xl font-semibold mb-2 flex items-center gap-2">
          <HiPencil className="h-5 w-5 text-blue-600" />
          Digital Signature
        </h4>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Create or upload your signature to automatically sign N4 forms. Your signature will be added to all generated N4 notices with a professional DocuSign-like experience.
        </p>
      </div>

      {hasSignature && signatureUrl ? (
        <Card className="mt-6 border-2 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HiCheckCircle className="h-5 w-5 text-green-500" />
              <h5 className="font-semibold">Signature Active</h5>
            </div>
            <div className="flex items-center gap-2">
              <Button
                color="light"
                onClick={() => {
                  setHasSignature(false);
                  setActiveTab(0);
                }}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <HiPencil className="h-4 w-4" />
                Replace
              </Button>
              <Button
                color="failure"
                onClick={handleDelete}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <HiTrash className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
          <div className="text-left p-6">
            <div className="w-60 h-20 border border-gray-300 rounded-lg p-2 bg-white flex items-center justify-start relative overflow-hidden">
              <img
                src={signatureUrl}
                alt="Your Signature"
                className="max-w-full max-h-full object-contain object-left-center"
              />
            </div>
            <Alert color="success" className="mt-4">
              <div>
                <p className="font-semibold">Signature Ready</p>
                <p className="text-sm mt-1">
                  Your signature will be automatically placed on all N4 forms when you download them. The signing process includes a guided review and confirmation step.
                </p>
              </div>
            </Alert>
          </div>
        </Card>
      ) : (
        <Card className="mt-6">
          <Tabs aria-label="Signature creation tabs" style="underline" onActiveTabChange={setActiveTab}>
            <Tabs.Item active={activeTab === 0} title={
              <span className="flex items-center gap-2">
                <HiFont className="h-4 w-4" />
                Type Signature
              </span>
            }>
              <div className="p-4">
                <Alert color="info" className="mb-4">
                  <div>
                    <p className="font-semibold">Type Your Signature</p>
                    <p className="text-sm mt-1">
                      Enter your name and choose a font style. Your signature will be generated automatically in your selected font.
                    </p>
                  </div>
                </Alert>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="typedName" className="mb-2 block font-semibold">
                      Enter Your Name:
                    </Label>
                    <TextInput
                      id="typedName"
                      type="text"
                      placeholder="e.g., John Smith"
                      value={typedName}
                      onChange={(e) => setTypedName(e.target.value)}
                      maxLength={50}
                      sizing="lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="fontSelect" className="mb-2 block font-semibold">
                      Choose Font Style:
                    </Label>
                    <Select
                      id="fontSelect"
                      value={selectedFont}
                      onChange={(e) => setSelectedFont(e.target.value)}
                      sizing="lg"
                    >
                      {signatureFonts.map(font => (
                        <option key={font.value} value={font.value}>{font.label}</option>
                      ))}
                    </Select>
                  </div>

                  {typedName && (
                    <div>
                      <Label className="mb-2 block font-semibold">Preview:</Label>
                      <div className="border border-gray-300 rounded-lg bg-white p-8 text-center">
                        <div
                          className="text-5xl text-black"
                          style={{ fontFamily: `"${selectedFont}", cursive` }}
                        >
                          {typedName}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="text-center mt-4">
                    <Button
                      color="blue"
                      onClick={handleSaveTypedSignature}
                      disabled={loading || !typedName.trim()}
                      size="lg"
                      className="flex items-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <HiPencil className="h-4 w-4" />
                          Save Signature
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    💡 Tip: Try different fonts to find the style that best represents your signature.
                  </p>
                </div>
              </div>
            </Tabs.Item>

            <Tabs.Item active={activeTab === 1} title={
              <span className="flex items-center gap-2">
                <HiPencilAlt className="h-4 w-4" />
                Draw Signature
              </span>
            }>
              <div className="p-4">
                <Alert color="info" className="mb-4">
                  <div>
                    <p className="font-semibold">Draw Your Signature</p>
                    <p className="text-sm mt-1">
                      Use your mouse, touchpad, or stylus to sign your name below. For best results, sign naturally as you would on paper.
                    </p>
                  </div>
                </Alert>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg bg-white p-4 text-center">
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

                <div className="mt-4 text-center flex justify-center gap-2">
                  <Button
                    color="light"
                    onClick={handleClearCanvas}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <HiX className="h-4 w-4" />
                    Clear
                  </Button>
                  <Button
                    color="blue"
                    onClick={handleSaveDrawnSignature}
                    disabled={loading}
                    size="lg"
                    className="flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <HiPencil className="h-4 w-4" />
                        Save Signature
                      </>
                    )}
                  </Button>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    💡 Tip: Sign naturally as you would on paper. You can clear and redraw as many times as needed.
                  </p>
                </div>
              </div>
            </Tabs.Item>

            <Tabs.Item active={activeTab === 2} title={
              <span className="flex items-center gap-2">
                <HiUpload className="h-4 w-4" />
                Upload Image
              </span>
            }>
              <div className="p-4">
                <Alert color="info" className="mb-4">
                  <div>
                    <p className="font-semibold">Upload Signature Image</p>
                    <p className="text-sm mt-1">
                      Upload a PNG, JPG, or GIF file (max 5MB). For best results, use a scanned image of your handwritten signature.
                    </p>
                  </div>
                </Alert>
                
                <div className="text-center py-6">
                  <FileInput
                    accept="image/png,image/jpeg,image/jpg,image/gif"
                    onChange={handleUpload}
                    disabled={loading}
                    helperText="Choose a signature image file (PNG, JPG, or GIF, max 5MB)"
                  />
                </div>

                <Card className="bg-gray-50 dark:bg-gray-800">
                  <h6 className="font-semibold mb-2">📝 Preparation Tips</h6>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Sign your name on white paper with a dark pen</li>
                    <li>Take a clear photo or scan it</li>
                    <li>Crop the image to show only your signature</li>
                    <li>For best quality, use a transparent PNG file</li>
                  </ul>
                </Card>
              </div>
            </Tabs.Item>
          </Tabs>
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
