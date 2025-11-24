"use client";

import { useState, useEffect } from 'react';
import { Button, Table, Badge, Spinner, Alert } from 'flowbite-react';
import { HiDownload, HiUpload, HiX, HiDocument } from 'react-icons/hi';
import { v2Api } from '@/lib/api/v2-client';
import { notify } from '@/lib/utils/notification-helper';

interface Attachment {
  id: string;
  file_name: string;
  mime_type: string | null;
  file_size_bytes: number | null;
  created_at: string;
  storage_key: string;
}

interface AttachmentsProps {
  entityType: string;
  entityId: string;
  organizationId?: string;
  readonly?: boolean;
}

export default function Attachments({ entityType, entityId, organizationId, readonly = false }: AttachmentsProps) {
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAttachments();
  }, [entityType, entityId]);

  const loadAttachments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await v2Api.listAttachments(entityType, entityId);
      setAttachments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error loading attachments:', err);
      setError(err.detail || 'Failed to load attachments');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      setError(null);
      await v2Api.uploadAttachment(entityType, entityId, file);
      notify.success('File uploaded successfully');
      await loadAttachments();
      // Reset file input
      event.target.value = '';
    } catch (err: any) {
      console.error('Error uploading file:', err);
      setError(err.detail || 'Failed to upload file');
      notify.error(err.detail || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      const blob = await v2Api.downloadAttachment(attachment.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      console.error('Error downloading file:', err);
      notify.error(err.detail || 'Failed to download file');
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert color="failure" onDismiss={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!readonly && (
        <div className="flex items-center gap-2">
          <label htmlFor="file-upload" className="cursor-pointer">
            <Button as="span" color="blue" disabled={uploading}>
              <HiUpload className="mr-2 h-4 w-4" />
              {uploading ? 'Uploading...' : 'Upload File'}
            </Button>
          </label>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            onChange={handleUpload}
            disabled={uploading}
          />
        </div>
      )}

      {attachments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <HiDocument className="h-12 w-12 mx-auto mb-2 text-gray-400" />
          <p>No attachments</p>
        </div>
      ) : (
        <Table>
          <Table.Head>
            <Table.HeadCell>File Name</Table.HeadCell>
            <Table.HeadCell>Type</Table.HeadCell>
            <Table.HeadCell>Size</Table.HeadCell>
            <Table.HeadCell>Uploaded</Table.HeadCell>
            <Table.HeadCell>Actions</Table.HeadCell>
          </Table.Head>
          <Table.Body className="divide-y">
            {attachments.map((attachment) => (
              <Table.Row key={attachment.id}>
                <Table.Cell className="font-medium">{attachment.file_name}</Table.Cell>
                <Table.Cell>
                  <Badge color="gray">{attachment.mime_type || 'Unknown'}</Badge>
                </Table.Cell>
                <Table.Cell>{formatFileSize(attachment.file_size_bytes)}</Table.Cell>
                <Table.Cell>
                  {new Date(attachment.created_at).toLocaleDateString()}
                </Table.Cell>
                <Table.Cell>
                  <Button
                    size="xs"
                    color="blue"
                    onClick={() => handleDownload(attachment)}
                  >
                    <HiDownload className="h-4 w-4" />
                  </Button>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}
    </div>
  );
}

