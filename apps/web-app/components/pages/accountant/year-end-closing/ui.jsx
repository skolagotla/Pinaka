/**
 * Year-End Closing Client Component
 * UI for closing financial periods with validation
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, Button, Form, Input, DatePicker, Table, Tag, Alert, Space, Modal } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { notify } from '@/lib/utils/notification-helper';
import { useLoading } from '@/lib/hooks/useLoading';
import { useUnifiedApi } from '@/lib/hooks/useUnifiedApi';
import { rules } from '@/lib/utils/validation-rules';
import { renderStatus } from '@/components/shared/TableRenderers';
import { STANDARD_COLUMNS, customizeColumn } from '@/lib/constants/standard-columns';
import { PageLayout } from '@/components/shared';
import dayjs from 'dayjs';

export default function YearEndClosingClient({ user, userRole }) {
  const [form] = Form.useForm();
  const { fetch } = useUnifiedApi({ showUserMessage: false });
  const { loading, withLoading } = useLoading();
  const { loading: validating, withLoading: withValidating } = useLoading();
  const [validationResult, setValidationResult] = useState(null);
  const [periods, setPeriods] = useState([]);

  const handleValidate = async (values) => {
    await withValidating(async () => {
      try {
        const response = await fetch(
          `/api/financials/close-period?periodId=${values.periodId}`,
          { method: 'GET' },
          { operation: 'Validate period', showUserMessage: false }
        );

        if (response && response.ok) {
          const data = await response.json();
          setValidationResult(data.validation);
        }
      } catch (error) {
        // Error already handled
      }
    });
  };

  const handleClose = async (values) => {
    await withLoading(async () => {
      try {
        const response = await fetch(
          `/api/financials/close-period`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              periodId: values.periodId,
            }),
          },
          { operation: 'Close period' }
        );

        if (response && response.ok) {
          notify.success('Period closed successfully');
          form.resetFields();
          setValidationResult(null);
          // Refresh periods list
        }
      } catch (error) {
        // Error already handled
      }
    });
  };

  const columns = [
    {
      title: 'Period ID',
      dataIndex: 'id',
      key: 'id',
    },
    customizeColumn(STANDARD_COLUMNS.STATUS, {
      render: (status) => {
        const statusMap = {
          closed: 'Completed',
          open: 'In Progress'
        };
        return renderStatus(statusMap[status] || status, {
          customColors: {
            'Completed': 'green',
            'In Progress': 'blue',
            'closed': 'green',
            'open': 'blue'
          }
        });
      },
    }),
    {
      title: 'Closed At',
      dataIndex: 'closedAt',
      key: 'closedAt',
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
    {
      title: 'Closed By',
      dataIndex: 'closedBy',
      key: 'closedBy',
    },
  ];

  return (
    <PageLayout title="Year-End Closing">
      <Card title="Close Financial Period" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleClose}
        >
          <Form.Item
            name="periodId"
            label="Period ID"
            rules={[rules.required('Period ID')]}
          >
            <Input placeholder="e.g., 2024-Q4" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button 
                onClick={() => {
                  const values = form.getFieldsValue();
                  if (values.periodId) {
                    handleValidate(values);
                  } else {
                    notify.warning('Please enter a period ID first');
                  }
                }}
                loading={validating}
              >
                Validate Period
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Close Period
              </Button>
            </Space>
          </Form.Item>
        </Form>

        {validationResult && (
          <Alert
            message={validationResult.valid ? "Validation Passed" : "Validation Failed"}
            description={
              <div>
                {validationResult.errors.length > 0 && (
                  <div>
                    <strong>Errors:</strong>
                    <ul>
                      {validationResult.errors.map((error, idx) => (
                        <li key={idx} style={{ color: '#ff4d4f' }}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {validationResult.warnings.length > 0 && (
                  <div>
                    <strong>Warnings:</strong>
                    <ul>
                      {validationResult.warnings.map((warning, idx) => (
                        <li key={idx} style={{ color: '#faad14' }}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {validationResult.valid && validationResult.warnings.length === 0 && (
                  <div>All checks passed. Ready to close.</div>
                )}
              </div>
            }
            type={validationResult.valid ? "success" : "error"}
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Card>

      <Card title="Closed Periods">
        <Table
          dataSource={periods}
          columns={columns}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </PageLayout>
  );
}

