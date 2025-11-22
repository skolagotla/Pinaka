#!/usr/bin/env python
"""
COMPLETE MIGRATION AUDIT
Comprehensively scans React app and Django app to find ALL missing features
"""
import os
import re
import json
from pathlib import Path
from collections import defaultdict

REACT_APP = Path('apps/web-app')
REACT_API = Path('apps/api-server')
DJANGO_APP = Path('pinaka_django')

def scan_all_react_pages():
    """Get ALL React pages with their routes"""
    pages = {}
    if REACT_APP.exists():
        for page_file in (REACT_APP / 'app').rglob('page.jsx'):
            route = '/' + str(page_file.parent.relative_to(REACT_APP / 'app')).replace('\\', '/')
            route = route.replace('/page', '').replace('//', '/')
            if route == '/page':
                route = '/'
            pages[route] = {
                'file': str(page_file.relative_to(REACT_APP)),
                'route': route
            }
    return pages

def scan_all_react_api_endpoints():
    """Get ALL React API endpoints"""
    endpoints = {}
    if REACT_API.exists():
        api_dir = REACT_API / 'pages' / 'api'
        for api_file in api_dir.rglob('*.ts'):
            if 'route.ts' in str(api_file):
                continue
            rel_path = api_file.relative_to(REACT_API / 'pages')
            route = '/' + str(rel_path.parent).replace('\\', '/')
            if route.endswith('/index'):
                route = route[:-6]
            endpoints[route] = {
                'file': str(rel_path),
                'methods': extract_methods(api_file)
            }
    return endpoints

def extract_methods(api_file):
    """Extract HTTP methods from API file"""
    methods = []
    try:
        with open(api_file, 'r') as f:
            content = f.read()
            if 'handleGet' in content or 'GET' in content:
                methods.append('GET')
            if 'handlePost' in content or 'POST' in content:
                methods.append('POST')
            if 'handlePut' in content or 'PUT' in content:
                methods.append('PUT')
            if 'handlePatch' in content or 'PATCH' in content:
                methods.append('PATCH')
            if 'handleDelete' in content or 'DELETE' in content:
                methods.append('DELETE')
    except:
        pass
    return methods

def scan_all_django_urls():
    """Get ALL Django URLs"""
    urls = {}
    if DJANGO_APP.exists():
        # Frontend URLs
        frontend_urls = DJANGO_APP / 'frontend' / 'urls.py'
        if frontend_urls.exists():
            with open(frontend_urls, 'r') as f:
                content = f.read()
                for match in re.finditer(r"path\('([^']+)',\s+\w+\.(\w+),\s+name='(\w+)'\)", content):
                    urls[match.group(3)] = {
                        'path': match.group(1),
                        'view': match.group(2),
                        'module': 'frontend'
                    }
        
        # Admin URLs
        admin_urls = DJANGO_APP / 'frontend' / 'admin_urls.py'
        if admin_urls.exists():
            with open(admin_urls, 'r') as f:
                content = f.read()
                for match in re.finditer(r"path\('([^']+)',\s+\w+\.(\w+),\s+name='(\w+)'\)", content):
                    urls[match.group(3)] = {
                        'path': match.group(1),
                        'view': match.group(2),
                        'module': 'admin'
                    }
        
        # API URLs from domains
        for urls_file in (DJANGO_APP / 'domains').rglob('urls.py'):
            with open(urls_file, 'r') as f:
                content = f.read()
                for match in re.finditer(r"path\('([^']+)'", content):
                    api_path = match.group(1)
                    urls[f"api_{api_path}"] = {
                        'path': f"/api/v1/{api_path}",
                        'view': 'api',
                        'module': 'api'
                    }
    return urls

def scan_all_django_views():
    """Get ALL Django views"""
    views = {}
    if DJANGO_APP.exists():
        # Frontend views
        frontend_views = DJANGO_APP / 'frontend' / 'views.py'
        if frontend_views.exists():
            with open(frontend_views, 'r') as f:
                content = f.read()
                for match in re.finditer(r'^def\s+(\w+)\(request', content, re.MULTILINE):
                    views[match.group(1)] = {'module': 'frontend', 'file': 'views.py'}
        
        # Admin views
        admin_views = DJANGO_APP / 'frontend' / 'admin_views.py'
        if admin_views.exists():
            with open(admin_views, 'r') as f:
                content = f.read()
                for match in re.finditer(r'^def\s+(admin_\w+)\(request', content, re.MULTILINE):
                    views[match.group(1)] = {'module': 'admin', 'file': 'admin_views.py'}
    return views

def map_react_to_django():
    """Map React routes to Django URLs"""
    mapping = {
        # Admin routes
        '/admin/dashboard': 'admin_dashboard',
        '/admin/users': 'admin_users',
        '/admin/rbac': 'admin_rbac',
        '/admin/system': 'admin_system',
        '/admin/audit-logs': 'admin_audit_logs',
        '/admin/settings': 'admin_user_settings',
        '/admin/library': 'admin_library',
        '/admin/analytics': 'admin_analytics',
        '/admin/support-tickets': 'admin_support_tickets',
        '/admin/security': 'admin_security',
        '/admin/data-export': 'admin_data_export',
        '/admin/notifications': 'admin_notifications',
        '/admin/user-activity': 'admin_user_activity',
        '/admin/content': 'admin_content',
        '/admin/api-keys': 'admin_api_keys',
        '/admin/database': 'admin_database',
        '/admin/verifications': 'admin_verifications',
        '/admin/applications': 'admin_applications',
        
        # Frontend routes
        '/dashboard': 'dashboard',
        '/properties': 'properties_list',
        '/tenants': 'tenants_list',
        '/leases': 'leases_list',
        '/payments': 'payments_list',
        '/financials': 'financials',
        '/library': 'library',
        '/legal': 'legal',
        '/operations': 'maintenance_list',
        '/calendar': 'calendar',
        '/messages': 'messages',
        '/partners': 'partners',
        '/settings': 'settings',
        '/verifications': 'verifications',
        '/checklist': 'checklist',
        '/estimator': 'estimator',
        '/invitations': 'invitations',
        '/landlords': 'landlords_list',
    }
    return mapping

def find_missing_features():
    """Find ALL missing features"""
    print("=" * 100)
    print("COMPLETE MIGRATION AUDIT - Finding ALL Missing Features")
    print("=" * 100)
    
    react_pages = scan_all_react_pages()
    react_apis = scan_all_react_api_endpoints()
    django_urls = scan_all_django_urls()
    django_views = scan_all_django_views()
    route_mapping = map_react_to_django()
    
    print(f"\n📊 SCAN RESULTS:")
    print(f"   React Pages: {len(react_pages)}")
    print(f"   React API Endpoints: {len(react_apis)}")
    print(f"   Django URLs: {len(django_urls)}")
    print(f"   Django Views: {len(django_views)}")
    
    # Check pages
    print(f"\n🔍 CHECKING PAGES:")
    missing_pages = []
    for react_route, django_view_name in route_mapping.items():
        react_exists = react_route in react_pages
        django_exists = django_view_name in django_views or django_view_name in django_urls
        status = "✅" if (react_exists and django_exists) else "❌"
        if not django_exists and react_exists:
            missing_pages.append({
                'route': react_route,
                'django_view': django_view_name,
                'react_file': react_pages[react_route]['file'] if react_route in react_pages else None
            })
        print(f"   {status} {react_route:40} → {django_view_name:30} {'MISSING' if not django_exists and react_exists else ''}")
    
    # Check all React pages not in mapping
    print(f"\n🔍 UNMAPPED REACT PAGES:")
    unmapped = []
    for route in react_pages:
        if route not in route_mapping:
            unmapped.append(route)
            print(f"   ⚠️  {route:50} (not in mapping)")
    
    # Check API endpoints
    print(f"\n🔍 CHECKING API ENDPOINTS:")
    missing_apis = []
    django_api_paths = {url['path'] for url in django_urls.values() if url['module'] == 'api'}
    
    for api_route in sorted(react_apis.keys()):
        # Normalize route
        normalized = api_route.replace('/pages/api', '').replace('/index', '')
        django_exists = any(normalized in path or path in normalized for path in django_api_paths)
        if not django_exists:
            missing_apis.append({
                'route': api_route,
                'file': react_apis[api_route]['file'],
                'methods': react_apis[api_route]['methods']
            })
        status = "✅" if django_exists else "❌"
        print(f"   {status} {api_route:60} {'MISSING' if not django_exists else ''}")
    
    # Generate report
    print(f"\n" + "=" * 100)
    print("📋 SUMMARY")
    print("=" * 100)
    print(f"\n❌ Missing Pages: {len(missing_pages)}")
    for item in missing_pages:
        print(f"   - {item['route']} → {item['django_view']}")
    
    print(f"\n❌ Missing API Endpoints: {len(missing_apis)}")
    for item in missing_apis[:20]:  # Show first 20
        print(f"   - {item['route']} ({', '.join(item['methods'])})")
    if len(missing_apis) > 20:
        print(f"   ... and {len(missing_apis) - 20} more")
    
    print(f"\n⚠️  Unmapped Pages: {len(unmapped)}")
    for route in unmapped[:10]:
        print(f"   - {route}")
    if len(unmapped) > 10:
        print(f"   ... and {len(unmapped) - 10} more")
    
    # Save detailed report
    report = {
        'missing_pages': missing_pages,
        'missing_apis': missing_apis,
        'unmapped_pages': unmapped,
        'total_react_pages': len(react_pages),
        'total_react_apis': len(react_apis),
        'total_django_views': len(django_views),
        'total_django_urls': len(django_urls),
    }
    
    with open('MIGRATION_AUDIT_REPORT.json', 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"\n💾 Detailed report saved to: MIGRATION_AUDIT_REPORT.json")
    print("=" * 100)
    
    return report

if __name__ == '__main__':
    report = find_missing_features()

