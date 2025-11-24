"""
SQLAlchemy models for v2 database schema
All tables use UUID primary keys and snake_case naming
"""
from sqlalchemy import Column, String, Boolean, Integer, Numeric, Date, DateTime, Text, ForeignKey, Index, UniqueConstraint, BigInteger
from sqlalchemy.sql import text as sa_text
from sqlalchemy.dialects.postgresql import UUID, ARRAY, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base
import uuid


class Organization(Base):
    """Organization model"""
    __tablename__ = "organizations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    name = Column(Text, nullable=False)
    type = Column(Text, nullable=False)  # 'PMC', 'LANDLORD', 'INTERNAL'
    timezone = Column(Text, nullable=True)
    country = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    users = relationship("User", back_populates="organization")
    landlords = relationship("Landlord", back_populates="organization")
    tenants = relationship("Tenant", back_populates="organization")
    vendors = relationship("Vendor", back_populates="organization")
    properties = relationship("Property", back_populates="organization")
    leases = relationship("Lease", back_populates="organization")
    work_orders = relationship("WorkOrder", back_populates="organization")
    attachments = relationship("Attachment", back_populates="organization")
    notifications = relationship("Notification", back_populates="organization")
    audit_logs = relationship("AuditLog", back_populates="organization")


class User(Base):
    """User model"""
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='SET NULL'), nullable=True)
    email = Column(Text, nullable=False, unique=True)
    password_hash = Column(Text, nullable=False)
    full_name = Column(Text, nullable=True)
    phone = Column(Text, nullable=True)
    status = Column(Text, server_default='active', nullable=False)  # 'active', 'invited', 'suspended'
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="users")
    user_roles = relationship("UserRole", back_populates="user")
    created_work_orders = relationship("WorkOrder", foreign_keys="WorkOrder.created_by_user_id", back_populates="created_by_user")
    work_order_comments = relationship("WorkOrderComment", back_populates="author")
    notifications = relationship("Notification", back_populates="user")
    audit_logs = relationship("AuditLog", foreign_keys="AuditLog.actor_user_id", back_populates="actor")
    
    __table_args__ = (
        Index('idx_users_email', 'email', unique=True),
        Index('idx_users_organization_id', 'organization_id'),
    )


class Role(Base):
    """Role model"""
    __tablename__ = "roles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    name = Column(Text, nullable=False, unique=True)  # 'super_admin', 'pmc_admin', 'pm', 'landlord', 'tenant', 'vendor'
    description = Column(Text, nullable=True)
    
    # Relationships
    user_roles = relationship("UserRole", back_populates="role")


class UserRole(Base):
    """User-Role relationship model"""
    __tablename__ = "user_roles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    role_id = Column(UUID(as_uuid=True), ForeignKey('roles.id', ondelete='CASCADE'), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='CASCADE'), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User", back_populates="user_roles")
    role = relationship("Role", back_populates="user_roles")
    organization = relationship("Organization")
    
    __table_args__ = (
        UniqueConstraint('user_id', 'role_id', 'organization_id', name='uq_user_roles_user_role_org'),
        Index('idx_user_roles_user_id', 'user_id'),
        Index('idx_user_roles_role_id', 'role_id'),
        Index('idx_user_roles_organization_id', 'organization_id'),
    )


class Landlord(Base):
    """Landlord model"""
    __tablename__ = "landlords"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    name = Column(Text, nullable=False)
    email = Column(Text, nullable=True)
    phone = Column(Text, nullable=True)
    status = Column(Text, server_default='active', nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User")
    organization = relationship("Organization", back_populates="landlords")
    properties = relationship("Property", back_populates="landlord")
    leases = relationship("Lease", back_populates="landlord")
    
    __table_args__ = (
        Index('idx_landlords_organization_id', 'organization_id'),
        Index('idx_landlords_user_id', 'user_id'),
    )


class Tenant(Base):
    """Tenant model"""
    __tablename__ = "tenants"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    name = Column(Text, nullable=False)
    email = Column(Text, nullable=True)
    phone = Column(Text, nullable=True)
    status = Column(Text, server_default='active', nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User")
    organization = relationship("Organization", back_populates="tenants")
    lease_tenants = relationship("LeaseTenant", back_populates="tenant")
    work_orders = relationship("WorkOrder", back_populates="tenant")
    
    __table_args__ = (
        Index('idx_tenants_organization_id', 'organization_id'),
        Index('idx_tenants_user_id', 'user_id'),
    )


class Vendor(Base):
    """Vendor model"""
    __tablename__ = "vendors"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    company_name = Column(Text, nullable=False)
    contact_name = Column(Text, nullable=True)
    email = Column(Text, nullable=True)
    phone = Column(Text, nullable=True)
    service_categories = Column(ARRAY(Text), nullable=True)
    status = Column(Text, server_default='active', nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    user = relationship("User")
    organization = relationship("Organization", back_populates="vendors")
    work_order_assignments = relationship("WorkOrderAssignment", back_populates="vendor")
    
    __table_args__ = (
        Index('idx_vendors_organization_id', 'organization_id'),
        Index('idx_vendors_user_id', 'user_id'),
    )


class Property(Base):
    """Property model"""
    __tablename__ = "properties"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    landlord_id = Column(UUID(as_uuid=True), ForeignKey('landlords.id', ondelete='SET NULL'), nullable=True)
    name = Column(Text, nullable=True)
    address_line1 = Column(Text, nullable=False)
    address_line2 = Column(Text, nullable=True)
    city = Column(Text, nullable=True)
    state = Column(Text, nullable=True)
    postal_code = Column(Text, nullable=True)
    country = Column(Text, nullable=True)
    status = Column(Text, server_default='active', nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="properties")
    landlord = relationship("Landlord", back_populates="properties")
    units = relationship("Unit", back_populates="property")
    work_orders = relationship("WorkOrder", back_populates="property")
    
    __table_args__ = (
        Index('idx_properties_org_landlord', 'organization_id', 'landlord_id'),
        Index('idx_properties_organization_id', 'organization_id'),
    )


class Unit(Base):
    """Unit model"""
    __tablename__ = "units"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    property_id = Column(UUID(as_uuid=True), ForeignKey('properties.id', ondelete='CASCADE'), nullable=False)
    unit_number = Column(Text, nullable=False)
    floor = Column(Text, nullable=True)
    bedrooms = Column(Integer, nullable=True)
    bathrooms = Column(Integer, nullable=True)
    size_sqft = Column(Integer, nullable=True)
    status = Column(Text, server_default='vacant', nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    property = relationship("Property", back_populates="units")
    leases = relationship("Lease", back_populates="unit")
    work_orders = relationship("WorkOrder", back_populates="unit")
    
    __table_args__ = (
        UniqueConstraint('property_id', 'unit_number', name='uq_units_property_unit'),
        Index('idx_units_property_id', 'property_id'),
    )


class Lease(Base):
    """Lease model"""
    __tablename__ = "leases"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    unit_id = Column(UUID(as_uuid=True), ForeignKey('units.id', ondelete='CASCADE'), nullable=False)
    landlord_id = Column(UUID(as_uuid=True), ForeignKey('landlords.id', ondelete='CASCADE'), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    rent_amount = Column(Numeric(12, 2), nullable=False)
    rent_due_day = Column(Integer, nullable=True)  # 1-31
    security_deposit = Column(Numeric(12, 2), nullable=True)
    status = Column(Text, server_default='pending', nullable=False)  # 'pending', 'active', 'terminated', 'expired'
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="leases")
    unit = relationship("Unit", back_populates="leases")
    landlord = relationship("Landlord", back_populates="leases")
    lease_tenants = relationship("LeaseTenant", back_populates="lease")
    
    __table_args__ = (
        Index('idx_leases_org_unit_status', 'organization_id', 'unit_id', 'status'),
        Index('idx_leases_organization_id', 'organization_id'),
    )


class LeaseTenant(Base):
    """Lease-Tenant relationship model"""
    __tablename__ = "lease_tenants"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    lease_id = Column(UUID(as_uuid=True), ForeignKey('leases.id', ondelete='CASCADE'), nullable=False)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False)
    is_primary = Column(Boolean, server_default='false', nullable=False)
    added_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    lease = relationship("Lease", back_populates="lease_tenants")
    tenant = relationship("Tenant", back_populates="lease_tenants")
    
    __table_args__ = (
        UniqueConstraint('lease_id', 'tenant_id', name='uq_lease_tenants_lease_tenant'),
        Index('idx_lease_tenants_lease_id', 'lease_id'),
        Index('idx_lease_tenants_tenant_id', 'tenant_id'),
    )


class WorkOrder(Base):
    """Work Order model"""
    __tablename__ = "work_orders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    property_id = Column(UUID(as_uuid=True), ForeignKey('properties.id', ondelete='CASCADE'), nullable=False)
    unit_id = Column(UUID(as_uuid=True), ForeignKey('units.id', ondelete='SET NULL'), nullable=True)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey('tenants.id', ondelete='SET NULL'), nullable=True)
    created_by_user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(Text, server_default='new', nullable=False)  # 'new', 'in_progress', 'waiting_on_vendor', 'completed', 'canceled'
    priority = Column(Text, server_default='medium', nullable=False)  # 'low', 'medium', 'high', 'emergency'
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    organization = relationship("Organization", back_populates="work_orders")
    property = relationship("Property", back_populates="work_orders")
    unit = relationship("Unit", back_populates="work_orders")
    tenant = relationship("Tenant", back_populates="work_orders")
    created_by_user = relationship("User", foreign_keys=[created_by_user_id], back_populates="created_work_orders")
    assignments = relationship("WorkOrderAssignment", back_populates="work_order")
    comments = relationship("WorkOrderComment", back_populates="work_order")
    attachments = relationship("Attachment", foreign_keys="Attachment.entity_id", primaryjoin="and_(WorkOrder.id==Attachment.entity_id, Attachment.entity_type=='work_order')")
    
    __table_args__ = (
        Index('idx_work_orders_org_status', 'organization_id', 'status'),
        Index('idx_work_orders_property_status', 'property_id', 'status'),
        Index('idx_work_orders_tenant_id', 'tenant_id'),
        Index('idx_work_orders_created_by', 'created_by_user_id'),
    )


class WorkOrderAssignment(Base):
    """Work Order Assignment model"""
    __tablename__ = "work_order_assignments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    work_order_id = Column(UUID(as_uuid=True), ForeignKey('work_orders.id', ondelete='CASCADE'), nullable=False)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey('vendors.id', ondelete='CASCADE'), nullable=False)
    assigned_by_user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    status = Column(Text, server_default='assigned', nullable=False)  # 'assigned', 'accepted', 'rejected', 'completed'
    assigned_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    work_order = relationship("WorkOrder", back_populates="assignments")
    vendor = relationship("Vendor", back_populates="work_order_assignments")
    assigned_by_user = relationship("User", foreign_keys=[assigned_by_user_id])
    
    __table_args__ = (
        Index('idx_work_order_assignments_work_order_id', 'work_order_id'),
        Index('idx_work_order_assignments_vendor_id', 'vendor_id'),
    )


class WorkOrderComment(Base):
    """Work Order Comment model"""
    __tablename__ = "work_order_comments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    work_order_id = Column(UUID(as_uuid=True), ForeignKey('work_orders.id', ondelete='CASCADE'), nullable=False)
    author_user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    work_order = relationship("WorkOrder", back_populates="comments")
    author = relationship("User", back_populates="work_order_comments")
    
    __table_args__ = (
        Index('idx_work_order_comments_work_order_id', 'work_order_id'),
    )


class Attachment(Base):
    """Generic Attachment model (S3-ready)"""
    __tablename__ = "attachments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    entity_type = Column(Text, nullable=False)  # 'work_order', 'message', 'lease', 'property', etc.
    entity_id = Column(UUID(as_uuid=True), nullable=False)
    storage_key = Column(Text, nullable=False)  # local file path now, S3 key later
    file_name = Column(Text, nullable=False)
    mime_type = Column(Text, nullable=True)
    file_size_bytes = Column(BigInteger, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="attachments")
    
    __table_args__ = (
        Index('idx_attachments_org_entity', 'organization_id', 'entity_type', 'entity_id'),
    )


class Notification(Base):
    """Notification model"""
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    entity_type = Column(Text, nullable=False)
    entity_id = Column(UUID(as_uuid=True), nullable=False)
    type = Column(Text, nullable=False)  # 'MESSAGE_RECEIVED', 'WORK_ORDER_UPDATED', 'RENT_DUE', etc.
    is_read = Column(Boolean, server_default='false', nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    read_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="notifications")
    organization = relationship("Organization", back_populates="notifications")
    
    __table_args__ = (
        Index('idx_notifications_user_read_created', 'user_id', 'is_read', 'created_at'),
    )


class AuditLog(Base):
    """Audit Log model"""
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='SET NULL'), nullable=True)
    actor_user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    action = Column(Text, nullable=False)  # 'ROLE_CHANGED', 'USER_IMPERSONATED', 'LEASE_CREATED', etc.
    entity_type = Column(Text, nullable=True)
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    metadata_json = Column('metadata', JSONB, nullable=True)  # Renamed to avoid SQLAlchemy reserved word conflict
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="audit_logs")
    actor = relationship("User", foreign_keys=[actor_user_id], back_populates="audit_logs")
    
    __table_args__ = (
        Index('idx_audit_logs_org_created', 'organization_id', 'created_at'),
        Index('idx_audit_logs_actor_created', 'actor_user_id', 'created_at'),
    )

