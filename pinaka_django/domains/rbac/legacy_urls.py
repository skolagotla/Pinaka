"""
RBAC Legacy API URLs - /api/rbac/ routes for React app compatibility
"""
from django.urls import path
from rest_framework.routers import DefaultRouter
from .views import RoleViewSet, UserRoleViewSet

# Create router for standard REST endpoints
router = DefaultRouter()
router.register(r'roles', RoleViewSet, basename='rbac-role')
router.register(r'user-roles', UserRoleViewSet, basename='rbac-user-role')

# Custom endpoints that match React app routes
urlpatterns = router.urls + [
    # Role by name lookup (custom action)
    path('roles/by-name/<str:role_name>/', RoleViewSet.as_view({'get': 'get_by_name'}), name='rbac-role-by-name'),
    path('roles/by-name/<str:role_name>/permissions/', RoleViewSet.as_view({'get': 'get_permissions_by_name'}), name='rbac-role-permissions-by-name'),
    
    # User role endpoints (custom actions)
    path('users/<str:user_id>/roles/', UserRoleViewSet.as_view({'get': 'get_user_roles'}), name='rbac-user-roles'),
    path('users/<str:user_id>/roles/<str:role_id>/assign/', UserRoleViewSet.as_view({'post': 'assign_role_to_user'}), name='rbac-user-role-assign'),
    path('users/<str:user_id>/permissions/', UserRoleViewSet.as_view({'get': 'get_user_permissions'}), name='rbac-user-permissions'),
]

