"""
LTB Document Domain Models
Ontario Landlord and Tenant Board forms
"""
from django.db import models


class LTBDocument(models.Model):
    """LTB Form Document - Ontario Landlord and Tenant Board forms"""
    
    # Form identification
    form_number = models.CharField(max_length=20, unique=True, db_index=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    
    # Categorization
    category = models.CharField(
        max_length=50,
        choices=[
            ('Rent', 'Rent'),
            ('Eviction', 'Eviction'),
            ('Application', 'Application'),
            ('Agreement', 'Agreement'),
            ('Notice Response', 'Notice Response'),
            ('Tenant Rights', 'Tenant Rights'),
            ('Maintenance', 'Maintenance'),
            ('Other', 'Other'),
        ],
        db_index=True
    )
    audience = models.CharField(
        max_length=20,
        choices=[
            ('landlord', 'Landlord'),
            ('tenant', 'Tenant'),
            ('both', 'Both'),
        ],
        default='both',
        db_index=True
    )
    
    # URLs
    pdf_url = models.URLField(max_length=500, help_text="Direct PDF URL from LTB website")
    instruction_url = models.URLField(max_length=500, blank=True, null=True, help_text="Instructions URL")
    
    # Region
    country = models.CharField(max_length=2, default='CA', db_index=True)
    province = models.CharField(max_length=10, default='ON', db_index=True)
    
    # Metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'ltb_documents'
        ordering = ['form_number']
        indexes = [
            models.Index(fields=['country', 'province']),
            models.Index(fields=['category']),
            models.Index(fields=['audience']),
        ]
        verbose_name = 'LTB Document'
        verbose_name_plural = 'LTB Documents'
    
    def __str__(self):
        return f"{self.form_number} - {self.name}"

