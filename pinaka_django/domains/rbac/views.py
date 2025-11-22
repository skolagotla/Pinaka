"""RBAC Domain API Views"""
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from .models import Admin, Role, Permission, UserRole, RolePermission
from .serializers import AdminSerializer, RoleSerializer, PermissionSerializer, UserRoleSerializer
from shared.rbac.permissions import get_user_roles, get_user_permissions, has_permission

class AdminViewSet(viewsets.ModelViewSet):
    queryset = Admin.objects.all()
    serializer_class = AdminSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['role', 'is_active', 'is_locked']
    search_fields = ['email', 'first_name', 'last_name']
    ordering = ['-created_at']

class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    serializer_class = RoleSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['is_active', 'is_system']
    search_fields = ['name', 'display_name']
    ordering = ['name']
    
    @action(detail=True, methods=['get'], url_path='permissions')
    def get_permissions(self, request, pk=None):
        """Get all permissions for a role"""
        try:
            role = self.get_object()
            role_permissions = RolePermission.objects.filter(role=role).select_related('permission')
            permissions = [rp.permission for rp in role_permissions]
            serializer = PermissionSerializer(permissions, many=True)
            return Response({
                'success': True,
                'data': serializer.data
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'], url_path='permissions')
    def assign_permission(self, request, pk=None):
        """Assign permission to role"""
        try:
            role = self.get_object()
            permission_id = request.data.get('permission_id')
            
            if not permission_id:
                return Response({
                    'success': False,
                    'error': 'permission_id is required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            permission = Permission.objects.get(id=permission_id)
            RolePermission.objects.get_or_create(role=role, permission=permission)
            
            return Response({
                'success': True,
                'message': 'Permission assigned to role successfully'
            })
        except Permission.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Permission not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['delete'], url_path='permissions/(?P<perm_id>[^/.]+)')
    def remove_permission(self, request, pk=None, perm_id=None):
        """Remove permission from role"""
        try:
            role = self.get_object()
            permission = Permission.objects.get(id=perm_id)
            RolePermission.objects.filter(role=role, permission=permission).delete()
            
            return Response({
                'success': True,
                'message': 'Permission removed from role successfully'
            })
        except Permission.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Permission not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'], url_path='by-name/(?P<role_name>[^/]+)')
    def get_by_name(self, request, role_name=None):
        """Get role by name"""
        try:
            role = Role.objects.get(name=role_name, is_active=True)
            serializer = self.get_serializer(role)
            return Response({
                'success': True,
                'data': serializer.data
            })
        except Role.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Role not found'
            }, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=False, methods=['get'], url_path='by-name/(?P<role_name>[^/]+)/permissions')
    def get_permissions_by_name(self, request, role_name=None):
        """Get permissions for role by name"""
        try:
            role = Role.objects.get(name=role_name, is_active=True)
            role_permissions = RolePermission.objects.filter(role=role).select_related('permission')
            permissions = [rp.permission for rp in role_permissions]
            serializer = PermissionSerializer(permissions, many=True)
            return Response({
                'success': True,
                'data': serializer.data
            })
        except Role.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Role not found'
            }, status=status.HTTP_404_NOT_FOUND)

class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['category', 'action']
    search_fields = ['category', 'resource', 'action']

class UserRoleViewSet(viewsets.ModelViewSet):
    queryset = UserRole.objects.all().select_related('role')
    serializer_class = UserRoleSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['user_type', 'role', 'user_id']
    ordering = ['-assigned_at']
    
    def get_queryset(self):
        """Filter by user_id and user_type if provided"""
        queryset = super().get_queryset()
        user_id = self.request.query_params.get('user_id')
        user_type = self.request.query_params.get('user_type')
        
        if user_id:
            queryset = queryset.filter(user_id=str(user_id))
        if user_type:
            queryset = queryset.filter(user_type=user_type.upper())
        
        return queryset
    
    @action(detail=False, methods=['get'], url_path='users/(?P<user_id>[^/]+)/roles')
    def get_user_roles(self, request, user_id=None):
        """Get all roles for a user"""
        try:
            user_type = request.query_params.get('userType') or request.query_params.get('user_type', 'ADMIN')
            user_roles = UserRole.objects.filter(
                user_id=str(user_id),
                user_type=user_type.upper(),
                is_active=True
            ).select_related('role')
            
            roles_data = []
            for user_role in user_roles:
                roles_data.append({
                    'id': str(user_role.id),
                    'role': {
                        'id': str(user_role.role.id),
                        'name': user_role.role.name,
                        'displayName': user_role.role.display_name,
                    },
                    'assignedAt': user_role.assigned_at.isoformat() if user_role.assigned_at else None,
                })
            
            return Response({
                'success': True,
                'data': roles_data
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'], url_path='assign')
    def assign_role(self, request):
        """Assign role to user"""
        try:
            user_id = request.data.get('user_id')
            user_type = request.data.get('user_type', 'ADMIN').upper()
            role_id = request.data.get('role_id')
            
            if not all([user_id, role_id]):
                return Response({
                    'success': False,
                    'error': 'user_id and role_id are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            role = Role.objects.get(id=role_id, is_active=True)
            user_role, created = UserRole.objects.get_or_create(
                user_id=str(user_id),
                user_type=user_type,
                role=role,
                defaults={'is_active': True}
            )
            
            if not created:
                user_role.is_active = True
                user_role.save()
            
            serializer = self.get_serializer(user_role)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Role assigned successfully'
            })
        except Role.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Role not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'], url_path='users/(?P<user_id>[^/]+)/roles/(?P<role_id>[^/]+)/assign')
    def assign_role_to_user(self, request, user_id=None, role_id=None):
        """Assign role to user (alternative endpoint)"""
        try:
            user_type = request.data.get('userType') or request.data.get('user_type', 'ADMIN').upper()
            role = Role.objects.get(id=role_id, is_active=True)
            user_role, created = UserRole.objects.get_or_create(
                user_id=str(user_id),
                user_type=user_type,
                role=role,
                defaults={'is_active': True}
            )
            
            if not created:
                user_role.is_active = True
                user_role.save()
            
            serializer = self.get_serializer(user_role)
            return Response({
                'success': True,
                'data': serializer.data,
                'message': 'Role assigned successfully'
            })
        except Role.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Role not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['post'], url_path='check-permission')
    def check_permission(self, request):
        """Check if user has permission"""
        try:
            user_id = request.data.get('user_id')
            user_type = request.data.get('user_type', 'ADMIN').upper()
            category = request.data.get('category')
            resource = request.data.get('resource')
            action = request.data.get('action')
            
            if not all([user_id, category, resource, action]):
                return Response({
                    'success': False,
                    'error': 'user_id, category, resource, and action are required'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            has_perm = has_permission(user_id, user_type, category, resource, action)
            
            return Response({
                'success': True,
                'data': {
                    'has_permission': has_perm
                }
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'], url_path='users/(?P<user_id>[^/]+)/permissions')
    def get_user_permissions(self, request, user_id=None):
        """Get all permissions for a user"""
        try:
            user_type = request.query_params.get('userType') or request.query_params.get('user_type', 'ADMIN').upper()
            permissions = get_user_permissions(user_id, user_type)
            
            return Response({
                'success': True,
                'data': [
                    {
                        'category': perm[0],
                        'resource': perm[1],
                        'action': perm[2]
                    }
                    for perm in permissions
                ]
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

