"""
Property Domain Serializers
"""
from rest_framework import serializers
from .models import Property, Unit


class UnitSerializer(serializers.ModelSerializer):
    """Serializer for Unit model"""
    
    class Meta:
        model = Unit
        fields = [
            'id', 'property', 'unit_number', 'floor_number',
            'bedrooms', 'bathrooms', 'square_feet', 'rent_amount',
            'status', 'available_from', 'description',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class UnitListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for unit lists"""
    
    property_name = serializers.CharField(source='property.property_name', read_only=True)
    
    class Meta:
        model = Unit
        fields = [
            'id', 'unit_number', 'bedrooms', 'bathrooms',
            'rent_amount', 'status', 'property_name'
        ]


class PropertySerializer(serializers.ModelSerializer):
    """Serializer for Property model"""
    
    units = UnitSerializer(many=True, read_only=True)
    unit_count_actual = serializers.IntegerField(source='units.count', read_only=True)
    
    class Meta:
        model = Property
        fields = [
            'id', 'property_name', 'address_line1', 'address_line2',
            'city', 'province_state', 'postal_zip', 'country',
            'property_type', 'year_built', 'purchase_price', 'purchase_date',
            'square_footage', 'lot_size', 'assessed_value',
            'status', 'landlord_id', 'pmc_id', 'unit_count', 'unit_count_actual',
            'description', 'notes', 'image_url',
            'created_at', 'updated_at', 'units'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'unit_count_actual']


class PropertyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for property lists"""
    
    unit_count_actual = serializers.IntegerField(source='units.count', read_only=True)
    
    class Meta:
        model = Property
        fields = [
            'id', 'property_name', 'address_line1', 'city',
            'province_state', 'postal_zip', 'property_type',
            'status', 'unit_count_actual'
        ]

