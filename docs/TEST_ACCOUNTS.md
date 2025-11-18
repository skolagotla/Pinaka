# Test Accounts - PT Database

This document lists all test accounts created for the PT (test) database. These accounts are for development and testing purposes only.

**⚠️ IMPORTANT:** These credentials are for TESTING ONLY. Never use these in production.

---

## Database Information

- **Database Name:** `PT`
- **Database Type:** PostgreSQL
- **Purpose:** Test/Development environment
- **Access:** Use `/db-switcher` page to switch to PT database
- **Authentication Mode:** Email/Password (not Auth0)
- **AUTH_MODE:** `auto` (automatically set when switching to PT database)

---

## Admin Accounts

### Super Admin

**Primary Admin Account - Full System Access**

- **Email/User ID:** `superadmin@admin.local`
- **Password:** `superadmin`
- **Base Role:** `SUPER_ADMIN`
- **RBAC Role:** `SUPER_ADMIN`
- **Access Level:** Full system access, can manage all users, roles, and settings
- **Login URL:** `http://localhost:3000/admin/login`
- **Created:** Via `scripts/create-superadmin-pt.js`

**Notes:**
- This is the main admin account for testing
- Has access to all admin features including `/admin/users`, `/admin/rbac`, etc.
- Can assign RBAC roles to other users
- Can switch databases via `/db-switcher`
- Can manage all PMC companies and users

---

## PMC Admin Accounts

**Property Management Company Admin Accounts**

**⚠️ Important:** The old PMC Admin accounts (`pmcadmin1@pmc.local` through `pmcadmin5@pmc.local`) linked to "Test Property Management Company" have been **deleted**. Only the AB Homes PMC Admins remain (see below).

**Current Active PMC Admins:**
- 2 PMC Admin accounts linked to AB Homes PMC company
- See "AB Homes PMC Company" section below for details

---

## Test PMC Company

**Property Management Company Record**

- **Company Name:** Test Property Management Company
- **Email:** `testpmc@pmc.local`
- **Phone:** `555-0100`
- **Status:** `APPROVED`
- **Created:** Via `scripts/create-pmc-admins-pt.js`

**Notes:**
- This is a PMC company record (not an admin user)
- Can be used to test PMC-level features
- **⚠️ Note:** The PMC Admin users (`pmcadmin1-5@pmc.local`) linked to this company have been **deleted**
- This PMC company record still exists but has no active admin users

---

## Default Passwords

### Admin Accounts
- **Super Admin:** `superadmin`
- **PMC Admins (AB Homes):** `pmcadmin`
- **Other Admins:** `admin123` (or value from `ADMIN_DEFAULT_PASSWORD` env var)

**Note:** Old PMC Admin accounts (pmcadmin1-5) have been deleted. Only AB Homes PMC Admins remain.

### Regular Users (Landlords, Tenants, PMCs)
- **Default Password:** `password123` (or value from `USER_DEFAULT_PASSWORD` env var)
- **AB Homes Landlords:** `testlld` (special password for pmc1-lld1 through pmc1-lld10)
- **Note:** These are temporary passwords for testing. In production, passwords should be hashed using bcrypt.

---

## Login URLs

### Admin Login (Super Admin)
- **URL:** `http://localhost:3000/admin/login`
- **Use For:** Super Admin account (`superadmin@admin.local`)

### Main App Login (PMC Admins, Landlords, Tenants)
- **URL:** `http://localhost:3000/`
- **Use For:** PMC Admin accounts, regular users

---

## Quick Reference

| Account Type | Email Pattern | Password | Login URL | Access Level |
|-------------|---------------|----------|-----------|--------------|
| Super Admin | `superadmin@admin.local` | `superadmin` | `/admin/login` | Full system access |
| PMC Admin (AB Homes) | `pmc1-admin@pmc.local`, `pmc2-admin@pmc.local` | `pmcadmin` | `/` | PMC-scoped access |
| Landlord (AB Homes) | `pmc1-lld1@pmc.local` to `pmc1-lld10@pmc.local` | `testlld` | `/` | Landlord access |
| AB Homes PMC | `ab-homes@pmc.local` | `password123` | `/` | PMC company record |

---

## Creating New Test Accounts

When creating new test accounts, please update this file with:

1. **Account Details:**
   - Email/User ID
   - Password
   - Role(s) (base role and RBAC role if applicable)
   - Associated PMC/Company (if applicable)

2. **Access Information:**
   - Login URL
   - Access level/permissions

3. **Creation Method:**
   - Script name or manual creation method
   - Date created

---

## Scripts Reference

### Create Super Admin
```bash
npx tsx scripts/create-superadmin-pt.js
```

### Create PMC Admins (2 users for AB Homes)
```bash
npx tsx scripts/create-ab-homes-pmc-admins.js
```

### Create Landlords (10 users for AB Homes)
```bash
npx tsx scripts/create-pmc1-landlords.js
```

### Create Random Properties for Landlords
```bash
npx tsx scripts/create-random-properties-for-landlords.js
```

**Note:** This script creates 4-9 random properties per landlord, with at least one multi-unit property (2-4 units) per landlord. Uses random Ontario addresses and postal codes.

### Delete Old PMC Admins
```bash
npx tsx scripts/delete-old-pmc-admins.js
```

### Delete User by Email
```bash
npx tsx scripts/delete-user-by-email.js <email>
```

---

## Last Updated

- **Date:** January 17, 2025
- **Updated By:** System
- **Accounts Count:** 
  - Super Admin: 1
  - PMC Admins: 2 (AB Homes only - old Test PMC admins deleted)
  - Landlords: 10 (AB Homes PMC)
  - PMC Companies: 2 (Test Property Management Company + AB Homes)
  - Properties: ~50-90 (4-9 per landlord, created via `create-random-properties-for-landlords.js`)

---

## Notes

- All test accounts are in the **PT database** only
- To use these accounts, switch to PT database using `/db-switcher` page
- Passwords are temporary and not hashed (for testing convenience)
- In production, all passwords should be properly hashed using bcrypt
- Test accounts should never be used in production environments
- **Authentication Mode:** When using PT database, the system uses email/password authentication (not Auth0)
- **Database Switching:** Use `/db-switcher` to switch between `nandi` (production) and `PT` (test) databases
- **Test DB Banner:** When using PT database, a red "Test DB" banner appears at the top of the application
- **Properties:** Each landlord has 4-9 random properties with Ontario addresses. At least one property per landlord is multi-unit (2-4 units).

---

## AB Homes PMC Company

**Property Management Company for Testing**

- **Company Name:** AB Homes
- **Email:** `ab-homes@pmc.local`
- **Phone:** `555-0200`
- **Status:** `APPROVED`
- **Created:** Via `scripts/create-ab-homes-pmc-admins.js`

### AB Homes PMC Admin Accounts

#### PMC Admin 1 (AB Homes)
- **Email/User ID:** `pmc1-admin@pmc.local`
- **Password:** `pmcadmin`
- **Base Role:** `PLATFORM_ADMIN`
- **RBAC Role:** `PMC_ADMIN`
- **PMC Company:** AB Homes
- **Login URL:** `http://localhost:3000/` (main app login)
- **Created:** Via `scripts/create-ab-homes-pmc-admins.js`

#### PMC Admin 2 (AB Homes)
- **Email/User ID:** `pmc2-admin@pmc.local`
- **Password:** `pmcadmin`
- **Base Role:** `PLATFORM_ADMIN`
- **RBAC Role:** `PMC_ADMIN`
- **PMC Company:** AB Homes
- **Login URL:** `http://localhost:3000/` (main app login)
- **Created:** Via `scripts/create-ab-homes-pmc-admins.js`

**Notes:**
- Both PMC Admin accounts share the same password: `pmcadmin`
- Both are linked to the same AB Homes PMC company
- Can access RBAC Settings at `/rbac` (not `/admin/rbac`)
- Can manage users, roles, and permissions within their PMC scope
- Cannot access `/admin/users` (requires SUPER_ADMIN role)
- When assigning roles, they can only see and assign PMC-related roles and user roles (not admin roles)
- Both users can be assigned to the same PMC company via the PMC Company dropdown in the edit user modal
- Can view and manage all landlords linked to AB Homes PMC
- Can view and manage all properties owned by AB Homes landlords
- Dashboard shows counts for managed landlords and properties

### AB Homes Landlord Accounts

**10 Landlord Accounts Linked to AB Homes PMC**

All landlords are linked to AB Homes PMC via `PMCLandlord` relationship and can be managed by AB Homes PMC Admins.

| # | Email/User ID | Password | Name | Status | Properties |
|---|---------------|----------|------|--------|------------|
| 1 | `pmc1-lld1@pmc.local` | `testlld` | Christopher Flores | APPROVED | 4-9 properties |
| 2 | `pmc1-lld2@pmc.local` | `testlld` | Kimberly King | APPROVED | 4-9 properties |
| 3 | `pmc1-lld3@pmc.local` | `testlld` | Linda Jackson | APPROVED | 4-9 properties |
| 4 | `pmc1-lld4@pmc.local` | `testlld` | Richard Robinson | APPROVED | 4-9 properties |
| 5 | `pmc1-lld5@pmc.local` | `testlld` | Lisa White | APPROVED | 4-9 properties |
| 6 | `pmc1-lld6@pmc.local` | `testlld` | Sandra Torres | APPROVED | 4-9 properties |
| 7 | `pmc1-lld7@pmc.local` | `testlld` | Mary Jackson | APPROVED | 4-9 properties |
| 8 | `pmc1-lld8@pmc.local` | `testlld` | Michael Martinez | APPROVED | 4-9 properties |
| 9 | `pmc1-lld9@pmc.local` | `testlld` | Robert King | APPROVED | 4-9 properties |
| 10 | `pmc1-lld10@pmc.local` | `testlld` | Susan Martin | APPROVED | 4-9 properties |

**Login Information:**
- **Login URL:** `http://localhost:3000/` (main app login)
- **Password:** `testlld` (for all 10 landlords)
- **User ID Format:** Can use `pmc1-lld1` through `pmc1-lld10` (without @pmc.local) or full email
- **Created:** Via `scripts/create-pmc1-landlords.js`

**Properties:**
- Each landlord has 4-9 random properties created via `scripts/create-random-properties-for-landlords.js`
- At least one property per landlord is multi-unit (2-4 units)
- Properties use random Ontario addresses and postal codes
- Property types: "Multi-family" or "Single-family"
- Properties are linked to their respective landlords

**Notes:**
- All landlords share the same password: `testlld`
- All are linked to AB Homes PMC company via `PMCLandlord` relationship
- All have `APPROVED` status and can log in immediately
- Can be managed by AB Homes PMC Admins
- Names are randomly generated for testing purposes
- Can view and manage their own properties
- Can add/edit units within their properties

---

## Authentication & Database Information

### Authentication Modes

**PT Database (Test):**
- Uses email/password authentication
- `AUTH_MODE` is set to `auto` (or `password`)
- Login at `http://localhost:3000/` (main app) or `http://localhost:3000/admin/login` (admin)
- No Auth0 required

**Nandi Database (Production):**
- Uses Auth0 authentication
- `AUTH_MODE` is set to `auth0`
- Login via Auth0 universal login page

### Database Switching

1. Navigate to `/db-switcher` page
2. Select the target database from the dropdown (e.g., `PT` or `nandi`)
3. Click "Switch Database"
4. The system will:
   - Update `.db-config.json` with the selected database
   - Update `AUTH_MODE` in `.env.local` (PT → `auto`, nandi → `auth0`)
   - Restart the server automatically

### Test DB Indicator

When using the PT database, a red "Test DB" banner appears at the top of the application to indicate you're in the test environment.

---

## Deleted Accounts

The following accounts have been deleted and should not be used:

- `pmcadmin1@pmc.local` through `pmcadmin5@pmc.local` (old Test PMC admins)
- `spamsambi@gmail.com` (removed user)

---

## Future Test Accounts

As new test accounts are created, they will be added below:

### [Add new test accounts here]

---
