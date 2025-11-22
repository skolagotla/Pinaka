"""
RBAC (Role-Based Access Control) Domain Models
Admin, Roles, Permissions
"""
from django.db import models
from django.core.validators import EmailValidator


class Admin(models.Model):
    """Admin/Platform User entity"""
    
    # Primary identification
    email = models.EmailField(unique=True, validators=[EmailValidator()])
    google_id = models.CharField(max_length=255, unique=True, blank=True, null=True)
    
    # Personal information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True, null=True)
    
    # Role
    role = models.CharField(
        max_length=30,
        choices=[
            ('PLATFORM_ADMIN', 'Platform Admin'),
            ('SUPPORT', 'Support'),
            ('VIEWER', 'Viewer'),
        ],
        default='PLATFORM_ADMIN'
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    is_locked = models.BooleanField(default=False)
    
    # Security settings
    allowed_google_domains = models.JSONField(
        default=list,
        blank=True,
        help_text="Allowed Google email domains (e.g., ['@gmail.com'])"
    )
    ip_whitelist = models.JSONField(
        default=list,
        blank=True,
        help_text="Allowed IP addresses"
    )
    require_ip_whitelist = models.BooleanField(default=False)
    
    # Tracking
    last_login_at = models.DateTimeField(blank=True, null=True)
    last_login_ip = models.CharField(max_length=45, blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'admins'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
            models.Index(fields=['is_active']),
        ]
        verbose_name = 'Admin'
        verbose_name_plural = 'Admins'
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    @property
    def full_name(self):
        """Get admin's full name"""
        return f"{self.first_name} {self.last_name}"


class Role(models.Model):
    """Role definition for RBAC"""
    
    # Role identification
    name = models.CharField(max_length=50, unique=True)
    display_name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_system = models.BooleanField(default=False)  # System roles cannot be deleted
    
    # Custom role tracking
    created_by = models.CharField(max_length=100, blank=True, null=True)  # Admin ID
    created_by_pmc_id = models.CharField(max_length=100, blank=True, null=True)  # PMC ID
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'roles'
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['is_active']),
            models.Index(fields=['created_by_pmc_id']),
        ]
        verbose_name = 'Role'
        verbose_name_plural = 'Roles'
    
    def __str__(self):
        return self.display_name


class Permission(models.Model):
    """Permission definition"""
    
    # Permission identification
    category = models.CharField(
        max_length=50,
        choices=[
            ('PROPERTY', 'Property'),
            ('TENANT', 'Tenant'),
            ('LEASE', 'Lease'),
            ('PAYMENT', 'Payment'),
            ('MAINTENANCE', 'Maintenance'),
            ('LANDLORD', 'Landlord'),
            ('PMC', 'Property Management Company'),
            ('ADMIN', 'Admin'),
            ('SETTINGS', 'Settings'),
        ]
    )
    resource = models.CharField(max_length=100)  # Specific resource within category
    action = models.CharField(
        max_length=20,
        choices=[
            ('READ', 'Read'),
            ('WRITE', 'Write'),
            ('DELETE', 'Delete'),
            ('MANAGE', 'Manage'),
        ]
    )
    
    # Conditions
    conditions = models.JSONField(
        blank=True,
        null=True,
        help_text="Additional conditions (e.g., scope restrictions)"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'permissions'
        unique_together = [['category', 'resource', 'action']]
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['resource']),
            models.Index(fields=['action']),
        ]
        verbose_name = 'Permission'
        verbose_name_plural = 'Permissions'
    
    def __str__(self):
        return f"{self.category}.{self.resource}.{self.action}"


class RolePermission(models.Model):
    """Role-Permission mapping (default permissions for roles)"""
    
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='permissions')
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE, related_name='role_permissions')
    
    # Additional conditions
    conditions = models.JSONField(blank=True, null=True)
    
    class Meta:
        db_table = 'role_permissions'
        unique_together = [['role', 'permission']]
        verbose_name = 'Role Permission'
        verbose_name_plural = 'Role Permissions'
    
    def __str__(self):
        return f"{self.role.display_name} → {self.permission}"


class UserRole(models.Model):
    """User-Role relationship with scopes"""
    
    # User identification
    user_id = models.CharField(max_length=100, db_index=True)
    user_type = models.CharField(
        max_length=20,
        choices=[
            ('ADMIN', 'Admin'),
            ('LANDLORD', 'Landlord'),
            ('TENANT', 'Tenant'),
            ('PMC', 'Property Management Company'),
            ('VENDOR', 'Vendor'),
        ]
    )
    
    # Role
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='user_roles')
    
    # Scope restrictions
    scope = models.JSONField(
        blank=True,
        null=True,
        help_text="Scope restrictions (e.g., specific properties, regions)"
    )
    
    # PMC/Landlord association (for PMC_ADMIN roles)
    pmc_id = models.CharField(max_length=100, blank=True, null=True)
    landlord_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Metadata
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.CharField(max_length=100, blank=True, null=True)  # Admin ID
    
    class Meta:
        db_table = 'user_roles'
        unique_together = [['user_id', 'user_type', 'role']]
        indexes = [
            models.Index(fields=['user_id', 'user_type']),
            models.Index(fields=['role']),
        ]
        verbose_name = 'User Role'
        verbose_name_plural = 'User Roles'
    
    def __str__(self):
        return f"{self.user_type} {self.user_id} → {self.role.display_name}"


class AdminAuditLog(models.Model):
    """Admin action audit log"""
    
    # Admin reference
    admin = models.ForeignKey(
        Admin,
        on_delete=models.SET_NULL,
        related_name='audit_logs',
        null=True,
        blank=True
    )
    
    # Action details
    action = models.CharField(max_length=100)  # 'login', 'logout', 'create_user', etc.
    resource = models.CharField(max_length=100, blank=True, null=True)
    resource_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Target tracking
    target_user_id = models.CharField(max_length=100, blank=True, null=True)
    target_user_role = models.CharField(max_length=50, blank=True, null=True)
    target_entity_type = models.CharField(max_length=50, blank=True, null=True)
    target_entity_id = models.CharField(max_length=100, blank=True, null=True)
    
    # Approval context
    approval_type = models.CharField(max_length=50, blank=True, null=True)
    approval_entity_id = models.CharField(max_length=100, blank=True, null=True)
    
    # State tracking
    before_state = models.JSONField(blank=True, null=True)
    after_state = models.JSONField(blank=True, null=True)
    changed_fields = models.JSONField(default=list, blank=True)
    
    # Additional context
    details = models.JSONField(blank=True, null=True)
    ip_address = models.CharField(max_length=45, blank=True, null=True)
    user_agent = models.CharField(max_length=255, blank=True, null=True)
    success = models.BooleanField(default=True)
    error_message = models.TextField(blank=True, null=True)
    google_email = models.EmailField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'admin_audit_logs'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['admin']),
            models.Index(fields=['action']),
            models.Index(fields=['resource']),
            models.Index(fields=['created_at']),
        ]
        verbose_name = 'Admin Audit Log'
        verbose_name_plural = 'Admin Audit Logs'
    
    def __str__(self):
        return f"{self.action} by {self.admin} at {self.created_at}"

