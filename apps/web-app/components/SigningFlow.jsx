/**
 * DocuSign-like Signing Flow Component - Migrated to Flowbite UI + v2 FastAPI
 * Provides a guided signing experience with document preview and signature placement
 * 
 * NOTE: PDF preview/download endpoints need to be added to v2 backend
 */
"use client";

import { useState, useEffect } from 'react';
import { Modal, Button, Card, Progress, Badge, Alert, Spinner, Tooltip } from 'flowbite-react';
import { HiCheckCircle, HiDownload, HiX, HiPencil } from 'react-icons/hi';
import { useForm as useFormV2 } from '@/lib/hooks/useV2Data';
import { v2Api } from '@/lib/api/v2-client';
import { notify } from '@/lib/utils/notification-helper';

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

  // Load form data using v2 API
  const { data: formDataV2, isLoading: loadingForm } = useFormV2(formId || '');

  useEffect(() => {
    if (open && formId) {
      // Reset state when modal opens
      setIsSigned(false);
      setSignedPdfUrl(null);
      setDownloadComplete(false);
      
      // Load PDF preview (unsigned)
      loadPDFPreview();
      
      // Use v2 form data if available
      if (formDataV2) {
        setEnrichedFormData(formDataV2);
        if (formDataV2.template_data?.landlordName) {
          setLandlordName(formDataV2.template_data.landlordName);
        }
      } else if (formData) {
        setEnrichedFormData(formData);
        if (formData?.landlordName || formData?.formData?.landlordName) {
          setLandlordName(formData.landlordName || formData.formData?.landlordName);
        }
      }
    }
  }, [open, formId, formDataV2, formData]);

  const loadPDFPreview = async () => {
    try {
      // TODO: Add PDF preview endpoint to v2 backend
      // For now, use v1 API as fallback
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.specialized.previewForm(formId);
      if (!response.ok) {
        throw new Error('Failed to load PDF preview');
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
    } catch (error) {
      console.error('[SigningFlow] Error loading PDF preview:', error);
      notify.error('Failed to load PDF preview');
    }
  };

  const handleSign = async () => {
    if (!signatureUrl) {
      notify.warning('Please set up your signature in Settings before signing documents.');
      return null;
    }
    
    setSigning(true);
    try {
      // Use v2 API to add signature
      await v2Api.createFormSignature(formId, {
        signature_data: signatureUrl, // Base64 encoded signature
      });

      // TODO: Get signed PDF from v2 backend
      // For now, use v1 API as fallback
      const { v1Api } = await import('@/lib/api/v1-client');
      const blob = await v1Api.forms.downloadForm(formId);
      const url = URL.createObjectURL(blob);
      
      setSignedPdfUrl(url);
      setIsSigned(true);
      setPdfPreviewUrl(url);
      
      if (onSignComplete) {
        onSignComplete();
      }
      
      notify.success('Document signed successfully');
      return url;
    } catch (error) {
      console.error('[SigningFlow] Error signing document:', error);
      notify.error(error.message || 'Failed to sign document. Please try again.');
      return null;
    } finally {
      setSigning(false);
    }
  };

  const handleDownload = async () => {
    let urlToDownload = signedPdfUrl;
    
    if (!isSigned || !urlToDownload) {
      urlToDownload = await handleSign();
    }
    
    if (urlToDownload) {
      downloadFile(urlToDownload);
    } else {
      notify.error('Failed to prepare document for download. Please try again.');
    }
  };

  const generateFileName = () => {
    const data = enrichedFormData || formData;
    
    const propertyName = data?.property?.name || 
                        data?.property?.address_line1 || 
                        data?.template_data?.propertyAddress ||
                        'property';
    
    const cleanPropertyName = propertyName
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
    
    const formType = data?.form_type || data?.formType || 'form';
    const date = new Date();
    const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    
    return `${cleanPropertyName}-${formType}-${dateStr}.pdf`;
  };

  const downloadFile = (url) => {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = generateFileName();
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setDownloadComplete(true);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error downloading document:', error);
      notify.error('Failed to download document. Please try again.');
    }
  };

  const getFormType = () => {
    const data = enrichedFormData || formData;
    if (data?.form_type === 'N4' || data?.formType === 'N4') {
      return 'N4 - Notice to End a Tenancy Early';
    }
    return data?.form_type || data?.formType || 'N/A';
  };

  const getLandlordName = () => {
    return formData?.landlordName || formData?.formData?.landlordName || landlordName || 'N/A';
  };

  const getTenantName = () => {
    const data = enrichedFormData || formData;
    
    if (data?.template_data?.tenantName) {
      return data.template_data.tenantName;
    }
    if (data?.tenantName) {
      return data.tenantName;
    }
    return 'N/A';
  };

  const getPropertyAddress = () => {
    const data = enrichedFormData || formData;
    
    if (data?.property?.address_line1) {
      const address = data.property.address_line1;
      const city = data.property.city ? `, ${data.property.city}` : '';
      const state = data.property.state ? `, ${data.property.state}` : '';
      return `${address}${city}${state}`;
    }
    if (data?.template_data?.propertyAddress) {
      return data.template_data.propertyAddress;
    }
    return 'N/A';
  };

  return (
    <Modal show={open} onClose={onClose} size="4xl">
      <Modal.Header>
        <div>
          <h3 className="text-xl font-bold">Review {getFormType()}</h3>
          <p className="text-sm text-gray-500 mt-1">
            Check the document for accuracy. <span className="text-red-500">*</span>
          </p>
        </div>
      </Modal.Header>
      <Modal.Body>
        {downloadComplete ? (
          <div className="text-center py-12">
            <HiCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h3 className="text-2xl font-bold mb-4">Document Downloaded Successfully</h3>
            <p className="text-gray-600 mb-4">
              Your signed form has been downloaded. This window will close automatically.
            </p>
          </div>
        ) : (
          <div className="min-h-[400px]">
            {/* Document Information */}
            <Card className="mb-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Form Type:</p>
                  <p className="font-semibold text-sm">{getFormType()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Generated By:</p>
                  <p className="font-semibold text-sm">{getLandlordName()}</p>
                </div>
                <div className="flex justify-end">
                  <Tooltip content={isSigned ? "Document is signed" : signatureUrl ? "Sign document" : "Please set up signature in Settings"}>
                    <Button
                      color={isSigned ? "gray" : "blue"}
                      size="sm"
                      onClick={handleSign}
                      disabled={isSigned || !signatureUrl || signing}
                    >
                      {signing ? (
                        <Spinner size="sm" />
                      ) : (
                        <HiPencil className="h-4 w-4" />
                      )}
                    </Button>
                  </Tooltip>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tenant:</p>
                  <p className="font-semibold text-sm">{getTenantName()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Property:</p>
                  <p className="font-semibold text-sm">{getPropertyAddress()}</p>
                </div>
                <div className="flex justify-end">
                  <Tooltip content={isSigned ? "Download signed document" : "Sign document first to download"}>
                    <Button
                      color={isSigned ? "success" : "gray"}
                      size="sm"
                      onClick={handleDownload}
                      disabled={!isSigned}
                    >
                      <HiDownload className="h-4 w-4" />
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </Card>
            
            {pdfPreviewUrl && (
              <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50 relative">
                <iframe
                  src={pdfPreviewUrl}
                  className="w-full h-[500px] border-0"
                  title="Document Preview"
                />
                {isSigned && (
                  <div className="absolute bottom-3 right-24 z-10">
                    <Badge color="success" className="px-3 py-1">
                      <HiCheckCircle className="h-4 w-4 mr-1" />
                      Signed
                    </Badge>
                  </div>
                )}
              </div>
            )}

            {signing && (
              <Card className="mt-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <div className="text-center py-6">
                  <Progress progress={75} className="mb-4" />
                  <p className="font-semibold">Signing your document...</p>
                  <p className="text-sm text-gray-600">This may take a few seconds</p>
                </div>
              </Card>
            )}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}
