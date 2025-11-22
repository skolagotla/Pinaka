"""
Django management command to initialize RBAC system
"""
from django.core.management.base import BaseCommand
from shared.rbac.management import initialize_rbac_system
from shared.rbac.assign_roles import assign_default_roles


class Command(BaseCommand):
    help = 'Initialize RBAC system with roles, permissions, and assign default roles to users'

    def handle(self, *args, **options):
        self.stdout.write('Initializing RBAC system...')
        
        # Initialize roles and permissions
        result = initialize_rbac_system()
        self.stdout.write(
            self.style.SUCCESS(
                f'✓ Roles initialized: {result["roles_created"]} created, '
                f'{result["roles_updated"]} updated'
            )
        )
        self.stdout.write(
            self.style.SUCCESS(
                f'✓ Permissions initialized: {result["permissions_assigned"]} permissions assigned'
            )
        )
        
        # Assign default roles to users
        self.stdout.write('Assigning default roles to users...')
        assign_default_roles()
        self.stdout.write(self.style.SUCCESS('✓ Default roles assigned'))
        
        self.stdout.write(self.style.SUCCESS('\nRBAC system initialized successfully!'))

