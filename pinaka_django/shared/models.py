"""
Shared Models for Platform-wide functionality
"""
from django.db import models
from django.core.cache import cache
from django.utils import timezone


class BaseModel(models.Model):
    """Base model with common fields"""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


class SoftDeleteModel(BaseModel):
    """Base model with soft delete functionality"""
    deleted_at = models.DateTimeField(null=True, blank=True)
    is_deleted = models.BooleanField(default=False)
    
    class Meta:
        abstract = True
    
    def soft_delete(self):
        """Soft delete the object"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        """Restore a soft-deleted object"""
        self.is_deleted = False
        self.deleted_at = None
        self.save()


class PlatformSettings(models.Model):
    """Platform-wide settings - single row configuration"""
    
    # ID field - matches existing schema (text type)
    id = models.CharField(max_length=50, primary_key=True, default='1')
    
    # Store all settings as JSON fields to match existing schema
    maintenance_mode = models.BooleanField(default=False, db_column='maintenanceMode')
    feature_flags = models.JSONField(default=dict, blank=True, db_column='featureFlags')
    email = models.JSONField(default=dict, blank=True)
    notifications = models.JSONField(default=dict, blank=True)
    stripe = models.JSONField(default=dict, blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, db_column='createdAt', null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True, db_column='updatedAt')
    
    class Meta:
        db_table = 'platform_settings'
        verbose_name = 'Platform Settings'
        verbose_name_plural = 'Platform Settings'
    
    def __str__(self):
        return 'Platform Settings'
    
    @classmethod
    def get_settings(cls):
        """Get or create platform settings (singleton pattern)"""
        settings, created = cls.objects.get_or_create(pk='1')
        return settings
    
    def to_dict(self):
        """Convert settings to dictionary format"""
        # Get defaults if JSON fields are empty
        feature_flags = self.feature_flags if self.feature_flags else {
            'tenantInvitations': True,
            'documentVault': True,
            'maintenanceRequests': True,
            'rentPayments': True,
        }
        email = self.email if self.email else {
            'enabled': True,
            'provider': 'gmail',
        }
        notifications = self.notifications if self.notifications else {
            'enabled': True,
            'channels': ['email'],
        }
        
        return {
            'maintenanceMode': self.maintenance_mode,
            'featureFlags': feature_flags,
            'email': email,
            'notifications': notifications,
        }
    
    def update_from_dict(self, data, updated_by=None):
        """Update settings from dictionary"""
        if 'maintenanceMode' in data:
            self.maintenance_mode = bool(data['maintenanceMode'])
        
        if 'featureFlags' in data:
            self.feature_flags = dict(data['featureFlags'])
        
        if 'email' in data:
            self.email = dict(data['email'])
        
        if 'notifications' in data:
            self.notifications = dict(data['notifications'])
        
        self.save()
        # Clear cache
        cache.delete('platform_settings')
        return self
