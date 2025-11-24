"""create v2 schema

Revision ID: 001_v2_schema
Revises: 
Create Date: 2024-11-23 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001_v2_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. organizations
    op.create_table(
        'organizations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('type', sa.Text(), nullable=False),  # 'PMC', 'LANDLORD', 'INTERNAL'
        sa.Column('timezone', sa.Text(), nullable=True),
        sa.Column('country', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )

    # 2. users
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('email', sa.Text(), nullable=False, unique=True),
        sa.Column('password_hash', sa.Text(), nullable=False),
        sa.Column('full_name', sa.Text(), nullable=True),
        sa.Column('phone', sa.Text(), nullable=True),
        sa.Column('status', sa.Text(), server_default='active', nullable=False),  # 'active', 'invited', 'suspended'
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='SET NULL'),
    )
    op.create_index('idx_users_email', 'users', ['email'], unique=True)
    op.create_index('idx_users_organization_id', 'users', ['organization_id'])

    # 3. roles
    op.create_table(
        'roles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.Text(), nullable=False, unique=True),  # 'super_admin', 'pmc_admin', 'pm', 'landlord', 'tenant', 'vendor'
        sa.Column('description', sa.Text(), nullable=True),
    )

    # 4. user_roles
    op.create_table(
        'user_roles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('role_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('user_id', 'role_id', 'organization_id', name='uq_user_roles_user_role_org'),
    )
    op.create_index('idx_user_roles_user_id', 'user_roles', ['user_id'])
    op.create_index('idx_user_roles_role_id', 'user_roles', ['role_id'])
    op.create_index('idx_user_roles_organization_id', 'user_roles', ['organization_id'])

    # 5. landlords
    op.create_table(
        'landlords',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('email', sa.Text(), nullable=True),
        sa.Column('phone', sa.Text(), nullable=True),
        sa.Column('status', sa.Text(), server_default='active', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_landlords_organization_id', 'landlords', ['organization_id'])
    op.create_index('idx_landlords_user_id', 'landlords', ['user_id'])

    # 6. tenants
    op.create_table(
        'tenants',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('email', sa.Text(), nullable=True),
        sa.Column('phone', sa.Text(), nullable=True),
        sa.Column('status', sa.Text(), server_default='active', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_tenants_organization_id', 'tenants', ['organization_id'])
    op.create_index('idx_tenants_user_id', 'tenants', ['user_id'])

    # 7. vendors
    op.create_table(
        'vendors',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('company_name', sa.Text(), nullable=False),
        sa.Column('contact_name', sa.Text(), nullable=True),
        sa.Column('email', sa.Text(), nullable=True),
        sa.Column('phone', sa.Text(), nullable=True),
        sa.Column('service_categories', postgresql.ARRAY(sa.Text()), nullable=True),
        sa.Column('status', sa.Text(), server_default='active', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_vendors_organization_id', 'vendors', ['organization_id'])
    op.create_index('idx_vendors_user_id', 'vendors', ['user_id'])

    # 8. properties
    op.create_table(
        'properties',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('landlord_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('name', sa.Text(), nullable=True),
        sa.Column('address_line1', sa.Text(), nullable=False),
        sa.Column('address_line2', sa.Text(), nullable=True),
        sa.Column('city', sa.Text(), nullable=True),
        sa.Column('state', sa.Text(), nullable=True),
        sa.Column('postal_code', sa.Text(), nullable=True),
        sa.Column('country', sa.Text(), nullable=True),
        sa.Column('status', sa.Text(), server_default='active', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['landlord_id'], ['landlords.id'], ondelete='SET NULL'),
    )
    op.create_index('idx_properties_org_landlord', 'properties', ['organization_id', 'landlord_id'])
    op.create_index('idx_properties_organization_id', 'properties', ['organization_id'])

    # 9. units
    op.create_table(
        'units',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('property_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('unit_number', sa.Text(), nullable=False),
        sa.Column('floor', sa.Text(), nullable=True),
        sa.Column('bedrooms', sa.Integer(), nullable=True),
        sa.Column('bathrooms', sa.Integer(), nullable=True),
        sa.Column('size_sqft', sa.Integer(), nullable=True),
        sa.Column('status', sa.Text(), server_default='vacant', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['property_id'], ['properties.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('property_id', 'unit_number', name='uq_units_property_unit'),
    )
    op.create_index('idx_units_property_id', 'units', ['property_id'])

    # 10. leases
    op.create_table(
        'leases',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('unit_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('landlord_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=False),
        sa.Column('rent_amount', sa.Numeric(12, 2), nullable=False),
        sa.Column('rent_due_day', sa.Integer(), nullable=True),  # 1-31
        sa.Column('security_deposit', sa.Numeric(12, 2), nullable=True),
        sa.Column('status', sa.Text(), server_default='pending', nullable=False),  # 'pending', 'active', 'terminated', 'expired'
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['unit_id'], ['units.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['landlord_id'], ['landlords.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_leases_org_unit_status', 'leases', ['organization_id', 'unit_id', 'status'])
    op.create_index('idx_leases_organization_id', 'leases', ['organization_id'])

    # 11. lease_tenants
    op.create_table(
        'lease_tenants',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('lease_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('is_primary', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('added_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['lease_id'], ['leases.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='CASCADE'),
        sa.UniqueConstraint('lease_id', 'tenant_id', name='uq_lease_tenants_lease_tenant'),
    )
    op.create_index('idx_lease_tenants_lease_id', 'lease_tenants', ['lease_id'])
    op.create_index('idx_lease_tenants_tenant_id', 'lease_tenants', ['tenant_id'])

    # 12. work_orders
    op.create_table(
        'work_orders',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('property_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('unit_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('tenant_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_by_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('title', sa.Text(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.Text(), server_default='new', nullable=False),  # 'new', 'in_progress', 'waiting_on_vendor', 'completed', 'canceled'
        sa.Column('priority', sa.Text(), server_default='medium', nullable=False),  # 'low', 'medium', 'high', 'emergency'
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), onupdate=sa.text('now()'), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['property_id'], ['properties.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['unit_id'], ['units.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['tenant_id'], ['tenants.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['created_by_user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_work_orders_org_status', 'work_orders', ['organization_id', 'status'])
    op.create_index('idx_work_orders_property_status', 'work_orders', ['property_id', 'status'])
    op.create_index('idx_work_orders_tenant_id', 'work_orders', ['tenant_id'])
    op.create_index('idx_work_orders_created_by', 'work_orders', ['created_by_user_id'])

    # 13. work_order_assignments
    op.create_table(
        'work_order_assignments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('work_order_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('vendor_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('assigned_by_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status', sa.Text(), server_default='assigned', nullable=False),  # 'assigned', 'accepted', 'rejected', 'completed'
        sa.Column('assigned_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['work_order_id'], ['work_orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['vendor_id'], ['vendors.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['assigned_by_user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_work_order_assignments_work_order_id', 'work_order_assignments', ['work_order_id'])
    op.create_index('idx_work_order_assignments_vendor_id', 'work_order_assignments', ['vendor_id'])

    # 14. work_order_comments
    op.create_table(
        'work_order_comments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('work_order_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('author_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['work_order_id'], ['work_orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['author_user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_work_order_comments_work_order_id', 'work_order_comments', ['work_order_id'])

    # 15. attachments
    op.create_table(
        'attachments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('entity_type', sa.Text(), nullable=False),  # 'work_order', 'message', 'lease', 'property', etc.
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('storage_key', sa.Text(), nullable=False),  # local file path now, S3 key later
        sa.Column('file_name', sa.Text(), nullable=False),
        sa.Column('mime_type', sa.Text(), nullable=True),
        sa.Column('file_size_bytes', sa.BigInteger(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_attachments_org_entity', 'attachments', ['organization_id', 'entity_type', 'entity_id'])

    # 16. notifications
    op.create_table(
        'notifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('entity_type', sa.Text(), nullable=False),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('type', sa.Text(), nullable=False),  # 'MESSAGE_RECEIVED', 'WORK_ORDER_UPDATED', 'RENT_DUE', etc.
        sa.Column('is_read', sa.Boolean(), server_default='false', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('read_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_notifications_user_read_created', 'notifications', ['user_id', 'is_read', 'created_at'])

    # 17. audit_logs
    op.create_table(
        'audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), nullable=True),  # nullable for platform-wide super_admin actions
        sa.Column('actor_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('action', sa.Text(), nullable=False),  # 'ROLE_CHANGED', 'USER_IMPERSONATED', 'LEASE_CREATED', etc.
        sa.Column('entity_type', sa.Text(), nullable=True),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('metadata', postgresql.JSONB(), nullable=True),  # Column name is 'metadata' in DB, but mapped to 'metadata_json' in model
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['organization_id'], ['organizations.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['actor_user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('idx_audit_logs_org_created', 'audit_logs', ['organization_id', 'created_at'])
    op.create_index('idx_audit_logs_actor_created', 'audit_logs', ['actor_user_id', 'created_at'])


def downgrade() -> None:
    # Drop tables in reverse order (respecting foreign keys)
    op.drop_table('audit_logs')
    op.drop_table('notifications')
    op.drop_table('attachments')
    op.drop_table('work_order_comments')
    op.drop_table('work_order_assignments')
    op.drop_table('work_orders')
    op.drop_table('lease_tenants')
    op.drop_table('leases')
    op.drop_table('units')
    op.drop_table('properties')
    op.drop_table('vendors')
    op.drop_table('tenants')
    op.drop_table('landlords')
    op.drop_table('user_roles')
    op.drop_table('roles')
    op.drop_table('users')
    op.drop_table('organizations')

