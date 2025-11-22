"""
Assign Default Roles to Existing Users
Based on React app logic
"""
from domains.rbac.models import Role, UserRole, Admin
from domains.landlord.models import Landlord
from domains.tenant.models import Tenant
from domains.pmc.models import PropertyManagementCompany
from shared.rbac.management import assign_role_to_user
import logging

logger = logging.getLogger(__name__)


def assign_default_roles():
    """Assign default roles to existing users based on React app logic"""
    
    # 1. Assign SUPER_ADMIN to superadmin@admin.local
    try:
        admin = Admin.objects.get(email='superadmin@admin.local')
        assign_role_to_user(
            user_id=str(admin.pk),
            user_type='ADMIN',
            role_name='SUPER_ADMIN',
            assigned_by=None
        )
        logger.info(f"Assigned SUPER_ADMIN to {admin.email}")
    except Admin.DoesNotExist:
        logger.warning("superadmin@admin.local not found")
    
    # 2. Assign PLATFORM_ADMIN to other admin users
    admins = Admin.objects.exclude(email='superadmin@admin.local')
    for admin in admins:
        # Check if already has a role
        existing_roles = UserRole.objects.filter(
            user_id=str(admin.pk),
            user_type='ADMIN'
        )
        
        if not existing_roles.exists():
            # Assign PLATFORM_ADMIN by default
            assign_role_to_user(
                user_id=str(admin.pk),
                user_type='ADMIN',
                role_name='PLATFORM_ADMIN',
                assigned_by=None
            )
            logger.info(f"Assigned PLATFORM_ADMIN to {admin.email}")
    
    # 3. Assign PMC_ADMIN to PMC admin users (pmc1-admin@pmc.local, pmc2-admin@pmc.local, etc.)
    pmc_admin_emails = [
        'pmc1-admin@pmc.local',
        'pmc2-admin@pmc.local',
        'pmcadmin1@pmc.local',
        'pmcadmin2@pmc.local',
        'pmcadmin3@pmc.local',
        'pmcadmin4@pmc.local',
        'pmcadmin5@pmc.local',
    ]
    
    for email in pmc_admin_emails:
        try:
            admin = Admin.objects.get(email=email)
            # Check if already has PMC_ADMIN role
            existing_pmc_role = UserRole.objects.filter(
                user_id=str(admin.pk),
                user_type='ADMIN',
                role__name='PMC_ADMIN',
                is_active=True
            ).first()
            
            if not existing_pmc_role:
                # Find associated PMC
                pmc = None
                if 'pmc1' in email.lower():
                    pmc = PropertyManagementCompany.objects.filter(
                        company_name__icontains='PMC 1'
                    ).first()
                    if not pmc:
                        pmc = PropertyManagementCompany.objects.filter(
                            company_name__icontains='AB Homes'
                        ).first()
                elif 'pmc2' in email.lower():
                    pmc = PropertyManagementCompany.objects.filter(
                        company_name__icontains='PMC 2'
                    ).first()
                
                scope = {}
                if pmc:
                    scope = {'pmc_id': str(pmc.pk), 'pmcId': str(pmc.pk)}
                
                user_role = assign_role_to_user(
                    user_id=str(admin.pk),
                    user_type='ADMIN',
                    role_name='PMC_ADMIN',
                    assigned_by=None,
                    scope=scope
                )
                
                # Set pmc_id on UserRole if PMC found
                if pmc:
                    user_role.pmc_id = str(pmc.pk)
                    user_role.save()
                
                logger.info(f"Assigned PMC_ADMIN to {admin.email} with scope {scope}")
            else:
                # Update existing role with PMC association if missing
                if not existing_pmc_role.pmc_id:
                    pmc = None
                    if 'pmc1' in email.lower():
                        pmc = PropertyManagementCompany.objects.filter(
                            company_name__icontains='PMC 1'
                        ).first()
                        if not pmc:
                            pmc = PropertyManagementCompany.objects.filter(
                                company_name__icontains='AB Homes'
                            ).first()
                    elif 'pmc2' in email.lower():
                        pmc = PropertyManagementCompany.objects.filter(
                            company_name__icontains='PMC 2'
                        ).first()
                    
                    if pmc:
                        existing_pmc_role.pmc_id = str(pmc.pk)
                        if not existing_pmc_role.scope:
                            existing_pmc_role.scope = {}
                        existing_pmc_role.scope['pmc_id'] = str(pmc.pk)
                        existing_pmc_role.scope['pmcId'] = str(pmc.pk)
                        existing_pmc_role.save()
                        logger.info(f"Updated PMC_ADMIN role for {admin.email} with PMC {pmc.pk}")
        except Admin.DoesNotExist:
            logger.debug(f"PMC admin {email} not found")
        except Exception as e:
            logger.error(f"Error assigning PMC_ADMIN to {email}: {e}")
    
    # 4. Assign OWNER_LANDLORD to all landlords
    landlords = Landlord.objects.all()
    for landlord in landlords:
        existing_roles = UserRole.objects.filter(
            user_id=str(landlord.pk),
            user_type='LANDLORD',
            is_active=True
        )
        
        if not existing_roles.exists():
            user_role = assign_role_to_user(
                user_id=str(landlord.pk),
                user_type='LANDLORD',
                role_name='OWNER_LANDLORD',
                assigned_by=None,
                scope={'landlord_id': str(landlord.pk)}
            )
            user_role.landlord_id = str(landlord.pk)
            user_role.save()
            logger.info(f"Assigned OWNER_LANDLORD to {landlord.email}")
    
    # 5. Assign TENANT to all tenants
    tenants = Tenant.objects.all()
    for tenant in tenants:
        existing_roles = UserRole.objects.filter(
            user_id=str(tenant.pk),
            user_type='TENANT',
            is_active=True
        )
        
        if not existing_roles.exists():
            assign_role_to_user(
                user_id=str(tenant.pk),
                user_type='TENANT',
                role_name='TENANT',
                assigned_by=None,
                scope={'tenant_id': str(tenant.pk)}
            )
            logger.info(f"Assigned TENANT to {tenant.email}")
    
    # 6. Ensure all admins have at least one role
    all_admins = Admin.objects.all()
    for admin in all_admins:
        existing_roles = UserRole.objects.filter(
            user_id=str(admin.pk),
            user_type='ADMIN',
            is_active=True
        )
        
        if not existing_roles.exists():
            # Default to PLATFORM_ADMIN if no role assigned
            assign_role_to_user(
                user_id=str(admin.pk),
                user_type='ADMIN',
                role_name='PLATFORM_ADMIN',
                assigned_by=None
            )
            logger.info(f"Assigned default PLATFORM_ADMIN to {admin.email}")
    
    logger.info("Default role assignment completed")


if __name__ == '__main__':
    assign_default_roles()

