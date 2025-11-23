"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, Badge, Modal, TextInput, Select, Textarea, Label, Checkbox, Spinner } from 'flowbite-react';
import { StandardModal, FormTextInput, PageLayout } from '@/components/shared';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import { useFormState } from '@/lib/hooks/useFormState';
import {
  HiSupport,
  HiPencil,
  HiCheckCircle,
  HiClock,
  HiExclamation,
} from 'react-icons/hi';

export default function AdminSupportTicketsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const formState = useFormState({
    status: '',
    priority: '',
  });
  const noteFormState = useFormState({
    content: '',
    isInternal: false,
  });
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, [pagination.page, filters]);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.status && { status: filters.status }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`/api/admin/support-tickets?${params}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setTickets(data.data);
        setPagination(prev => ({ ...prev, total: data.pagination.total }));
      } else {
        setErrorMessage(data.error || 'Failed to fetch tickets');
        setSuccessMessage(null);
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setErrorMessage('Failed to fetch tickets');
      setSuccessMessage(null);
    } finally {
      setLoading(false);
    }
  };

  const handleViewTicket = async (ticket) => {
    try {
      const response = await fetch(`/api/admin/support-tickets/${ticket.id}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setSelectedTicket(data.data);
        formState.setFieldsValue({
          status: data.data.status,
          priority: data.data.priority,
        });
        setModalVisible(true);
      }
    } catch (err) {
      setErrorMessage('Failed to fetch ticket details');
      setSuccessMessage(null);
    }
  };

  const handleUpdateTicket = async () => {
    try {
      const values = formState.values;
      const response = await fetch(`/api/admin/support-tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMessage('Ticket updated successfully');
        setErrorMessage(null);
        setModalVisible(false);
        fetchTickets();
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setErrorMessage(data.error || 'Failed to update ticket');
        setSuccessMessage(null);
      }
    } catch (err) {
      setErrorMessage('Failed to update ticket');
      setSuccessMessage(null);
    }
  };

  const handleAddNote = async () => {
    try {
      const values = noteFormState.values;
      const response = await fetch(`/api/admin/support-tickets/${selectedTicket.id}?action=note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMessage('Note added successfully');
        setErrorMessage(null);
        setNoteModalVisible(false);
        noteFormState.resetFields();
        handleViewTicket(selectedTicket);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setErrorMessage(data.error || 'Failed to add note');
        setSuccessMessage(null);
      }
    } catch (err) {
      setErrorMessage('Failed to add note');
      setSuccessMessage(null);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'gray',
      MEDIUM: 'info',
      HIGH: 'warning',
      URGENT: 'failure',
    };
    return colors[priority] || 'gray';
  };

  const getStatusColor = (status) => {
    const colors = {
      OPEN: 'failure',
      IN_PROGRESS: 'info',
      RESOLVED: 'success',
      CLOSED: 'gray',
    };
    return colors[status] || 'gray';
  };

  const columns = [
    {
      title: 'Ticket #',
      dataIndex: 'ticketNumber',
      key: 'ticketNumber',
      render: (text) => <span className="font-semibold text-gray-900 dark:text-white">{text}</span>,
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Property',
      key: 'property',
      render: (_, record) => {
        if (record.property) {
          return (
            <div>
              <span className="font-semibold text-gray-900 dark:text-white">
                {record.property.propertyName || record.property.addressLine1}
              </span>
              {record.property.city && (
                <div className="text-xs text-gray-500 dark:text-gray-400">{record.property.city}</div>
              )}
            </div>
          );
        }
        return <span className="text-gray-500 dark:text-gray-400">General Support</span>;
      },
    },
    {
      title: 'Created By',
      key: 'createdBy',
      render: (_, record) => {
        const creator = record.createdByLandlord || record.createdByTenant;
        if (creator) {
          return `${creator.firstName} ${creator.lastName} (${creator.email})`;
        }
        return `${record.createdByName} (${record.createdByEmail})`;
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => <Badge color={getPriorityColor(priority)}>{priority}</Badge>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Badge color={getStatusColor(status)}>{status}</Badge>,
    },
    {
      title: 'Assigned To',
      key: 'assignedTo',
      render: (_, record) => {
        if (record.assignedToPMC) {
          return (
            <div>
              <Badge color="info" className="mb-1">PMC</Badge>
              <div className="font-semibold text-gray-900 dark:text-white">{record.assignedToPMC.companyName}</div>
            </div>
          );
        } else if (record.assignedToLandlord) {
          return (
            <div>
              <Badge color="success" className="mb-1">Landlord</Badge>
              <div className="font-semibold text-gray-900 dark:text-white">
                {record.assignedToLandlord.firstName} {record.assignedToLandlord.lastName}
              </div>
            </div>
          );
        } else if (record.assignedToAdmin) {
          return (
            <div>
              <Badge color="purple" className="mb-1">Admin</Badge>
              <div className="font-semibold text-gray-900 dark:text-white">
                {record.assignedToAdmin.firstName} {record.assignedToAdmin.lastName}
              </div>
            </div>
          );
        }
        return <span className="text-gray-500 dark:text-gray-400">Unassigned</span>;
      },
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          size="xs"
          color="gray"
          onClick={() => handleViewTicket(record)}
          title="View"
        >
          <HiPencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <PageLayout
      headerTitle={
        <div className="flex items-center gap-2">
          <HiSupport className="h-5 w-5" />
          <span>Support Tickets</span>
        </div>
      }
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

      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <TextInput
              placeholder="Search tickets"
              className="w-full sm:w-64"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  fetchTickets();
                }
              }}
            />
            <Select
              className="w-full sm:w-40"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value || '' })}
            >
              <option value="">All Status</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </Select>
            <Select
              className="w-full sm:w-40"
              value={filters.priority}
              onChange={(e) => setFilters({ ...filters, priority: e.target.value || '' })}
            >
              <option value="">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </Select>
            <Button color="gray" onClick={fetchTickets}>
              Refresh
            </Button>
          </div>

          <FlowbiteTable
            columns={columns}
            dataSource={tickets}
            loading={loading}
            rowKey="id"
            pagination={{
              current: pagination.page,
              pageSize: pagination.limit,
              total: pagination.total,
              onChange: (page) => setPagination({ ...pagination, page }),
            }}
            onRow={(record) => ({
              onClick: () => handleViewTicket(record),
              className: 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800',
            })}
          />
        </div>
      </Card>

      <Modal
        show={modalVisible}
        onClose={() => {
          setModalVisible(false);
          formState.resetFields();
        }}
        size="xl"
      >
        <Modal.Header>Ticket: {selectedTicket?.ticketNumber}</Modal.Header>
        <Modal.Body>
          {selectedTicket && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Subject</label>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedTicket.subject}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">Status</label>
                  <Select
                    value={formState.values.status || selectedTicket.status}
                    onChange={(e) => formState.setFieldsValue({ status: e.target.value })}
                  >
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">Priority</label>
                  <Select
                    value={formState.values.priority || selectedTicket.priority}
                    onChange={(e) => formState.setFieldsValue({ priority: e.target.value })}
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Property</label>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">
                    {selectedTicket.property ? (
                      <>
                        <span className="font-semibold">
                          {selectedTicket.property.propertyName || selectedTicket.property.addressLine1}
                        </span>
                        {selectedTicket.property.city && (
                          <span className="text-gray-500 dark:text-gray-400">
                            {' '}{selectedTicket.property.city}, {selectedTicket.property.provinceState}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">General Support (No Property)</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created By</label>
                  <div className="mt-1">
                    {selectedTicket.createdByLandlord ? (
                      <div>
                        <Badge color="success" className="mb-1">Landlord</Badge>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {selectedTicket.createdByLandlord.firstName} {selectedTicket.createdByLandlord.lastName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedTicket.createdByLandlord.email}
                        </div>
                      </div>
                    ) : selectedTicket.createdByTenant ? (
                      <div>
                        <Badge color="info" className="mb-1">Tenant</Badge>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {selectedTicket.createdByTenant.firstName} {selectedTicket.createdByTenant.lastName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedTicket.createdByTenant.email}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-900 dark:text-white">
                        {selectedTicket.createdByName} ({selectedTicket.createdByEmail})
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Assigned To</label>
                  <div className="mt-1">
                    {selectedTicket.assignedToPMC ? (
                      <div>
                        <Badge color="info" className="mb-1">PMC</Badge>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedTicket.assignedToPMC.companyName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedTicket.assignedToPMC.email}
                        </div>
                      </div>
                    ) : selectedTicket.assignedToLandlord ? (
                      <div>
                        <Badge color="success" className="mb-1">Landlord</Badge>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedTicket.assignedToLandlord.firstName} {selectedTicket.assignedToLandlord.lastName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedTicket.assignedToLandlord.email}
                        </div>
                      </div>
                    ) : selectedTicket.assignedToAdmin ? (
                      <div>
                        <Badge color="purple" className="mb-1">Admin</Badge>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {selectedTicket.assignedToAdmin.firstName} {selectedTicket.assignedToAdmin.lastName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {selectedTicket.assignedToAdmin.email}
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500 dark:text-gray-400">Unassigned</span>
                    )}
                  </div>
                </div>
                {(selectedTicket.contractor || selectedTicket.vendor) && (
                  <>
                    {selectedTicket.contractor && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Related Contractor</label>
                        <div className="mt-1">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {selectedTicket.contractor.companyName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedTicket.contractor.contactName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedTicket.contractor.email}
                          </div>
                          {selectedTicket.contractor.phone && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {selectedTicket.contractor.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {selectedTicket.vendor && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Related Vendor</label>
                        <div className="mt-1">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {selectedTicket.vendor.name || selectedTicket.vendor.businessName}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {selectedTicket.vendor.email}
                          </div>
                          {selectedTicket.vendor.phone && (
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {selectedTicket.vendor.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">Description:</label>
                <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {selectedTicket.description}
                  </p>
                </div>
              </div>

              {selectedTicket.notes && selectedTicket.notes.length > 0 && (
                <div>
                  <label className="text-sm font-semibold text-gray-900 dark:text-white mb-3 block">Notes:</label>
                  <div className="space-y-4">
                    {selectedTicket.notes.map((note) => (
                      <div key={note.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {note.createdByName}
                          </span>
                          {note.isInternal && (
                            <Badge color="warning" size="sm">Internal</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">{note.content}</p>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="flex items-center gap-3">
            <Button color="blue" onClick={handleUpdateTicket}>
              Update Ticket
            </Button>
            <Button color="gray" onClick={() => setNoteModalVisible(true)}>
              Add Note
            </Button>
            <Button color="gray" onClick={() => setModalVisible(false)}>
              Close
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

      <StandardModal
        title="Add Note"
        open={noteModalVisible}
        onCancel={() => {
          setNoteModalVisible(false);
          noteFormState.resetFields();
        }}
        onFinish={handleAddNote}
        submitText="Add"
      >
        <div className="space-y-4">
          <div>
            <Label htmlFor="content" className="mb-2 block">
              Note
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="content"
              name="content"
              value={noteFormState.values.content}
              onChange={(e) => noteFormState.setFieldsValue({ content: e.target.value })}
              required
              rows={4}
              placeholder="Enter note content..."
            />
          </div>
          <div className="flex items-center">
            <Checkbox
              id="isInternal"
              checked={noteFormState.values.isInternal}
              onChange={(e) => noteFormState.setFieldsValue({ isInternal: e.target.checked })}
            />
            <Label htmlFor="isInternal" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Internal Note (only visible to admins)
            </Label>
          </div>
        </div>
      </StandardModal>
    </PageLayout>
  );
}

