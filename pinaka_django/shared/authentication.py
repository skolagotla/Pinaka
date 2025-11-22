"""
Custom Authentication Backend
Authenticates users from Admin, Landlord, Tenant, and PMC models
"""
from django.contrib.auth.backends import BaseBackend
from django.contrib.auth.models import User
from django.db import models
from domains.rbac.models import Admin
from domains.landlord.models import Landlord
from domains.tenant.models import Tenant
from domains.pmc.models import PropertyManagementCompany
import os


class DomainModelBackend(BaseBackend):
    """
    Custom authentication backend that authenticates against
    Admin, Landlord, Tenant, and PMC models
    """
    
    def authenticate(self, request, username=None, password=None, **kwargs):
        if username is None or password is None:
            return None
        
        # Normalize email/username (matching React app logic)
        search_email = username.lower().strip()
        
        # Handle special user ID formats
        import re
        if search_email == 'superadmin':
            search_email = 'superadmin@admin.local'
        elif re.match(r'^pmcadmin[1-5]$', search_email):
            search_email = f'{search_email}@pmc.local'
        elif re.match(r'^pmc[12]-admin$', search_email):
            search_email = f'{search_email}@pmc.local'
        elif re.match(r'^pmc1-lld([1-9]|10)$', search_email):
            search_email = f'{search_email}@pmc.local'
        
        # Check Admin (including PMC Admins)
        try:
            admin = Admin.objects.get(email=search_email)
            
            # Check if active
            if not admin.is_active:
                return None
            
            # Check if locked
            if admin.is_locked:
                return None
            
            # Check if this is a PMC Admin (has PMC_ADMIN role)
            from domains.rbac.models import UserRole, Role
            pmc_admin_role = None
            try:
                pmc_role = Role.objects.get(name='PMC_ADMIN')
                # UserRole.user_id stores the Admin's ID as a string
                # Try both string ID and email formats
                pmc_admin_role = UserRole.objects.filter(
                    user_type='ADMIN',
                    role=pmc_role,
                    is_active=True
                ).filter(
                    models.Q(user_id=str(admin.id)) | models.Q(user_id=admin.email)
                ).first()
            except Role.DoesNotExist:
                pass
            except Exception as e:
                import logging
                logging.getLogger(__name__).debug(f"Error checking PMC_ADMIN role: {e}")
                pass
            
            # Check password (matching React app logic)
            password_match = False
            if admin.email == 'superadmin@admin.local':
                password_match = password == 'superadmin'
            elif (admin.email.startswith('pmcadmin') or 
                  admin.email.startswith('pmc1-admin') or 
                  admin.email.startswith('pmc2-admin')) and admin.email.endswith('@pmc.local'):
                password_match = password == 'pmcadmin'
            elif pmc_admin_role:
                # PMC Admin uses pmcadmin password
                password_match = password == 'pmcadmin'
            else:
                default_password = os.getenv('ADMIN_DEFAULT_PASSWORD', 'admin123')
                password_match = password == default_password
            
            if password_match:
                # Create or get Django User for this admin
                django_user, _ = User.objects.get_or_create(
                    username=admin.email,
                    defaults={
                        'email': admin.email,
                        'first_name': admin.first_name,
                        'last_name': admin.last_name,
                        'is_staff': True,
                        'is_superuser': admin.role == 'PLATFORM_ADMIN',
                    }
                )
                django_user.admin_profile = admin  # Attach admin profile
                
                # Get all RBAC roles for this admin
                from domains.rbac.models import UserRole
                admin_roles = UserRole.objects.filter(
                    user_id=str(admin.id),
                    user_type='ADMIN',
                    is_active=True
                ).select_related('role')
                
                # Check for SUPER_ADMIN role
                has_super_admin = any(ur.role.name == 'SUPER_ADMIN' for ur in admin_roles)
                
                # Set user type based on role (matching React app logic)
                if pmc_admin_role:
                    django_user.user_type = 'pmc'
                    django_user.user_role = 'pmc'
                    django_user.pmc_id = pmc_admin_role.pmc_id or (pmc_admin_role.scope.get('pmcId') if pmc_admin_role.scope else None)
                elif has_super_admin:
                    django_user.user_type = 'admin'
                    django_user.user_role = 'admin'
                else:
                    django_user.user_type = 'admin'
                    django_user.user_role = admin.role.lower() if admin.role else 'admin'
                
                # Attach RBAC roles
                django_user.rbac_roles = [ur.role.name for ur in admin_roles]
                
                return django_user
        except Admin.DoesNotExist:
            pass
        
        # Check Landlord
        try:
            landlord = Landlord.objects.get(email=search_email)
            
            # Check if approved
            if landlord.approval_status != 'APPROVED':
                return None
            
            # Check password (matching React app logic)
            password_match = False
            # Special case: pmc1-lld1 through pmc1-lld10 use password "testlld"
            if re.match(r'^pmc1-lld([1-9]|10)@pmc\.local$', search_email):
                password_match = password == 'testlld'
            else:
                default_password = os.getenv('USER_DEFAULT_PASSWORD', 'password123')
                password_match = password == default_password
            
            if password_match:
                # Create or get Django User for this landlord
                django_user, _ = User.objects.get_or_create(
                    username=landlord.email,
                    defaults={
                        'email': landlord.email,
                        'first_name': landlord.first_name,
                        'last_name': landlord.last_name,
                        'is_staff': False,
                        'is_superuser': False,
                    }
                )
                django_user.landlord_profile = landlord  # Attach landlord profile
                django_user.user_type = 'landlord'
                django_user.user_role = 'landlord'
                
                # Get RBAC roles for landlord
                from domains.rbac.models import UserRole
                landlord_roles = UserRole.objects.filter(
                    user_id=str(landlord.id),
                    user_type='LANDLORD',
                    is_active=True
                ).select_related('role')
                django_user.rbac_roles = [ur.role.name for ur in landlord_roles]
                
                return django_user
        except Landlord.DoesNotExist:
            pass
        
        # Check Tenant
        try:
            tenant = Tenant.objects.get(email=search_email)
            
            # Check if active
            if tenant.status != 'ACTIVE':
                return None
            
            # Check password (default password for tenants)
            default_password = os.getenv('USER_DEFAULT_PASSWORD', 'password123')
            if password == default_password:
                # Create or get Django User for this tenant
                django_user, _ = User.objects.get_or_create(
                    username=tenant.email,
                    defaults={
                        'email': tenant.email,
                        'first_name': tenant.first_name,
                        'last_name': tenant.last_name,
                        'is_staff': False,
                        'is_superuser': False,
                    }
                )
                django_user.tenant_profile = tenant  # Attach tenant profile
                django_user.user_type = 'tenant'
                django_user.user_role = 'tenant'
                return django_user
        except Tenant.DoesNotExist:
            pass
        
        # Check PMC
        try:
            pmc = PropertyManagementCompany.objects.get(email=search_email)
            
            # Check if approved
            if pmc.approval_status != 'APPROVED':
                return None
            
            # Check password (default password for PMCs)
            default_password = os.getenv('USER_DEFAULT_PASSWORD', 'password123')
            if password == default_password:
                # Create or get Django User for this PMC
                django_user, _ = User.objects.get_or_create(
                    username=pmc.email,
                    defaults={
                        'email': pmc.email,
                        'first_name': pmc.company_name or '',
                        'last_name': '',
                        'is_staff': False,
                        'is_superuser': False,
                    }
                )
                django_user.pmc_profile = pmc  # Attach PMC profile
                django_user.user_type = 'pmc'
                django_user.user_role = 'pmc'
                return django_user
        except PropertyManagementCompany.DoesNotExist:
            pass
        
        return None
    
    def get_user(self, user_id):
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

