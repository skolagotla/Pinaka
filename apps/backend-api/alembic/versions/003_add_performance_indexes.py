"""Add performance indexes for high-frequency lookups

Revision ID: 003_add_performance_indexes
Revises: 002_fix_roles_table
Create Date: 2024-01-01 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003_add_performance_indexes'
down_revision = '002_fix_roles_table'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Work Orders - status filtering (very common)
    op.create_index(
        'idx_work_orders_status_created', 
        'work_orders', 
        ['status', 'created_at'],
        postgresql_ops={'created_at': 'DESC'}
    )
    
    # Work Orders - organization + status (common filter combination)
    op.create_index(
        'idx_work_orders_org_status_created',
        'work_orders',
        ['organization_id', 'status', 'created_at'],
        postgresql_ops={'created_at': 'DESC'}
    )
    
    # Leases - status filtering
    op.create_index(
        'idx_leases_status_created',
        'leases',
        ['status', 'created_at'],
        postgresql_ops={'created_at': 'DESC'}
    )
    
    # Leases - tenant lookup (for tenant-specific queries)
    op.create_index(
        'idx_leases_tenant_id_status',
        'leases',
        ['tenant_id', 'status']
    )
    
    # Properties - status filtering
    op.create_index(
        'idx_properties_status_created',
        'properties',
        ['status', 'created_at'],
        postgresql_ops={'created_at': 'DESC'}
    )
    
    # Units - status filtering (for vacancy management)
    op.create_index(
        'idx_units_status_property',
        'units',
        ['status', 'property_id']
    )
    
    # Tenants - status filtering
    op.create_index(
        'idx_tenants_status_created',
        'tenants',
        ['status', 'created_at'],
        postgresql_ops={'created_at': 'DESC'}
    )
    
    # Rent Payments - date range queries
    op.create_index(
        'idx_rent_payments_date_status',
        'rent_payments',
        ['payment_date', 'status']
    )
    
    # Rent Payments - lease lookup
    op.create_index(
        'idx_rent_payments_lease_status',
        'rent_payments',
        ['lease_id', 'status']
    )
    
    # Expenses - date and category filtering
    op.create_index(
        'idx_expenses_date_category',
        'expenses',
        ['expense_date', 'category']
    )
    
    # Expenses - work order lookup
    op.create_index(
        'idx_expenses_work_order',
        'expenses',
        ['work_order_id']
    )
    
    # Notifications - user and read status
    op.create_index(
        'idx_notifications_user_read_created',
        'notifications',
        ['user_id', 'is_read', 'created_at'],
        postgresql_ops={'created_at': 'DESC'}
    )
    
    # Tasks - status and due date
    op.create_index(
        'idx_tasks_status_due_date',
        'tasks',
        ['status', 'due_date']
    )
    
    # Tasks - organization and status
    op.create_index(
        'idx_tasks_org_status',
        'tasks',
        ['organization_id', 'status']
    )
    
    # Attachments - entity lookup (polymorphic)
    op.create_index(
        'idx_attachments_entity',
        'attachments',
        ['entity_type', 'entity_id']
    )
    
    # Audit Logs - actor and timestamp
    op.create_index(
        'idx_audit_logs_actor_created',
        'audit_logs',
        ['actor_user_id', 'created_at'],
        postgresql_ops={'created_at': 'DESC'}
    )
    
    # Audit Logs - organization and timestamp
    op.create_index(
        'idx_audit_logs_org_created',
        'audit_logs',
        ['organization_id', 'created_at'],
        postgresql_ops={'created_at': 'DESC'}
    )


def downgrade() -> None:
    op.drop_index('idx_work_orders_status_created', table_name='work_orders')
    op.drop_index('idx_work_orders_org_status_created', table_name='work_orders')
    op.drop_index('idx_leases_status_created', table_name='leases')
    op.drop_index('idx_leases_tenant_id_status', table_name='leases')
    op.drop_index('idx_properties_status_created', table_name='properties')
    op.drop_index('idx_units_status_property', table_name='units')
    op.drop_index('idx_tenants_status_created', table_name='tenants')
    op.drop_index('idx_rent_payments_date_status', table_name='rent_payments')
    op.drop_index('idx_rent_payments_lease_status', table_name='rent_payments')
    op.drop_index('idx_expenses_date_category', table_name='expenses')
    op.drop_index('idx_expenses_work_order', table_name='expenses')
    op.drop_index('idx_notifications_user_read_created', table_name='notifications')
    op.drop_index('idx_tasks_status_due_date', table_name='tasks')
    op.drop_index('idx_tasks_org_status', table_name='tasks')
    op.drop_index('idx_attachments_entity', table_name='attachments')
    op.drop_index('idx_audit_logs_actor_created', table_name='audit_logs')
    op.drop_index('idx_audit_logs_org_created', table_name='audit_logs')

