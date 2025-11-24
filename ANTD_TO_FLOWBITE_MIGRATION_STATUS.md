# Ant Design → Flowbite Migration Status

## ✅ Completed Migrations

### Core Shared Components
- ✅ `SearchBar.jsx` - Migrated to Flowbite TextInput + react-icons
- ✅ `FilterBar.jsx` - Migrated to Flowbite Card, Select, TextInput, Badge
- ✅ `TableRenderers.jsx` - Migrated to Flowbite Badge + react-icons
- ✅ `PropertySelector.jsx` - Migrated to Flowbite Select, Badge, Button
- ✅ `StatusTag.tsx` - Migrated to Flowbite Badge + react-icons
- ✅ `DeleteConfirmButton.jsx` - Uses FlowbitePopconfirm
- ✅ `ButtonGroup.jsx` - Removed Ant Design Space, uses Tailwind flexbox
- ✅ `FormActions.jsx` - Migrated to Tailwind flexbox
- ✅ `LoadingWrapper.jsx` - Migrated to Flowbite Spinner, Alert, Button

### Form Components
- ✅ `AddressAutocomplete.jsx` - Migrated to Flowbite TextInput, Spinner, Badge
- ✅ `PhoneNumberInput.jsx` - Migrated to Flowbite TextInput + react-icons
- ✅ `PostalCodeInput.jsx` - Migrated to Flowbite TextInput + react-icons
- ✅ `RegionSelect.jsx` - Migrated to Flowbite Select + react-icons

### Page Components
- ✅ `SignInCard.jsx` - Migrated to Flowbite Card, TextInput, Button, Alert
- ✅ `ErrorBoundary.jsx` - Migrated to Flowbite Card, Button, Alert
- ✅ `PageHeader.tsx` - Migrated to Tailwind + react-icons

### Hooks & Utilities
- ✅ `useNotification.js` - Migrated to use notify helper (no Ant Design)
- ✅ `notification-helper.js` - Removed Ant Design dependency, uses custom toast

### Migration Tools
- ✅ Created `scripts/migrate-antd-to-flowbite.js` - Automated migration script

## 🔄 Remaining Work

### Files Still Using Ant Design: ~98 files

#### High Priority (Frequently Used)
1. **Form Components** (3 files)
   - `TomTomAddressAutocomplete.jsx`
   - `MapboxAddressAutocomplete.jsx`
   - `NominatimAddressAutocomplete.jsx`
   - *Pattern: Same as AddressAutocomplete - replace Input→TextInput, Spin→Spinner, List→div, Tag→Badge*

2. **Property Detail Components** (4 files)
   - `PropertyTenantsTab.jsx`
   - `PropertyUnitsTab.jsx`
   - `PropertyOverviewTab.jsx`
   - `PropertyMaintenanceTab.jsx`

3. **Settings Components** (2 files)
   - `LandlordOrganizationSettings.jsx`
   - `PMCOrganizationSettings.jsx`

4. **RBAC Components** (3 files)
   - `AdminUsersRBACIntegration.tsx`
   - `RoleAssignmentModal.tsx`
   - `ScopeAssignment.tsx`

5. **Shared Components** (~40 files)
   - `LibraryClient.jsx`
   - `TicketViewModal.jsx`
   - `ApprovalsTable.jsx`
   - `PDFViewerModal.jsx`
   - `PaymentStatusTag.jsx`
   - `PermissionSettings.jsx`
   - `MemoizedTable.jsx`
   - `PersonalDocumentsView.jsx`
   - `ApprovalRequestsList.jsx`
   - `OrganizationStatusBanner.jsx`
   - `ActivityLogViewer.jsx`
   - `TableActionButton.jsx`
   - `BulkActionsToolbar.jsx`
   - `SettingsClient.jsx`
   - `PMCDashboardWidget.jsx`
   - `MaintenanceClient.jsx`
   - `PMCCommunicationChannel.jsx`
   - `TabbedContent.jsx`
   - `AdvancedFilters.jsx`
   - `PageBanner.jsx`
   - `BulkOperationModal.jsx`
   - `ApplicationsTable.tsx`
   - `ApprovalRequestModal.jsx`
   - `DashboardWidget.jsx`
   - `OptimizedCard.jsx`
   - `PhoneDisplay.jsx`
   - `PaymentCalendar.jsx`
   - `LTBDocumentsGrid.jsx`
   - `SafeStatistic.jsx`
   - `PersonalDocumentsContent.jsx`
   - `FloatingActionButton.jsx`
   - `TableActionsColumn.jsx`
   - `DashboardStatCard.jsx`
   - And more...

6. **Maintenance Components** (~6 files)
   - `EscalateButton.jsx`
   - `TicketViewer.jsx`
   - `MaintenanceSubmitRequestModal.jsx`
   - `MaintenanceCloseCommentModal.jsx`
   - `MaintenanceViewModal.jsx`
   - `MaintenanceRejectApprovalModal.jsx`
   - `MaintenanceCreateTicketModal.jsx`
   - `MaintenanceExpenseTracker.jsx`
   - `MaintenanceVendorSelector.jsx`

7. **App Pages** (~10 files)
   - `app/contractor/dashboard/page.jsx`
   - `app/vendor/dashboard/page.jsx`
   - `app/verifications/ui.jsx`
   - `app/accept-invitation/page.jsx`
   - `app/account-suspended/page.jsx`
   - `app/db-switcher/page.jsx`
   - `app/providers.jsx`

8. **Hooks** (~15 files)
   - `useMutualApproval.js`
   - `useRentReceipts.js`
   - `useDocumentVaultFeature.js`
   - `useAddressForm.js`
   - `useFormSubmission.js`
   - `useRentPaymentFeature.js`
   - `useDocumentVault.js`
   - `useMaintenanceTicket.js`
   - `useBulkOperations.js`
   - `useSettings.js`
   - `useDashboardMetrics.js`
   - `useResizableTable.js`
   - `useDocumentUpload.js`
   - `useActionButtons.js`
   - `useTheme.js`
   - `usePinakaCRUD.js`
   - `useMessage.js`

9. **Other Components** (~15 files)
   - `SignatureUpload.jsx`
   - `TimezoneSelector.jsx`
   - `PropertyContextBanner.jsx`
   - `ThemeSelector.jsx`
   - `LogViewer.jsx`
   - `PDFViewerModal.jsx`
   - `DocumentChat.jsx`
   - `ResizableTable.jsx`
   - `LazyProComponents.jsx`
   - And more...

## 📋 Migration Patterns

### Common Replacements

#### Icons
```javascript
// Before
import { SearchOutlined } from '@ant-design/icons';
<SearchOutlined />

// After
import { HiSearch } from 'react-icons/hi';
<HiSearch className="h-4 w-4" />
```

#### Components
```javascript
// Input → TextInput
import { Input } from 'antd';
<Input prefix={<Icon />} />

// After
import { TextInput } from 'flowbite-react';
<div className="relative">
  <div className="absolute inset-y-0 left-0 flex items-center pl-3">
    <Icon className="h-5 w-5 text-gray-400" />
  </div>
  <TextInput className="pl-10" />
</div>

// Tag → Badge
import { Tag } from 'antd';
<Tag color="success">Text</Tag>

// After
import { Badge } from 'flowbite-react';
<Badge color="success">Text</Badge>

// Spin → Spinner
import { Spin } from 'antd';
<Spin />

// After
import { Spinner } from 'flowbite-react';
<Spinner size="sm" />

// Space → div with flex
import { Space } from 'antd';
<Space size="middle">
  <Button>1</Button>
  <Button>2</Button>
</Space>

// After
<div className="flex items-center gap-3">
  <Button>1</Button>
  <Button>2</Button>
</div>

// Typography.Text → span
import { Typography } from 'antd';
const { Text } = Typography;
<Text>Content</Text>

// After
<span>Content</span>
// or with styling:
<span className="text-gray-600">Content</span>
```

## 🚀 How to Complete Remaining Migrations

### Option 1: Use the Migration Script
```bash
# List all files with Ant Design
node scripts/migrate-antd-to-flowbite.js

# Migrate a specific file
node scripts/migrate-antd-to-flowbite.js apps/web-app/components/YourComponent.jsx
```

### Option 2: Manual Migration
1. Replace icon imports (use the script or manual find/replace)
2. Replace component imports (Input→TextInput, Tag→Badge, etc.)
3. Update JSX to use Flowbite components
4. Replace Ant Design props with Flowbite equivalents
5. Test the component

### Option 3: Batch Migration
For similar components (like the 3 address autocomplete files), you can:
1. Use AddressAutocomplete.jsx as a template
2. Copy the pattern to the other files
3. Update API-specific logic

## 📝 Final Steps

1. **Remove Ant Design from package.json**
   ```bash
   # After all migrations are complete
   cd apps/web-app
   pnpm remove antd @ant-design/icons @ant-design/pro-components @ant-design/charts
   ```

2. **Update imports across codebase**
   - Search for any remaining `from 'antd'` imports
   - Replace with Flowbite equivalents

3. **Test all pages**
   - Verify UI looks correct
   - Check for console errors
   - Test interactive components

4. **Update documentation**
   - Update component usage examples
   - Update style guide

## 🎯 Priority Order

1. **Form Components** (3 files) - Easy, similar pattern
2. **Shared Components** (40 files) - High impact, used everywhere
3. **Hooks** (15 files) - Critical for functionality
4. **Page Components** (10 files) - User-facing
5. **Other Components** (30 files) - Lower priority

## ✅ Completion Checklist

- [x] Core shared components migrated
- [x] Form input components migrated
- [x] Notification system migrated
- [x] Migration script created
- [ ] All form autocomplete components (3 remaining)
- [ ] All shared components (~40 remaining)
- [ ] All hooks (~15 remaining)
- [ ] All page components (~10 remaining)
- [ ] All other components (~30 remaining)
- [ ] Remove Ant Design from package.json
- [ ] Final testing and verification

## 📊 Progress

**Completed:** ~15 files (15%)
**Remaining:** ~98 files (85%)
**Estimated Time:** 2-3 days for complete migration

---

*Last Updated: $(date)*
*Migration started: Core components completed*

