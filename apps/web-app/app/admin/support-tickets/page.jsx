"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Descriptions,
  Typography,
  Timeline,
  Input as AntInput,
} from 'antd';
import { StandardModal, FormTextInput } from '@/components/shared';
import {
  CustomerServiceOutlined,
  PlusOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { TextArea } = AntInput;
const { Option } = Select;

export default function AdminSupportTicketsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [noteModalVisible, setNoteModalVisible] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });
  const [filters, setFilters] = useState({ status: '', priority: '', search: '' });
  const [form] = Form.useForm();
  const [noteForm] = Form.useForm();

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
        message.error(data.error || 'Failed to fetch tickets');
      }
    } catch (err) {
      console.error('Error fetching tickets:', err);
      message.error('Failed to fetch tickets');
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
        setModalVisible(true);
      }
    } catch (err) {
      message.error('Failed to fetch ticket details');
    }
  };

  const handleUpdateTicket = async (values) => {
    try {
      const response = await fetch(`/api/admin/support-tickets/${selectedTicket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        message.success('Ticket updated successfully');
        setModalVisible(false);
        fetchTickets();
      } else {
        message.error(data.error || 'Failed to update ticket');
      }
    } catch (err) {
      message.error('Failed to update ticket');
    }
  };

  const handleAddNote = async (values) => {
    try {
      const response = await fetch(`/api/admin/support-tickets/${selectedTicket.id}?action=note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        message.success('Note added successfully');
        setNoteModalVisible(false);
        noteForm.resetFields();
        handleViewTicket(selectedTicket);
      } else {
        message.error(data.error || 'Failed to add note');
      }
    } catch (err) {
      message.error('Failed to add note');
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      LOW: 'default',
      MEDIUM: 'blue',
      HIGH: 'orange',
      URGENT: 'red',
    };
    return colors[priority] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      OPEN: 'red',
      IN_PROGRESS: 'blue',
      RESOLVED: 'green',
      CLOSED: 'default',
    };
    return colors[status] || 'default';
  };

  const columns = [
    {
      title: 'Ticket #',
      dataIndex: 'ticketNumber',
      key: 'ticketNumber',
      render: (text) => <Text strong>{text}</Text>,
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
              <Text strong>{record.property.propertyName || record.property.addressLine1}</Text>
              {record.property.city && <div><Text type="secondary" style={{ fontSize: 12 }}>{record.property.city}</Text></div>}
            </div>
          );
        }
        return <Text type="secondary">General Support</Text>;
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
      render: (priority) => <Tag color={getPriorityColor(priority)}>{priority}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color={getStatusColor(status)}>{status}</Tag>,
    },
    {
      title: 'Assigned To',
      key: 'assignedTo',
      render: (_, record) => {
        if (record.assignedToPMC) {
          return (
            <div>
              <Tag color="blue">PMC</Tag>
              <div><Text strong>{record.assignedToPMC.companyName}</Text></div>
            </div>
          );
        } else if (record.assignedToLandlord) {
          return (
            <div>
              <Tag color="green">Landlord</Tag>
              <div><Text strong>{record.assignedToLandlord.firstName} {record.assignedToLandlord.lastName}</Text></div>
            </div>
          );
        } else if (record.assignedToAdmin) {
          return (
            <div>
              <Tag color="purple">Admin</Tag>
              <div><Text strong>{record.assignedToAdmin.firstName} {record.assignedToAdmin.lastName}</Text></div>
            </div>
          );
        }
        return <Text type="secondary">Unassigned</Text>;
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
        <ActionButton
          action="edit"
          onClick={() => handleViewTicket(record)}
          tooltip="View"
          showText={true}
          text="View"
        />
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 1400, margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <CustomerServiceOutlined /> Support Tickets
        </Title>
      </div>

      <Card>
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Space wrap>
            <Input
              placeholder="Search tickets"
              style={{ width: 300 }}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              onPressEnter={fetchTickets}
            />
            <Select
              style={{ width: 150 }}
              placeholder="Status"
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
              allowClear
            >
              <Option value="OPEN">Open</Option>
              <Option value="IN_PROGRESS">In Progress</Option>
              <Option value="RESOLVED">Resolved</Option>
              <Option value="CLOSED">Closed</Option>
            </Select>
            <Select
              style={{ width: 150 }}
              placeholder="Priority"
              value={filters.priority}
              onChange={(value) => setFilters({ ...filters, priority: value })}
              allowClear
            >
              <Option value="LOW">Low</Option>
              <Option value="MEDIUM">Medium</Option>
              <Option value="HIGH">High</Option>
              <Option value="URGENT">Urgent</Option>
            </Select>
            <Button onClick={fetchTickets}>Refresh</Button>
          </Space>

          <Table
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
              style: { cursor: 'pointer' },
            })}
          />
        </Space>
      </Card>

      <Modal
        title={`Ticket: ${selectedTicket?.ticketNumber}`}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedTicket && (
          <Form
            form={form}
            layout="vertical"
            initialValues={selectedTicket}
            onFinish={handleUpdateTicket}
          >
            <Descriptions column={2} bordered style={{ marginBottom: 24 }}>
              <Descriptions.Item label="Subject">{selectedTicket.subject}</Descriptions.Item>
              <Descriptions.Item label="Status">
                <Form.Item name="status" noStyle>
                  <Select>
                    <Option value="OPEN">Open</Option>
                    <Option value="IN_PROGRESS">In Progress</Option>
                    <Option value="RESOLVED">Resolved</Option>
                    <Option value="CLOSED">Closed</Option>
                  </Select>
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="Priority">
                <Form.Item name="priority" noStyle>
                  <Select>
                    <Option value="LOW">Low</Option>
                    <Option value="MEDIUM">Medium</Option>
                    <Option value="HIGH">High</Option>
                    <Option value="URGENT">Urgent</Option>
                  </Select>
                </Form.Item>
              </Descriptions.Item>
              <Descriptions.Item label="Property">
                {selectedTicket.property ? (
                  <div>
                    <Text strong>{selectedTicket.property.propertyName || selectedTicket.property.addressLine1}</Text>
                    {selectedTicket.property.city && (
                      <div><Text type="secondary">{selectedTicket.property.city}, {selectedTicket.property.provinceState}</Text></div>
                    )}
                  </div>
                ) : (
                  <Text type="secondary">General Support (No Property)</Text>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Created By">
                {selectedTicket.createdByLandlord ? (
                  <div>
                    <Tag color="green">Landlord</Tag>
                    <div>{selectedTicket.createdByLandlord.firstName} {selectedTicket.createdByLandlord.lastName}</div>
                    <div><Text type="secondary">{selectedTicket.createdByLandlord.email}</Text></div>
                  </div>
                ) : selectedTicket.createdByTenant ? (
                  <div>
                    <Tag color="blue">Tenant</Tag>
                    <div>{selectedTicket.createdByTenant.firstName} {selectedTicket.createdByTenant.lastName}</div>
                    <div><Text type="secondary">{selectedTicket.createdByTenant.email}</Text></div>
                  </div>
                ) : (
                  <div>{selectedTicket.createdByName} ({selectedTicket.createdByEmail})</div>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="Assigned To">
                {selectedTicket.assignedToPMC ? (
                  <div>
                    <Tag color="blue">PMC</Tag>
                    <div><Text strong>{selectedTicket.assignedToPMC.companyName}</Text></div>
                    <div><Text type="secondary">{selectedTicket.assignedToPMC.email}</Text></div>
                  </div>
                ) : selectedTicket.assignedToLandlord ? (
                  <div>
                    <Tag color="green">Landlord</Tag>
                    <div><Text strong>{selectedTicket.assignedToLandlord.firstName} {selectedTicket.assignedToLandlord.lastName}</Text></div>
                    <div><Text type="secondary">{selectedTicket.assignedToLandlord.email}</Text></div>
                  </div>
                ) : selectedTicket.assignedToAdmin ? (
                  <div>
                    <Tag color="purple">Admin</Tag>
                    <div><Text strong>{selectedTicket.assignedToAdmin.firstName} {selectedTicket.assignedToAdmin.lastName}</Text></div>
                    <div><Text type="secondary">{selectedTicket.assignedToAdmin.email}</Text></div>
                  </div>
                ) : (
                  <Text type="secondary">Unassigned</Text>
                )}
              </Descriptions.Item>
              {(selectedTicket.contractor || selectedTicket.vendor) && (
                <>
                  {selectedTicket.contractor && (
                    <Descriptions.Item label="Related Contractor">
                      <div>
                        <Text strong>{selectedTicket.contractor.companyName}</Text>
                        <div><Text type="secondary">{selectedTicket.contractor.contactName}</Text></div>
                        <div><Text type="secondary">{selectedTicket.contractor.email}</Text></div>
                        {selectedTicket.contractor.phone && (
                          <div><Text type="secondary">{selectedTicket.contractor.phone}</Text></div>
                        )}
                      </div>
                    </Descriptions.Item>
                  )}
                  {selectedTicket.vendor && (
                    <Descriptions.Item label="Related Vendor">
                      <div>
                        <Text strong>{selectedTicket.vendor.name || selectedTicket.vendor.businessName}</Text>
                        <div><Text type="secondary">{selectedTicket.vendor.email}</Text></div>
                        {selectedTicket.vendor.phone && (
                          <div><Text type="secondary">{selectedTicket.vendor.phone}</Text></div>
                        )}
                      </div>
                    </Descriptions.Item>
                  )}
                </>
              )}
            </Descriptions>

            <div style={{ marginBottom: 24 }}>
              <Text strong>Description:</Text>
              <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                {selectedTicket.description}
              </div>
            </div>

            {selectedTicket.notes && selectedTicket.notes.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <Text strong>Notes:</Text>
                <Timeline style={{ marginTop: 16 }}>
                  {selectedTicket.notes.map((note) => (
                    <Timeline.Item key={note.id}>
                      <div>
                        <Text strong>{note.createdByName}</Text>
                        {note.isInternal && <Tag color="orange" style={{ marginLeft: 8 }}>Internal</Tag>}
                        <div style={{ marginTop: 4 }}>{note.content}</div>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(note.createdAt).toLocaleString()}
                        </Text>
                      </div>
                    </Timeline.Item>
                  ))}
                </Timeline>
              </div>
            )}

            <Space>
              <Button type="primary" htmlType="submit">Update Ticket</Button>
              <Button onClick={() => setNoteModalVisible(true)}>Add Note</Button>
              <Button onClick={() => setModalVisible(false)}>Close</Button>
            </Space>
          </Form>
        )}
      </Modal>

      <StandardModal
        title="Add Note"
        open={noteModalVisible}
        form={noteForm}
        loading={false}
        submitText="Add"
        onCancel={() => {
          setNoteModalVisible(false);
          noteForm.resetFields();
        }}
        onFinish={handleAddNote}
      >
        <FormTextInput
          name="content"
          label="Note"
          textArea
          rows={4}
          required
        />
        <Form.Item name="isInternal" valuePropName="checked">
          <input type="checkbox" /> Internal Note (only visible to admins)
        </Form.Item>
      </StandardModal>
    </div>
  );
}

