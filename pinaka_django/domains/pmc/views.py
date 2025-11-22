"""PMC Domain API Views"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import PropertyManagementCompany
from .serializers import PropertyManagementCompanySerializer, PropertyManagementCompanyListSerializer

class PropertyManagementCompanyViewSet(viewsets.ModelViewSet):
    # OPTIMIZED: Prefetch related properties and admins
    queryset = PropertyManagementCompany.objects.prefetch_related('properties')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['approval_status', 'is_active', 'country_code']
    search_fields = ['company_name', 'email', 'company_id']
    ordering = ['-created_at']
    
    def get_queryset(self):
        """Optimize queryset based on action"""
        queryset = super().get_queryset()
        if self.action == 'retrieve':
            # For detail view, prefetch more related objects
            queryset = queryset.prefetch_related('properties__units', 'properties__units__leases')
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PropertyManagementCompanyListSerializer
        return PropertyManagementCompanySerializer
    
    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        """Approve PMC"""
        try:
            pmc = self.get_object()
            pmc.approval_status = 'APPROVED'
            pmc.is_active = True
            pmc.approved_at = timezone.now()
            pmc.approved_by = str(request.user.id) if hasattr(request.user, 'id') else 'system'
            pmc.save()
            
            serializer = self.get_serializer(pmc)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'PMC approved successfully'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        """Reject PMC"""
        try:
            pmc = self.get_object()
            reason = request.data.get('reason', '')
            
            pmc.approval_status = 'REJECTED'
            pmc.is_active = False
            pmc.rejected_at = timezone.now()
            pmc.rejected_by = str(request.user.id) if hasattr(request.user, 'id') else 'system'
            pmc.rejection_reason = reason
            pmc.save()
            
            serializer = self.get_serializer(pmc)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'PMC rejected successfully'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

