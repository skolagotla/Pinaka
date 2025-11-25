/**
 * Year-End Closing Client Component
 * UI for closing financial periods with validation
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, Button, TextInput, Label, Alert, Spinner, Badge } from 'flowbite-react';
import { HiCheckCircle, HiXCircle, HiExclamationTriangle } from 'react-icons/hi';
import { notify } from '@/lib/utils/notification-helper';
import { useLoading } from '@/lib/hooks/useLoading';
// useUnifiedApi removed - use v2Api from @/lib/api/v2-client';
import { useFormState } from '@/lib/hooks/useFormState';
import { renderStatus } from '@/components/shared/TableRenderers';
import { STANDARD_COLUMNS, customizeColumn } from '@/lib/constants/standard-columns';
import { PageLayout, TableWrapper, FlowbiteTable } from '@/components/shared';
import dayjs from 'dayjs';

export default function YearEndClosingClient({ user, userRole }) {
  const { formData, updateField, resetForm } = useFormState({ periodId: '' });
  // useUnifiedApi removed({ showUserMessage: false });
  const { loading, withLoading } = useLoading();
  const { loading: validating, withLoading: withValidating } = useLoading();
  const [validationResult, setValidationResult] = useState(null);
  const [periods, setPeriods] = useState([]);

  const handleValidate = async () => {
    if (!formData.periodId) {
      notify.warning('Please enter a period ID first');
      return;
    }

    await withValidating(async () => {
      try {
        // TODO: Implement v2 endpoint for period validation
        const { apiClient } = await import('@/lib/utils/api-client');
        const response = await apiClient(`/api/v2/analytics/close-period?periodId=${formData.periodId}`, {
          method: 'GET',
        });

        if (response && response.ok) {
          const data = await response.json();
          if (data.success && data.validation) {
            setValidationResult(data.validation);
          } else {
            setValidationResult(data);
          }
        }
      } catch (error) {
        console.error('Error validating period:', error);
      }
    });
  };

  const handleClose = async () => {
    if (!formData.periodId) {
      notify.warning('Please enter a period ID first');
      return;
    }

    await withLoading(async () => {
      try {
        // TODO: Implement v2 endpoint for period closing
        const { apiClient } = await import('@/lib/utils/api-client');
        const response = await apiClient('/api/v2/analytics/close-period', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            periodId: formData.periodId,
          }),
        });

        if (response && response.ok) {
          notify.success('Period closed successfully');
          resetForm();
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
      header: 'Period ID',
      accessorKey: 'id',
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => {
        const status = row.original.status;
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
    },
    {
      header: 'Closed At',
      accessorKey: 'closedAt',
      cell: ({ row }) => row.original.closedAt ? new Date(row.original.closedAt).toLocaleDateString() : '-',
    },
    {
      header: 'Closed By',
      accessorKey: 'closedBy',
    },
  ];

  return (
    <PageLayout title="Year-End Closing">
      <Card className="mb-6">
        <h5 className="text-xl font-semibold mb-4">Close Financial Period</h5>
        <div className="space-y-4">
          <div>
            <Label htmlFor="periodId" value="Period ID" />
            <TextInput
              id="periodId"
              type="text"
              placeholder="e.g., 2024-Q4"
              value={formData.periodId}
              onChange={(e) => updateField('periodId', e.target.value)}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleValidate}
              disabled={validating || !formData.periodId}
            >
              {validating ? <Spinner size="sm" className="mr-2" /> : null}
              Validate Period
            </Button>
            <Button
              color="blue"
              onClick={handleClose}
              disabled={loading || !formData.periodId}
            >
              {loading ? <Spinner size="sm" className="mr-2" /> : null}
              Close Period
            </Button>
          </div>
        </div>

        {validationResult && (
          <Alert
            color={validationResult.valid ? "success" : "failure"}
            icon={validationResult.valid ? HiCheckCircle : HiXCircle}
            className="mt-4"
          >
            <div>
              <div className="font-semibold mb-2">
                {validationResult.valid ? "Validation Passed" : "Validation Failed"}
              </div>
              {validationResult.errors && validationResult.errors.length > 0 && (
                <div className="mb-2">
                  <strong>Errors:</strong>
                  <ul className="list-disc list-inside">
                    {validationResult.errors.map((error, idx) => (
                      <li key={idx} className="text-red-600">{error}</li>
                    ))}
                  </ul>
                </div>
              )}
              {validationResult.warnings && validationResult.warnings.length > 0 && (
                <div className="mb-2">
                  <strong>Warnings:</strong>
                  <ul className="list-disc list-inside">
                    {validationResult.warnings.map((warning, idx) => (
                      <li key={idx} className="text-yellow-600">{warning}</li>
                    ))}
                  </ul>
                </div>
              )}
              {validationResult.valid && (!validationResult.warnings || validationResult.warnings.length === 0) && (
                <div>All checks passed. Ready to close.</div>
              )}
            </div>
          </Alert>
        )}
      </Card>

      <Card>
        <h5 className="text-xl font-semibold mb-4">Closed Periods</h5>
        <TableWrapper>
          <FlowbiteTable
            data={periods}
            columns={columns}
            keyField="id"
            pagination={false}
          />
        </TableWrapper>
      </Card>
    </PageLayout>
  );
}
