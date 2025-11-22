#!/usr/bin/env python
"""
Comprehensive Migration Checker
Scans React app and Django app to identify what's been migrated and what's missing
"""
import os
import re
import json
from pathlib import Path
from collections import defaultdict

# React app paths
REACT_APP_PATH = Path('apps/web-app')
REACT_API_PATH = Path('apps/api-server')

# Django app paths
DJANGO_APP_PATH = Path('pinaka_django')

def scan_react_pages():
    """Scan React app pages"""
    pages = {}
    if REACT_APP_PATH.exists():
        pages_dir = REACT_APP_PATH / 'app'
        if pages_dir.exists():
            for page_file in pages_dir.rglob('page.jsx'):
                rel_path = page_file.relative_to(REACT_APP_PATH)
                route = str(rel_path.parent).replace('\\', '/')
                pages[route] = {
                    'file': str(rel_path),
                    'type': 'page'
                }
    return pages

def scan_react_components():
    """Scan React app components"""
    components = {}
    if REACT_APP_PATH.exists():
        components_dir = REACT_APP_PATH / 'components'
        if components_dir.exists():
            for comp_file in components_dir.rglob('*.jsx'):
                rel_path = comp_file.relative_to(REACT_APP_PATH)
                comp_name = comp_file.stem
                components[comp_name] = {
                    'file': str(rel_path),
                    'type': 'component'
                }
    return components

def scan_react_api_routes():
    """Scan React API server routes"""
    api_routes = {}
    if REACT_API_PATH.exists():
        # Look for route files
        for route_file in REACT_API_PATH.rglob('route.ts'):
            rel_path = route_file.relative_to(REACT_API_PATH)
            route = str(rel_path.parent).replace('\\', '/')
            api_routes[route] = {
                'file': str(rel_path),
                'type': 'api_route'
            }
    return api_routes

def scan_django_views():
    """Scan Django views"""
    views = {}
    if DJANGO_APP_PATH.exists():
        # Scan frontend views
        frontend_views = DJANGO_APP_PATH / 'frontend' / 'views.py'
        if frontend_views.exists():
            with open(frontend_views, 'r') as f:
                content = f.read()
                # Find all view functions
                view_pattern = r'^def\s+(\w+)\(request\):'
                for match in re.finditer(view_pattern, content, re.MULTILINE):
                    view_name = match.group(1)
                    views[view_name] = {
                        'file': 'frontend/views.py',
                        'type': 'view',
                        'module': 'frontend'
                    }
        
        # Scan admin views
        admin_views = DJANGO_APP_PATH / 'frontend' / 'admin_views.py'
        if admin_views.exists():
            with open(admin_views, 'r') as f:
                content = f.read()
                view_pattern = r'^def\s+(admin_\w+)\(request\):'
                for match in re.finditer(view_pattern, content, re.MULTILINE):
                    view_name = match.group(1)
                    views[view_name] = {
                        'file': 'frontend/admin_views.py',
                        'type': 'view',
                        'module': 'admin'
                    }
    return views

def scan_django_urls():
    """Scan Django URL patterns"""
    urls = {}
    if DJANGO_APP_PATH.exists():
        # Scan frontend URLs
        frontend_urls = DJANGO_APP_PATH / 'frontend' / 'urls.py'
        if frontend_urls.exists():
            with open(frontend_urls, 'r') as f:
                content = f.read()
                # Find path patterns
                path_pattern = r"path\('([^']+)',\s+\w+\.(\w+),\s+name='(\w+)'\)"
                for match in re.finditer(path_pattern, content):
                    url_path = match.group(1)
                    view_name = match.group(2)
                    url_name = match.group(3)
                    urls[url_name] = {
                        'path': url_path,
                        'view': view_name,
                        'type': 'url',
                        'module': 'frontend'
                    }
        
        # Scan admin URLs
        admin_urls = DJANGO_APP_PATH / 'frontend' / 'admin_urls.py'
        if admin_urls.exists():
            with open(admin_urls, 'r') as f:
                content = f.read()
                path_pattern = r"path\('([^']+)',\s+\w+\.(\w+),\s+name='(\w+)'\)"
                for match in re.finditer(path_pattern, content):
                    url_path = match.group(1)
                    view_name = match.group(2)
                    url_name = match.group(3)
                    urls[url_name] = {
                        'path': url_path,
                        'view': view_name,
                        'type': 'url',
                        'module': 'admin'
                    }
    return urls

def scan_django_models():
    """Scan Django models"""
    models = {}
    if DJANGO_APP_PATH.exists():
        domains_dir = DJANGO_APP_PATH / 'domains'
        if domains_dir.exists():
            for model_file in domains_dir.rglob('models.py'):
                with open(model_file, 'r') as f:
                    content = f.read()
                    # Find model classes
                    model_pattern = r'^class\s+(\w+)\(models\.Model\):'
                    for match in re.finditer(model_pattern, content, re.MULTILINE):
                        model_name = match.group(1)
                        rel_path = model_file.relative_to(DJANGO_APP_PATH)
                        models[model_name] = {
                            'file': str(rel_path),
                            'type': 'model'
                        }
    return models

def scan_react_api_endpoints():
    """Scan React API client for endpoints"""
    endpoints = {}
    if REACT_APP_PATH.exists():
        api_dir = REACT_APP_PATH / 'lib' / 'api'
        if api_dir.exists():
            for api_file in api_dir.rglob('*.ts'):
                with open(api_file, 'r') as f:
                    content = f.read()
                    # Find API methods
                    method_pattern = r'(\w+):\s*\([^)]*\)\s*=>\s*[^,}]+'
                    for match in re.finditer(method_pattern, content):
                        method_name = match.group(1)
                        rel_path = api_file.relative_to(REACT_APP_PATH)
                        endpoints[method_name] = {
                            'file': str(rel_path),
                            'type': 'api_endpoint'
                        }
    return endpoints

def check_ltb_documents():
    """Check if LTB documents are implemented"""
    ltb_status = {
        'react_component': False,
        'django_view': False,
        'django_template': False,
        'api_endpoint': False
    }
    
    # Check React component
    ltb_component = REACT_APP_PATH / 'components' / 'shared' / 'LTBDocumentsGrid.jsx'
    if ltb_component.exists():
        ltb_status['react_component'] = True
        with open(ltb_component, 'r') as f:
            content = f.read()
            # Check for API calls
            if 'api' in content.lower() or 'fetch' in content.lower():
                ltb_status['api_endpoint'] = True
    
    # Check Django view
    admin_views = DJANGO_APP_PATH / 'frontend' / 'admin_views.py'
    if admin_views.exists():
        with open(admin_views, 'r') as f:
            content = f.read()
            if 'ltb' in content.lower() or 'legal' in content.lower():
                ltb_status['django_view'] = True
    
    # Check Django template
    library_template = DJANGO_APP_PATH / 'templates' / 'frontend' / 'admin' / 'library.html'
    if library_template.exists():
        with open(library_template, 'r') as f:
            content = f.read()
            if 'ltb' in content.lower() or 'legal' in content.lower():
                ltb_status['django_template'] = True
    
    return ltb_status

def generate_migration_report():
    """Generate comprehensive migration report"""
    print("=" * 80)
    print("COMPREHENSIVE MIGRATION CHECKER")
    print("=" * 80)
    
    print("\n1. SCANNING REACT APP...")
    react_pages = scan_react_pages()
    react_components = scan_react_components()
    react_api_routes = scan_react_api_routes()
    react_endpoints = scan_react_api_endpoints()
    
    print(f"   Found {len(react_pages)} pages")
    print(f"   Found {len(react_components)} components")
    print(f"   Found {len(react_api_routes)} API routes")
    print(f"   Found {len(react_endpoints)} API endpoints")
    
    print("\n2. SCANNING DJANGO APP...")
    django_views = scan_django_views()
    django_urls = scan_django_urls()
    django_models = scan_django_models()
    
    print(f"   Found {len(django_views)} views")
    print(f"   Found {len(django_urls)} URL patterns")
    print(f"   Found {len(django_models)} models")
    
    print("\n3. CHECKING LTB DOCUMENTS...")
    ltb_status = check_ltb_documents()
    print(f"   React Component: {'✓' if ltb_status['react_component'] else '✗'}")
    print(f"   Django View: {'✓' if ltb_status['django_view'] else '✗'}")
    print(f"   Django Template: {'✓' if ltb_status['django_template'] else '✗'}")
    print(f"   API Endpoint: {'✓' if ltb_status['api_endpoint'] else '✗'}")
    
    print("\n4. KEY PAGES MIGRATION STATUS:")
    key_pages = {
        '/admin/library': 'admin_library',
        '/admin/settings': 'admin_user_settings',
        '/admin/platform-settings': 'admin_platform_settings',
        '/settings': 'settings',
        '/library': 'library',
        '/legal': None,  # Check if exists
    }
    
    for react_route, django_view in key_pages.items():
        react_exists = any(route == react_route.lstrip('/') for route in react_pages.keys())
        django_exists = django_view in django_views if django_view else False
        status = '✓' if (react_exists and django_exists) else '✗'
        print(f"   {react_route:30} | React: {'✓' if react_exists else '✗'} | Django: {'✓' if django_exists else '✗'} | {status}")
    
    print("\n5. KEY COMPONENTS MIGRATION STATUS:")
    key_components = [
        'LTBDocumentsGrid',
        'LibraryClient',
        'UnifiedLibraryComponent',
        'SettingsClient',
        'SignatureUpload',
        'ThemeSelector',
    ]
    
    for comp_name in key_components:
        react_exists = comp_name in react_components
        # Check if Django equivalent exists (simplified check)
        django_exists = False
        if comp_name == 'LTBDocumentsGrid':
            django_exists = 'ltb' in str(django_views).lower() or 'legal' in str(django_views).lower()
        elif comp_name == 'LibraryClient':
            django_exists = 'library' in str(django_views).lower()
        elif comp_name == 'SettingsClient':
            django_exists = 'settings' in str(django_views).lower()
        
        status = '✓' if (react_exists and django_exists) else '✗'
        print(f"   {comp_name:30} | React: {'✓' if react_exists else '✗'} | Django: {'✓' if django_exists else '✗'} | {status}")
    
    print("\n6. MISSING FEATURES:")
    missing = []
    
    if not ltb_status['django_view']:
        missing.append("LTB Documents Grid (Legal tab in library)")
    if not ltb_status['django_template']:
        missing.append("LTB Documents template")
    
    if missing:
        for item in missing:
            print(f"   ✗ {item}")
    else:
        print("   No critical features missing!")
    
    print("\n" + "=" * 80)
    print("MIGRATION CHECK COMPLETE")
    print("=" * 80)
    
    return {
        'react_pages': react_pages,
        'react_components': react_components,
        'django_views': django_views,
        'django_urls': django_urls,
        'ltb_status': ltb_status,
        'missing': missing
    }

if __name__ == '__main__':
    report = generate_migration_report()

