"""
Property Domain API Views
RESTful API endpoints with full CRUD operations
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q, Count

from domains.property.models import Property, Unit
from .serializers import (
    PropertyListSerializer,
    PropertyDetailSerializer,
    PropertyCreateSerializer,
    PropertyUpdateSerializer,
    UnitSerializer,
    UnitCreateSerializer,
)


class PropertyViewSet(viewsets.ModelViewSet):
    """
    Property API ViewSet
    
    Provides:
    - list: GET /api/v1/properties/
    - create: POST /api/v1/properties/
    - retrieve: GET /api/v1/properties/{id}/
    - update: PUT /api/v1/properties/{id}/
    - partial_update: PATCH /api/v1/properties/{id}/
    - destroy: DELETE /api/v1/properties/{id}/
    
    Custom actions:
    - add_unit: POST /api/v1/properties/{id}/add_unit/
    - stats: GET /api/v1/properties/{id}/stats/
    """
    queryset = Property.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Optionally filter properties
        - by city: ?city=Toronto
        - by status: ?status=ACTIVE
        - by type: ?property_type=RESIDENTIAL
        - search: ?search=main street
        """
        queryset = Property.objects.all()
        
        # Filter by city
        city = self.request.query_params.get('city')
        if city:
            queryset = queryset.filter(city__icontains=city)
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Filter by type
        property_type = self.request.query_params.get('property_type')
        if property_type:
            queryset = queryset.filter(property_type=property_type)
        
        # Search
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(property_name__icontains=search) |
                Q(address_line1__icontains=search) |
                Q(city__icontains=search)
            )
        
        # Prefetch related units for efficiency
        queryset = queryset.prefetch_related('units')
        
        return queryset
    
    def get_serializer_class(self):
        """
        Use different serializers for different actions
        """
        if self.action == 'list':
            return PropertyListSerializer
        elif self.action == 'create':
            return PropertyCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return PropertyUpdateSerializer
        return PropertyDetailSerializer
    
    @action(detail=True, methods=['post'])
    def add_unit(self, request, pk=None):
        """
        Custom endpoint to add a unit to a property
        POST /api/v1/properties/{id}/add_unit/
        """
        property_obj = self.get_object()
        serializer = UnitCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            unit = serializer.save(property=property_obj)
            return Response(
                UnitSerializer(unit).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """
        Get property statistics
        GET /api/v1/properties/{id}/stats/
        """
        property_obj = self.get_object()
        
        # Calculate statistics
        units = property_obj.units.all()
        total_units = units.count()
        occupied_units = units.filter(status='OCCUPIED').count()
        vacant_units = units.filter(status='VACANT').count()
        
        stats = {
            'property_id': property_obj.id,
            'property_name': property_obj.property_name,
            'total_units': total_units,
            'occupied_units': occupied_units,
            'vacant_units': vacant_units,
            'occupancy_rate': (occupied_units / total_units * 100) if total_units > 0 else 0,
            'total_rent_potential': sum(unit.rent_price for unit in units),
        }
        
        return Response(stats)


class UnitViewSet(viewsets.ModelViewSet):
    """
    Unit API ViewSet
    
    Provides full CRUD operations for units
    """
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter units by property or status
        - by property: ?property_id=xxx
        - by status: ?status=VACANT
        """
        queryset = Unit.objects.select_related('property')
        
        # Filter by property
        property_id = self.request.query_params.get('property_id')
        if property_id:
            queryset = queryset.filter(property_id=property_id)
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        return queryset
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'create':
            return UnitCreateSerializer
        return UnitSerializer

