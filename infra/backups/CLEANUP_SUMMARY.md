# Pinaka Database V1 Cleanup Summary

**Generated**: 2025-11-24  
**SQL Script**: `infra/backups/cleanup_v1_tables.sql`

## Overview

This cleanup script removes all v1-era database tables and related enums from the Pinaka database, leaving only the v2 schema tables.

## Classification Results

### V1/Deprecated Tables to Remove: **61 tables**

#### Admin & Authentication (7 tables)
- ActivityLog
- Admin
- AdminAuditLog
- AdminPermission
- AdminSession
- ApiKey
- FailedLoginAttempt

#### Application & Approval (2 tables)
- Application
- ApprovalRequest

#### Banking & Financial (7 tables)
- BankReconciliation
- FinancialSnapshot
- OwnerPayout
- OwnerStatement
- PartialPayment
- SecurityDeposit
- StripeCustomer
- StripePayment

#### Content & System (3 tables)
- ContentItem
- SystemAnnouncement
- ReferenceData

#### Document Management (4 tables)
- Document
- DocumentAuditLog
- DocumentMessage
- LeaseDocument

#### Inspection & Maintenance (5 tables)
- InspectionChecklist
- InspectionChecklistItem
- MaintenanceComment
- MaintenanceRequest
- RecurringMaintenance

#### Messaging (4 tables)
- ConversationParticipant (v1 version)
- Message (v1 version)
- MessageAttachment
- MessageNotification

#### PMC & Landlord Relationships (4 tables)
- PMCLandlord
- PMCLandlordApproval
- PropertyManagementCompany
- LandlordServiceProvider

#### Property Verification (2 tables)
- PropertyOwnershipVerification
- PropertyOwnershipVerificationHistory

#### RBAC & Permissions (4 tables)
- RBACAuditLog
- RolePermission
- UserPermission
- UserActivity

#### Support Tickets (3 tables)
- SupportTicket
- TicketAttachment
- TicketNote

#### Tenant-Related (5 tables)
- EmergencyContact
- Employer
- EmploymentDocument
- TenantInvitation
- TenantRating

#### Other V1 Tables (11 tables)
- Eviction
- GeneratedForm
- LateFee
- LateFeeRule
- Listing
- OrganizationSettings
- TaskReminder
- UnifiedVerification
- UnifiedVerificationHistory
- VendorRating

### V1-Only ENUM Types to Remove: **21 enums**

- AdminRole
- ApprovalRequestStatus
- ApprovalStatus
- ApprovalWorkflowType
- ContentType
- ConversationStatus
- ConversationType
- OrganizationStatus
- OwnershipDocumentType
- PMCApprovalStatus
- PMCApprovalType
- PermissionAction
- PlanType
- RBACRole
- ResourceCategory
- ScopeType
- TicketPriority
- TicketStatus
- UnifiedVerificationStatus
- UnifiedVerificationType
- VerificationStatus

### V2 Tables Preserved: **18 tables**

**Note**: The preserved tables use PascalCase naming (e.g., "Organization", "Property") which matches the current database schema. The v2 models in `apps/backend-api/db/models_v2.py` use snake_case (e.g., "organizations", "properties"), suggesting the database may need a migration to fully adopt v2 naming conventions.

Preserved tables:
- Conversation
- Country
- Expense
- Invitation
- Landlord
- Lease
- LeaseTenant
- Organization
- Property
- Region
- RentPayment
- Role
- Scope
- ServiceProvider
- Task
- Tenant
- Unit
- UserRole

## Important Notes

1. **Naming Convention Mismatch**: The preserved tables use PascalCase (v1 naming), while v2 models expect snake_case. This suggests:
   - The database may need a migration to rename tables to snake_case
   - OR the v2 models need to be updated to match the current schema
   - OR the v2 tables haven't been created yet and these are v1 tables that should also be dropped

2. **Safe Execution**: The script uses `DROP TABLE IF EXISTS` and `CASCADE`, so it's safe to run even if some tables don't exist.

3. **Backup Required**: Always backup your database before running this script!

4. **Transaction Safety**: The script is wrapped in a `BEGIN...COMMIT` transaction, so if any error occurs, all changes will be rolled back.

## Execution

To run the cleanup script:

```bash
psql -d PT -f infra/backups/cleanup_v1_tables.sql
```

Or using the connection string from your config:

```bash
psql "postgresql://skolagot@localhost:5432/PT" -f infra/backups/cleanup_v1_tables.sql
```

## Validation

After running the script, verify that:
1. All 61 v1 tables have been removed
2. All 21 v1 enums have been removed
3. The 18 preserved tables still exist
4. No foreign key constraints reference dropped tables

