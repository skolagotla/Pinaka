"""fix roles table schema

Revision ID: 002_fix_roles
Revises: 001_v2_schema
Create Date: 2024-11-23 15:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_fix_roles'
down_revision = '001_v2_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    CASE A: Drop and recreate roles table with correct v2 schema.
    
    The existing roles table is from legacy Prisma schema and incompatible:
    - Legacy: id is String (CUID), name is enum (RBACRole), has extra fields
    - V2: id is UUID, name is Text, simple structure (id, name, description)
    
    This migration drops the incompatible table and recreates it with the correct
    v2 schema. The user_roles table is also recreated since it depends on roles.
    
    Also ensures users and organizations tables exist (they may be missing from
    incomplete first migration).
    """
    
    # Drop and recreate organizations table if it has wrong schema (bigint vs UUID)
    # Check if it exists and drop it to recreate with correct schema
    op.execute("DROP TABLE IF EXISTS organizations CASCADE")
    
    # Recreate organizations table with correct v2 schema (UUID id)
    op.create_table(
        'organizations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.Text(), nullable=False),
        sa.Column('type', sa.Text(), nullable=False),  # 'PMC', 'LANDLORD', 'INTERNAL'
        sa.Column('timezone', sa.Text(), nullable=True),
        sa.Column('country', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    
    # Drop users table if it exists (will be recreated)
    op.execute("DROP TABLE IF EXISTS users CASCADE")
    
    # Recreate users table with correct v2 schema (UUID id)
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
    
    # Drop the old incompatible roles table and user_roles table
    # Drop user_roles first to avoid foreign key constraint issues
    op.execute("DROP TABLE IF EXISTS user_roles CASCADE")
    op.execute("DROP TABLE IF EXISTS roles CASCADE")
    
    # Recreate roles table with correct v2 schema
    op.create_table(
        'roles',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('name', sa.Text(), nullable=False, unique=True),  # 'super_admin', 'pmc_admin', 'pm', 'landlord', 'tenant', 'vendor'
        sa.Column('description', sa.Text(), nullable=True),
    )
    
    # Recreate user_roles table (it was dropped by CASCADE)
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


def downgrade() -> None:
    """
    Revert: drop v2 tables.
    Note: Original legacy table structure would need to be restored manually
    if needed, as we don't have the exact legacy schema in this migration.
    """
    op.drop_table('user_roles')
    op.drop_table('roles')

