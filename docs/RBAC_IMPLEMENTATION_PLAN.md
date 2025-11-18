# RBAC Implementation Plan

## Overview
This document outlines the implementation plan for the Role-Based Access Control (RBAC) system, including both permissions/access control and feature requirements.

**Approach**: RBAC + Features - Defining RBAC for existing and new features, assuming features will exist.

**Date**: 2025-11-16

---

## Implementation Phases

### Phase 1: Data Model & Schema
**Goal**: Define and implement the database schema for RBAC

#### 1.1 Core Models
- [ ] **User Model** - Extend existing user model with role relationships
- [ ] **Role Model** - Define all roles (Admin, PMC Admin, PM, Leasing Agent, etc.)
- [ ] **Permission Model** - Store permissions (resource + action + conditions)
- [ ] **Scope Model** - Portfolio → Property → Unit hierarchy
- [ ] **UserRole Model** - Many-to-many relationship with scopes
- [ ] **AuditLog Model** - Track all permission changes and data access

#### 1.2 Role Definitions
Based on Q1.1.1 - Q1.1.12:
- [ ] SUPER_ADMIN (existing)
- [ ] PLATFORM_ADMIN (existing)
- [ ] SUPPORT_ADMIN (existing)
- [ ] BILLING_ADMIN (existing)
- [ ] AUDIT_ADMIN (existing)
- [ ] PMC_ADMIN (new)
- [ ] PROPERTY_MANAGER (new)
- [ ] LEASING_AGENT (new)
- [ ] MAINTENANCE_TECH (new)
- [ ] ACCOUNTANT (new)
- [ ] OWNER_LANDLORD (new)
- [ ] TENANT (new)
- [ ] VENDOR_SERVICE_PROVIDER (new)

#### 1.3 Permission Categories
Based on Q2.1.1 - Q2.15.8, implement permissions for:
- [ ] Category 1: Property & Unit Management
- [ ] Category 2: Tenant Management
- [ ] Category 3: Leasing & Applications
- [ ] Category 4: Rent & Payments
- [ ] Category 5: Accounting
- [ ] Category 6: Reporting & Owner Statements
- [ ] Category 7: Maintenance
- [ ] Category 8: Vendor Management
- [ ] Category 9: Communication / Messaging
- [ ] Category 10: Document Management
- [ ] Category 11: Marketing / Listings
- [ ] Category 12: Task / Workflow Management
- [ ] Category 13: User & Role Management
- [ ] Category 14: Portfolio / Property Assignment
- [ ] Category 15: System Settings

---

### Phase 2: Permission Checking Logic
**Goal**: Implement middleware and functions to check permissions

#### 2.1 Core Permission Functions
- [ ] `hasPermission(userId, resource, action, scope?)` - Check if user has permission
- [ ] `canAccess(userId, resourceId, resourceType)` - Check data access
- [ ] `getUserScopes(userId)` - Get all scopes for user
- [ ] `filterByScope(query, userId, resourceType)` - Filter queries by scope

#### 2.2 Middleware
- [ ] `withRBAC(handler, requiredPermission)` - API route middleware
- [ ] `withScopeCheck(handler, resourceType)` - Scope-based access middleware
- [ ] `withApprovalWorkflow(handler, workflowType)` - Approval workflow middleware

#### 2.3 Permission Matrix
- [ ] Build permission matrix from decisions (Q2.1.1 - Q2.15.8)
- [ ] Implement permission inheritance logic (Q4.1)
- [ ] Implement scope inheritance (Q3.1)
- [ ] Handle multiple roles per user (Q7.1)

---

### Phase 3: Data Isolation & Multi-Tenancy
**Goal**: Ensure proper data isolation between PMCs, landlords, tenants

#### 3.1 Scope Enforcement
Based on Q3.1 - Q3.2.3:
- [ ] Portfolio-level isolation
- [ ] Property-level isolation
- [ ] Unit-level isolation
- [ ] PMC isolation (Q3.2.1)
- [ ] Landlord isolation (Q3.2.2)
- [ ] Tenant isolation (Q3.2.3)

#### 3.2 Query Filtering
- [ ] Auto-filter queries by user scope
- [ ] Prevent cross-PMC data access
- [ ] Prevent cross-landlord data access
- [ ] Tenant data isolation (co-tenants can see each other)

---

### Phase 4: Feature Implementation (RBAC-Enabled)
**Goal**: Implement features with RBAC from the start

#### 4.1 Property & Unit Management
Based on Q2.1.1 - Q2.1.3:
- [ ] Property editing with approval workflow (3-day auto-revert)
- [ ] Unit add/remove with tenant check
- [ ] Property inspections (PM or licensed inspector only)
- [ ] Inspection reports (shared with tenants/landlords)

#### 4.2 Tenant Management
Based on Q2.2.1:
- [ ] Eviction workflow (PMC PM/Leasing initiates, landlord approves)
- [ ] LTB compliance (Ontario-specific)
- [ ] Eviction process tracking

#### 4.3 Leasing & Applications
Based on Q2.3.1 - Q2.3.4:
- [ ] Application intake (tenant/co-applicant can edit, 1-week deadline)
- [ ] Screening request (third-party integration, secure channel)
- [ ] Lease creation (owner approval ALWAYS required)
- [ ] Lease renewals (anyone can initiate, approval required)
- [ ] Application status management (Draft, Submitted, Under Review, Approved, Rejected, Withdrawn)
- [ ] Application archiving (rejected apps kept for reporting)

#### 4.4 Rent & Payments
Based on Q2.4.1 - Q2.4.3:
- [ ] Post charges (PM, Accountant, Landlord - all types)
- [ ] Charge reversal/adjustment
- [ ] Record payments (offline and online)
- [ ] Payment methods (bank transfer, email transfer, checks, credit cards)
- [ ] Check hold (5 days)
- [ ] Refunds (PMC Admin/Landlord approval, always full refund)

#### 4.5 Accounting
Based on Q2.5.1 - Q2.5.5:
- [ ] Chart of Accounts (PMC-level and property-level)
- [ ] Bank Reconciliation (matching payments + expenses)
- [ ] Owner Payouts (PMC initiated, NET 15/30, rent - expenses - commission)
- [ ] Security Deposit Management (PM/Accountant edit, tenant view)
- [ ] Financial Periods (Fiscal year, Accountant/PMC Owner can close)

#### 4.6 Reporting & Owner Statements
Based on Q2.6.1 - Q2.6.3:
- [ ] Financial Reports (PM view portfolio/properties, export with notification)
- [ ] Owner Statements (Income, expenses, net profit, commission - customizable)
- [ ] Statement Generation (Monthly, Quarterly, Yearly, self-service)
- [ ] Custom Reports (keep open for future)
- [ ] Dashboards (keep open for future)
- [ ] Report Scheduling (automated generation and email)
- [ ] Report Sharing (PM can share with PMC Admin)

#### 4.7 Maintenance
Based on Q2.7.1 - Q2.7.3:
- [ ] Big Expense Approval (configurable threshold, PMC + Landlord approval)
- [ ] Work Order Creation (tenant can create/edit/cancel)
- [ ] Work Order Assignment (PM/Landlord assign, Maintenance Tech see all for assigned properties)
- [ ] Work Order Reassignment (if tech unavailable)
- [ ] Emergency Requests (priority handling)
- [ ] Duplicate Work Order Handling (treated as one)

#### 4.8 Vendor Management
Based on Q2.8.1 - Q2.8.2:
- [ ] Vendor Invoicing (Maintenance Tech submit, Accountant → PM → Owner approval)
- [ ] Vendor Ratings (Tenants, Landlords/PMs can rate, vendors can see and respond)
- [ ] Tenant Ratings (Vendors can rate tenants)
- [ ] Rating Consequences (PM can block low-rated vendors)

#### 4.9 Communication / Messaging
Based on Q2.9.1 - Q2.9.3:
- [ ] Inbox Viewing (Maintenance Tech unit-only, Tenant own-only)
- [ ] Message Sending (Maintenance Tech maintenance-only, tied to tickets)
- [ ] Email/SMS (Only through ticketing system, bulk messages allowed)
- [ ] Content Restrictions (Profanity filters, attachment size limits)
- [ ] Communication History (All through ticketing system, visible to landlords/PMs)
- [ ] Rate Limits (Applied when needed)

#### 4.10 Document Management
Based on Q2.10.1 - Q2.10.3:
- [ ] Document Upload (Pictures, text, PDF, <10MB, co-tenant approval)
- [ ] Document Viewing (Maintenance Tech work-order-only, historical allowed)
- [ ] Document Access (Landlords all docs, PMs all for managed properties)
- [ ] Document Sharing (Restricted access, not direct sharing)
- [ ] Document Retention (Forever, minimum 7 years for legal/accounting)

#### 4.11 Marketing / Listings
Based on Q2.11.1 - Q2.11.2:
- [ ] Create Listings (PM, Leasing, Landlord if self-managed, editable after publish)
- [ ] Listing Information (Photos, description, pricing, availability)
- [ ] Syndicate Listings (Super Admin managed, paid feature, API keys managed centrally)

#### 4.12 Task / Workflow Management
Based on Q2.12.1 - Q2.12.2:
- [ ] Create Tasks (Owner, Accountant, Maintenance Tech - property/unit linked)
- [ ] Assign Tasks (PM, Leasing - within PMC, PMC Admin notified)
- [ ] Task Reassignment (Assignee can reassign, PM/PMC Admin notified)
- [ ] Single Assignee Only (no multiple assignees)

#### 4.13 User & Role Management
Based on Q2.13.1 - Q2.13.3:
- [ ] Create Users (PMC Admin for PMC, Super Admin for PMC Admins)
- [ ] Assign Roles (PMC Admin within PMC, cannot change landlord role)
- [ ] Account Deactivation (PMC Admin for PMC users, Super Admin for anyone)
- [ ] Account Deletion (Archived/soft-deleted, data intact)
- [ ] Active Record Reassignment (Reassign on deactivation, PMC Admin becomes owner if not reassigned)

#### 4.14 Portfolio / Property Assignment
Based on Q2.14.1 - Q2.14.2:
- [ ] Assign Scopes (PMC Admin assign properties to PMs, units to Leasing Agents)
- [ ] View Scopes (Maintenance Tech unit-only, PM all portfolio properties, Leasing Agent assigned properties only)

#### 4.15 System Settings
Based on Q2.15.1 - Q2.15.8:
- [ ] Permissions Config (PMC Admin can customize, tracked in audit log)
- [ ] Custom Roles (PMC Admin can create, tracked in audit log)
- [ ] Payment Settings (Super Admin level, PMC-wide, different methods per property)
- [ ] Lease Templates (PMC level or landlord level, Super Admin defaults)
- [ ] Notification Preferences (User configurable, PMC Admin defaults, mandatory notifications)
- [ ] API Access (Super Admin only, PMC/Admin only, keep expandable)
- [ ] Data Export (PMC Admin, PM, Accountant, Landlord - with audit log)
- [ ] Bulk Operations (Keep open for future)
- [ ] Security & Authentication (Google/Apple 2FA mandatory, 90-min timeout or biometric)
- [ ] Mobile App (No offline, same permissions, mobile-specific features, optional disable)

---

### Phase 5: Approval Workflows
**Goal**: Implement approval workflows based on decisions

#### 5.1 Property Editing Approval
- [ ] 3-day approval window
- [ ] Auto-revert if not approved
- [ ] Notification to editor

#### 5.2 Big Expense Approval
- [ ] Configurable threshold (per landlord, per request or per month)
- [ ] Dual approval (PMC + Landlord)
- [ ] Void if one approves and one rejects

#### 5.3 Lease Approval
- [ ] Owner approval ALWAYS required
- [ ] All parties review before official
- [ ] Lease renewal same workflow

#### 5.4 Refund Approval
- [ ] PMC Admin or Landlord final approval
- [ ] Always full refund (no partial)

---

### Phase 6: Audit & Compliance
**Goal**: Implement comprehensive audit logging

#### 6.1 Permission Changes
Based on Q10.1:
- [ ] Log all permission changes
- [ ] Log role assignments/removals
- [ ] Viewable by Super Admin and PMC Admin
- [ ] Cannot be deleted (trail log)
- [ ] 30 days visible, 7 years cold storage

#### 6.2 Data Access Logging
Based on Q10.2:
- [ ] Log sensitive data access (PM views tenant financials)
- [ ] Track all 4 W's (Who, What, When, Where)
- [ ] PII compliance
- [ ] GDPR compliance

#### 6.3 Activity Logging
- [ ] All user actions logged
- [ ] Report generation/download logged
- [ ] Data export logged
- [ ] Account deactivation logged

---

### Phase 7: UI/UX Implementation
**Goal**: Build admin interfaces for RBAC management

#### 7.1 Permission Matrix Editor
Based on Q8.1:
- [ ] Visual grid (roles vs permissions)
- [ ] Modern, easy-to-manage interface
- [ ] Bulk permission assignment
- [ ] Test permissions feature (preview before assign)
- [ ] RBAC settings at Super Admin, PMC Admin, and Landlord levels

#### 7.2 Role Assignment Interface
Based on Q8.2:
- [ ] User list (filtered by scope)
- [ ] Multiple role assignment
- [ ] Search/filter interface
- [ ] Current roles/scopes display
- [ ] Scope assignment (Portfolio → Property → Unit)

#### 7.3 Permission Testing
- [ ] Preview what user can see
- [ ] Test permissions before assignment
- [ ] Visual permission checker

---

### Phase 8: Migration Strategy
**Goal**: Migrate existing users and data

#### 8.1 Existing Users
Based on Q9.1:
- [ ] Existing landlords → Owner/Landlord role (default)
- [ ] Existing tenants → Tenant role (default)
- [ ] Existing PMCs → PMC Admin role (manual assignment at signup)
- [ ] Check at signup process

#### 8.2 Existing Permissions
- [ ] Map existing AdminRole enum to new system
- [ ] Migrate AdminPermission model
- [ ] Backward compatibility

#### 8.3 Data Migration
- [ ] Assign default scopes
- [ ] Create initial permission sets
- [ ] Audit trail for migration

---

### Phase 9: Edge Cases & Special Scenarios
**Goal**: Handle special cases

#### 9.1 Multiple Roles
Based on Q6.1:
- [ ] User can have multiple roles
- [ ] Permission checking with multiple roles
- [ ] Scope-based permission resolution

#### 9.2 Role Changes
Based on Q6.2:
- [ ] Immediate logout on role change
- [ ] No grace period
- [ ] Audit trail for role changes

#### 9.3 Emergency Access
Based on Q6.3:
- [ ] Maintenance emergency (go through PM/Landlord)
- [ ] Super Admin can grant temporary emergency permissions
- [ ] Emergency access logged differently

#### 9.4 Property Transfer
Based on Q6.4:
- [ ] Property moves from Landlord A to Landlord B
- [ ] Records stay with property
- [ ] PM reassignment logic
- [ ] Historical data access

---

### Phase 10: Testing & Validation
**Goal**: Comprehensive testing

#### 10.1 Permission Testing
- [ ] Test all permission combinations
- [ ] Test scope enforcement
- [ ] Test data isolation
- [ ] Test approval workflows

#### 10.2 Security Testing
- [ ] Test cross-PMC access prevention
- [ ] Test cross-landlord access prevention
- [ ] Test unauthorized access attempts
- [ ] Test audit logging

#### 10.3 Integration Testing
- [ ] Test with existing features
- [ ] Test with new features
- [ ] Test API access
- [ ] Test mobile app

---

## Implementation Priority

### High Priority (Core RBAC)
1. Phase 1: Data Model & Schema
2. Phase 2: Permission Checking Logic
3. Phase 3: Data Isolation & Multi-Tenancy
4. Phase 6: Audit & Compliance

### Medium Priority (Features)
5. Phase 4: Feature Implementation (RBAC-Enabled)
6. Phase 5: Approval Workflows
7. Phase 9: Edge Cases & Special Scenarios

### Lower Priority (UI/UX)
8. Phase 7: UI/UX Implementation
9. Phase 8: Migration Strategy
10. Phase 10: Testing & Validation

---

## Estimated Timeline

- **Phase 1-3**: 2-3 weeks (Core RBAC)
- **Phase 4**: 4-6 weeks (Features with RBAC)
- **Phase 5**: 1-2 weeks (Approval workflows)
- **Phase 6**: 1 week (Audit)
- **Phase 7**: 2-3 weeks (UI/UX)
- **Phase 8**: 1 week (Migration)
- **Phase 9**: 1 week (Edge cases)
- **Phase 10**: 2 weeks (Testing)

**Total Estimated Time**: 14-20 weeks

---

## Dependencies

- Prisma schema updates
- Existing AdminRole and AdminPermission models
- Authentication system (Google/Apple 2FA)
- Ticketing/messaging system
- Third-party integrations (tenant screening, payment gateways)

---

## Notes

- All features assume they will exist (per decision)
- RBAC is designed to be flexible and expandable
- Audit logging is critical for legal compliance
- Scope-based isolation is key for multi-tenancy
- Approval workflows are time-sensitive (3-day windows, etc.)

---

## Next Steps

1. Review this implementation plan
2. Prioritize phases based on business needs
3. Start with Phase 1: Data Model & Schema
4. Iterate and refine as we build

