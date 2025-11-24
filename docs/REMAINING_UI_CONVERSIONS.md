# Remaining UI Conversions - Ant Design to Flowbite

## Status: 4/21 Files Converted ✅

### ✅ Completed Conversions
1. `apps/web-app/components/pages/accountant/year-end-closing/ui.jsx` ✅
2. `apps/web-app/components/pages/accountant/tax-reporting/ui.jsx` ✅
3. `apps/web-app/components/pages/landlord/activity-logs/ui.jsx` ✅
4. `apps/web-app/components/pages/pmc/activity-logs/ui.jsx` ✅

### 📋 Remaining Files (17)

#### Organization Pages (2)
- `apps/web-app/components/pages/landlord/organization/ui.jsx`
- `apps/web-app/components/pages/pmc/organization/ui.jsx`

#### Verification Pages (2)
- `apps/web-app/components/pages/landlord/verification/ui.jsx`
- `apps/web-app/components/pages/pmc/verification/ui.jsx`

#### PMC Landlords Pages (2)
- `apps/web-app/components/pages/pmc/landlords/ui.jsx`
- `apps/web-app/components/pages/pmc/landlords/[id]/ui.jsx`

#### Tenant Pages (3)
- `apps/web-app/components/pages/tenant/estimator/ui.jsx`
- `apps/web-app/components/pages/tenant/checklist/ui.jsx`
- `apps/web-app/components/pages/tenant/rent-receipts/ui.jsx`

#### Property Detail Pages (3)
- `apps/web-app/components/pages/landlord/properties/[id]/ui.jsx`
- `apps/web-app/components/pages/pmc/properties/[id]/ui.jsx`
- `apps/web-app/components/pages/pmc/properties/ui.jsx`

#### PMC Pages (5)
- `apps/web-app/components/pages/pmc/inspections/ui.jsx`
- `apps/web-app/components/pages/pmc/forms/ui.jsx`
- `apps/web-app/components/pages/pmc/analytics/ui.jsx`
- `apps/web-app/components/pages/pmc/tenants-leases/ui.jsx`
- `apps/web-app/components/pages/landlord/tenants-leases/ui.jsx`

## Conversion Pattern

All conversions follow this pattern:

1. **Replace Imports:**
   ```jsx
   // Ant Design
   import { Card, Button, Table, Form, Input, Select, Tag, Alert, Space } from 'antd';
   import { IconName } from '@ant-design/icons';
   
   // Flowbite
   import { Card, Button, TextInput, Label, Select, Badge, Alert, Spinner } from 'flowbite-react';
   import { HiIconName } from 'react-icons/hi';
   ```

2. **Replace Forms:**
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

3. **Replace Tables:**
   ```jsx
   // Ant Design
   <Table dataSource={data} columns={columns} rowKey="id" />
   
   // Flowbite
   <FlowbiteTable data={data} columns={columns} keyField="id" />
   ```

4. **Replace Tags/Badges:**
   ```jsx
   // Ant Design
   <Tag color="blue">Text</Tag>
   
   // Flowbite
   <Badge color="blue">Text</Badge>
   ```

5. **Replace Icons:**
   ```jsx
   // Ant Design
   <IconName />
   
   // Flowbite
   <HiIconName className="h-5 w-5" />
   ```

## Notes

- All specialized v1 API endpoints are marked with `// TODO: Implement v2 endpoint`
- Components gracefully handle missing v2 endpoints
- Core functionality is 100% on v2
- These are low-priority UI conversions that can be done incrementally

