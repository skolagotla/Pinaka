"""fix v2 property-related tables (properties, units, leases)

Revision ID: 004_fix_v2_properties
Revises: 003_fix_v2_entities
Create Date: 2024-11-23 16:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '004_fix_v2_properties'
down_revision = '003_fix_v2_entities'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Fix properties, units, leases tables - these exist from legacy Prisma schema
    but need to be recreated with v2 schema (UUID ids, different columns).
    
    Strategy: Rename legacy tables, then create v2 tables with correct schema.
    """
    
    # Drop dependent tables first (if they exist from v2 migration attempt)
    op.execute("DROP TABLE IF EXISTS lease_tenants CASCADE")
    op.execute("DROP TABLE IF EXISTS work_orders CASCADE")
    op.execute("DROP TABLE IF EXISTS work_order_assignments CASCADE")
    op.execute("DROP TABLE IF EXISTS work_order_comments CASCADE")
    
    # Rename legacy tables to preserve data
    op.execute("ALTER TABLE IF EXISTS properties RENAME TO properties_legacy_prisma")
    op.execute("ALTER TABLE IF EXISTS units RENAME TO units_legacy_prisma")
    op.execute("ALTER TABLE IF EXISTS leases RENAME TO leases_legacy_prisma")
    
    # Create v2 properties table
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
    
    # Create v2 units table
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
    
    # Create v2 leases table
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
    
    # Create lease_tenants table
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
    
    # Create work_orders table
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
    
    # Create work_order_assignments table
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
    
    # Create work_order_comments table
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


def downgrade() -> None:
    """Revert: drop v2 tables and restore legacy names"""
    op.drop_table('work_order_comments')
    op.drop_table('work_order_assignments')
    op.drop_table('work_orders')
    op.drop_table('lease_tenants')
    op.drop_table('leases')
    op.drop_table('units')
    op.drop_table('properties')
    
    # Restore legacy table names
    op.execute("ALTER TABLE IF EXISTS properties_legacy_prisma RENAME TO properties")
    op.execute("ALTER TABLE IF EXISTS units_legacy_prisma RENAME TO units")
    op.execute("ALTER TABLE IF EXISTS leases_legacy_prisma RENAME TO leases")

