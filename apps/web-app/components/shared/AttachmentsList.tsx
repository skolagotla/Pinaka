/**
 * AttachmentsList Component - v2 FastAPI
 * 
 * Displays and manages attachments for any entity type using v2 FastAPI backend.
 * Supports upload, download, and delete operations.
 */
"use client";

import { useState } from 'react';
import { Card, Button, Spinner, Alert } from 'flowbite-react';
import { HiDownload, HiTrash, HiUpload, HiDocument } from 'react-icons/hi';
import { useAttachments, useUploadAttachment, useDownloadAttachment } from '@/lib/hooks/useV2Data';

interface AttachmentsListProps {
  entityType: string;
  entityId: string;
  showUpload?: boolean;
  onUploadSuccess?: () => void;
}

export default function AttachmentsList({ 
  entityType, 
  entityId, 
  showUpload = true,
  onUploadSuccess 
}: AttachmentsListProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  const { data: attachments, isLoading, error } = useAttachments(entityType, entityId);
  const uploadAttachment = useUploadAttachment();
  const downloadAttachment = useDownloadAttachment();
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    setUploadError(null);
    
    try {
      await uploadAttachment.mutateAsync({
        entityType,
        entityId,
        file,
      });
      
      if (onUploadSuccess) {
        onUploadSuccess();
      }
      
      // Reset file input
      event.target.value = '';
    } catch (err: any) {
      setUploadError(err.detail || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };
  
  const handleDownload = async (attachmentId: string, fileName: string) => {
    try {
      const blob = await downloadAttachment.mutateAsync(attachmentId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to download attachment:', err);
      alert('Failed to download file');
    }
  };
  
  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };
  
  if (isLoading) {
    return (
      <Card>
        <div className="flex justify-center items-center py-8">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Alert color="failure">
        Failed to load attachments: {error instanceof Error ? error.message : 'Unknown error'}
      </Alert>
    );
  }
  
  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Attachments</h3>
        {showUpload && (
          <label>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <Button
              as="span"
              color="blue"
              size="sm"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Uploading...
                </>
              ) : (
                <>
                  <HiUpload className="mr-2 h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </label>
        )}
      </div>
      
      {uploadError && (
        <Alert color="failure" className="mb-4">
          {uploadError}
        </Alert>
      )}
      
      {attachments && attachments.length > 0 ? (
        <div className="space-y-2">
          {attachments.map((attachment: any) => (
            <div
              key={attachment.id}
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3 flex-1">
                <HiDocument className="h-5 w-5 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {attachment.file_name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(attachment.file_size_bytes)} • {new Date(attachment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  color="gray"
                  onClick={() => handleDownload(attachment.id, attachment.file_name)}
                >
                  <HiDownload className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          No attachments yet. {showUpload && 'Upload a file to get started.'}
        </p>
      )}
    </Card>
  );
}

