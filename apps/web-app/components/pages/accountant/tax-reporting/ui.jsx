/**
 * Tax Reporting Client Component
 * UI for generating T776 tax reports
 */

"use client";

import { useState } from 'react';
import { Card, Button, TextInput, Label, Select, Alert, Badge, Spinner } from 'flowbite-react';
import { HiDownload, HiDocumentText } from 'react-icons/hi';
import { notify } from '@/lib/utils/notification-helper';
import { useLoading } from '@/lib/hooks/useLoading';
// useUnifiedApi removed - use v2Api from @/lib/api/v2-client';
import { useFormState } from '@/lib/hooks/useFormState';
import { PageLayout, TableWrapper, FlowbiteTable } from '@/components/shared';
import { STANDARD_COLUMNS, customizeColumn } from '@/lib/constants/standard-columns';
import { exportToPDF } from '@/lib/utils/export-utils';

export default function TaxReportingClient({ user, userRole }) {
  const { formData, updateField } = useFormState({
    landlordId: '',
    taxYear: new Date().getFullYear() - 1, // Previous year by default
    propertyIds: [],
  });
  // useUnifiedApi removed - use v2Api
  const { loading, withLoading } = useLoading();
  const [report, setReport] = useState(null);

  const handleGenerate = async () => {
    await withLoading(async () => {
      try {
        // TODO: Implement v2 endpoint for T776 generation
        const { apiClient } = await import('@/lib/utils/api-client');
        const response = await apiClient('/api/v1/analytics/t776/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            landlordId: formData.landlordId || user.userId,
            taxYear: formData.taxYear,
            propertyIds: formData.propertyIds,
          }),
        });
        
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || data.message || 'Failed to generate tax report');
        }
        if (data.success && data.data) {
          setReport(data.data);
        } else {
          setReport(data.report || data);
        }
        notify.success('Tax report generated successfully');
      } catch (error) {
        console.error('Error generating tax report:', error);
        notify.error(error.message || 'Failed to generate tax report');
      }
    });
  };

  const handleDownload = async () => {
    if (!report) {
      notify.warning('Please generate a report first');
      return;
    }

    try {
      // Prepare data for PDF export
      const pdfData = report.properties || [];
      const pdfColumns = [
        { title: 'Property Name', dataIndex: 'propertyName' },
        { title: 'Address', dataIndex: 'address' },
        { title: 'Income', dataIndex: 'income', render: (val) => `$${val?.toFixed(2) || '0.00'}` },
      ];

      // Add summary information to the title
      const title = `T776 Tax Report - ${report.taxYear}\nTotal Income: $${report.income?.totalRentalIncome?.toFixed(2) || '0.00'}\nTotal Expenses: $${report.totalExpenses?.toFixed(2) || '0.00'}\nNet Income: $${report.netIncome?.toFixed(2) || '0.00'}`;

      await exportToPDF(pdfData, pdfColumns, title, `t776-tax-report-${report.taxYear}`);
      notify.success('PDF downloaded successfully');
    } catch (error) {
      console.error('[Tax Reporting] PDF export error:', error);
      notify.error(error.message || 'Failed to generate PDF');
    }
  };

  const propertyColumns = [
    {
      header: 'Property Name',
      accessorKey: 'propertyName',
    },
    {
      header: 'Address',
      accessorKey: 'address',
    },
    {
      header: 'Income',
      accessorKey: 'income',
      cell: ({ row }) => `$${row.original.income?.toFixed(2) || '0.00'}`,
    },
  ];

  return (
    <PageLayout title="Tax Reporting (T776)">
      <Card className="mb-6">
        <h5 className="text-xl font-semibold mb-4">Generate T776 Tax Report</h5>
        <div className="space-y-4">
          {userRole !== 'landlord' && (
            <div>
              <Label htmlFor="landlordId" value="Landlord ID" />
              <TextInput
                id="landlordId"
                type="text"
                placeholder="Enter landlord ID"
                value={formData.landlordId}
                onChange={(e) => updateField('landlordId', e.target.value)}
                required
              />
            </div>
          )}

          <div>
            <Label htmlFor="taxYear" value="Tax Year" />
            <TextInput
              id="taxYear"
              type="number"
              placeholder="e.g., 2024"
              value={formData.taxYear}
              onChange={(e) => updateField('taxYear', parseInt(e.target.value))}
              required
            />
          </div>

          <div>
            <Label htmlFor="propertyIds" value="Properties (Optional)" />
            <p className="text-sm text-gray-500 mb-2">Leave empty to include all properties</p>
            <Select
              id="propertyIds"
              multiple
              value={formData.propertyIds}
              onChange={(value) => updateField('propertyIds', value)}
            >
              {/* Properties would be loaded from API */}
            </Select>
          </div>

          <Button
            color="blue"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? <Spinner size="sm" className="mr-2" /> : <HiDocumentText className="mr-2 h-5 w-5" />}
            Generate Report
          </Button>
        </div>
      </Card>

      {report && (
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h5 className="text-xl font-semibold">Tax Report Summary</h5>
            <Button onClick={handleDownload}>
              <HiDownload className="mr-2 h-5 w-5" />
              Download PDF
            </Button>
          </div>

          <Alert color="info" className="mb-4">
            Tax Year: {report.taxYear}
          </Alert>

          <TableWrapper>
            <FlowbiteTable
              data={report.properties || []}
              columns={propertyColumns}
              keyField="propertyId"
              pagination={false}
            />
          </TableWrapper>

          <div className="mt-6 space-y-2">
            <h3 className="text-lg font-semibold mb-2">Income Summary</h3>
            <p>Total Rental Income: <strong>${report.income?.totalRentalIncome?.toFixed(2) || '0.00'}</strong></p>
            <p>Total Expenses: <strong>${report.totalExpenses?.toFixed(2) || '0.00'}</strong></p>
            <p>Net Income: <strong>${report.netIncome?.toFixed(2) || '0.00'}</strong></p>
            <p>Net Income After CCA: <strong>${report.netIncomeAfterCCA?.toFixed(2) || '0.00'}</strong></p>
          </div>
        </Card>
      )}
    </PageLayout>
  );
}
