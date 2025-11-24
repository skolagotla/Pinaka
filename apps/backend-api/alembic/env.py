"""
Alembic environment configuration
"""

from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from sqlalchemy.ext.asyncio import AsyncEngine
from alembic import context
from core.config import settings
from core.database import Base
from db.models import ServiceProvider  # Import legacy models
from db.models_v2 import (  # Import v2 models
    Organization, User, Role, UserRole,
    Landlord, Tenant, Vendor, Property, Unit,
    Lease, LeaseTenant, WorkOrder, WorkOrderAssignment,
    WorkOrderComment, Attachment, Notification, AuditLog
)

# this is the Alembic Config object
config = context.config

# Override sqlalchemy.url with settings
# Alembic uses synchronous SQLAlchemy, so remove asyncpg driver and schema param
db_url = settings.DATABASE_URL.replace("+asyncpg", "")
# Remove schema parameter (psycopg2 doesn't support it)
if "?schema=" in db_url:
    db_url = db_url.split("?schema=")[0]
config.set_main_option("sqlalchemy.url", db_url)

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# add your model's MetaData object here for 'autogenerate' support
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection):
    context.configure(connection=connection, target_metadata=target_metadata)

    with context.begin_transaction():
        context.run_migrations()


async def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    # Alembic uses synchronous SQLAlchemy, so use sync engine
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        future=True,
    )

    with connectable.connect() as connection:
        do_run_migrations(connection)

    connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    import asyncio
    asyncio.run(run_migrations_online())

