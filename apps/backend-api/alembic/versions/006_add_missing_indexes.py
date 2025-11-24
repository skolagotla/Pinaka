"""add missing indexes for v2 tables

Revision ID: 006_add_missing_indexes
Revises: 005_add_attachments_audit_logs
Create Date: 2024-11-24 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '006_add_missing_indexes'
down_revision = '005_add_attachments_audit_logs'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Add missing indexes to optimize common query patterns for v2 tables.
    These indexes support role-based filtering and common access patterns.
    """
    
    # Work orders indexes (already exist in migration 004, but ensure they're there)
    # These are already created, but adding here for completeness
    
    # Leases indexes - ensure all are present
    # idx_leases_org_unit_status already exists
    # Add index for landlord_id lookups
    op.create_index('idx_leases_landlord_id', 'leases', ['landlord_id'], if_not_exists=True)
    
    # Notifications - ensure user_read_created index exists (already in migration 005)
    # Add index for organization_id lookups
    op.create_index('idx_notifications_organization_id', 'notifications', ['organization_id'], if_not_exists=True)
    
    # Attachments - ensure entity lookup index exists (already in migration 005)
    # Additional index for file lookups
    op.create_index('idx_attachments_storage_key', 'attachments', ['storage_key'], if_not_exists=True)
    
    # Users - add index for status filtering
    op.create_index('idx_users_status', 'users', ['status'], if_not_exists=True)
    
    # Properties - add index for status filtering
    op.create_index('idx_properties_status', 'properties', ['status'], if_not_exists=True)
    
    # Units - add index for status filtering
    op.create_index('idx_units_status', 'units', ['status'], if_not_exists=True)
    
    # Leases - add index for status filtering
    op.create_index('idx_leases_status', 'leases', ['status'], if_not_exists=True)
    
    # Work orders - add index for priority filtering
    op.create_index('idx_work_orders_priority', 'work_orders', ['priority'], if_not_exists=True)
    
    # Work order assignments - add index for status filtering
    op.create_index('idx_work_order_assignments_status', 'work_order_assignments', ['status'], if_not_exists=True)
    
    # Landlords - add index for status filtering
    op.create_index('idx_landlords_status', 'landlords', ['status'], if_not_exists=True)
    
    # Tenants - add index for status filtering
    op.create_index('idx_tenants_status', 'tenants', ['status'], if_not_exists=True)
    
    # Vendors - add index for status filtering
    op.create_index('idx_vendors_status', 'vendors', ['status'], if_not_exists=True)


def downgrade() -> None:
    """Revert: drop added indexes"""
    op.drop_index('idx_vendors_status', table_name='vendors', if_exists=True)
    op.drop_index('idx_tenants_status', table_name='tenants', if_exists=True)
    op.drop_index('idx_landlords_status', table_name='landlords', if_exists=True)
    op.drop_index('idx_work_order_assignments_status', table_name='work_order_assignments', if_exists=True)
    op.drop_index('idx_work_orders_priority', table_name='work_orders', if_exists=True)
    op.drop_index('idx_leases_status', table_name='leases', if_exists=True)
    op.drop_index('idx_units_status', table_name='units', if_exists=True)
    op.drop_index('idx_properties_status', table_name='properties', if_exists=True)
    op.drop_index('idx_users_status', table_name='users', if_exists=True)
    op.drop_index('idx_attachments_storage_key', table_name='attachments', if_exists=True)
    op.drop_index('idx_notifications_organization_id', table_name='notifications', if_exists=True)
    op.drop_index('idx_leases_landlord_id', table_name='leases', if_exists=True)

