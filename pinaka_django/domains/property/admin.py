"""
Django Admin Interface for Property Domain
Auto-generated CRUD interface - no code needed!
"""

from django.contrib import admin
from .models import Property, Unit


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    """
    Property administration interface
    Fully functional CRUD without writing any forms!
    """
    list_display = [
        'property_name',
        'city',
        'province_state',
        'property_type',
        'unit_count',
        'status',
        'created_at',
    ]
    
    list_filter = [
        'property_type',
        'status',
        'city',
        'province_state',
    ]
    
    search_fields = [
        'property_name',
        'address_line1',
        'city',
        'postal_zip',
    ]
    
    readonly_fields = [
        'id',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('property_name', 'property_type', 'unit_count', 'status')
        }),
        ('Address', {
            'fields': (
                'address_line1',
                'address_line2',
                'city',
                'province_state',
                'postal_zip',
                'country',
            )
        }),
        ('Property Details', {
            'fields': (
                'year_built',
                'square_footage',
                'lot_size',
            ),
            'classes': ('collapse',),  # Collapsible section
        }),
        ('Financial Information', {
            'fields': (
                'purchase_price',
                'purchase_date',
                'assessed_value',
            ),
            'classes': ('collapse',),
        }),
        ('Description', {
            'fields': ('description', 'notes', 'image_url')
        }),
        ('Relationships', {
            'fields': ('landlord_id', 'pmc_id')
        }),
        ('System Information', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
    
    # Inline units display
    class UnitInline(admin.TabularInline):
        model = Unit
        extra = 1
        fields = ['unit_name', 'bedrooms', 'bathrooms', 'rent_price', 'status']
    
    inlines = [UnitInline]


@admin.register(Unit)
class UnitAdmin(admin.ModelAdmin):
    """
    Unit administration interface
    """
    list_display = [
        'unit_name',
        'property',
        'bedrooms',
        'bathrooms',
        'rent_price',
        'status',
        'created_at',
    ]
    
    list_filter = [
        'status',
        'bedrooms',
        'bathrooms',
        'has_parking',
        'pets_allowed',
    ]
    
    search_fields = [
        'unit_name',
        'property__property_name',
    ]
    
    readonly_fields = [
        'id',
        'created_at',
        'updated_at',
    ]
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('property', 'unit_name', 'status')
        }),
        ('Unit Details', {
            'fields': (
                'bedrooms',
                'bathrooms',
                'square_feet',
                'floor_number',
            )
        }),
        ('Financial', {
            'fields': ('rent_price', 'security_deposit')
        }),
        ('Amenities', {
            'fields': (
                'has_parking',
                'has_storage',
                'has_balcony',
                'is_furnished',
                'pets_allowed',
            )
        }),
        ('Description', {
            'fields': ('description', 'notes')
        }),
        ('System Information', {
            'fields': ('id', 'created_at', 'updated_at'),
            'classes': ('collapse',),
        }),
    )
