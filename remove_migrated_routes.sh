#!/bin/bash
# Script to remove migrated Next.js API routes
# Run this AFTER testing confirms everything works

echo "🗑️  Removing migrated Next.js API routes..."
echo ""

# Properties
rm -f apps/api-server/pages/api/v1/properties/index.ts
rm -f apps/api-server/pages/api/v1/properties/[id].ts
rm -f apps/api-server/pages/api/v1/properties/[id]/units/index.ts

# Tenants (basic CRUD - keep specialized endpoints for now)
rm -f apps/api-server/pages/api/v1/tenants/index.ts
rm -f apps/api-server/pages/api/v1/tenants/[id].ts

# Landlords
rm -f apps/api-server/pages/api/v1/landlords/index.ts
rm -f apps/api-server/pages/api/v1/landlords/[id].ts

# Leases (basic CRUD - keep renew/terminate for now if they have special logic)
rm -f apps/api-server/pages/api/v1/leases/index.ts
rm -f apps/api-server/pages/api/v1/leases/[id].ts

# Units
rm -f apps/api-server/pages/api/v1/units/index.ts
rm -f apps/api-server/pages/api/v1/units/[id].ts

# Maintenance (Work Orders)
rm -f apps/api-server/pages/api/v1/maintenance/index.ts
rm -f apps/api-server/pages/api/v1/maintenance/[id].ts
rm -f apps/api-server/pages/api/v1/maintenance/[id]/comments.ts
rm -f apps/api-server/pages/api/v1/maintenance/[id]/add-comment.ts

# Notifications
rm -f apps/api-server/pages/api/v1/notifications/index.ts
rm -f apps/api-server/pages/api/v1/notifications/[id].ts
rm -f apps/api-server/pages/api/v1/notifications/read-all.ts

# Documents (Attachments - basic CRUD)
rm -f apps/api-server/pages/api/v1/documents/index.ts
rm -f apps/api-server/pages/api/v1/documents/[id].ts
rm -f apps/api-server/pages/api/v1/documents/upload.ts

# Admin Auth (if fully migrated)
# rm -f apps/api-server/pages/api/admin/auth/login.ts
# rm -f apps/api-server/pages/api/admin/auth/me.ts

# Admin Organizations
rm -f apps/api-server/pages/api/admin/organizations/index.ts
rm -f apps/api-server/pages/api/admin/organizations/[id].ts

# Admin Audit Logs
rm -f apps/api-server/pages/api/admin/audit-logs/index.ts

echo "✅ Migrated routes removed"
echo ""
echo "⚠️  Note: Specialized endpoints (renew, terminate, approve, etc.) kept for now"
echo "   These may need custom logic migration later"
