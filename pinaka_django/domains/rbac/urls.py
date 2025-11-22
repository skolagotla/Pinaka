"""RBAC Domain API URLs"""
from rest_framework.routers import DefaultRouter
from .views import AdminViewSet, RoleViewSet, PermissionViewSet, UserRoleViewSet

router = DefaultRouter()
router.register(r'admins', AdminViewSet, basename='admin')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'permissions', PermissionViewSet, basename='permission')
router.register(r'user-roles', UserRoleViewSet, basename='user-role')
urlpatterns = router.urls

