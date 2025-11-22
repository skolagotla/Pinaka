"""
Authentication Views - Login/Logout
"""
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib import messages
from django.views.decorators.http import require_http_methods


def login_view(request):
    """Login page"""
    if request.user.is_authenticated:
        return redirect('/')
    
    if request.method == 'POST':
        email = request.POST.get('email', '').strip()
        password = request.POST.get('password', '').strip()
        
        if not email or not password:
            messages.error(request, 'Email and password are required')
            return render(request, 'frontend/auth/login.html')
        
        # Authenticate user
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            # Login successful
            login(request, user)
            messages.success(request, f'Welcome back, {user.get_full_name() or user.email}!')
            
            # Redirect based on user type (matching React app logic)
            next_url = request.GET.get('next', None)
            if next_url:
                return redirect(next_url)
            
            # Check if user is platform admin (SUPER_ADMIN or PLATFORM_ADMIN)
            from shared.rbac.permissions import has_role
            user_id = None
            if hasattr(user, 'admin_profile'):
                user_id = str(user.admin_profile.id)
            elif hasattr(user, 'id'):
                user_id = str(user.id)
            
            if user_id:
                is_admin = has_role(user_id, 'ADMIN', 'SUPER_ADMIN') or has_role(user_id, 'ADMIN', 'PLATFORM_ADMIN')
                if is_admin:
                    return redirect('/admin/')
            
            # Default redirect to home
            return redirect('/')
        else:
            messages.error(request, 'Invalid email or password')
    
    return render(request, 'frontend/auth/login.html')


def logout_view(request):
    """Logout view"""
    logout(request)
    messages.success(request, 'You have been logged out successfully')
    return redirect('/login/')


@require_http_methods(["POST"])
def api_login(request):
    """API login endpoint (for AJAX requests)"""
    from django.http import JsonResponse
    import json
    
    try:
        data = json.loads(request.body)
        email = data.get('email', '').strip()
        password = data.get('password', '').strip()
        
        if not email or not password:
            return JsonResponse({
                'success': False,
                'error': 'Email and password are required'
            }, status=400)
        
        # Authenticate user
        user = authenticate(request, username=email, password=password)
        
        if user is not None:
            login(request, user)
            
            # Determine redirect URL based on user type
            redirect_url = '/'
            from shared.rbac.permissions import has_role
            user_id = None
            if hasattr(user, 'admin_profile'):
                user_id = str(user.admin_profile.id)
            elif hasattr(user, 'id'):
                user_id = str(user.id)
            
            if user_id:
                is_admin = has_role(user_id, 'ADMIN', 'SUPER_ADMIN') or has_role(user_id, 'ADMIN', 'PLATFORM_ADMIN')
                if is_admin:
                    redirect_url = '/admin/'
            
            return JsonResponse({
                'success': True,
                'message': 'Login successful',
                'user': {
                    'email': user.email,
                    'name': user.get_full_name() or user.email,
                    'type': getattr(user, 'user_type', 'unknown'),
                    'role': getattr(user, 'user_role', 'unknown'),
                },
                'redirect': redirect_url
            })
        else:
            return JsonResponse({
                'success': False,
                'error': 'Invalid email or password'
            }, status=401)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

