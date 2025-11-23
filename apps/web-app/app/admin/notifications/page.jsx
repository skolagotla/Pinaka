"use client";

import { useState, useEffect } from 'react';
import { Card, Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Button, Modal, TextInput, Select, Textarea, Label, Badge, Spinner, ToggleSwitch } from 'flowbite-react';
import {
  HiBell,
  HiPlus,
  HiPencil,
  HiTrash,
} from 'react-icons/hi';
import { StandardModal } from '@/components/shared';

export default function AdminNotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [announcements, setAnnouncements] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getAnnouncements();
      if (data.success) {
        setAnnouncements(data.data);
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      message: '',
      type: 'info',
      startDate: '',
      endDate: '',
      isActive: true,
    });
    setModalVisible(true);
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title || '',
      message: announcement.message || '',
      type: announcement.type || 'info',
      startDate: announcement.startDate ? announcement.startDate.split('T')[0] : '',
      endDate: announcement.endDate ? announcement.endDate.split('T')[0] : '',
      isActive: announcement.isActive !== undefined ? announcement.isActive : true,
    });
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
      };

      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.saveAnnouncement(payload, editingAnnouncement?.id);

      if (data.success) {
        alert(editingAnnouncement ? 'Announcement updated' : 'Announcement created');
        setModalVisible(false);
        fetchAnnouncements();
      } else {
        alert(data.error || 'Failed to save announcement');
      }
    } catch (err) {
      alert('Failed to save announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.deleteAnnouncement(id);
      if (data.success) {
        alert('Announcement deleted');
        fetchAnnouncements();
      } else {
        alert(data.error || 'Failed to delete announcement');
      }
    } catch (err) {
      alert('Failed to delete announcement');
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <HiBell className="h-6 w-6" />
          Notifications
        </h1>
        <Button color="blue" onClick={handleCreate}>
          <HiPlus className="h-4 w-4 mr-2" />
          Create Announcement
        </Button>
      </div>

      <Card>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="xl" />
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <HiBell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No announcements found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableHeadCell>Title</TableHeadCell>
                <TableHeadCell>Type</TableHeadCell>
                <TableHeadCell>Status</TableHeadCell>
                <TableHeadCell>Start Date</TableHeadCell>
                <TableHeadCell>End Date</TableHeadCell>
                <TableHeadCell>Actions</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {announcements.map((announcement) => (
                  <TableRow key={announcement.id}>
                    <TableCell className="font-medium">{announcement.title}</TableCell>
                    <TableCell>
                      <Badge color={announcement.type === 'error' ? 'failure' : announcement.type === 'warning' ? 'warning' : 'info'}>
                        {announcement.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge color={announcement.isActive ? 'success' : 'gray'}>
                        {announcement.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {announcement.startDate ? new Date(announcement.startDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      {announcement.endDate ? new Date(announcement.endDate).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="sm" color="gray" onClick={() => handleEdit(announcement)}>
                          <HiPencil className="h-4 w-4" />
                        </Button>
                        <Button size="sm" color="failure" onClick={() => handleDelete(announcement.id)}>
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
        title={editingAnnouncement ? 'Edit Announcement' : 'Create Announcement'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onFinish={handleSubmit}
        submitText={editingAnnouncement ? 'Save' : 'Create'}
      >
        <div className="space-y-4">
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
            <Label htmlFor="message" className="mb-2 block">
              Message <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="message"
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            />
          </div>
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
              <option value="info">Info</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
              <option value="success">Success</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate" className="mb-2 block">Start Date</Label>
              <TextInput
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="endDate" className="mb-2 block">End Date</Label>
              <TextInput
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ToggleSwitch
              checked={formData.isActive}
              onChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>
        </div>
      </StandardModal>
    </div>
  );
}
