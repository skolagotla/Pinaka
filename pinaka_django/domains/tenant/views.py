"""Tenant Domain API Views"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Tenant
from .serializers import TenantSerializer, TenantListSerializer

class TenantViewSet(viewsets.ModelViewSet):
    # OPTIMIZED: Prefetch related leases and payments for detail views
    queryset = Tenant.objects.prefetch_related('lease_tenants', 'lease_tenants__lease', 'lease_tenants__lease__unit')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'approval_status']
    search_fields = ['first_name', 'last_name', 'email', 'tenant_id']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Optimize queryset based on action"""
        queryset = super().get_queryset()
        if self.action == 'retrieve':
            # For detail view, prefetch more related objects
            queryset = queryset.prefetch_related(
                'lease_tenants__lease__unit__property',
                'lease_tenants__lease__rent_payments'
            )
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TenantListSerializer
        return TenantSerializer
    
    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        """Approve tenant application"""
        try:
            tenant = self.get_object()
            tenant.approval_status = 'APPROVED'
            tenant.status = 'ACTIVE'
            tenant.approved_at = timezone.now()
            # Note: approved_by field may not exist in model, using rejection_reason field to store approver if needed
            tenant.save()
            
            serializer = self.get_serializer(tenant)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Tenant approved successfully'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        """Reject tenant application"""
        try:
            tenant = self.get_object()
            reason = request.data.get('reason', '')
            
            tenant.approval_status = 'REJECTED'
            tenant.status = 'INACTIVE'
            tenant.rejected_at = timezone.now()
            tenant.rejection_reason = reason
            tenant.save()
            
            serializer = self.get_serializer(tenant)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Tenant rejected successfully'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
