"""
SQLAlchemy models for database tables
"""

from sqlalchemy import Column, String, Boolean, Float, DateTime, Text, ARRAY, ForeignKey, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from core.database import Base
import uuid


class ServiceProvider(Base):
    """Service Provider model (vendors and contractors)"""
    __tablename__ = "ServiceProvider"
    
    id = Column(String, primary_key=True, default=lambda: f"cuid_{uuid.uuid4().hex[:25]}")
    provider_id = Column("providerId", String, unique=True, nullable=False)
    type = Column(String, nullable=False)  # 'vendor' or 'contractor'
    
    # Name fields
    name = Column(String, nullable=False)
    business_name = Column("businessName", String, nullable=True)
    contact_name = Column("contactName", String, nullable=True)
    license_number = Column("licenseNumber", String, nullable=True)
    
    # Contact info
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=False)
    
    # Service classification
    category = Column(String, nullable=True)
    specialties = Column(ARRAY(String), nullable=True, default=[])
    
    # Location
    address_line1 = Column("addressLine1", String, nullable=True)
    address_line2 = Column("addressLine2", String, nullable=True)
    city = Column(String, nullable=True)
    province_state = Column("provinceState", String, nullable=True)
    postal_zip = Column("postalZip", String, nullable=True)
    country = Column(String, nullable=True)
    country_code = Column("countryCode", String, nullable=True)
    region_code = Column("regionCode", String, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    # Business fields
    rating = Column(Float, nullable=True)
    hourly_rate = Column("hourlyRate", Float, nullable=True)
    notes = Column(Text, nullable=True)
    
    # Global vs Local
    is_global = Column("isGlobal", Boolean, default=False)
    invited_by = Column("invitedBy", String, nullable=True)
    invited_by_role = Column("invitedByRole", String, nullable=True)
    approved_by = Column("approvedBy", String, nullable=True)
    approved_at = Column("approvedAt", DateTime, nullable=True)
    
    # Soft delete
    is_deleted = Column("isDeleted", Boolean, default=False)
    deleted_at = Column("deletedAt", DateTime, nullable=True)
    deleted_by = Column("deletedBy", String, nullable=True)
    deleted_by_role = Column("deletedByRole", String, nullable=True)
    deletion_reason = Column("deletionReason", String, nullable=True)
    
    # Retention fields
    retained_name = Column("retainedName", String, nullable=True)
    retained_email = Column("retainedEmail", String, nullable=True)
    retained_phone = Column("retainedPhone", String, nullable=True)
    
    is_active = Column("isActive", Boolean, default=True)
    created_at = Column("createdAt", DateTime, server_default=func.now(), nullable=False)
    updated_at = Column("updatedAt", DateTime, server_default=func.now(), onupdate=func.now(), nullable=False)
    
    # Indexes
    __table_args__ = (
        Index("idx_service_provider_type", "type"),
        Index("idx_service_provider_category", "category"),
        Index("idx_service_provider_is_active", "isActive"),
        Index("idx_service_provider_email", "email"),
        Index("idx_service_provider_is_global", "isGlobal"),
        Index("idx_service_provider_is_deleted", "isDeleted"),
        Index("idx_service_provider_location", "latitude", "longitude"),
        Index("idx_service_provider_invited_by", "invitedBy"),
    )

