"""Frontend URLs"""
from django.urls import path
from . import views
from . import invitation_views
from . import tax_views
from . import checklist_views
from . import tenant_payment_views
from . import year_end_views
from . import pending_approval_views
from . import widgets
from . import search_views
from . import estimator_views
from . import account_suspended_views
from . import public_views
from . import cron_views
from . import forms_views
from . import auth_views

urlpatterns = [
    path('login/', auth_views.login_view, name='login'),
    path('logout/', auth_views.logout_view, name='logout'),
    path('api/auth/login/', auth_views.api_login, name='api_login'),
    path('', views.dashboard, name='dashboard'),
    path('properties/', views.properties_list, name='properties_list'),
    path('properties/create/', views.property_create, name='property_create'),
    path('properties/<str:pk>/', views.property_detail, name='property_detail'),
    path('tenants/', views.tenants_list, name='tenants_list'),
    path('tenants/create/', views.tenant_create, name='tenant_create'),
    path('tenants/<str:pk>/edit/', views.tenant_edit, name='tenant_edit'),
    path('tenants/<str:pk>/', views.tenant_detail, name='tenant_detail'),
    path('leases/', views.leases_list, name='leases_list'),
    path('leases/<str:pk>/', views.lease_detail, name='lease_detail'),
    path('payments/', views.payments_list, name='payments_list'),
    path('maintenance/', views.maintenance_list, name='maintenance_list'),
    path('landlords/', views.landlords_list, name='landlords_list'),
    path('landlords/create/', views.landlord_create, name='landlord_create'),
    path('landlords/<str:pk>/edit/', views.landlord_edit, name='landlord_edit'),
    path('landlords/<str:pk>/', views.landlord_detail, name='landlord_detail'),
    path('pmcs/', views.pmcs_list, name='pmcs_list'),
    path('pmcs/<str:pk>/', views.pmc_detail, name='pmc_detail'),
    path('users/', views.users_list, name='users_list'),
    path('financials/', views.financials, name='financials'),
    path('calendar/', views.calendar, name='calendar'),
    path('operations/', views.operations, name='operations'),
    path('legal/', views.legal, name='legal'),
    path('partners/', views.partners, name='partners'),
    path('settings/', views.settings, name='settings'),
    path('library/', views.library, name='library'),
    path('messages/', views.messages, name='messages'),
    path('verifications/', views.verifications, name='verifications'),
    path('accept-invitation/', invitation_views.accept_invitation, name='accept_invitation'),
    path('complete-registration/', invitation_views.complete_registration, name='complete_registration'),
    path('financials/tax-reporting/', tax_views.tax_reporting, name='tax_reporting'),
    path('checklist/', checklist_views.checklist, name='checklist'),
    path('checklist/save-item/', checklist_views.save_checklist_item, name='save_checklist_item'),
    path('checklist/submit/', checklist_views.submit_checklist, name='submit_checklist'),
    path('payments/', tenant_payment_views.tenant_payments, name='tenant_payments'),
    path('financials/year-end/', year_end_views.year_end_closing, name='year_end_closing'),
    path('pending-approval/', pending_approval_views.pending_approval, name='pending_approval'),
    path('widgets/activity-log/', widgets.activity_log_widget, name='activity_log_widget'),
    path('widgets/notifications/', widgets.notification_widget, name='notification_widget'),
    path('search/', search_views.global_search, name='global_search'),
    path('estimator/', estimator_views.estimator, name='estimator'),
    path('account-suspended/', account_suspended_views.account_suspended, name='account_suspended'),
    path('homepage/rent/', public_views.homepage_rent, name='homepage_rent'),
    path('success/', public_views.success_page, name='success'),
    path('api/cron/archive-audit-logs/', cron_views.archive_audit_logs, name='archive_audit_logs'),
    path('api/cron/expired-approvals/', cron_views.expired_approvals, name='expired_approvals'),
    path('forms/', forms_views.forms_management, name='forms_management'),
]

