"""
Property Domain Models
Aggregate root: Property
"""

from django.db import models
from django.core.validators import MinValueValidator
from shared.models import BaseModel, SoftDeleteModel
import uuid


class Property(BaseModel):
    """
    Property Aggregate Root
    Represents a physical property managed in the system
    """
    # Basic Information
    property_name = models.CharField(
        max_length=255,
        help_text="Name of the property"
    )
    
    # Address
    address_line1 = models.CharField(
        max_length=255,
        help_text="Street address line 1"
    )
    address_line2 = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text="Street address line 2 (optional)"
    )
    city = models.CharField(
        max_length=100,
        help_text="City"
    )
    province_state = models.CharField(
        max_length=100,
        help_text="Province or State"
    )
    postal_zip = models.CharField(
        max_length=20,
        help_text="Postal or ZIP code"
    )
    country = models.CharField(
        max_length=100,
        default='Canada',
        help_text="Country"
    )
    
    # Property Details
    property_type = models.CharField(
        max_length=50,
        choices=[
            ('RESIDENTIAL', 'Residential'),
            ('COMMERCIAL', 'Commercial'),
            ('MIXED', 'Mixed Use'),
            ('INDUSTRIAL', 'Industrial'),
        ],
        default='RESIDENTIAL',
        help_text="Type of property"
    )
    
    unit_count = models.IntegerField(
        default=1,
        validators=[MinValueValidator(1)],
        help_text="Total number of units"
    )
    
    year_built = models.IntegerField(
        null=True,
        blank=True,
        help_text="Year the property was built"
    )
    
    square_footage = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Total square footage"
    )
    
    lot_size = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Lot size in square feet"
    )
    
    # Financial
    purchase_price = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Purchase price"
    )
    
    purchase_date = models.DateField(
        null=True,
        blank=True,
        help_text="Date property was purchased"
    )
    
    assessed_value = models.DecimalField(
        max_digits=15,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Current assessed value"
    )
    
    # Description & Notes
    description = models.TextField(
        blank=True,
        default='',
        help_text="Property description"
    )
    
    notes = models.TextField(
        blank=True,
        default='',
        help_text="Internal notes"
    )
    
    # Media
    image_url = models.URLField(
        max_length=500,
        blank=True,
        default='',
        help_text="Primary property image URL"
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('ACTIVE', 'Active'),
            ('INACTIVE', 'Inactive'),
            ('SOLD', 'Sold'),
            ('MAINTENANCE', 'Under Maintenance'),
        ],
        default='ACTIVE',
        help_text="Property status"
    )
    
    # Relationships (Foreign Keys - will be added after other models are created)
    landlord_id = models.CharField(
        max_length=100,
        help_text="Landlord who owns this property"
    )
    
    pmc_id = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text="Property Management Company (if managed)"
    )
    
    class Meta:
        db_table = 'properties'
        verbose_name = 'Property'
        verbose_name_plural = 'Properties'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['landlord_id']),
            models.Index(fields=['pmc_id']),
            models.Index(fields=['city']),
            models.Index(fields=['property_type']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.property_name} - {self.city}"
    
    # Domain Methods
    def get_full_address(self):
        """Return formatted full address"""
        address = f"{self.address_line1}"
        if self.address_line2:
            address += f", {self.address_line2}"
        address += f", {self.city}, {self.province_state} {self.postal_zip}, {self.country}"
        return address
    
    def calculate_total_revenue(self):
        """Calculate total revenue from all units (implement after Unit model)"""
        # Will be implemented once Unit model is created
        return 0
    
    def get_occupancy_rate(self):
        """Calculate current occupancy rate"""
        # Will be implemented once Unit and Lease models are created
        return 0


class Unit(BaseModel):
    """
    Unit Entity
    Represents a rentable unit within a property
    """
    # Override id to use UUID to match existing database schema
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='units',
        help_text="Property this unit belongs to"
    )
    
    unit_name = models.CharField(
        max_length=100,
        help_text="Unit identifier (e.g., 'Unit 101', 'Suite A')"
    )
    
    # Unit Details
    bedrooms = models.IntegerField(
        default=1,
        validators=[MinValueValidator(0)],
        help_text="Number of bedrooms"
    )
    
    bathrooms = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        default=1.0,
        validators=[MinValueValidator(0)],
        help_text="Number of bathrooms"
    )
    
    square_feet = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Unit square footage"
    )
    
    floor_number = models.IntegerField(
        null=True,
        blank=True,
        help_text="Floor number"
    )
    
    # Financial
    rent_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        help_text="Monthly rent price"
    )
    
    security_deposit = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Security deposit amount"
    )
    
    # Status
    status = models.CharField(
        max_length=20,
        choices=[
            ('VACANT', 'Vacant'),
            ('OCCUPIED', 'Occupied'),
            ('MAINTENANCE', 'Under Maintenance'),
            ('RESERVED', 'Reserved'),
        ],
        default='VACANT',
        help_text="Unit status"
    )
    
    # Amenities
    has_parking = models.BooleanField(
        default=False,
        help_text="Has parking space"
    )
    
    has_storage = models.BooleanField(
        default=False,
        help_text="Has storage unit"
    )
    
    has_balcony = models.BooleanField(
        default=False,
        help_text="Has balcony"
    )
    
    is_furnished = models.BooleanField(
        default=False,
        help_text="Is furnished"
    )
    
    pets_allowed = models.BooleanField(
        default=False,
        help_text="Pets allowed"
    )
    
    description = models.TextField(
        blank=True,
        default='',
        help_text="Unit description"
    )
    
    notes = models.TextField(
        blank=True,
        default='',
        help_text="Internal notes"
    )
    
    class Meta:
        db_table = 'units'
        verbose_name = 'Unit'
        verbose_name_plural = 'Units'
        ordering = ['property', 'unit_name']
        unique_together = [['property', 'unit_name']]
        indexes = [
            models.Index(fields=['property', 'status']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"{self.property.property_name} - {self.unit_name}"
    
    # Domain Methods
    def is_available(self):
        """Check if unit is available for rent"""
        return self.status == 'VACANT'
    
    def get_current_lease(self):
        """Get current active lease (implement after Lease model)"""
        # Will be implemented once Lease model is created
        return None
