"""add performance indexes

Revision ID: 008_add_performance_indexes
Revises: 007_phase1_models
Create Date: 2024-12-XX XX:XX:XX.XXXXXX

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '008_add_performance_indexes'
down_revision = '007_phase1_models'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Add performance indexes for common query patterns.
    These indexes optimize:
    - Leases: tenant_id filtering (used in list_leases for tenant role)
    - Work orders: vendor filtering via assignments
    - Audit logs: entity lookups
    """
    
    # Leases: tenant_id filtering (used in list_leases for tenant role)
    op.create_index('idx_leases_tenant_id', 'leases', ['tenant_id'], if_not_exists=True)
    
    # Work orders: vendor filtering via assignments (for vendor role filtering)
    op.create_index('idx_work_order_assignments_vendor_status', 
                   'work_order_assignments', ['vendor_id', 'status'], 
                   if_not_exists=True)
    
    # Audit logs: entity lookups (for filtering by entity_type and entity_id)
    op.create_index('idx_audit_logs_entity', 
                   'audit_logs', ['entity_type', 'entity_id'], 
                   if_not_exists=True)
    
    # Leases: composite index for common filtering (organization + status)
    op.create_index('idx_leases_org_status', 
                   'leases', ['organization_id', 'status'], 
                   if_not_exists=True)


def downgrade() -> None:
    """Revert: drop added indexes"""
    op.drop_index('idx_leases_org_status', table_name='leases', if_exists=True)
    op.drop_index('idx_audit_logs_entity', table_name='audit_logs', if_exists=True)
    op.drop_index('idx_work_order_assignments_vendor_status', table_name='work_order_assignments', if_exists=True)
    op.drop_index('idx_leases_tenant_id', table_name='leases', if_exists=True)

