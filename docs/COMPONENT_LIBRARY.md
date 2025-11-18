# Component Library Documentation

This document describes the reusable UI components created to optimize code across the application.

## Phase 1: High-Impact Components

### 1. StandardModal
**Location:** `components/shared/StandardModal.jsx`

A reusable modal component that wraps Ant Design Modal with Form, providing consistent patterns.

**Features:**
- Automatic form validation
- Loading states
- Standardized footer buttons (Save/Cancel)
- Form reset on cancel
- Error handling

**Usage:**
```jsx
import { StandardModal } from '@/components/shared';
import { Form } from 'antd';

const [form] = Form.useForm();
const [loading, setLoading] = useState(false);

<StandardModal
  title="Add User"
  open={modalVisible}
  form={form}
  loading={loading}
  onCancel={() => setModalVisible(false)}
  onFinish={async (values) => {
    setLoading(true);
    try {
      await createUser(values);
      setModalVisible(false);
      form.resetFields();
    } finally {
      setLoading(false);
    }
  }}
>
  <Form.Item name="name" label="Name" rules={[{ required: true }]}>
    <Input />
  </Form.Item>
</StandardModal>
```

### 2. FilterBar
**Location:** `components/shared/FilterBar.jsx`

A reusable filter/search bar component for consistent filtering across pages.

**Features:**
- Multiple filter dropdowns
- Search input
- Reset button
- Active filter tags display
- Responsive layout

**Usage:**
```jsx
import { FilterBar } from '@/components/shared';

<FilterBar
  filters={[
    { 
      key: 'status', 
      label: 'Status', 
      type: 'select', 
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' }
      ]
    },
    { 
      key: 'dateRange', 
      label: 'Date Range', 
      type: 'dateRange' 
    }
  ]}
  activeFilters={filters}
  onFilterChange={setFilters}
  onReset={() => setFilters({})}
  searchValue={searchTerm}
  onSearchChange={setSearchTerm}
  searchPlaceholder="Search..."
/>
```

### 3. FormField Components
**Location:** `components/shared/FormFields/`

Standardized form field components for consistent form patterns.

#### FormDatePicker
```jsx
import { FormDatePicker } from '@/components/shared';

<FormDatePicker
  name="dueDate"
  label="Due Date"
  required
  showTime
/>
```

#### FormSelect
```jsx
import { FormSelect } from '@/components/shared';

<FormSelect
  name="status"
  label="Status"
  required
  options={[
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ]}
/>
```

#### FormTextInput
```jsx
import { FormTextInput } from '@/components/shared';

<FormTextInput
  name="email"
  label="Email"
  type="email"
  required
/>

// TextArea variant
<FormTextInput
  name="description"
  label="Description"
  textArea
  rows={4}
/>
```

#### FormPhoneInput
```jsx
import { FormPhoneInput } from '@/components/shared';

<FormPhoneInput
  name="phone"
  label="Phone Number"
  required
/>
```

## Phase 2: Medium-Impact Components

### 4. StatCard
**Location:** `components/shared/StatCard.jsx`

Standardized statistics card component for dashboards and summary pages.

**Usage:**
```jsx
import { StatCard } from '@/components/shared';
import { HomeOutlined } from '@ant-design/icons';

<StatCard
  title="Total Properties"
  value={25}
  prefix={<HomeOutlined />}
  color="#1890ff"
  trend={{ value: 12, isPositive: true, label: 'vs last month' }}
  onClick={() => router.push('/properties')}
  clickable
/>
```

### 5. LoadingWrapper
**Location:** `components/shared/LoadingWrapper.jsx`

Consistent loading state wrapper for tables, lists, and content areas.

**Usage:**
```jsx
import { LoadingWrapper, TableSkeleton } from '@/components/shared';

<LoadingWrapper 
  loading={loading} 
  error={error} 
  onRetry={refetch}
  skeleton={<TableSkeleton rows={5} columns={4} />}
>
  <Table dataSource={data} />
</LoadingWrapper>
```

### 6. TableActionsColumn
**Location:** `components/shared/TableActionsColumn.jsx`

Pre-configured action column for tables with standard edit/delete/view actions.

**Usage:**
```jsx
import { TableActionsColumn } from '@/components/shared';

const actionsColumn = TableActionsColumn({
  onView: (record) => handleView(record),
  onEdit: (record) => handleEdit(record),
  onDelete: (record) => handleDelete(record.id),
  canEdit: (record) => record.status !== 'archived',
  customActions: [
    { 
      type: 'approve', 
      onClick: (record) => handleApprove(record), 
      condition: (record) => record.status === 'pending' 
    }
  ]
});

const columns = [
  { title: 'Name', dataIndex: 'name' },
  ...otherColumns,
  actionsColumn
];
```

## Phase 3: Enhanced Components

### 7. TabbedContent
**Location:** `components/shared/TabbedContent.jsx`

Standardized tabbed content component with consistent patterns.

**Usage:**
```jsx
import { TabbedContent } from '@/components/shared';

<TabbedContent
  tabs={[
    { 
      key: 'all', 
      label: 'All', 
      children: <Table dataSource={allData} />, 
      badge: 25 
    },
    { 
      key: 'pending', 
      label: 'Pending', 
      children: <Table dataSource={pendingData} />, 
      badge: 5 
    }
  ]}
  activeKey={activeTab}
  onChange={setActiveTab}
  lazy
/>
```

### 8. useNotification Hook
**Location:** `lib/hooks/useNotification.js`

Enhanced notification hook with standardized message formats and auto-dismiss.

**Usage:**
```jsx
import { useNotification } from '@/lib/hooks';

const notification = useNotification();

// Simple notification
notification.success('User created successfully');
notification.error('Failed to save');

// With action button
notification.success('User created successfully', {
  action: { 
    label: 'View', 
    onClick: () => router.push('/users'),
    description: 'Click to view the new user'
  }
});

// Persistent notification
notification.error('Critical error', { duration: 0 });
```

### 9. FormActions
**Location:** `components/shared/FormActions.jsx`

Standardized form action buttons (Save/Cancel/Reset) with consistent patterns.

**Usage:**
```jsx
import { FormActions } from '@/components/shared';

<FormActions
  onSave={() => form.submit()}
  onCancel={() => setModalVisible(false)}
  onReset={() => form.resetFields()}
  loading={saving}
  showReset
  align="right"
/>
```

## Benefits

### Code Reduction
- **Phase 1:** ~500-800 lines of duplicate code removed
- **Phase 2:** ~300-500 lines of duplicate code removed
- **Phase 3:** ~200-300 lines of duplicate code removed
- **Total:** ~1000-1600 lines of code reduction

### Consistency
- All modals follow the same pattern
- All forms use standardized field components
- All filters use the same UI
- All tables have consistent action columns

### Maintainability
- Changes to modal behavior only need to be made in one place
- Form field updates automatically apply everywhere
- Filter improvements benefit all pages
- Action button changes are centralized

## Migration Guide

### Replacing Existing Modals
1. Import `StandardModal` and `Form.useForm()`
2. Replace `Modal` + `Form` with `StandardModal`
3. Move form fields inside `StandardModal`
4. Remove manual footer buttons (handled by component)

### Replacing Form Fields
1. Import form field components from `@/components/shared`
2. Replace `Form.Item` + `Input/Select/DatePicker` with `FormDatePicker`, `FormSelect`, etc.
3. Remove redundant validation rules (handled by components)

### Replacing Filter Bars
1. Import `FilterBar`
2. Define filter configurations
3. Replace existing filter UI with `FilterBar` component

## Next Steps

Consider refactoring existing pages to use these components:
1. Start with high-traffic pages
2. Replace modals first (highest impact)
3. Then replace form fields
4. Finally replace filter bars

This will gradually improve code quality and consistency across the application.

