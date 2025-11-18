# Scripts Directory

This directory contains utility scripts for database management, data migrations, setup, and maintenance.

## Script Categories

### ✅ Active/Useful Scripts (Keep)

#### Setup & Initialization
- `create-superadmin-pt.js` - Create super admin for PT database
- `create-pmc-admins-pt.js` - Create PMC admins for PT database
- `create-ab-homes-pmc-admins.js` - Create AB Homes PMC admins
- `create-pmc1-landlords.js` - Create test landlords
- `create-random-properties-for-landlords.js` - Create test properties
- `create-pt-database.js` - Create PT test database
- `initialize-rbac.ts` - Initialize RBAC system
- `setup-first-admin.js` - Setup first admin user
- `setup-admin-env.sh` - Setup admin environment

#### Data Management
- `delete-user-by-email.js` - Delete user by email
- `delete-tenant-by-email.js` - Delete tenant by email
- `delete-pmc-by-email.js` - Delete PMC by email
- `delete-invitation-by-email.js` - Delete invitation by email
- `find-pmc-by-email.js` - Find PMC by email
- `list-pmcs.js` - List all PMCs
- `search-all-pmcs.js` - Search PMCs

#### Database Operations
- `copy-data-nandi-to-pt.js` - Copy data from nandi to PT database
- `clear-activity-logs.js` - Clear activity logs
- `clear-invitations.js` - Clear invitations
- `clear-rate-limit.js` - Clear rate limits
- `clear-cache.sh` - Clear all caches

#### Maintenance & Health Checks
- `check-document-expiration.js` - Check document expiration
- `check-recent-db-changes.js` - Check recent database changes
- `check-recent-schema-changes.js` - Check recent schema changes
- `check-admin-env.js` - Check admin environment
- `check-all-n4-forms.js` - Check all N4 forms
- `check-property-ids.ts` - Check property IDs
- `check_approval_history.js` - Check approval history
- `check_pmc_status.js` - Check PMC status
- `rbac-health-check.ts` - RBAC health check
- `test-rbac-system.ts` - Test RBAC system

#### Production & Deployment
- `backup.sh` - Full backup script
- `deploy.sh` - Deployment script
- `build-with-timeout.sh` - Build with timeout
- `stop.sh` - Stop script
- `production-deployment-checklist.ts` - Production deployment checklist

#### Analysis & Utilities
- `analyze-bundle.js` - Analyze bundle size
- `audit-phone-postal-formatting.js` - Audit phone/postal formatting
- `inspect-n4-pdf.js` - Inspect N4 PDF
- `show-all-payments.js` - Show all payments
- `seed-vendors.js` - Seed vendors

---

### ⚠️ One-Time Use Scripts (Consider Archiving)

These scripts were used for one-time data migrations or fixes. They can be archived but kept for reference:

#### Data Fixes (One-Time)
- `fix-all-dates.js` - Fixed date issues (already executed)
- `fix-lease-dates-timezone.js` - Fixed lease date timezone issues
- `fix-rent-payment-dates.js` - Fixed rent payment dates
- `fix-tenant-dates.js` - Fixed tenant dates
- `fix-prorated-rent.js` - Fixed prorated rent
- `fix-quote-mismatches.js` - Fixed quote mismatches
- `fix-in-progress-status.js` - Fixed in-progress status
- `fix-vendor-assignment-status.js` - Fixed vendor assignment status

#### Data Migrations (One-Time)
- `migrate_entity_ids.js` - Migrated entity IDs (already executed)
- `migrate-to-unified-hashes.js` - Migrated to unified hashes (already executed)
- `migrate-document-hashes.js` - Migrated document hashes (already executed)
- `migrate-verifications-to-unified.js` - Migrated verifications (already executed)
- `migrate-verified-documents.js` - Migrated verified documents (already executed)
- `migrate-service-providers.js` - Migrated service providers (already executed)
- `migrate-reference-data.js` - Migrated reference data (already executed)
- `migrate-to-organizations.ts` - Migrated to organizations (already executed)
- `migrate-photos-to-json.js` - Migrated photos to JSON (already executed)
- `migrate-imports.js` - Migrated imports (already executed)
- `update-entity-ids.js` - Updated entity IDs (already executed)
- `update-landlord-ids.js` - Updated landlord IDs (already executed)
- `update_specific_pmc_id.js` - Updated specific PMC ID (already executed)

#### Data Cleanup (One-Time)
- `delete-old-pmc-admins.js` - Deleted old PMC admins (already executed)
- `cleanup-old-n4-forms.js` - Cleaned up old N4 forms (already executed)
- `delete-all-draft-n4-forms.js` - Deleted all draft N4 forms (already executed)
- `delete-draft-n4-forms.js` - Deleted draft N4 forms (already executed)
- `delete-all-inspection-checklists.js` - Deleted all inspection checklists
- `delete-inspection-checklists.js` - Deleted inspection checklists
- `delete-all-maintenance-tickets.js` - Deleted all maintenance tickets
- `clear-all-maintenance-tickets.js` - Cleared all maintenance tickets
- `clear-all-landlords.ts` - Cleared all landlords
- `clear-all-data-except-landlords.js` - Cleared all data except landlords
- `cleanup-all-documents.js` - Cleaned up all documents
- `delete-test-data.js` - Deleted test data

#### Data Updates (One-Time)
- `update-activity-log-descriptions.js` - Updated activity log descriptions (already executed)
- `update-approval-messages.js` - Updated approval messages (already executed)
- `update-status-messages.js` - Updated status messages (already executed)
- `update-vendor-assignment-messages.js` - Updated vendor assignment messages (already executed)
- `update-maintenance-status.js` - Updated maintenance status (already executed)
- `normalize-phone-postal-data.js` - Normalized phone/postal data (already executed)
- `backfill-property-ids.ts` - Backfilled property IDs (already executed)
- `backfill-unit-count.ts` - Backfilled unit count (already executed)
- `correct-lease-dates-forward.js` - Corrected lease dates forward (already executed)
- `regenerate-all-rent-payments.js` - Regenerated all rent payments (already executed)
- `remove-duplicate-rent-payments.js` - Removed duplicate rent payments (already executed)
- `remove-duplicate-units.js` - Removed duplicate units (already executed)
- `merge-duplicate-documents.js` - Merged duplicate documents (already executed)
- `recover-payment-data.js` - Recovered payment data (already executed)

---

## Usage Guidelines

### For Active Scripts
- Run setup scripts for initial environment setup
- Use data management scripts for ongoing operations
- Run health checks regularly
- Use backup scripts before major changes

### For One-Time Scripts
- **Do not run** unless you understand what they do
- These scripts were used for specific one-time migrations/fixes
- Keep for reference but mark as executed
- Consider archiving to a separate directory

---

## Notes

- All scripts should be run from the project root directory
- Most scripts require database connection
- Test scripts are for PT (test) database only
- Production scripts should be reviewed before execution
- Always backup before running data modification scripts

---

**Last Updated:** January 2025

