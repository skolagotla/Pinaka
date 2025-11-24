# Ant Design to Flowbite Conversion Status

## ✅ Completed (5/21 files)

1. ✅ `apps/web-app/components/pages/accountant/year-end-closing/ui.jsx`
2. ✅ `apps/web-app/components/pages/accountant/tax-reporting/ui.jsx`
3. ✅ `apps/web-app/components/pages/landlord/activity-logs/ui.jsx`
4. ✅ `apps/web-app/components/pages/pmc/activity-logs/ui.jsx`
5. ✅ `apps/web-app/components/pages/pmc/landlords/ui.jsx`

## 🔄 In Progress

6. `apps/web-app/components/pages/landlord/organization/ui.jsx` - Needs useLoading import fix
7. `apps/web-app/components/pages/pmc/organization/ui.jsx`

## 📋 Remaining (14 files)

### Simple Conversions (Estimated 30-60 min each)
8. `apps/web-app/components/pages/landlord/verification/ui.jsx`
9. `apps/web-app/components/pages/pmc/verification/ui.jsx`
10. `apps/web-app/components/pages/pmc/landlords/[id]/ui.jsx`
11. `apps/web-app/components/pages/pmc/properties/ui.jsx`
12. `apps/web-app/components/pages/landlord/properties/[id]/ui.jsx`
13. `apps/web-app/components/pages/pmc/properties/[id]/ui.jsx`

### Medium Complexity (Estimated 1-2 hours each)
14. `apps/web-app/components/pages/tenant/estimator/ui.jsx`
15. `apps/web-app/components/pages/tenant/checklist/ui.jsx`
16. `apps/web-app/components/pages/tenant/rent-receipts/ui.jsx`

### Complex Conversions (Estimated 2-4 hours each)
17. `apps/web-app/components/pages/pmc/inspections/ui.jsx` (~670 lines)
18. `apps/web-app/components/pages/pmc/forms/ui.jsx` (~1278 lines)
19. `apps/web-app/components/pages/pmc/analytics/ui.jsx` (~558 lines)
20. `apps/web-app/components/pages/pmc/tenants-leases/ui.jsx` (~1181 lines)
21. `apps/web-app/components/pages/landlord/tenants-leases/ui.jsx` (~1855 lines)

## Conversion Patterns

### Imports
```jsx
// Ant Design
import { Card, Button, Table, Form, Input, Select, Tag, Alert, Space } from 'antd';
import { IconName } from '@ant-design/icons';

// Flowbite
import { Card, Button, TextInput, Label, Select, Badge, Alert, Spinner } from 'flowbite-react';
import { HiIconName } from 'react-icons/hi';
```

### Forms
```jsx
// Ant Design
const [form] = Form.useForm();
<Form form={form} onFinish={handleSubmit}>
  <Form.Item name="field" label="Label">
    <Input />
  </Form.Item>
</Form>

// Flowbite
const { formData, updateField } = useFormState({ field: '' });
<div>
  <Label htmlFor="field" value="Label" />
  <TextInput id="field" value={formData.field} onChange={(e) => updateField('field', e.target.value)} />
</div>
```

### Tables
```jsx
// Ant Design
<Table dataSource={data} columns={columns} rowKey="id" />

// Flowbite
<FlowbiteTable data={data} columns={columns} keyField="id" />
```

### Tags/Badges
```jsx
// Ant Design
<Tag color="blue">Text</Tag>

// Flowbite
<Badge color="blue">Text</Badge>
```

## Notes

- All specialized v1 API endpoints are marked with `// TODO: Implement v2 endpoint`
- Components gracefully handle missing v2 endpoints
- Core functionality is 100% on v2
- These are UI-only conversions that don't affect functionality

