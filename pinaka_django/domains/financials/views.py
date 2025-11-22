"""
Financial Reports API Views
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Count, Q
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from datetime import timedelta
from domains.payment.models import RentPayment
from domains.expense.models import Expense
from domains.property.models import Property
import csv
import json


class FinancialReportsViewSet(viewsets.ViewSet):
    """Financial Reports API"""
    
    @action(detail=False, methods=['get'], url_path='reports')
    def generate_report(self, request):
        """Generate financial report"""
        try:
            report_type = request.query_params.get('type', 'monthly')
            
            now = timezone.now()
            if report_type == 'monthly':
                start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                end_date = (start_date + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            elif report_type == 'yearly':
                start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
                end_date = now.replace(month=12, day=31, hour=23, minute=59, second=59)
            else:
                # Custom period
                start_date_str = request.query_params.get('start_date')
                end_date_str = request.query_params.get('end_date')
                if not start_date_str or not end_date_str:
                    return Response({
                        'success': False,
                        'error': 'start_date and end_date required for custom period'
                    }, status=status.HTTP_400_BAD_REQUEST)
                from django.utils.dateparse import parse_date
                start_date = parse_date(start_date_str)
                end_date = parse_date(end_date_str)
            
            # Get payments and expenses
            payments = RentPayment.objects.filter(
                paid_date__gte=start_date,
                paid_date__lte=end_date
            )
            expenses = Expense.objects.filter(
                date__gte=start_date,
                date__lte=end_date
            )
            
            # Group by property
            report_rows = []
            properties = Property.objects.all()
            for property in properties:
                property_payments = payments.filter(lease__unit__property=property)
                property_expenses = expenses.filter(property=property)
                
                property_income = property_payments.aggregate(Sum('amount'))['amount__sum'] or 0
                property_expense_total = property_expenses.aggregate(Sum('amount'))['amount__sum'] or 0
                
                if property_income > 0 or property_expense_total > 0:
                    report_rows.append({
                        'property': property.property_name,
                        'income': float(property_income),
                        'expenses': float(property_expense_total),
                        'net': float(property_income - property_expense_total),
                    })
            
            total_income = payments.aggregate(Sum('amount'))['amount__sum'] or 0
            total_expenses = expenses.aggregate(Sum('amount'))['amount__sum'] or 0
            
            return Response({
                'success': True,
                'data': {
                    'title': f'{report_type.capitalize()} Financial Report',
                    'period': {
                        'start': start_date.isoformat(),
                        'end': end_date.isoformat(),
                    },
                    'summary': {
                        'total_income': float(total_income),
                        'total_expenses': float(total_expenses),
                        'net_income': float(total_income - total_expenses),
                    },
                    'rows': report_rows,
                }
            })
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=False, methods=['get'], url_path='export')
    def export_report(self, request):
        """Export financial report as CSV or PDF"""
        try:
            format_type = request.query_params.get('format', 'csv')
            report_type = request.query_params.get('type', 'monthly')
            
            now = timezone.now()
            if report_type == 'monthly':
                start_date = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                end_date = (start_date + timedelta(days=32)).replace(day=1) - timedelta(days=1)
            else:
                start_date = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
                end_date = now.replace(month=12, day=31, hour=23, minute=59, second=59)
            
            payments = RentPayment.objects.filter(
                paid_date__gte=start_date,
                paid_date__lte=end_date
            )
            expenses = Expense.objects.filter(
                date__gte=start_date,
                date__lte=end_date
            )
            
            if format_type == 'csv':
                response = HttpResponse(content_type='text/csv')
                response['Content-Disposition'] = f'attachment; filename="financial-report-{report_type}.csv"'
                
                writer = csv.writer(response)
                writer.writerow(['Property', 'Income', 'Expenses', 'Net Income'])
                
                properties = Property.objects.all()
                for property in properties:
                    property_payments = payments.filter(lease__unit__property=property)
                    property_expenses = expenses.filter(property=property)
                    
                    property_income = property_payments.aggregate(Sum('amount'))['amount__sum'] or 0
                    property_expense_total = property_expenses.aggregate(Sum('amount'))['amount__sum'] or 0
                    net = property_income - property_expense_total
                    
                    writer.writerow([
                        property.property_name,
                        f"${property_income:.2f}",
                        f"${property_expense_total:.2f}",
                        f"${net:.2f}",
                    ])
                
                # Summary row
                total_income = payments.aggregate(Sum('amount'))['amount__sum'] or 0
                total_expenses = expenses.aggregate(Sum('amount'))['amount__sum'] or 0
                writer.writerow(['TOTAL', f"${total_income:.2f}", f"${total_expenses:.2f}", f"${total_income - total_expenses:.2f}"])
                
                return response
            else:
                # PDF export would require reportlab or similar
                return JsonResponse({
                    'success': False,
                    'error': 'PDF export not yet implemented'
                }, status=status.HTTP_501_NOT_IMPLEMENTED)
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

