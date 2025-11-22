"""Payment Domain API URLs"""
from rest_framework.routers import DefaultRouter
from .views import RentPaymentViewSet, SecurityDepositViewSet, ExpenseViewSet

router = DefaultRouter()
router.register(r'rent-payments', RentPaymentViewSet, basename='rent-payment')
router.register(r'security-deposits', SecurityDepositViewSet, basename='security-deposit')
router.register(r'expenses', ExpenseViewSet, basename='expense')
urlpatterns = router.urls

