"""
Property Domain API Views
"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Property, Unit
from .serializers import (
    PropertySerializer,
    PropertyListSerializer,
    UnitSerializer,
    UnitListSerializer
)


class PropertyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Property CRUD operations
    
    list: Get all properties
    retrieve: Get single property
    create: Create new property
    update: Update property
    partial_update: Partially update property
    destroy: Delete property
    """
    queryset = Property.objects.all().prefetch_related('units')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'property_type', 'city', 'province_state']
    search_fields = ['property_name', 'address_line1', 'city', 'postal_zip']
    ordering_fields = ['property_name', 'created_at', 'city']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Use lightweight serializer for list view"""
        if self.action == 'list':
            return PropertyListSerializer
        return PropertySerializer
    
    @action(detail=True, methods=['get'])
    def units(self, request, pk=None):
        """Get all units for a property"""
        property_obj = self.get_object()
        units = property_obj.units.all()
        serializer = UnitListSerializer(units, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get property statistics"""
        stats = {
            'total_properties': Property.objects.count(),
            'total_units': Unit.objects.count(),
            'by_status': {},
            'by_type': {},
        }
        
        # Properties by status
        for status_choice in Property._meta.get_field('status').choices:
            status_value = status_choice[0]
            count = Property.objects.filter(status=status_value).count()
            stats['by_status'][status_value] = count
        
        # Properties by type
        for type_choice in Property._meta.get_field('property_type').choices:
            type_value = type_choice[0]
            count = Property.objects.filter(property_type=type_value).count()
            stats['by_type'][type_value] = count
        
        return Response(stats)


class UnitViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Unit CRUD operations
    
    list: Get all units
    retrieve: Get single unit
    create: Create new unit
    update: Update unit
    partial_update: Partially update unit
    destroy: Delete unit
    """
    queryset = Unit.objects.all().select_related('property')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'property', 'bedrooms', 'bathrooms']
    search_fields = ['unit_number', 'property__property_name']
    ordering_fields = ['rent_amount', 'created_at', 'bedrooms']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        """Use lightweight serializer for list view"""
        if self.action == 'list':
            return UnitListSerializer
        return UnitSerializer
    
    @action(detail=False, methods=['get'])
    def available(self, request):
        """Get all available units"""
        available_units = Unit.objects.filter(status='AVAILABLE').select_related('property')
        serializer = UnitListSerializer(available_units, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get unit statistics"""
        stats = {
            'total_units': Unit.objects.count(),
            'available_units': Unit.objects.filter(status='AVAILABLE').count(),
            'occupied_units': Unit.objects.filter(status='OCCUPIED').count(),
            'by_bedrooms': {},
        }
        
        # Units by bedroom count
        for i in range(6):  # 0-5 bedrooms
            count = Unit.objects.filter(bedrooms=i).count()
            stats['by_bedrooms'][i] = count
        
        return Response(stats)
