"""Document Domain Serializers"""
from rest_framework import serializers
from .models import Document, DocumentAuditLog, DocumentMessage


class DocumentSerializer(serializers.ModelSerializer):
    file_size_mb = serializers.FloatField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    tenant_name = serializers.CharField(source='tenant.full_name', read_only=True)
    property_name = serializers.CharField(source='property.property_name', read_only=True, allow_null=True)
    
    class Meta:
        model = Document
        fields = '__all__'
        read_only_fields = ['id', 'uploaded_at', 'updated_at']


class DocumentListSerializer(serializers.ModelSerializer):
    file_size_mb = serializers.FloatField(read_only=True)
    is_expired = serializers.BooleanField(read_only=True)
    tenant_name = serializers.CharField(source='tenant.full_name', read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id',
            'original_name',
            'file_name',
            'file_type',
            'file_size',
            'file_size_mb',
            'category',
            'subcategory',
            'is_verified',
            'is_deleted',
            'is_expired',
            'expiration_date',
            'is_required',
            'uploaded_at',
            'tenant_name',
        ]


class DocumentAuditLogSerializer(serializers.ModelSerializer):
    document_name = serializers.CharField(source='document.original_name', read_only=True)
    
    class Meta:
        model = DocumentAuditLog
        fields = '__all__'
        read_only_fields = ['id', 'created_at']


class DocumentMessageSerializer(serializers.ModelSerializer):
    document_name = serializers.CharField(source='document.original_name', read_only=True)
    
    class Meta:
        model = DocumentMessage
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

