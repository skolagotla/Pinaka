"""Landlord Domain API Views"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Landlord
from .serializers import LandlordSerializer, LandlordListSerializer

class LandlordViewSet(viewsets.ModelViewSet):
    # OPTIMIZED: Prefetch related properties for detail views
    queryset = Landlord.objects.prefetch_related('properties')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['approval_status', 'country_code']
    search_fields = ['first_name', 'last_name', 'email', 'landlord_id']
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
            return LandlordListSerializer
        return LandlordSerializer
    
    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        """Approve landlord"""
        try:
            landlord = self.get_object()
            landlord.approval_status = 'APPROVED'
            landlord.approved_at = timezone.now()
            landlord.approved_by = request.user.email if hasattr(request.user, 'email') else 'system'
            landlord.save()
            
            serializer = self.get_serializer(landlord)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Landlord approved successfully'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        """Reject landlord"""
        try:
            landlord = self.get_object()
            reason = request.data.get('reason', '')
            
            landlord.approval_status = 'REJECTED'
            landlord.rejected_at = timezone.now()
            landlord.rejected_by = request.user.email if hasattr(request.user, 'email') else 'system'
            landlord.rejection_reason = reason
            landlord.save()
            
            serializer = self.get_serializer(landlord)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Landlord rejected successfully'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

