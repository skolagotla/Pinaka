"""
SQLAlchemy models for v2 database schema
All tables use UUID primary keys and snake_case naming
"""
from sqlalchemy import Column, String, Boolean, Integer, Numeric, Date, DateTime, Text, ForeignKey, Index, UniqueConstraint, BigInteger
import sqlalchemy as sa
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
    tasks = relationship("Task", back_populates="organization")
    conversations = relationship("Conversation", back_populates="organization")
    invitations = relationship("Invitation", back_populates="organization")
    forms = relationship("Form", back_populates="organization")
    rent_payments = relationship("RentPayment", back_populates="organization")
    expenses = relationship("Expense", back_populates="organization")
    inspections = relationship("Inspection", back_populates="organization")


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
    onboarding_completed = Column(sa.Boolean, server_default=sa_text('false'), nullable=False)
    onboarding_step = Column(sa.Integer, server_default=sa_text('0'), nullable=False)  # Current step in onboarding flow
    onboarding_data = Column(sa.JSON, nullable=True)  # Store onboarding progress data
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
    extra_metadata = Column(JSONB, nullable=True)  # Using extra_metadata to avoid SQLAlchemy reserved word conflict
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    organization = relationship("Organization", back_populates="audit_logs")
    actor = relationship("User", foreign_keys=[actor_user_id], back_populates="audit_logs")
    
    __table_args__ = (
        Index('idx_audit_logs_org_created', 'organization_id', 'created_at'),
        Index('idx_audit_logs_actor_created', 'actor_user_id', 'created_at'),
    )


class Task(Base):
    """Task model for calendar and to-do items"""
    __tablename__ = "tasks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    created_by_user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    property_id = Column(UUID(as_uuid=True), ForeignKey('properties.id', ondelete='SET NULL'), nullable=True)
    title = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    category = Column(Text, nullable=True)  # 'rent', 'lease', 'maintenance', 'legal', 'inspection', 'general'
    due_date = Column(DateTime(timezone=True), nullable=False)
    priority = Column(Text, server_default='medium', nullable=False)  # 'low', 'medium', 'high', 'urgent'
    is_completed = Column(Boolean, server_default='false', nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    organization = relationship("Organization")
    created_by_user = relationship("User", foreign_keys=[created_by_user_id])
    property = relationship("Property")
    
    __table_args__ = (
        Index('idx_tasks_org_due_date', 'organization_id', 'due_date'),
        Index('idx_tasks_created_by', 'created_by_user_id'),
        Index('idx_tasks_property_id', 'property_id'),
    )


class Conversation(Base):
    """Conversation model for messaging"""
    __tablename__ = "conversations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    created_by_user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    entity_type = Column(Text, nullable=True)  # 'work_order', 'lease', 'property', etc.
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    subject = Column(Text, nullable=True)
    status = Column(Text, server_default='active', nullable=False)  # 'active', 'archived', 'closed'
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    organization = relationship("Organization")
    created_by_user = relationship("User", foreign_keys=[created_by_user_id])
    participants = relationship("ConversationParticipant", back_populates="conversation")
    messages = relationship("Message", back_populates="conversation")
    
    __table_args__ = (
        Index('idx_conversations_org_entity', 'organization_id', 'entity_type', 'entity_id'),
        Index('idx_conversations_created_by', 'created_by_user_id'),
    )


class ConversationParticipant(Base):
    """Conversation Participant model"""
    __tablename__ = "conversation_participants"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    conversation_id = Column(UUID(as_uuid=True), ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    last_read_at = Column(DateTime(timezone=True), nullable=True)
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    conversation = relationship("Conversation", back_populates="participants")
    user = relationship("User")
    
    __table_args__ = (
        UniqueConstraint('conversation_id', 'user_id', name='uq_conversation_participants_conv_user'),
        Index('idx_conversation_participants_conv_id', 'conversation_id'),
        Index('idx_conversation_participants_user_id', 'user_id'),
    )


class Message(Base):
    """Message model for conversations"""
    __tablename__ = "messages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    conversation_id = Column(UUID(as_uuid=True), ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False)
    sender_user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    body = Column(Text, nullable=False)
    is_read = Column(Boolean, server_default='false', nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_user_id])
    
    __table_args__ = (
        Index('idx_messages_conversation_created', 'conversation_id', 'created_at'),
        Index('idx_messages_sender', 'sender_user_id'),
    )


class Invitation(Base):
    """Invitation model for user onboarding"""
    __tablename__ = "invitations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    invited_by_user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    email = Column(Text, nullable=False)
    role_name = Column(Text, nullable=False)  # 'landlord', 'tenant', 'pmc', 'vendor', etc.
    token = Column(Text, nullable=False, unique=True)
    status = Column(Text, server_default='pending', nullable=False)  # 'pending', 'accepted', 'expired', 'cancelled'
    expires_at = Column(DateTime(timezone=True), nullable=False)
    accepted_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    organization = relationship("Organization")
    invited_by_user = relationship("User", foreign_keys=[invited_by_user_id])
    
    __table_args__ = (
        Index('idx_invitations_org_status', 'organization_id', 'status'),
        Index('idx_invitations_email', 'email'),
        Index('idx_invitations_token', 'token', unique=True),
    )


class Form(Base):
    """Form model for document generation and signing"""
    __tablename__ = "forms"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    created_by_user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    form_type = Column(Text, nullable=False)  # 'N4', 'N5', 'L1', 'T1', etc.
    entity_type = Column(Text, nullable=True)  # 'lease', 'work_order', etc.
    entity_id = Column(UUID(as_uuid=True), nullable=True)
    template_data = Column(JSONB, nullable=True)  # Form field values
    status = Column(Text, server_default='draft', nullable=False)  # 'draft', 'pending_signature', 'signed', 'expired'
    signed_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    organization = relationship("Organization")
    created_by_user = relationship("User", foreign_keys=[created_by_user_id])
    signatures = relationship("FormSignature", back_populates="form")
    
    __table_args__ = (
        Index('idx_forms_org_entity', 'organization_id', 'entity_type', 'entity_id'),
        Index('idx_forms_type_status', 'form_type', 'status'),
    )


class FormSignature(Base):
    """Form Signature model"""
    __tablename__ = "form_signatures"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    form_id = Column(UUID(as_uuid=True), ForeignKey('forms.id', ondelete='CASCADE'), nullable=False)
    signer_user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    signature_data = Column(Text, nullable=True)  # Base64 encoded signature image
    signed_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relationships
    form = relationship("Form", back_populates="signatures")
    signer = relationship("User", foreign_keys=[signer_user_id])
    
    __table_args__ = (
        Index('idx_form_signatures_form_id', 'form_id'),
        Index('idx_form_signatures_signer', 'signer_user_id'),
    )


class RentPayment(Base):
    """Rent Payment model"""
    __tablename__ = "rent_payments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    lease_id = Column(UUID(as_uuid=True), ForeignKey('leases.id', ondelete='CASCADE'), nullable=False)
    tenant_id = Column(UUID(as_uuid=True), ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False)
    amount = Column(Numeric(12, 2), nullable=False)
    payment_date = Column(Date, nullable=False)
    payment_method = Column(Text, nullable=True)  # 'check', 'bank_transfer', 'credit_card', 'cash', etc.
    status = Column(Text, server_default='pending', nullable=False)  # 'pending', 'completed', 'failed', 'refunded'
    reference_number = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    organization = relationship("Organization")
    lease = relationship("Lease")
    tenant = relationship("Tenant")
    
    __table_args__ = (
        Index('idx_rent_payments_lease_date', 'lease_id', 'payment_date'),
        Index('idx_rent_payments_tenant', 'tenant_id'),
        Index('idx_rent_payments_status', 'status'),
    )


class Expense(Base):
    """Expense model"""
    __tablename__ = "expenses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    property_id = Column(UUID(as_uuid=True), ForeignKey('properties.id', ondelete='SET NULL'), nullable=True)
    work_order_id = Column(UUID(as_uuid=True), ForeignKey('work_orders.id', ondelete='SET NULL'), nullable=True)
    vendor_id = Column(UUID(as_uuid=True), ForeignKey('vendors.id', ondelete='SET NULL'), nullable=True)
    category = Column(Text, nullable=False)  # 'maintenance', 'utilities', 'insurance', 'taxes', etc.
    amount = Column(Numeric(12, 2), nullable=False)
    expense_date = Column(Date, nullable=False)
    description = Column(Text, nullable=True)
    receipt_attachment_id = Column(UUID(as_uuid=True), ForeignKey('attachments.id', ondelete='SET NULL'), nullable=True)
    status = Column(Text, server_default='pending', nullable=False)  # 'pending', 'approved', 'rejected', 'paid'
    created_by_user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    organization = relationship("Organization")
    property = relationship("Property")
    work_order = relationship("WorkOrder")
    vendor = relationship("Vendor")
    created_by_user = relationship("User", foreign_keys=[created_by_user_id])
    receipt_attachment = relationship("Attachment", foreign_keys=[receipt_attachment_id])
    
    __table_args__ = (
        Index('idx_expenses_org_date', 'organization_id', 'expense_date'),
        Index('idx_expenses_property', 'property_id'),
        Index('idx_expenses_category', 'category'),
    )


class Inspection(Base):
    """Inspection model"""
    __tablename__ = "inspections"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, server_default=sa_text('gen_random_uuid()'))
    organization_id = Column(UUID(as_uuid=True), ForeignKey('organizations.id', ondelete='CASCADE'), nullable=False)
    property_id = Column(UUID(as_uuid=True), ForeignKey('properties.id', ondelete='CASCADE'), nullable=False)
    unit_id = Column(UUID(as_uuid=True), ForeignKey('units.id', ondelete='SET NULL'), nullable=True)
    lease_id = Column(UUID(as_uuid=True), ForeignKey('leases.id', ondelete='SET NULL'), nullable=True)
    inspection_type = Column(Text, nullable=False)  # 'move_in', 'move_out', 'routine', 'damage', etc.
    scheduled_date = Column(Date, nullable=False)
    completed_date = Column(Date, nullable=True)
    status = Column(Text, server_default='scheduled', nullable=False)  # 'scheduled', 'in_progress', 'completed', 'cancelled'
    notes = Column(Text, nullable=True)
    checklist_data = Column(JSONB, nullable=True)  # Inspection checklist items
    created_by_user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Relationships
    organization = relationship("Organization")
    property = relationship("Property")
    unit = relationship("Unit")
    lease = relationship("Lease")
    created_by_user = relationship("User", foreign_keys=[created_by_user_id])
    
    __table_args__ = (
        Index('idx_inspections_org_date', 'organization_id', 'scheduled_date'),
        Index('idx_inspections_property', 'property_id'),
        Index('idx_inspections_status', 'status'),
    )

