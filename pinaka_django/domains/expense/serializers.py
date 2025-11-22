"""Expense Domain Serializers"""
from rest_framework import serializers
from .models import Expense


class ExpenseSerializer(serializers.ModelSerializer):
    property_name = serializers.CharField(source='property.property_name', read_only=True)
    
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class ExpenseListSerializer(serializers.ModelSerializer):
    property_name = serializers.CharField(source='property.property_name', read_only=True)
    
    class Meta:
        model = Expense
        fields = [
            'id',
            'category',
            'amount',
            'date',
            'description',
            'property_name',
            'paid_to',
            'payment_method',
            'created_at',
        ]

