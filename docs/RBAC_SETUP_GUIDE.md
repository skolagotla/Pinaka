# RBAC Setup Guide

## How to Set Up Roles and Permissions

### Step 1: Initialize RBAC System (First Time Setup)

The RBAC system needs to be initialized before you can use it. This creates all system roles and their default permissions.

#### Option A: Using the Script (Recommended)

Run the initialization script from the terminal:

```bash
npx tsx scripts/initialize-rbac.ts
```

This will:
- ✅ Create all 13 system roles (Super Admin, PMC Admin, Property Manager, etc.)
- ✅ Seed the permission matrix with default permissions for each role
- ✅ Set up the RBAC database structure

#### Option B: Using the UI (Coming Soon)

You can also initialize from the RBAC Settings page (if the button is available).

---

### Step 2: View Roles and Permissions

1. **Go to RBAC Settings**: Navigate to `/admin/rbac` in the admin dashboard
2. **View Roles**: Click on the "Roles & Permissions" tab
   - You'll see all system roles (Super Admin, PMC Admin, Property Manager, etc.)
   - Each role shows its status (Active/Inactive)
3. **View Permissions**: 
   - Click "View Permissions" button next to any role
   - Or go to the "Permission Matrix" tab and select a role from the dropdown

---

### Step 3: Create Custom Roles (Optional)

If you need custom roles beyond the 13 system roles:

1. Go to **RBAC Settings** → **Roles & Permissions** tab
2. Click **"Create Role"** button
3. Fill in:
   - **System Name**: Internal identifier (e.g., `CUSTOM_PM`)
   - **Display Name**: User-friendly name (e.g., "Custom Property Manager")
   - **Description**: What this role is for
   - **Active**: Enable/disable the role
4. Click **OK** to save

**Note**: After creating a custom role, you'll need to assign permissions to it (see Step 4).

---

### Step 4: Manage Permissions for Roles

#### For System Roles

System roles (Super Admin, PMC Admin, etc.) have their permissions defined in code (`lib/rbac/permissionMatrix.ts`). These are the default permissions and are automatically set when you run the initialization script.

**To modify system role permissions:**
- Currently, you need to edit `lib/rbac/permissionMatrix.ts` and re-run the initialization script
- Or use the Permission Editor UI (if available)

#### For Custom Roles

Custom roles need permissions assigned manually:

1. **Via Code** (Current Method):
   - Edit `lib/rbac/permissionMatrix.ts`
   - Add entries for your custom role
   - Re-run initialization script

2. **Via UI** (Future Enhancement):
   - Permission Editor will allow you to:
     - Select a role
     - Choose resource categories
     - Select resources
     - Assign actions (CREATE, READ, UPDATE, DELETE, etc.)
     - Set conditions (scope restrictions)

---

### Step 5: Assign Roles to Users

1. Go to **Users** page (`/admin/users`)
2. Find the user you want to assign a role to
3. Click on the user or use the "Manage Roles" button
4. Select a role from the dropdown
5. Optionally set scopes (Portfolio, Property, Unit)
6. Click **Assign**

---

### Current System Roles

The following 13 system roles are created during initialization:

1. **Super Admin** - Full system access
2. **Platform Admin** - Platform-wide management
3. **Support Admin** - Support and customer service
4. **Billing Admin** - Billing and payments
5. **Audit Admin** - Audit logs and compliance
6. **PMC Admin** - Property Management Company administration
7. **Property Manager** - Property management
8. **Leasing Agent** - Leasing and applications
9. **Maintenance Tech** - Maintenance requests
10. **Accountant** - Financial management
11. **Owner/Landlord** - Property owners
12. **Tenant** - Tenants
13. **Vendor/Service Provider** - Service providers

---

### Permission Categories

Permissions are organized into 15 categories:

1. **Property & Unit Management** - Properties, units, portfolios
2. **Tenant Management** - Tenants, applications, screening
3. **Leasing & Applications** - Leases, applications, renewals
4. **Rent Payments** - Payment processing, receipts
5. **Accounting** - Financial records, expenses, reconciliation
6. **Reporting & Owner Statements** - Reports, statements
7. **Maintenance** - Maintenance requests, work orders
8. **Vendor Management** - Vendors, service providers
9. **Communication & Messaging** - Messages, notifications
10. **Document Management** - Documents, uploads, sharing
11. **Marketing & Listings** - Property listings, marketing
12. **Task & Workflow Management** - Tasks, workflows
13. **User & Role Management** - Users, roles, permissions
14. **Portfolio & Property Assignment** - Assignments, scopes
15. **System Settings** - Platform settings, API keys

---

### Troubleshooting

**Q: I don't see any roles in RBAC Settings**
- **A**: Run the initialization script: `npx tsx scripts/initialize-rbac.ts`

**Q: How do I change permissions for a system role?**
- **A**: Currently, edit `lib/rbac/permissionMatrix.ts` and re-run the initialization script. A UI editor is planned.

**Q: Can I delete system roles?**
- **A**: No, system roles cannot be deleted. You can deactivate them.

**Q: How do I assign permissions to a custom role?**
- **A**: Currently via code. A UI editor is planned for future releases.

---

### Next Steps

1. ✅ Initialize RBAC system (run script)
2. ✅ Review default permissions for each role
3. ✅ Create custom roles if needed
4. ✅ Assign roles to users
5. ✅ Set up scopes for users
6. ✅ Test permissions in your application

---

### API Endpoints

- `GET /api/rbac/roles` - List all roles
- `POST /api/rbac/roles` - Create a new role
- `GET /api/rbac/roles/[id]` - Get a specific role
- `PUT /api/rbac/roles/[id]` - Update a role
- `GET /api/rbac/roles/[id]/permissions` - Get permissions for a role

---

For more details, see:
- `docs/RBAC_DESIGN_DECISIONS.md` - Complete permission matrix
- `docs/RBAC_IMPLEMENTATION_STATUS.md` - Implementation details
- `lib/rbac/permissionMatrix.ts` - Permission matrix code

