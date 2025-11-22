"""
Organization Domain Models (SaaS Multi-Tenancy)
"""
from django.db import models


class Organization(models.Model):
    """Organization entity for SaaS multi-tenancy"""
    
    # Primary identification
    name = models.CharField(max_length=255)
    subdomain = models.CharField(max_length=100, unique=True, blank=True, null=True)
    
    # Plan & Status
    plan = models.CharField(
        max_length=20,
        choices=[
            ('FREE', 'Free'),
            ('BASIC', 'Basic'),
            ('PRO', 'Pro'),
            ('ENTERPRISE', 'Enterprise'),
        ],
        default='FREE'
    )
    status = models.CharField(
        max_length=20,
        choices=[
            ('ACTIVE', 'Active'),
            ('SUSPENDED', 'Suspended'),
            ('CANCELLED', 'Cancelled'),
            ('TRIAL', 'Trial'),
        ],
        default='ACTIVE'
    )
    
    # Subscription details
    subscription_id = models.CharField(max_length=255, blank=True, null=True)
    subscription_status = models.CharField(max_length=50, blank=True, null=True)
    current_period_start = models.DateTimeField(blank=True, null=True)
    current_period_end = models.DateTimeField(blank=True, null=True)
    cancel_at_period_end = models.BooleanField(default=False)
    
    # Usage limits (null = unlimited for enterprise)
    max_properties = models.IntegerField(blank=True, null=True)
    max_tenants = models.IntegerField(blank=True, null=True)
    max_users = models.IntegerField(blank=True, null=True)
    max_storage_gb = models.IntegerField(blank=True, null=True)
    max_api_calls_per_month = models.IntegerField(blank=True, null=True)
    
    # Billing
    billing_email = models.EmailField(blank=True, null=True)
    billing_address = models.CharField(max_length=255, blank=True, null=True)
    billing_city = models.CharField(max_length=100, blank=True, null=True)
    billing_state = models.CharField(max_length=100, blank=True, null=True)
    billing_postal_code = models.CharField(max_length=20, blank=True, null=True)
    billing_country = models.CharField(max_length=100, blank=True, null=True)
    
    # Metadata
    trial_ends_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'organizations'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['subdomain']),
            models.Index(fields=['status']),
            models.Index(fields=['plan']),
            models.Index(fields=['subscription_status']),
        ]
        verbose_name = 'Organization'
        verbose_name_plural = 'Organizations'
    
    def __str__(self):
        return f"{self.name} ({self.subdomain or 'no-subdomain'})"


class OrganizationSettings(models.Model):
    """Organization settings and branding"""
    
    organization = models.OneToOneField(
        Organization,
        on_delete=models.CASCADE,
        related_name='settings'
    )
    
    # Branding
    logo_url = models.URLField(max_length=500, blank=True, null=True)
    primary_color = models.CharField(max_length=7, default='#1890ff')
    secondary_color = models.CharField(max_length=7, default='#52c41a')
    company_name = models.CharField(max_length=255, blank=True, null=True)
    
    # Features
    features = models.JSONField(blank=True, null=True)  # Feature flags
    
    # Integrations
    integrations = models.JSONField(blank=True, null=True)  # Integration settings
    
    # Notifications
    email_notifications = models.BooleanField(default=True)
    sms_notifications = models.BooleanField(default=False)
    
    # Customization
    custom_domain = models.CharField(max_length=255, unique=True, blank=True, null=True)
    custom_css = models.TextField(blank=True, null=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'organization_settings'
        verbose_name = 'Organization Settings'
        verbose_name_plural = 'Organization Settings'

