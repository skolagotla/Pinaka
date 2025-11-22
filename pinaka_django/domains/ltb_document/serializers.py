"""
LTB Document Serializers
"""
from rest_framework import serializers
from .models import LTBDocument


class LTBDocumentSerializer(serializers.ModelSerializer):
    """LTB Document serializer - matching React app format"""
    
    # Map to React app field names
    formNumber = serializers.CharField(source='form_number', read_only=True)
    pdfUrl = serializers.URLField(source='pdf_url', read_only=True)
    instructionUrl = serializers.URLField(source='instruction_url', read_only=True, allow_null=True)
    
    class Meta:
        model = LTBDocument
        fields = [
            'id',
            'form_number',
            'formNumber',  # React app format
            'name',
            'description',
            'category',
            'audience',
            'pdf_url',
            'pdfUrl',  # React app format
            'instruction_url',
            'instructionUrl',  # React app format
            'country',
            'province',
        ]
        read_only_fields = fields

