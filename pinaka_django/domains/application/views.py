"""Application Domain API Views"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Application
from .serializers import ApplicationSerializer, ApplicationListSerializer


class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.select_related('property', 'unit', 'lease').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'status',
        'property',
        'unit',
        'applicant_id',
        'screening_status',
        'is_archived',
        'approval_status',
    ]
    search_fields = [
        'applicant_name',
        'applicant_email',
        'property__property_name',
        'unit__unit_name',
    ]
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ApplicationListSerializer
        return ApplicationSerializer
    
    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        """Approve application"""
        try:
            application = self.get_object()
            notes = request.data.get('notes', '')
            
            application.status = 'APPROVED'
            application.approved_at = timezone.now()
            application.approved_by = str(request.user.id) if hasattr(request.user, 'id') else 'system'
            application.approved_by_email = request.user.email if hasattr(request.user, 'email') else None
            application.approved_by_name = request.user.get_full_name() if hasattr(request.user, 'get_full_name') else str(request.user)
            if notes:
                application.notes = (application.notes or '') + f'\nApproval Notes: {notes}'
            application.save()
            
            serializer = self.get_serializer(application)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Application approved successfully'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        """Reject application"""
        try:
            application = self.get_object()
            reason = request.data.get('reason', '')
            
            application.status = 'REJECTED'
            application.rejected_at = timezone.now()
            application.rejected_by = str(request.user.id) if hasattr(request.user, 'id') else 'system'
            application.rejected_by_email = request.user.email if hasattr(request.user, 'email') else None
            application.rejected_by_name = request.user.get_full_name() if hasattr(request.user, 'get_full_name') else str(request.user)
            application.rejection_reason = reason
            application.save()
            
            serializer = self.get_serializer(application)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Application rejected successfully'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

