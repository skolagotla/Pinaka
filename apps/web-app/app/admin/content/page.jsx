"use client";

import { useState, useEffect } from 'react';
import { Card, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Button, Modal, TextInput, Select, Textarea, Label, Badge, Spinner, Alert } from 'flowbite-react';
import {
  HiDocumentText,
  HiPlus,
  HiPencil,
  HiTrash,
} from 'react-icons/hi';
import { StandardModal } from '@/components/shared';

export default function AdminContentPage() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    content: '',
    isActive: true,
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getContent();
      if (data.success) {
        setContent(data.data);
      }
    } catch (err) {
      console.error('Error fetching content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingContent(null);
    setFormData({ type: '', title: '', content: '', isActive: true });
    setModalVisible(true);
  };

  const handleEdit = (item) => {
    setEditingContent(item);
    setFormData({
      type: item.type || '',
      title: item.title || '',
      content: item.content || '',
      isActive: item.isActive !== undefined ? item.isActive : true,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.saveContent(formData, editingContent?.id);

      if (data.success) {
        alert(editingContent ? 'Content updated' : 'Content created');
        setModalVisible(false);
        fetchContent();
      } else {
        alert(data.error || 'Failed to save content');
      }
    } catch (err) {
      alert(err?.message || 'Failed to save content');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.deleteContent(id);
      if (data.success) {
        alert('Content deleted');
        fetchContent();
      } else {
        alert(data.error || 'Failed to delete content');
      }
    } catch (err) {
      alert(err?.message || 'Failed to delete content');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HiDocumentText className="h-6 w-6" />
          Content Management
        </h1>
        <Button color="blue" onClick={handleCreate}>
          <HiPlus className="h-4 w-4 mr-2" />
          Create Content
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="xl" />
          </div>
        ) : content.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <HiDocumentText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No content found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableHeadCell>Type</TableHeadCell>
                <TableHeadCell>Title</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {content.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Badge color="blue">{item.type}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>
                      <Badge color={item.isActive ? 'success' : 'gray'}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" color="gray" onClick={() => handleEdit(item)}>
                          <HiPencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" color="failure" onClick={() => handleDelete(item.id)}>
                          <HiTrash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      <StandardModal
        title={editingContent ? 'Edit Content' : 'Create Content'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onFinish={handleSubmit}
        submitText={editingContent ? 'Save' : 'Create'}
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="type" className="mb-2 block">
              Type <span className="text-red-500">*</span>
            </Label>
            <Select
              id="type"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="">Select type</option>
              <option value="announcement">Announcement</option>
              <option value="help">Help</option>
              <option value="terms">Terms</option>
              <option value="privacy">Privacy</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="title" className="mb-2 block">
              Title <span className="text-red-500">*</span>
            </Label>
            <TextInput
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="content" className="mb-2 block">
              Content <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              required
              rows={6}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded"
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>
      </StandardModal>
    </div>
  );
}
