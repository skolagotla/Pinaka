"use client";

import { useState, useEffect } from 'react';
import { Calendar as AntCalendar, Card, Badge, List, Modal, Form, Input, Select, DatePicker, Tag, Space, Checkbox } from 'antd';
import { ActionButton } from '@/components/shared/buttons';
import { PageLayout, StandardModal, FormTextInput, FormSelect, FormDatePicker } from '@/components/shared';
import { notify } from '@/lib/utils/notification-helper';
import { PlusOutlined, CheckCircleOutlined, ClockCircleOutlined, CalendarOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import { useModalState } from '@/lib/hooks/useModalState';
import { rules } from '@/lib/utils/validation-rules';
import dayjs from 'dayjs';
import { formatDateShort } from '@/lib/utils/safe-date-formatter';

export default function CalendarClient({ initialProperties = [] }) {
  const { fetch, loading } = useUnifiedApi({ showUserMessage: true });
  const [tasks, setTasks] = useState([]);
  const [properties, setProperties] = useState(initialProperties);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const { isOpen: taskModalOpen, open: openTaskModal, close: closeTaskModal, editingItem: editingTask, openForEdit: openTaskModalForEdit, openForCreate: openTaskModalForCreate } = useModalState();
  const [form] = Form.useForm();

  useEffect(() => {
    loadTasks();
    if (initialProperties.length === 0) {
      loadProperties();
    }
  }, []);

  const loadTasks = async () => {
    try {
      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.tasks.list({ page: 1, limit: 1000 });
      const tasksData = response.data?.data || response.data || [];
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      console.error('Error loading tasks:', error);
      setTasks([]);
    }
  };

  const loadProperties = async () => {
    try {
      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      const response = await v1Api.properties.list({ page: 1, limit: 1000 });
      const propertiesData = response.data?.data || response.data || [];
      setProperties(Array.isArray(propertiesData) ? propertiesData : []);
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    }
  };

  const handleAddTask = async (values) => {
    try {
      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      const taskData = {
        ...values,
        // Format as YYYY-MM-DD for date-only, or include time if showTime is used
        dueDate: dayjs.isDayjs(values.dueDate) 
          ? (values.dueDate.format('YYYY-MM-DD HH:mm:ss')) 
          : values.dueDate
      };

      if (editingTask) {
        await v1Api.tasks.update(editingTask.id, taskData);
      } else {
        await v1Api.tasks.create(taskData);
      }

      notify.success(`Task ${editingTask ? 'updated' : 'created'} successfully`);
      closeTaskModal();
      form.resetFields();
      loadTasks();
    } catch (error) {
      notify.error(error.message || 'Failed to save task');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      await v1Api.tasks.update(taskId, {
        isCompleted: true,
        completedAt: new Date().toISOString()
      });
      notify.success('Task completed!');
      loadTasks();
    } catch (error) {
      notify.error(error.message || 'Failed to complete task');
    }
  };

  const handleEditTask = async (task) => {
    // Extract local date components to avoid UTC timezone shift when loading
    const dueDateObj = new Date(task.dueDate);
    const year = dueDateObj.getFullYear();
    const month = dueDateObj.getMonth() + 1;
    const day = dueDateObj.getDate();
    const hours = dueDateObj.getHours();
    const minutes = dueDateObj.getMinutes();
    const seconds = dueDateObj.getSeconds();
    form.setFieldsValue({
      ...task,
      // If task has time, include it; otherwise just use date
      dueDate: dayjs(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
    });
    openTaskModalForEdit(task);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      // Use v1Api client
      const { v1Api } = await import('@/lib/api/v1-client');
      await v1Api.tasks.delete(taskId);
      notify.success('Task deleted');
      loadTasks();
    } catch (error) {
      notify.error(error.message || 'Failed to delete task');
    }
  };

  const dateCellRender = (value) => {
    const dayTasks = tasks.filter(t => 
      dayjs(t.dueDate).isSame(value, 'day')
    );

    return (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {dayTasks.map(task => (
          <li key={task.id}>
            <Badge 
              status={task.isCompleted ? 'success' : task.priority === 'urgent' ? 'error' : 'processing'} 
              text={task.title.substring(0, 20)}
              style={{ fontSize: 11 }}
            />
          </li>
        ))}
      </ul>
    );
  };

  const upcomingTasks = tasks
    .filter(t => !t.isCompleted && dayjs(t.dueDate).isAfter(dayjs()))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 10);

  const overdueTasks = tasks.filter(t => 
    !t.isCompleted && dayjs(t.dueDate).isBefore(dayjs())
  );

  const statsData = [
    { label: 'Total Tasks', value: tasks.length, color: '#1890ff' },
    { label: 'Overdue', value: overdueTasks.length, color: '#ff4d4f' },
    { label: 'Upcoming', value: upcomingTasks.length, color: '#52c41a' }
  ];

  return (
    <PageLayout
      title="Calendar & Tasks"
      subtitle="Manage your schedule and to-dos"
      stats={statsData}
      actions={[
        {
          key: 'add-task',
          icon: <PlusOutlined />,
          label: 'Add Task',
          type: 'primary',
          onClick: openTaskModalForCreate
        }
      ]}
    >

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
        {/* Calendar */}
        <Card title="Calendar View">
          <AntCalendar
            dateCellRender={dateCellRender}
            onSelect={(date) => setSelectedDate(date)}
          />
        </Card>

        {/* Task List */}
        <div>
          {overdueTasks.length > 0 && (
            <Card title="Overdue" style={{ marginBottom: 16 }} bodyStyle={{ maxHeight: 200, overflow: 'auto' }}>
              <List
                size="small"
                dataSource={overdueTasks}
                renderItem={task => (
                  <List.Item
                    actions={[
                      <Checkbox key="checkbox" onChange={() => handleCompleteTask(task.id)} />,
                      <ActionButton key="edit" action="edit" size="small" onClick={() => handleEditTask(task)} />,
                      <ActionButton key="delete" action="delete" size="small" onClick={() => handleDeleteTask(task.id)} />
                    ]}
                  >
                    <Space direction="vertical" size="small">
                      <span>{task.title}</span>
                      <Tag color="red">{formatDateShort(task.dueDate)}</Tag>
                    </Space>
                  </List.Item>
                )}
              />
            </Card>
          )}

          <Card title="Upcoming Tasks" bodyStyle={{ maxHeight: 400, overflow: 'auto' }}>
            <List
              size="small"
              dataSource={upcomingTasks}
              renderItem={task => (
                <List.Item
                    actions={[
                      <Checkbox key="checkbox" onChange={() => handleCompleteTask(task.id)} />,
                      <ActionButton key="edit" action="edit" size="small" onClick={() => handleEditTask(task)} />,
                      <ActionButton key="delete" action="delete" size="small" onClick={() => handleDeleteTask(task.id)} />
                    ]}
                >
                  <Space direction="vertical" size="small">
                    <span>{task.title}</span>
                    <Space>
                      <Tag color={task.priority === 'urgent' ? 'red' : 'blue'}>{task.priority}</Tag>
                      <Tag icon={<CalendarOutlined />}>{formatDateShort(task.dueDate)}</Tag>
                    </Space>
                  </Space>
                </List.Item>
              )}
            />
          </Card>
        </div>
      </div>

      {/* Add Task Modal */}
      <StandardModal
        title="Add Task"
        open={taskModalOpen}
        form={form}
        loading={false}
        submitText="Add"
        onCancel={() => {
          closeTaskModal();
          form.resetFields();
        }}
        onFinish={handleAddTask}
      >
        <FormTextInput
          name="title"
          label="Task Title"
          required
        />

        <FormTextInput
          name="description"
          label="Description"
          textArea
          rows={3}
        />

        <FormSelect
          name="category"
          label="Category"
          required
          options={[
            { label: 'Rent', value: 'rent' },
            { label: 'Lease', value: 'lease' },
            { label: 'Maintenance', value: 'maintenance' },
            { label: 'Legal', value: 'legal' },
            { label: 'Inspection', value: 'inspection' },
            { label: 'General', value: 'general' }
          ]}
        />

        <Form.Item
          name="dueDate"
          label="Due Date"
            rules={[rules.required('Task title')]}
        >
          <DatePicker showTime style={{ width: '100%' }} />
        </Form.Item>

        <FormSelect
          name="priority"
          label="Priority"
          options={[
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' },
            { label: 'Urgent', value: 'urgent' }
          ]}
          initialValue="medium"
        />

          {/* Property-centric: Property selection for tasks */}
          {properties.length > 0 && (
            <Form.Item
              name="propertyId"
              label="Property (Optional)"
              tooltip="Link this task to a specific property. If not selected, property will be inferred from linked entity if available."
            >
              <Select
                placeholder="Select property (optional)"
                allowClear
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={properties.map(p => ({
                  value: p.id,
                  label: `${p.propertyName || p.addressLine1}${p.city ? `, ${p.city}` : ''}`
                }))}
              />
            </Form.Item>
          )}
      </StandardModal>
    </PageLayout>
  );
}

