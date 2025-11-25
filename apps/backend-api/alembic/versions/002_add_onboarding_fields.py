"""add onboarding fields to users

Revision ID: 002_add_onboarding_fields
Revises: 001_v2_schema
Create Date: 2024-12-20 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_add_onboarding_fields'
down_revision = '001_v2_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add onboarding fields to users table
    op.add_column('users', sa.Column('onboarding_completed', sa.Boolean(), server_default=sa.text('false'), nullable=False))
    op.add_column('users', sa.Column('onboarding_step', sa.Integer(), server_default=sa.text('0'), nullable=False))
    op.add_column('users', sa.Column('onboarding_data', postgresql.JSONB, nullable=True))


def downgrade() -> None:
    # Remove onboarding fields
    op.drop_column('users', 'onboarding_data')
    op.drop_column('users', 'onboarding_step')
    op.drop_column('users', 'onboarding_completed')

