# Legacy Code Removal Status

**Date:** January 2025  
**Status:** In Progress

---

## ✅ Completed

### Legacy Hooks Removed
- ✅ `lib/hooks/useApiErrorHandler.js` - Deleted
- ✅ `lib/hooks/useApiClient.js` - Deleted  
- ✅ `lib/hooks/useApiCall.js` - Deleted
- ✅ Updated `lib/hooks/index.js` - Removed exports

### Hooks Updated to Use useUnifiedApi
- ✅ `lib/hooks/useDataLoader.js` - Now uses `useUnifiedApi`
- ✅ `lib/hooks/useFormSubmission.js` - Now uses `useUnifiedApi`
- ✅ `lib/hooks/useDocumentVault.js` - Now uses `useUnifiedApi`

### Legacy API Endpoints Removed
- ✅ **154 legacy API endpoints** removed
- ✅ All endpoints that have v1 equivalents have been deleted
- ✅ Kept system endpoints (admin, auth, cron, stripe, webhooks, rbac, organizations)

### Components Updated
- ✅ `components/shared/LibraryClient.jsx` - Removed `useApiErrorHandler` import

---

## ⚠️ Remaining Work

### Components Still Using Legacy Hooks
The following components still import or use legacy hooks and need to be updated:

1. `components/shared/NotificationCenter.jsx`
2. `components/shared/PMCCommunicationChannel.jsx`
3. `components/shared/MessagesClient.jsx`
4. `components/pages/landlord/rent-payments/ui.jsx`
5. `components/shared/MaintenanceClient.jsx`
6. `components/shared/LeaseTerminationModal.jsx`
7. `components/shared/LeaseRenewalModal.jsx`
8. `components/shared/TicketViewModal.jsx`
9. `components/shared/BulkOperationModal.jsx`
10. `components/shared/ApprovalRequestsList.jsx`
11. `components/shared/PMCDashboardWidget.jsx`
12. `components/shared/PermissionSettings.jsx`
13. `components/shared/FinancialReports.jsx`
14. `components/shared/ApprovalRequestModal.jsx`
15. `components/shared/ActivityLogWidget.jsx`
16. `components/shared/ActivityLogViewer.jsx`
17. `components/maintenance/EscalateButton.jsx`
18. `components/TimezoneSelector.jsx`
19. `components/SigningFlow.jsx`
20. `components/SignatureUpload.jsx`
21. `components/GlobalSearch.jsx`

**Action Required:** Update these components to:
- Use `v1Api` client for all API calls (preferred)
- Or use `useUnifiedApi` hook if they need state management
- Remove any direct `fetch('/api/...')` calls to legacy endpoints

---

## 📋 Migration Pattern

### Before (Legacy)
```javascript
import { useApiErrorHandler } from '@/lib/hooks';

const { fetchWithErrorHandling } = useApiErrorHandler();
const response = await fetchWithErrorHandling('/api/properties', { method: 'GET' });
```

### After (v1Api - Preferred)
```javascript
import { v1Api } from '@/lib/api/v1-client';

const response = await v1Api.properties.list({ page: 1, limit: 50 });
const properties = response.data;
```

### After (useUnifiedApi - If State Needed)
```javascript
import { useUnifiedApi } from '@/lib/hooks';

const { fetch } = useUnifiedApi();
const response = await fetch('/api/v1/properties', { method: 'GET' });
```

---

## 🎯 Next Steps

1. **Update Remaining Components** - Replace legacy hooks with v1Api or useUnifiedApi
2. **Remove Unused Imports** - Clean up any remaining legacy imports
3. **Verify** - Run tests and verify no broken references
4. **Document** - Update architecture docs

---

**Last Updated:** January 2025

