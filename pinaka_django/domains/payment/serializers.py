"""Payment Domain Serializers"""
from rest_framework import serializers
from .models import RentPayment, SecurityDeposit, Expense

class RentPaymentSerializer(serializers.ModelSerializer):
    is_paid = serializers.BooleanField(read_only=True)
    lease_display = serializers.CharField(source='lease.lease_id', read_only=True)
    
    class Meta:
        model = RentPayment
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class SecurityDepositSerializer(serializers.ModelSerializer):
    class Meta:
        model = SecurityDeposit
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

