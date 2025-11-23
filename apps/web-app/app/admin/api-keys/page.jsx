"use client";

import { useState, useEffect } from 'react';
import { Card, Button, Badge, Alert, ToggleSwitch, Spinner } from 'flowbite-react';
import { StandardModal, FormTextInput, FormSelect, PageLayout } from '@/components/shared';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import { useFormState } from '@/lib/hooks/useFormState';
import {
  HiKey,
  HiPlus,
  HiPencil,
  HiTrash,
  HiClipboard,
} from 'react-icons/hi';

export default function AdminApiKeysPage() {
  const [loading, setLoading] = useState(true);
  const [apiKeys, setApiKeys] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingKey, setEditingKey] = useState(null);
  const [newKey, setNewKey] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const formState = useFormState({
    name: '',
    permissions: [],
    rateLimit: 100,
    expiresAt: null,
    isActive: true,
  });

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getApiKeys();
      if (data.success) {
        setApiKeys(data.data);
      }
    } catch (err) {
      console.error('Error fetching API keys:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingKey(null);
    setNewKey(null);
    formState.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (key) => {
    setEditingKey(key);
    setNewKey(null);
    formState.setFieldsValue({
      name: key.name || '',
      permissions: key.permissions || [],
      rateLimit: key.rateLimit || 100,
      expiresAt: key.expiresAt || null,
      isActive: key.isActive !== undefined ? key.isActive : true,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = formState.values;
      const payload = {
        ...values,
        expiresAt: values.expiresAt ? (typeof values.expiresAt === 'string' ? values.expiresAt : new Date(values.expiresAt).toISOString()) : null,
      };

      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.saveApiKey(payload, editingKey?.id);

      if (data.success) {
        if (!editingKey && data.data.key) {
          setNewKey(data.data.key);
          setSuccessMessage('Save this API key securely - it will not be shown again!');
          setErrorMessage(null);
        } else {
          setSuccessMessage(editingKey ? 'API key updated' : 'API key created');
          setErrorMessage(null);
          setModalVisible(false);
          fetchApiKeys();
          setTimeout(() => setSuccessMessage(null), 5000);
        }
      } else {
        setErrorMessage(data.error || 'Failed to save API key');
        setSuccessMessage(null);
      }
    } catch (err) {
      setErrorMessage('Failed to save API key');
      setSuccessMessage(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this API key?')) {
      return;
    }
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.deleteApiKey(id);
      if (data.success) {
        setSuccessMessage('API key deleted');
        setErrorMessage(null);
        fetchApiKeys();
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setErrorMessage(data.error || 'Failed to delete API key');
        setSuccessMessage(null);
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to delete API key');
      setSuccessMessage(null);
    }
  };

  const handleCopyKey = (key) => {
    navigator.clipboard.writeText(key);
    setSuccessMessage('API key copied to clipboard');
    setErrorMessage(null);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      render: (key) => (
        <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono">
          {key}
        </code>
      ),
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (perms) => (
        <div className="flex flex-wrap gap-1">
          {perms?.map((p) => (
            <Badge key={p} color="info">{p}</Badge>
          ))}
        </div>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (active) => (
        <Badge color={active ? 'success' : 'failure'}>
          {active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      title: 'Last Used',
      dataIndex: 'lastUsedAt',
      key: 'lastUsedAt',
      render: (date) => date ? new Date(date).toLocaleString() : 'Never',
    },
    {
      title: 'Expires',
      dataIndex: 'expiresAt',
      key: 'expiresAt',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'Never',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <Button
            size="xs"
            color="gray"
            onClick={() => handleEdit(record)}
            title="Edit"
          >
            <HiPencil className="h-4 w-4" />
          </Button>
          <Button
            size="xs"
            color="failure"
            onClick={() => handleDelete(record.id)}
            title="Delete"
          >
            <HiTrash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageLayout
      headerTitle={
        <div className="flex items-center gap-2">
          <HiKey className="h-5 w-5" />
          <span>API Key Management</span>
        </div>
      }
      headerActions={[
        <Button key="create" color="blue" onClick={handleCreate}>
          <HiPlus className="mr-2 h-4 w-4" />
          Create API Key
        </Button>
      ]}
      contentStyle={{ maxWidth: 1400, margin: '0 auto' }}
    >
      {successMessage && (
        <Alert color="success" className="mb-6" onDismiss={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert color="failure" className="mb-6" onDismiss={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {newKey && (
        <Alert color="warning" className="mb-6" onDismiss={() => setNewKey(null)}>
          <div className="space-y-3">
            <div className="font-semibold">New API Key Generated</div>
            <div>
              <p className="text-sm mb-2">Save this key securely - it will not be shown again!</p>
              <code className="block px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono break-all">
                {newKey}
              </code>
              <Button
                color="gray"
                size="sm"
                onClick={() => handleCopyKey(newKey)}
                className="mt-2"
              >
                <HiClipboard className="mr-2 h-4 w-4" />
                Copy Key
              </Button>
            </div>
          </div>
        </Alert>
      )}

      <Card className="p-6">
        <FlowbiteTable
          columns={columns}
          dataSource={apiKeys}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 50 }}
        />
      </Card>

      <StandardModal
        title={editingKey ? 'Edit API Key' : 'Create API Key'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setNewKey(null);
          formState.resetFields();
        }}
        onFinish={handleSubmit}
        submitText={editingKey ? 'Save' : 'Create'}
        width={600}
      >
        <div className="space-y-4">
          <FormTextInput
            name="name"
            label="Name"
            value={formState.values.name}
            onChange={(e) => formState.setFieldsValue({ name: e.target.value })}
            required
            disabled={!!editingKey}
            placeholder="API Key Name"
          />
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Permissions
              <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="space-y-2">
              {['read', 'write', 'delete'].map((perm) => (
                <label key={perm} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formState.values.permissions?.includes(perm) || false}
                    onChange={(e) => {
                      const currentPerms = formState.values.permissions || [];
                      if (e.target.checked) {
                        formState.setFieldsValue({ permissions: [...currentPerms, perm] });
                      } else {
                        formState.setFieldsValue({ permissions: currentPerms.filter(p => p !== perm) });
                      }
                    }}
                    className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900 dark:text-white capitalize">{perm}</span>
                </label>
              ))}
            </div>
          </div>
          <FormTextInput
            name="rateLimit"
            label="Rate Limit (requests per minute)"
            type="number"
            value={formState.values.rateLimit}
            onChange={(e) => formState.setFieldsValue({ rateLimit: parseInt(e.target.value) || 100 })}
            min={1}
            placeholder="100"
          />
          <FormTextInput
            name="expiresAt"
            label="Expires At"
            type="datetime-local"
            value={formState.values.expiresAt ? new Date(formState.values.expiresAt).toISOString().slice(0, 16) : ''}
            onChange={(e) => formState.setFieldsValue({ expiresAt: e.target.value ? new Date(e.target.value).toISOString() : null })}
            placeholder="Select expiration date"
          />
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Status
            </label>
            <ToggleSwitch
              checked={formState.values.isActive}
              onChange={(checked) => formState.setFieldsValue({ isActive: checked })}
              label={formState.values.isActive ? 'Active' : 'Inactive'}
            />
          </div>
        </div>
      </StandardModal>
    </PageLayout>
  );
}

