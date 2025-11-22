"""Expense Domain API Views"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from .models import Expense
from .serializers import ExpenseSerializer, ExpenseListSerializer


class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.select_related('property', 'maintenance_request').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'property',
        'category',
        'date',
        'is_recurring',
        'created_by_pmc',
        'approval_status',
    ]
    search_fields = [
        'description',
        'category',
        'paid_to',
        'property__property_name',
    ]
    ordering = ['-date', '-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ExpenseListSerializer
        return ExpenseSerializer
    
    @action(detail=True, methods=['post'], url_path='approve')
    def approve(self, request, pk=None):
        """Approve expense (for PMC approval workflow)"""
        try:
            expense = self.get_object()
            # Expense model doesn't have approval_status, but has pmc_approval_request_id
            # Mark as approved by clearing the approval request ID
            expense.pmc_approval_request_id = None
            expense.save()
            
            serializer = self.get_serializer(expense)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Expense approved successfully'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'], url_path='reject')
    def reject(self, request, pk=None):
        """Reject expense (for PMC approval workflow)"""
        try:
            expense = self.get_object()
            reason = request.data.get('reason', '')
            
            # Store rejection reason in description
            if reason:
                expense.description = (expense.description or '') + f'\n[Rejected: {reason}]'
            # Clear approval request ID to mark as rejected
            expense.pmc_approval_request_id = None
            expense.save()
            
            serializer = self.get_serializer(expense)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Expense rejected successfully'
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

