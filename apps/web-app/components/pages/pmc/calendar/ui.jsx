/**
 * PMC Calendar & Tasks Component - Migrated to Flowbite UI
 * 
 * NOTE: Tasks API still uses v1 - v2 backend endpoint needed for full migration
 * UI converted to Flowbite components
 */
"use client";

import { useState, useEffect } from 'react';
import { 
  Card, Badge, Modal, Button, TextInput, Label, Select, Textarea, 
  Checkbox, Spinner, Alert, List
} from 'flowbite-react';
import { ActionButton } from '@/components/shared/buttons';
import { PageLayout } from '@/components/shared';
import { notify } from '@/lib/utils/notification-helper';
import { 
  HiPlus, HiCheckCircle, HiClock, HiCalendar, HiPencil, HiTrash,
  HiX
} from 'react-icons/hi';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import { useModalState } from '@/lib/hooks/useModalState';
import { useFormState } from '@/lib/hooks/useFormState';
import { useV2Auth } from '@/lib/hooks/useV2Auth';
import { v2Api } from '@/lib/api/v2-client';
import { useProperties, useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/lib/hooks/useV2Data';
import dayjs from 'dayjs';
import { formatDateShort } from '@/lib/utils/safe-date-formatter';

export default function PMCCalendarClient({ initialProperties = [] }) {
  const { fetch, loading } = useUnifiedApi({ showUserMessage: true });
  const { user } = useV2Auth();
  const organizationId = user?.organization_id;
  const { data: propertiesData, isLoading: propertiesLoading } = useProperties(organizationId);
  
  // v2 API hooks
  const { data: tasksData, isLoading: tasksLoading, refetch: refetchTasks } = useTasks(organizationId);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  
  const tasks = tasksData || [];
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const { isOpen: taskModalOpen, open: openTaskModal, close: closeTaskModal, editingItem: editingTask, openForEdit, openForCreate } = useModalState();
  
  const taskForm = useFormState({
    title: '',
    description: '',
    category: '',
    dueDate: null,
    priority: 'medium',
    propertyId: null,
  });

  const properties = propertiesData && Array.isArray(propertiesData)
    ? propertiesData
    : initialProperties || [];

  // Tasks are loaded via v2 hooks above

  const handleSubmitTask = async () => {
    try {
      const values = taskForm.getFieldsValue();
      
      if (!values.title || !values.category || !values.dueDate) {
        notify.error('Title, category, and due date are required');
        return;
      }

      const taskData = {
        ...values,
        dueDate: dayjs.isDayjs(values.dueDate) 
          ? values.dueDate.format('YYYY-MM-DD HH:mm:ss')
          : values.dueDate
      };

      if (!organizationId) {
        notify.error('Organization ID is required');
        return;
      }
      
      const v2TaskData = {
        organization_id: organizationId,
        title: values.title,
        description: values.description || null,
        category: values.category || 'general',
        priority: values.priority || 'medium',
        property_id: values.propertyId || null,
        due_date: dayjs.isDayjs(values.dueDate) 
          ? values.dueDate.format('YYYY-MM-DD')
          : values.dueDate,
        status: 'pending',
      };
      
      if (editingTask) {
        await updateTask.mutateAsync({
          id: editingTask.id,
          data: v2TaskData
        });
        notify.success('Task updated successfully');
      } else {
        await createTask.mutateAsync(v2TaskData);
        notify.success('Task created successfully');
      }

      closeTaskModal();
      taskForm.reset();
      refetchTasks();
    } catch (error) {
      notify.error(error.message || 'Failed to save task');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      const { v1Api } = await import('@/lib/api/v1-client');
      await v1Api.tasks.update(taskId, {
        isCompleted: true,
        completedAt: new Date().toISOString()
      });
      notify.success('Task completed');
      loadTasks();
    } catch (error) {
      notify.error(error.message || 'Failed to complete task');
    }
  };

  const handleEditTask = (task) => {
    const dueDateObj = new Date(task.dueDate);
    const year = dueDateObj.getFullYear();
    const month = dueDateObj.getMonth() + 1;
    const day = dueDateObj.getDate();
    const hours = dueDateObj.getHours();
    const minutes = dueDateObj.getMinutes();
    const seconds = dueDateObj.getSeconds();
    
    taskForm.setFields({
      ...task,
      dueDate: dayjs(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`)
    });
    openForEdit(task);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await deleteTask.mutateAsync(taskId);
      notify.success('Task deleted');
      refetchTasks();
    } catch (error) {
      notify.error(error.message || 'Failed to delete task');
    }
  };

  // Simple calendar grid (similar to landlord calendar)
  const renderCalendarGrid = () => {
    const startOfMonth = dayjs(selectedDate).startOf('month');
    const endOfMonth = dayjs(selectedDate).endOf('month');
    const daysInMonth = endOfMonth.date();
    const firstDayOfWeek = startOfMonth.day();
    
    const days = [];
    const today = dayjs();
    
    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = startOfMonth.date(day);
      const dayTasks = tasks.filter(t => 
        dayjs(t.dueDate).isSame(date, 'day')
      );
      days.push({ date, tasks: dayTasks, isToday: date.isSame(today, 'day') });
    }
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center font-semibold text-gray-600 dark:text-gray-400">
            {day}
          </div>
        ))}
        {days.map((day, idx) => (
          <div
            key={idx}
            className={`min-h-[80px] p-1 border border-gray-200 dark:border-gray-700 ${
              day?.isToday ? 'bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
          >
            {day && (
              <>
                <div className={`text-sm font-medium mb-1 ${
                  day.isToday ? 'text-blue-600 dark:text-blue-400' : ''
                }`}>
                  {day.date.date()}
                </div>
                <div className="space-y-1">
                  {day.tasks.slice(0, 2).map(task => (
                    <Badge
                      key={task.id}
                      color={task.isCompleted ? 'success' : task.priority === 'urgent' ? 'failure' : 'info'}
                      size="sm"
                      className="text-xs block truncate"
                    >
                      {task.title.substring(0, 15)}
                    </Badge>
                  ))}
                  {day.tasks.length > 2 && (
                    <Badge color="gray" size="sm" className="text-xs">
                      +{day.tasks.length - 2}
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
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
    { label: 'Total Tasks', value: tasks.length, color: 'blue' },
    { label: 'Overdue', value: overdueTasks.length, color: 'red' },
    { label: 'Upcoming', value: upcomingTasks.length, color: 'green' }
  ];

  return (
    <PageLayout
      title="Calendar & Tasks"
      subtitle="Manage your schedule and to-dos"
      stats={statsData}
      actions={[
        {
          key: 'add-task',
          icon: <HiPlus className="h-5 w-5" />,
          label: 'Add Task',
          type: 'primary',
          onClick: () => {
            taskForm.reset();
            openForCreate();
          }
        }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <Card>
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-lg font-semibold">Calendar View</h3>
              <div className="flex gap-2">
                <Button
                  size="xs"
                  color="light"
                  onClick={() => setSelectedDate(selectedDate.subtract(1, 'month'))}
                >
                  ←
                </Button>
                <span className="px-4 py-1 text-sm font-medium">
                  {selectedDate.format('MMMM YYYY')}
                </span>
                <Button
                  size="xs"
                  color="light"
                  onClick={() => setSelectedDate(selectedDate.add(1, 'month'))}
                >
                  →
                </Button>
              </div>
            </div>
            {renderCalendarGrid()}
          </Card>
        </div>

        {/* Task Lists */}
        <div className="space-y-4">
          {overdueTasks.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold mb-3">Overdue</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {overdueTasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium">{task.title}</div>
                      <Badge color="failure" size="sm" className="mt-1">
                        {formatDateShort(task.dueDate)}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Checkbox
                        checked={task.isCompleted}
                        onChange={() => handleCompleteTask(task.id)}
                      />
                      <Button size="xs" color="light" onClick={() => handleEditTask(task)}>
                        <HiPencil className="h-4 w-4" />
                      </Button>
                      <Button size="xs" color="failure" onClick={() => handleDeleteTask(task.id)}>
                        <HiTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <h3 className="text-lg font-semibold mb-3">Upcoming Tasks</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {upcomingTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded"
                >
                  <div className="flex-1">
                    <div className="text-sm font-medium">{task.title}</div>
                    <div className="flex gap-1 mt-1">
                      <Badge
                        color={task.priority === 'urgent' ? 'failure' : 'info'}
                        size="sm"
                      >
                        {task.priority}
                      </Badge>
                      <Badge color="gray" size="sm">
                        {formatDateShort(task.dueDate)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Checkbox
                      checked={task.isCompleted}
                      onChange={() => handleCompleteTask(task.id)}
                    />
                    <Button size="xs" color="light" onClick={() => handleEditTask(task)}>
                      <HiPencil className="h-4 w-4" />
                    </Button>
                    <Button size="xs" color="failure" onClick={() => handleDeleteTask(task.id)}>
                      <HiTrash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Add/Edit Task Modal */}
      <Modal show={taskModalOpen} onClose={closeTaskModal} size="md">
        <Modal.Header>
          {editingTask ? 'Edit Task' : 'Add Task'}
        </Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="mb-2 block">
                Task Title <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id="title"
                value={taskForm.getFieldValue('title')}
                onChange={(e) => taskForm.setField('title', e.target.value)}
                required
                placeholder="Enter task title"
              />
            </div>

            <div>
              <Label htmlFor="description" className="mb-2 block">
                Description
              </Label>
              <Textarea
                id="description"
                rows={3}
                value={taskForm.getFieldValue('description')}
                onChange={(e) => taskForm.setField('description', e.target.value)}
                placeholder="Enter task description"
              />
            </div>

            <div>
              <Label htmlFor="category" className="mb-2 block">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                id="category"
                value={taskForm.getFieldValue('category')}
                onChange={(e) => taskForm.setField('category', e.target.value)}
                required
              >
                <option value="">Select category</option>
                <option value="rent">Rent</option>
                <option value="lease">Lease</option>
                <option value="maintenance">Maintenance</option>
                <option value="legal">Legal</option>
                <option value="inspection">Inspection</option>
                <option value="general">General</option>
              </Select>
            </div>

            <div>
              <Label htmlFor="dueDate" className="mb-2 block">
                Due Date <span className="text-red-500">*</span>
              </Label>
              <TextInput
                id="dueDate"
                type="datetime-local"
                value={taskForm.getFieldValue('dueDate') ? dayjs(taskForm.getFieldValue('dueDate')).format('YYYY-MM-DDTHH:mm') : ''}
                onChange={(e) => taskForm.setField('dueDate', e.target.value ? dayjs(e.target.value) : null)}
                required
              />
            </div>

            <div>
              <Label htmlFor="priority" className="mb-2 block">
                Priority
              </Label>
              <Select
                id="priority"
                value={taskForm.getFieldValue('priority')}
                onChange={(e) => taskForm.setField('priority', e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>

            {properties.length > 0 && (
              <div>
                <Label htmlFor="propertyId" className="mb-2 block">
                  Property (Optional)
                </Label>
                <Select
                  id="propertyId"
                  value={taskForm.getFieldValue('propertyId') || ''}
                  onChange={(e) => taskForm.setField('propertyId', e.target.value || null)}
                >
                  <option value="">Select property (optional)</option>
                  {properties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.property_name || p.address_line1}{p.city ? `, ${p.city}` : ''}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={closeTaskModal} color="gray">
            Cancel
          </Button>
          <Button onClick={handleSubmitTask} color="blue">
            {editingTask ? 'Save' : 'Add Task'}
          </Button>
        </Modal.Footer>
      </Modal>
    </PageLayout>
  );
}
