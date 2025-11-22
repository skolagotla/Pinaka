"""Service Providers Domain API Views"""
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import ServiceProvider, ServiceProviderRating
from .serializers import (
    ServiceProviderSerializer,
    ServiceProviderListSerializer,
    ServiceProviderRatingSerializer
)


class ServiceProviderViewSet(viewsets.ModelViewSet):
    queryset = ServiceProvider.objects.prefetch_related('ratings').all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'provider_type',
        'is_active',
        'is_verified',
        'approval_status',
        'country_code',
    ]
    search_fields = [
        'company_name',
        'contact_name',
        'email',
        'phone',
        'provider_id',
    ]
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return ServiceProviderListSerializer
        return ServiceProviderSerializer


class ServiceProviderRatingViewSet(viewsets.ModelViewSet):
    queryset = ServiceProviderRating.objects.select_related('service_provider').all()
    serializer_class = ServiceProviderRatingSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = [
        'service_provider',
        'rated_by_type',
        'is_public',
    ]
    ordering = ['-created_at']

