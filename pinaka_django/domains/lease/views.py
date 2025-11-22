"""Lease Domain API Views"""
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import Lease, LeaseTenant
from .serializers import LeaseSerializer, LeaseTenantSerializer

class LeaseViewSet(viewsets.ModelViewSet):
    # OPTIMIZED: Add prefetch_related for lease tenants
    queryset = Lease.objects.select_related('unit', 'unit__property').prefetch_related('lease_tenants', 'lease_tenants__tenant')
    serializer_class = LeaseSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'unit']
    search_fields = ['lease_id']
    ordering = ['-lease_start']

class LeaseTenantViewSet(viewsets.ModelViewSet):
    queryset = LeaseTenant.objects.all().select_related('lease', 'tenant')
    serializer_class = LeaseTenantSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['lease', 'tenant', 'is_primary_tenant']
