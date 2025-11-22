#!/usr/bin/env python3
"""
Comprehensive CRUD and RBAC Migration Checker
Compares React app API endpoints with Django app ViewSets
"""
import os
import re
import json
from pathlib import Path

# Base paths
REACT_APP = Path(__file__).parent.parent / "apps" / "web-app"
DJANGO_APP = Path(__file__).parent

def find_react_api_endpoints():
    """Find all API endpoints in React app"""
    endpoints = {}
    
    # Check for API route files
    api_routes = list(REACT_APP.rglob("**/api/**/*.ts")) + list(REACT_APP.rglob("**/api/**/*.tsx"))
    
    for route_file in api_routes:
        try:
            content = route_file.read_text()
            # Find route handlers
            if "export async function" in content or "export function" in content:
                # Extract route path from file path
                rel_path = route_file.relative_to(REACT_APP)
                route_path = "/" + str(rel_path.parent).replace("\\", "/")
                endpoints[route_path] = {
                    'file': str(rel_path),
                    'methods': extract_methods(content)
                }
        except:
            pass
    
    # Check for v1Api usage in components
    components = list(REACT_APP.rglob("**/*.jsx")) + list(REACT_APP.rglob("**/*.tsx"))
    for component in components:
        try:
            content = component.read_text()
            # Find v1Api calls
            api_calls = re.findall(r'v1Api\.(\w+)\.(list|get|create|update|delete|patch)', content)
            for domain, method in api_calls:
                if domain not in endpoints:
                    endpoints[f"/api/v1/{domain}"] = {'methods': []}
                if method not in endpoints[f"/api/v1/{domain}"]['methods']:
                    endpoints[f"/api/v1/{domain}"]['methods'].append(method.upper())
        except:
            pass
    
    return endpoints

def extract_methods(content):
    """Extract HTTP methods from route handler"""
    methods = []
    if "GET" in content or "export async function GET" in content:
        methods.append("GET")
    if "POST" in content or "export async function POST" in content:
        methods.append("POST")
    if "PUT" in content or "PATCH" in content:
        methods.append("PUT")
    if "DELETE" in content:
        methods.append("DELETE")
    return methods

def find_django_viewsets():
    """Find all Django ViewSets and their CRUD operations"""
    viewsets = {}
    
    domains_dir = DJANGO_APP / "domains"
    if not domains_dir.exists():
        return viewsets
    
    for domain_dir in domains_dir.iterdir():
        if not domain_dir.is_dir() or domain_dir.name.startswith('_'):
            continue
        
        views_file = domain_dir / "views.py"
        urls_file = domain_dir / "urls.py"
        
        if views_file.exists():
            try:
                content = views_file.read_text()
                # Find ViewSet classes
                viewset_matches = re.findall(r'class (\w+ViewSet)', content)
                
                for viewset_name in viewset_matches:
                    # Extract CRUD methods
                    methods = {
                        'list': 'list' in content and f'def list' in content,
                        'create': 'create' in content and f'def create' in content,
                        'retrieve': 'retrieve' in content and f'def retrieve' in content,
                        'update': 'update' in content and f'def update' in content,
                        'partial_update': 'partial_update' in content and f'def partial_update' in content,
                        'destroy': 'destroy' in content and f'def destroy' in content,
                    }
                    
                    # Check for custom actions
                    custom_actions = re.findall(r'@action.*?url_path=[\'"]([^\'"]+)[\'"]', content)
                    
                    domain_name = domain_dir.name
                    if domain_name not in viewsets:
                        viewsets[domain_name] = {}
                    
                    viewsets[domain_name][viewset_name] = {
                        'methods': methods,
                        'custom_actions': custom_actions
                    }
            except Exception as e:
                print(f"Error reading {views_file}: {e}")
    
    return viewsets

def find_rbac_endpoints():
    """Find RBAC-related endpoints in both apps"""
    rbac_react = {}
    rbac_django = {}
    
    # React RBAC endpoints
    react_files = list(REACT_APP.rglob("**/*.jsx")) + list(REACT_APP.rglob("**/*.tsx"))
    for file in react_files:
        try:
            content = file.read_text()
            # Find RBAC API calls
            rbac_calls = re.findall(r'/api/rbac/([^\s\'"]+)', content)
            for endpoint in rbac_calls:
                rbac_react[endpoint] = True
        except:
            pass
    
    # Django RBAC endpoints
    rbac_views = DJANGO_APP / "domains" / "rbac" / "views.py"
    if rbac_views.exists():
        try:
            content = rbac_views.read_text()
            # Find ViewSet classes
            if "class RoleViewSet" in content:
                rbac_django['roles'] = True
            if "class PermissionViewSet" in content:
                rbac_django['permissions'] = True
            if "class UserRoleViewSet" in content:
                rbac_django['user-roles'] = True
        except:
            pass
    
    return rbac_react, rbac_django

def check_crud_operations():
    """Check CRUD operations for each domain"""
    domains = [
        'property', 'tenant', 'lease', 'payment', 'maintenance',
        'landlord', 'pmc', 'document', 'message', 'support',
        'notification', 'verification', 'invitation', 'service_provider',
        'application', 'activity', 'expense', 'rbac'
    ]
    
    crud_status = {}
    
    for domain in domains:
        domain_dir = DJANGO_APP / "domains" / domain
        if not domain_dir.exists():
            crud_status[domain] = {'status': 'missing', 'operations': {}}
            continue
        
        views_file = domain_dir / "views.py"
        if not views_file.exists():
            crud_status[domain] = {'status': 'no_views', 'operations': {}}
            continue
        
        try:
            content = views_file.read_text()
            operations = {
                'list': 'list' in content or 'get_queryset' in content,
                'create': 'create' in content or 'perform_create' in content,
                'retrieve': 'retrieve' in content,
                'update': 'update' in content or 'perform_update' in content,
                'partial_update': 'partial_update' in content,
                'destroy': 'destroy' in content or 'perform_destroy' in content,
            }
            
            # Check if it's a ModelViewSet (has all CRUD)
            is_model_viewset = 'ModelViewSet' in content
            is_readonly = 'ReadOnlyModelViewSet' in content
            
            crud_status[domain] = {
                'status': 'complete' if is_model_viewset else ('readonly' if is_readonly else 'partial'),
                'operations': operations,
                'is_model_viewset': is_model_viewset,
                'is_readonly': is_readonly
            }
        except Exception as e:
            crud_status[domain] = {'status': 'error', 'error': str(e)}
    
    return crud_status

def check_rbac_functionality():
    """Check RBAC functionality completeness"""
    rbac_dir = DJANGO_APP / "domains" / "rbac"
    rbac_status = {
        'models': {},
        'views': {},
        'permissions': {}
    }
    
    # Check models
    models_file = rbac_dir / "models.py"
    if models_file.exists():
        content = models_file.read_text()
        rbac_status['models'] = {
            'Role': 'class Role' in content,
            'Permission': 'class Permission' in content,
            'UserRole': 'class UserRole' in content,
            'RolePermission': 'class RolePermission' in content,
        }
    
    # Check views
    views_file = rbac_dir / "views.py"
    if views_file.exists():
        content = views_file.read_text()
        rbac_status['views'] = {
            'RoleViewSet': 'class RoleViewSet' in content,
            'PermissionViewSet': 'class PermissionViewSet' in content,
            'UserRoleViewSet': 'class UserRoleViewSet' in content,
        }
    
    # Check permissions
    permissions_file = DJANGO_APP / "shared" / "rbac" / "permissions.py"
    if permissions_file.exists():
        content = permissions_file.read_text()
        rbac_status['permissions'] = {
            'has_role': 'def has_role' in content,
            'has_permission': 'def has_permission' in content,
            'check_permission': 'def check_permission' in content,
            'get_user_roles': 'def get_user_roles' in content,
            'get_user_permissions': 'def get_user_permissions' in content,
        }
    
    return rbac_status

def generate_report():
    """Generate comprehensive migration report"""
    print("=" * 80)
    print("COMPREHENSIVE CRUD & RBAC MIGRATION CHECKER")
    print("=" * 80)
    print()
    
    # Check CRUD operations
    print("1. CRUD OPERATIONS CHECK")
    print("-" * 80)
    crud_status = check_crud_operations()
    
    for domain, status in crud_status.items():
        if status.get('status') == 'missing':
            print(f"❌ {domain.upper()}: Missing domain")
        elif status.get('status') == 'no_views':
            print(f"⚠️  {domain.upper()}: No views file")
        elif status.get('status') == 'complete':
            ops = status.get('operations', {})
            missing = [op for op, exists in ops.items() if not exists]
            if missing:
                print(f"⚠️  {domain.upper()}: Missing operations: {', '.join(missing)}")
            else:
                print(f"✅ {domain.upper()}: Complete CRUD")
        elif status.get('status') == 'readonly':
            print(f"📖 {domain.upper()}: Read-only (no create/update/delete)")
        else:
            ops = status.get('operations', {})
            available = [op for op, exists in ops.items() if exists]
            print(f"⚠️  {domain.upper()}: Partial - Available: {', '.join(available)}")
    
    print()
    
    # Check RBAC functionality
    print("2. RBAC FUNCTIONALITY CHECK")
    print("-" * 80)
    rbac_status = check_rbac_functionality()
    
    # Models
    print("\nModels:")
    for model, exists in rbac_status['models'].items():
        print(f"  {'✅' if exists else '❌'} {model}")
    
    # Views
    print("\nViews:")
    for view, exists in rbac_status['views'].items():
        print(f"  {'✅' if exists else '❌'} {view}")
    
    # Permissions
    print("\nPermission Functions:")
    for func, exists in rbac_status['permissions'].items():
        print(f"  {'✅' if exists else '❌'} {func}")
    
    print()
    
    # Detailed domain analysis
    print("3. DETAILED DOMAIN ANALYSIS")
    print("-" * 80)
    
    domains_to_check = [
        'property', 'tenant', 'lease', 'payment', 'maintenance',
        'landlord', 'pmc', 'document', 'message', 'support',
        'notification', 'verification', 'invitation', 'service_provider',
        'application', 'activity', 'expense', 'rbac'
    ]
    
    for domain in domains_to_check:
        domain_dir = DJANGO_APP / "domains" / domain
        if not domain_dir.exists():
            continue
        
        views_file = domain_dir / "views.py"
        if not views_file.exists():
            continue
        
        try:
            content = views_file.read_text()
            
            # Find all ViewSets
            viewsets = re.findall(r'class (\w+ViewSet)', content)
            
            print(f"\n{domain.upper()}:")
            for viewset in viewsets:
                # Check methods
                has_list = f'def list' in content or 'ModelViewSet' in content
                has_create = f'def create' in content or 'ModelViewSet' in content
                has_retrieve = f'def retrieve' in content or 'ModelViewSet' in content
                has_update = f'def update' in content or 'ModelViewSet' in content
                has_destroy = f'def destroy' in content or 'ModelViewSet' in content
                
                # Check custom actions
                custom_actions = re.findall(r'@action.*?url_path=[\'"]([^\'"]+)[\'"]', content)
                
                print(f"  {viewset}:")
                print(f"    List: {'✅' if has_list else '❌'}")
                print(f"    Create: {'✅' if has_create else '❌'}")
                print(f"    Retrieve: {'✅' if has_retrieve else '❌'}")
                print(f"    Update: {'✅' if has_update else '❌'}")
                print(f"    Delete: {'✅' if has_destroy else '❌'}")
                if custom_actions:
                    print(f"    Custom Actions: {', '.join(custom_actions)}")
        except Exception as e:
            print(f"  Error: {e}")
    
    print()
    print("=" * 80)
    print("CHECK COMPLETE")
    print("=" * 80)

if __name__ == "__main__":
    generate_report()

