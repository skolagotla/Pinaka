"""Payment Domain API Views"""
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import RentPayment, SecurityDeposit, Expense
from .serializers import RentPaymentSerializer, SecurityDepositSerializer, ExpenseSerializer

class RentPaymentViewSet(viewsets.ModelViewSet):
    # OPTIMIZED: Add unit and property relationships
    queryset = RentPayment.objects.select_related('lease', 'lease__unit', 'lease__unit__property')
    serializer_class = RentPaymentSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['status', 'lease', 'payment_method', 'is_late']
    ordering = ['-payment_date']

class SecurityDepositViewSet(viewsets.ModelViewSet):
    queryset = SecurityDeposit.objects.all().select_related('lease')
    serializer_class = SecurityDepositSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status', 'lease']
    ordering = ['-received_date']

class ExpenseViewSet(viewsets.ModelViewSet):
    queryset = Expense.objects.all()
    serializer_class = ExpenseSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['category', 'status', 'property_id']
    ordering = ['-expense_date']

