"""Maintenance Domain API Views"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import MaintenanceRequest, MaintenanceComment
from .serializers import MaintenanceRequestSerializer, MaintenanceCommentSerializer

class MaintenanceRequestViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceRequest.objects.all().select_related('property', 'tenant')
    serializer_class = MaintenanceRequestSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'category', 'property', 'tenant']
    search_fields = ['title', 'description', 'ticket_number']
    ordering = ['-requested_date']
    
    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        """Approve maintenance request (changes status to ASSIGNED)"""
        try:
            maintenance = self.get_object()
            maintenance.status = 'ASSIGNED'
            maintenance.save()
            
            serializer = self.get_serializer(maintenance)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Maintenance request approved successfully'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        """Reject maintenance request (changes status to CANCELLED)"""
        try:
            maintenance = self.get_object()
            reason = request.data.get('reason', '')
            
            maintenance.status = 'CANCELLED'
            # Store rejection reason in description or notes if available
            if reason:
                maintenance.description = (maintenance.description or '') + f'\n[Rejected: {reason}]'
            maintenance.save()
            
            serializer = self.get_serializer(maintenance)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Maintenance request rejected successfully'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'], url_path='escalate')
    def escalate(self, request, pk=None):
        """Escalate maintenance request (increases priority)"""
        try:
            maintenance = self.get_object()
            maintenance.priority = 'HIGH'
            maintenance.save()
            
            serializer = self.get_serializer(maintenance)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Maintenance request escalated successfully'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MaintenanceCommentViewSet(viewsets.ModelViewSet):
    queryset = MaintenanceComment.objects.all().select_related('maintenance_request')
    serializer_class = MaintenanceCommentSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['maintenance_request', 'author_role']
    ordering = ['created_at']

