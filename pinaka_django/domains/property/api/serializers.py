"""
Property Domain API Serializers
Single source of truth - auto-generated from models!
"""

from rest_framework import serializers
from domains.property.models import Property, Unit


class UnitSerializer(serializers.ModelSerializer):
    """
    Unit serializer for API responses
    No manual field definitions needed - auto-generated from model!
    """
    class Meta:
        model = Unit
        fields = [
            'id',
            'unit_name',
            'bedrooms',
            'bathrooms',
            'square_feet',
            'floor_number',
            'rent_price',
            'security_deposit',
            'status',
            'has_parking',
            'has_storage',
            'has_balcony',
            'is_furnished',
            'pets_allowed',
            'description',
            'notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UnitCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating units"""
    class Meta:
        model = Unit
        fields = [
            'unit_name',
            'bedrooms',
            'bathrooms',
            'square_feet',
            'floor_number',
            'rent_price',
            'security_deposit',
            'status',
            'has_parking',
            'has_storage',
            'has_balcony',
            'is_furnished',
            'pets_allowed',
            'description',
            'notes',
        ]


class PropertyListSerializer(serializers.ModelSerializer):
    """
    Property list serializer (lightweight)
    """
    unit_count_actual = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = [
            'id',
            'property_name',
            'address_line1',
            'city',
            'province_state',
            'postal_zip',
            'property_type',
            'unit_count',
            'unit_count_actual',
            'status',
            'image_url',
            'created_at',
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_unit_count_actual(self, obj):
        """Get actual unit count from related units"""
        return obj.units.count()


class PropertyDetailSerializer(serializers.ModelSerializer):
    """
    Property detail serializer with related units
    """
    units = UnitSerializer(many=True, read_only=True)
    full_address = serializers.SerializerMethodField()
    unit_count_actual = serializers.SerializerMethodField()
    
    class Meta:
        model = Property
        fields = '__all__'  # Include all fields
    
    def get_full_address(self, obj):
        """Get formatted full address"""
        return obj.get_full_address()
    
    def get_unit_count_actual(self, obj):
        """Get actual unit count"""
        return obj.units.count()


class PropertyCreateSerializer(serializers.ModelSerializer):
    """
    Property creation serializer with validation
    """
    class Meta:
        model = Property
        fields = [
            'property_name',
            'address_line1',
            'address_line2',
            'city',
            'province_state',
            'postal_zip',
            'country',
            'property_type',
            'unit_count',
            'year_built',
            'square_footage',
            'lot_size',
            'purchase_price',
            'purchase_date',
            'assessed_value',
            'description',
            'notes',
            'image_url',
            'status',
            'landlord_id',
            'pmc_id',
        ]
    
    def validate_unit_count(self, value):
        """Validate unit count is positive"""
        if value < 1:
            raise serializers.ValidationError("Unit count must be at least 1")
        return value
    
    def validate_property_name(self, value):
        """Validate property name is not empty"""
        if not value.strip():
            raise serializers.ValidationError("Property name cannot be empty")
        return value


class PropertyUpdateSerializer(serializers.ModelSerializer):
    """
    Property update serializer (all fields optional)
    """
    class Meta:
        model = Property
        fields = [
            'property_name',
            'address_line1',
            'address_line2',
            'city',
            'province_state',
            'postal_zip',
            'country',
            'property_type',
            'unit_count',
            'year_built',
            'square_footage',
            'lot_size',
            'purchase_price',
            'purchase_date',
            'assessed_value',
            'description',
            'notes',
            'image_url',
            'status',
            'landlord_id',
            'pmc_id',
        ]
        # All fields optional for partial updates
        extra_kwargs = {field: {'required': False} for field in fields}

