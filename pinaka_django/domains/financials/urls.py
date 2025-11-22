"""
Financial Reports API URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FinancialReportsViewSet

router = DefaultRouter()
router.register(r'financials', FinancialReportsViewSet, basename='financials')

urlpatterns = [
    path('', include(router.urls)),
]

