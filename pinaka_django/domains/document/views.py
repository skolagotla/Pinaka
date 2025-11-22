"""Document Domain API Views"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.http import HttpResponse, FileResponse
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
from .models import Document, DocumentAuditLog, DocumentMessage
from .serializers import (
    DocumentSerializer,
    DocumentListSerializer,
    DocumentAuditLogSerializer,
    DocumentMessageSerializer
)


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.select_related('tenant', 'property').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'category',
        'is_verified',
        'is_deleted',
        'is_required',
        'visibility',
        'tenant',
        'property',
    ]
    search_fields = [
        'original_name',
        'file_name',
        'description',
        'tenant__first_name',
        'tenant__last_name',
        'tenant__email',
    ]
    ordering = ['-uploaded_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DocumentListSerializer
        return DocumentSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        # Filter out deleted documents by default
        if self.request.query_params.get('include_deleted') != 'true':
            queryset = queryset.filter(is_deleted=False)
        return queryset
    
    @action(detail=False, methods=['post'], url_path='upload')
    def upload(self, request):
        """Upload a new document"""
        try:
            if 'file' not in request.FILES:
                return Response({
                    'success': False,
                    'error': 'No file provided'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            file = request.FILES['file']
            category = request.data.get('category', 'PERSONAL')
            description = request.data.get('description', '')
            
            # Get user info
            user = request.user
            user_email = user.email if hasattr(user, 'email') else 'unknown@example.com'
            user_name = user.get_full_name() if hasattr(user, 'get_full_name') else 'Unknown User'
            
            # Get tenant from user profile
            tenant = None
            if hasattr(user, 'tenant_profile'):
                tenant = user.tenant_profile
            elif hasattr(user, 'landlord_profile'):
                # For landlords, we might need tenant selection
                tenant_id = request.data.get('tenant_id')
                if tenant_id:
                    from domains.tenant.models import Tenant
                    tenant = Tenant.objects.filter(id=tenant_id).first()
            
            if not tenant:
                return Response({
                    'success': False,
                    'error': 'Tenant not found'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            # Save file
            file_name = default_storage.save(f'documents/{tenant.id}/{file.name}', ContentFile(file.read()))
            file_path = default_storage.path(file_name)
            
            # Create document
            document = Document.objects.create(
                tenant=tenant,
                file_name=os.path.basename(file_name),
                original_name=file.name,
                file_type=file.content_type or 'application/octet-stream',
                file_size=file.size,
                storage_path=file_name,
                category=category,
                description=description,
                uploaded_by=str(tenant.id),
                uploaded_by_email=user_email,
                uploaded_by_name=user_name,
            )
            
            serializer = DocumentSerializer(document)
            return Response({
                'success': True,
                'data': serializer.data
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['get'], url_path='view')
    def view_document(self, request, pk=None):
        """View/download a document"""
        try:
            document = self.get_object()
            
            if not default_storage.exists(document.storage_path):
                return HttpResponse('File not found', status=404)
            
            file = default_storage.open(document.storage_path, 'rb')
            response = FileResponse(file, content_type=document.file_type)
            response['Content-Disposition'] = f'inline; filename="{document.original_name}"'
            return response
            
        except Exception as e:
            return HttpResponse(f'Error: {str(e)}', status=500)


class DocumentAuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DocumentAuditLog.objects.select_related('document').all()
    serializer_class = DocumentAuditLogSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['action', 'document']
    ordering = ['-created_at']


class DocumentMessageViewSet(viewsets.ModelViewSet):
    queryset = DocumentMessage.objects.select_related('document').all()
    serializer_class = DocumentMessageSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['document', 'sender_role', 'is_read']
    ordering = ['-created_at']

