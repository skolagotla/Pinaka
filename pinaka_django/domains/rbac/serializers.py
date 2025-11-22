"""RBAC Domain Serializers"""
from rest_framework import serializers
from .models import Admin, Role, Permission, UserRole

class AdminSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    
    class Meta:
        model = Admin
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class RoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Role
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = '__all__'
        read_only_fields = ['id', 'created_at']

class UserRoleSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source='role.display_name', read_only=True)
    
    class Meta:
        model = UserRole
        fields = '__all__'
        read_only_fields = ['id', 'assigned_at']

