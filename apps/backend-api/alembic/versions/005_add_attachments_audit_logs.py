"""add attachments and audit_logs tables

Revision ID: 005_add_attachments_audit_logs
Revises: 004_fix_v2_properties
Create Date: 2024-11-23 19:15:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '005_add_attachments_audit_logs'
down_revision = '004_fix_v2_properties'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Add attachments and audit_logs tables to complete v2 schema
    """
    
    # Create attachments table
    op.create_table(
        'attachments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('entity_type', sa.Text(), nullable=False),  # 'work_order', 'message', 'lease', 'property', etc.
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('storage_key', sa.Text(), nullable=False),  # local file path now, S3 key later
        sa.Column('file_name', sa.Text(), nullable=False),
        sa.Column('mime_type', sa.Text(), nullable=True),
        sa.Column('file_size_bytes', sa.BigInteger(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('idx_attachments_org_entity', 'attachments', ['organization_id', 'entity_type', 'entity_id'])
    op.create_index('idx_attachments_entity', 'attachments', ['entity_type', 'entity_id'])
    
    # Create audit_logs table
    op.create_table(
        'audit_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('organization_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('organizations.id', ondelete='SET NULL'), nullable=True),
        sa.Column('actor_user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('action', sa.Text(), nullable=False),  # 'ROLE_CHANGED', 'USER_IMPERSONATED', 'LEASE_CREATED', etc.
        sa.Column('entity_type', sa.Text(), nullable=True),
        sa.Column('entity_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('extra_metadata', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
    )
    op.create_index('idx_audit_logs_org_created', 'audit_logs', ['organization_id', 'created_at'])
    op.create_index('idx_audit_logs_actor_created', 'audit_logs', ['actor_user_id', 'created_at'])
    op.create_index('idx_audit_logs_entity', 'audit_logs', ['entity_type', 'entity_id'])


def downgrade() -> None:
    """Revert: drop attachments and audit_logs tables"""
    op.drop_index('idx_audit_logs_entity', table_name='audit_logs')
    op.drop_index('idx_audit_logs_actor_created', table_name='audit_logs')
    op.drop_index('idx_audit_logs_org_created', table_name='audit_logs')
    op.drop_table('audit_logs')
    
    op.drop_index('idx_attachments_entity', table_name='attachments')
    op.drop_index('idx_attachments_org_entity', table_name='attachments')
    op.drop_table('attachments')

