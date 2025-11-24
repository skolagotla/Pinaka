"""fix v2 entity tables (landlords, tenants, vendors)

Revision ID: 003_fix_v2_entities
Revises: 002_fix_roles
Create Date: 2024-11-23 16:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003_fix_v2_entities'
down_revision = '002_fix_roles'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Fix landlords, tenants, vendors tables - these exist from legacy Prisma schema
    but need to be recreated with v2 schema (UUID ids, different columns).
    
    Strategy: Rename legacy tables, then create v2 tables with correct schema.
    """
    
    # Rename legacy tables to preserve data (optional - can drop if not needed)
    op.execute("ALTER TABLE IF EXISTS landlords RENAME TO landlords_legacy_prisma")
    op.execute("ALTER TABLE IF EXISTS tenants RENAME TO tenants_legacy_prisma")
    op.execute("ALTER TABLE IF EXISTS vendors RENAME TO vendors_legacy_prisma")
    
    # Create v2 landlords table
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
    
    # Create v2 tenants table
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
    
    # Create v2 vendors table
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


def downgrade() -> None:
    """Revert: drop v2 tables and restore legacy names"""
    op.drop_table('vendors')
    op.drop_table('tenants')
    op.drop_table('landlords')
    
    # Restore legacy table names
    op.execute("ALTER TABLE IF EXISTS landlords_legacy_prisma RENAME TO landlords")
    op.execute("ALTER TABLE IF EXISTS tenants_legacy_prisma RENAME TO tenants")
    op.execute("ALTER TABLE IF EXISTS vendors_legacy_prisma RENAME TO vendors")

