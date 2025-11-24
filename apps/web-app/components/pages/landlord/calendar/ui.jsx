/**
 * Calendar & Tasks Component - Migrated to Flowbite UI
 * 
 * NOTE: Tasks API still uses v1 - v2 backend endpoint needed for full migration
 * UI converted to Flowbite components
 */
"use client";

import { useState, useEffect } from 'react';
import { 
  Card, Badge, Modal, Button, TextInput, Label, Select, Textarea, 
  Checkbox, Spinner, Alert
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
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '@/lib/hooks/useV2Data';
import { v2Api } from '@/lib/api/v2-client';
import dayjs from 'dayjs';
import { formatDateShort } from '@/lib/utils/safe-date-formatter';

export default function CalendarClient({ initialProperties = [] }) {
  const { user } = useV2Auth();
  const organizationId = user?.organization_id;
  const { fetch, loading } = useUnifiedApi({ showUserMessage: true });
  const [properties, setProperties] = useState(initialProperties);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [currentMonth, setCurrentMonth] = useState(dayjs());
  const { isOpen: taskModalOpen, open: openTaskModal, close: closeTaskModal, editingItem: editingTask, openForEdit: openTaskModalForEdit, openForCreate: openTaskModalForCreate } = useModalState();
  
  // v2 API hooks
  const { data: tasksData, isLoading: tasksLoading, refetch: refetchTasks } = useTasks(organizationId);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  
  const tasks = tasksData || [];
  
  const taskForm = useFormState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
    propertyId: null,
    dueDate: null
  });

  useEffect(() => {
    if (initialProperties.length === 0) {
      loadProperties();
    }
  }, []);
  
  // Tasks are loaded via v2 hooks above

  const loadProperties = async () => {
    try {
      // Use v2Api for properties
      if (user?.organization_id) {
        const properties = await v2Api.listProperties(user.organization_id);
        setProperties(Array.isArray(properties) ? properties : []);
      }
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    }
  };

  const handleAddTask = async () => {
    try {
      const values = taskForm.getFieldsValue();
      if (!values.title || !values.dueDate) {
        notify.error('Title and due date are required');
        return;
      }

      if (!organizationId) {
        notify.error('Organization ID is required');
        return;
      }
      
      const taskData = {
        organization_id: organizationId,
        title: values.title,
        description: values.description || null,
        category: values.category || 'general',
        priority: values.priority || 'medium',
        property_id: values.propertyId || null,
        due_date: dayjs(values.dueDate).format('YYYY-MM-DD'),
        status: 'pending',
      };

      if (editingTask) {
        await updateTask.mutateAsync({
          id: editingTask.id,
          data: taskData
        });
        notify.success('Task updated successfully');
      } else {
        await createTask.mutateAsync(taskData);
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
      // NOTE: Tasks API still uses v1 - v2 backend endpoint needed
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
    taskForm.setFields({
      ...task,
      dueDate: dayjs(dueDateObj).format('YYYY-MM-DDTHH:mm')
    });
    openTaskModalForEdit(task);
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await deleteTask.mutateAsync(taskId);
      notify.success('Task deleted');
      refetchTasks();
    } catch (error) {
      notify.error(error.message || 'Failed to delete task');
    }
  };

  // Generate calendar days
  const getCalendarDays = () => {
    const startOfMonth = currentMonth.startOf('month');
    const endOfMonth = currentMonth.endOf('month');
    const startDate = startOfMonth.startOf('week');
    const endDate = endOfMonth.endOf('week');
    const days = [];
    let currentDate = startDate;

    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
      days.push(currentDate);
      currentDate = currentDate.add(1, 'day');
    }

    return days;
  };

  const getTasksForDate = (date) => {
    return tasks.filter(t => dayjs(t.dueDate).isSame(date, 'day'));
  };

  const upcomingTasks = tasks
    .filter(t => !t.isCompleted && dayjs(t.dueDate).isAfter(dayjs()))
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 10);

  const overdueTasks = tasks.filter(t => 
    !t.isCompleted && dayjs(t.dueDate).isBefore(dayjs(), 'day')
  );

  const statsData = [
    { label: 'Total Tasks', value: tasks.length, color: '#1890ff' },
    { label: 'Overdue', value: overdueTasks.length, color: '#ff4d4f' },
    { label: 'Upcoming', value: upcomingTasks.length, color: '#52c41a' }
  ];

  const calendarDays = getCalendarDays();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
            openTaskModalForCreate();
          }
        }
      ]}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar View */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Calendar</h3>
              <div className="flex gap-2">
                <Button
                  size="xs"
                  color="light"
                  onClick={() => setCurrentMonth(currentMonth.subtract(1, 'month'))}
                >
                  ←
                </Button>
                <Button
                  size="xs"
                  color="light"
                  onClick={() => setCurrentMonth(dayjs())}
                >
                  Today
                </Button>
                <Button
                  size="xs"
                  color="light"
                  onClick={() => setCurrentMonth(currentMonth.add(1, 'month'))}
                >
                  →
                </Button>
              </div>
            </div>
            <div className="text-center mb-4">
              <h4 className="text-xl font-semibold">
                {currentMonth.format('MMMM YYYY')}
              </h4>
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Week day headers */}
              {weekDays.map(day => (
                <div key={day} className="text-center text-sm font-semibold p-2">
                  {day}
                </div>
              ))}
              
              {/* Calendar days */}
              {calendarDays.map((date, idx) => {
                const dayTasks = getTasksForDate(date);
                const isCurrentMonth = date.month() === currentMonth.month();
                const isToday = date.isSame(dayjs(), 'day');
                const isSelected = date.isSame(selectedDate, 'day');
                
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      min-h-[80px] p-1 border border-gray-200 rounded cursor-pointer
                      ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                      ${isToday ? 'ring-2 ring-blue-500' : ''}
                      ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                    `}
                  >
                    <div className="text-sm font-medium mb-1">
                      {date.date()}
                    </div>
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map(task => (
                        <div
                          key={task.id}
                          className={`
                            text-xs p-1 rounded truncate
                            ${task.isCompleted 
                              ? 'bg-green-100 text-green-800' 
                              : task.priority === 'urgent' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                            }
                          `}
                          title={task.title}
                        >
                          {task.title.substring(0, 15)}
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Task Lists */}
        <div className="space-y-4">
          {overdueTasks.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <HiClock className="h-5 w-5 text-red-500" />
                Overdue
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {overdueTasks.map(task => (
                  <div
                    key={task.id}
                    className="p-3 border border-red-200 rounded-lg bg-red-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{task.title}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDateShort(task.dueDate)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Checkbox
                          checked={task.isCompleted}
                          onChange={() => handleCompleteTask(task.id)}
                        />
                        <ActionButton
                          action="edit"
                          size="xs"
                          onClick={() => handleEditTask(task)}
                        />
                        <ActionButton
                          action="delete"
                          size="xs"
                          onClick={() => handleDeleteTask(task.id)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <HiCalendar className="h-5 w-5 text-blue-500" />
              Upcoming Tasks
            </h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {upcomingTasks.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No upcoming tasks
                </p>
              ) : (
                upcomingTasks.map(task => (
                  <div
                    key={task.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{task.title}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge
                            color={task.priority === 'urgent' ? 'failure' : 'info'}
                            size="sm"
                          >
                            {task.priority}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatDateShort(task.dueDate)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Checkbox
                          checked={task.isCompleted}
                          onChange={() => handleCompleteTask(task.id)}
                        />
                        <ActionButton
                          action="edit"
                          size="xs"
                          onClick={() => handleEditTask(task)}
                        />
                        <ActionButton
                          action="delete"
                          size="xs"
                          onClick={() => handleDeleteTask(task.id)}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
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
              />
            </div>

            <div>
              <Label htmlFor="description" className="mb-2 block">
                Description
              </Label>
              <Textarea
                id="description"
                rows={3}
                value={taskForm.getFieldValue('description') || ''}
                onChange={(e) => taskForm.setField('description', e.target.value)}
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
                value={taskForm.getFieldValue('dueDate') || ''}
                onChange={(e) => taskForm.setField('dueDate', e.target.value)}
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
                      {p.name || p.address_line1}{p.city ? `, ${p.city}` : ''}
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
          <Button onClick={handleAddTask} color="blue">
            {editingTask ? 'Update' : 'Add'} Task
          </Button>
        </Modal.Footer>
      </Modal>
    </PageLayout>
  );
}
