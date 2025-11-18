/**
 * Tax Reporting Client Component
 * UI for generating T776 tax reports
 */

"use client";

import { useState } from 'react';
import { Card, Button, Form, Input, Select, Table, Tag, Alert, Space } from 'antd';
import { DownloadOutlined, FilePdfOutlined } from '@ant-design/icons';
import { notify } from '@/lib/utils/notification-helper';
import { useLoading } from '@/lib/hooks/useLoading';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import { rules } from '@/lib/utils/validation-rules';
import { PageLayout } from '@/components/shared';
import { STANDARD_COLUMNS, customizeColumn } from '@/lib/constants/standard-columns';
import { exportToPDF } from '@/lib/utils/export-utils';

export default function TaxReportingClient({ user, userRole }) {
  const [form] = Form.useForm();
  const { fetch } = useUnifiedApi({ showUserMessage: true });
  const { loading, withLoading } = useLoading();
  const [report, setReport] = useState(null);

  const handleGenerate = async (values) => {
    await withLoading(async () => {
      try {
        const response = await fetch(
          `/api/financials/t776/generate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              landlordId: values.landlordId || user.userId,
              taxYear: values.taxYear,
              propertyIds: values.propertyIds,
            }),
          },
          { operation: 'Generate tax report' }
        );

        if (response && response.ok) {
          const data = await response.json();
          setReport(data.report);
          notify.success('Tax report generated successfully');
        }
      } catch (error) {
        // Error already handled
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
    customizeColumn(STANDARD_COLUMNS.PROPERTY_NAME, {
      dataIndex: 'propertyName',
    }),
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: 'Income',
      dataIndex: 'income',
      key: 'income',
      render: (amount) => `$${amount.toFixed(2)}`,
    },
  ];

  return (
    <PageLayout title="Tax Reporting (T776)">
      <Card title="Generate T776 Tax Report" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGenerate}
          initialValues={{
            taxYear: new Date().getFullYear() - 1, // Previous year by default
          }}
        >
          {userRole !== 'landlord' && (
            <Form.Item
              name="landlordId"
              label="Landlord ID"
              rules={[rules.required('Landlord ID')]}
            >
              <Input placeholder="Enter landlord ID" />
            </Form.Item>
          )}

          <Form.Item
            name="taxYear"
            label="Tax Year"
            rules={[{ required: true, message: 'Please select tax year' }]}
          >
            <Input type="number" placeholder="e.g., 2024" />
          </Form.Item>

          <Form.Item
            name="propertyIds"
            label="Properties (Optional)"
            help="Leave empty to include all properties"
          >
            <Select
              mode="multiple"
              placeholder="Select properties (optional)"
              allowClear
            >
              {/* Properties would be loaded from API */}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} icon={<FilePdfOutlined />}>
              Generate Report
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {report && (
        <Card 
          title="Tax Report Summary" 
          extra={
            <Button icon={<DownloadOutlined />} onClick={handleDownload}>
              Download PDF
            </Button>
          }
        >
          <Alert
            message={`Tax Year: ${report.taxYear}`}
            type="info"
            style={{ marginBottom: 16 }}
          />

          <Table
            dataSource={report.properties}
            columns={propertyColumns}
            rowKey="propertyId"
            pagination={false}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0}>
                    <strong>Total</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1}></Table.Summary.Cell>
                  <Table.Summary.Cell index={2}>
                    <strong>${report.income.totalRentalIncome.toFixed(2)}</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />

          <div style={{ marginTop: 24 }}>
            <h3>Income Summary</h3>
            <p>Total Rental Income: <strong>${report.income.totalRentalIncome.toFixed(2)}</strong></p>
            <p>Total Expenses: <strong>${report.totalExpenses.toFixed(2)}</strong></p>
            <p>Net Income: <strong>${report.netIncome.toFixed(2)}</strong></p>
            <p>Net Income After CCA: <strong>${report.netIncomeAfterCCA.toFixed(2)}</strong></p>
          </div>
        </Card>
      )}
    </PageLayout>
  );
}

