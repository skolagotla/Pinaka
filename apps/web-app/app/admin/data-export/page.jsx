"use client";

import { useState } from 'react';
import { Card, Button, Select, TextInput, Label, Alert, Radio } from 'flowbite-react';
import {
  HiDownload,
} from 'react-icons/hi';

export default function AdminDataExportPage() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    format: 'json',
    dateRange: null,
  });

  const handleExport = async () => {
    if (!formData.type) {
      alert('Please select an export type');
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: formData.type,
        format: formData.format || 'json',
        ...(formData.dateRange && formData.dateRange[0] && {
          startDate: formData.dateRange[0].toISOString(),
        }),
        ...(formData.dateRange && formData.dateRange[1] && {
          endDate: formData.dateRange[1].toISOString(),
        }),
      });

      const response = await fetch(`/api/admin/data-export?${params}`);
      
      if (response.ok) {
        if (formData.format === 'csv') {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const dateStr = new Date().toISOString().split('T')[0];
          a.download = formData.type + '-export-' + dateStr + '.csv';
          a.click();
          window.URL.revokeObjectURL(url);
        } else {
          const data = await response.json();
          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const dateStr = new Date().toISOString().split('T')[0];
          a.download = formData.type + '-export-' + dateStr + '.json';
          a.click();
          window.URL.revokeObjectURL(url);
        }
        alert('Export started successfully');
      } else {
        const data = await response.json();
        alert(data.error || 'Export failed');
      }
    } catch (err) {
      console.error('Error exporting data:', err);
      alert('Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <HiDownload className="h-6 w-6" />
        Data Export
      </h1>

      <Alert color="info" className="mb-6">
        <div>
          <div className="font-medium">Data Export</div>
          <div className="text-sm mt-1">
            Export platform data for backup, compliance, or analysis purposes. All exports are logged in the audit trail.
          </div>
        </div>
      </Alert>

      <Card>
        <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); handleExport(); }}>
          <div>
            <Label htmlFor="type" className="mb-2 block">
              Export Type <span className="text-red-500">*</span>
            </Label>
            <Select
              id="type"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="">Select export type</option>
              <option value="users">Users</option>
              <option value="properties">Properties</option>
              <option value="leases">Leases</option>
              <option value="payments">Payments</option>
              <option value="maintenance">Maintenance</option>
              <option value="documents">Documents</option>
              <option value="all">All Data</option>
            </Select>
          </div>

          <div>
            <Label className="mb-2 block">Export Format</Label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <Radio
                  name="format"
                  value="json"
                  checked={formData.format === 'json'}
                  onChange={(e) => setFormData({ ...formData, format: 'json' })}
                />
                <span>JSON</span>
              </label>
              <label className="flex items-center gap-2">
                <Radio
                  name="format"
                  value="csv"
                  checked={formData.format === 'csv'}
                  onChange={(e) => setFormData({ ...formData, format: 'csv' })}
                />
                <span>CSV</span>
              </label>
            </div>
          </div>

          <div>
            <Label htmlFor="dateRange" className="mb-2 block">
              Date Range (Optional)
            </Label>
            <div className="grid grid-cols-2 gap-4">
              <TextInput
                id="startDate"
                type="date"
                placeholder="Start Date"
                onChange={(e) => setFormData({
                  ...formData,
                  dateRange: [e.target.value, formData.dateRange?.[1] || null]
                })}
              />
              <TextInput
                id="endDate"
                type="date"
                placeholder="End Date"
                onChange={(e) => setFormData({
                  ...formData,
                  dateRange: [formData.dateRange?.[0] || null, e.target.value]
                })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              color="blue"
              disabled={loading || !formData.type}
            >
              {loading ? 'Exporting...' : (
                <>
                  <HiDownload className="h-4 w-4 mr-2" />
                  Export Data
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
