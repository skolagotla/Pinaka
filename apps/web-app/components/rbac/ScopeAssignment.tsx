/**
 * Scope Assignment Component - Phase 7
 * 
 * Component for assigning scopes (Portfolio → Property → Unit) to user roles
 */

"use client";

import { useState, useEffect } from 'react';
import { Card, Select, Button, Spinner } from 'flowbite-react';
import { HiLocationMarker } from 'react-icons/hi';
import { useFormState } from '@/lib/hooks/useFormState';
import { notify } from '@/lib/utils/notification-helper';

interface ScopeAssignmentProps {
  userId: string;
  userType: string;
  roleId: string;
  assignedBy: string;
  onSuccess?: () => void;
  initialScope?: {
    portfolioId?: string;
    propertyId?: string;
    unitId?: string;
  };
}

export default function ScopeAssignment({
  userId,
  userType,
  roleId,
  assignedBy,
  onSuccess,
  initialScope,
}: ScopeAssignmentProps) {
  const form = useFormState({
    portfolioId: '',
    propertyId: '',
    unitId: '',
  });
  const [loading, setLoading] = useState(false);
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  useEffect(() => {
    loadOptions();
    if (initialScope) {
      form.setFieldsValue({
        portfolioId: initialScope.portfolioId || '',
        propertyId: initialScope.propertyId || '',
        unitId: initialScope.unitId || '',
      });
    }
  }, []);

  const loadOptions = async () => {
    try {
      // Load portfolios, properties, units
      // This would fetch from your API
      // For now, placeholder
    } catch (error) {
      console.error('Error loading scope options:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const values = form.getFieldsValue();

    try {
      setLoading(true);

      const scope = {
        portfolioId: values.portfolioId || undefined,
        propertyId: values.propertyId || undefined,
        unitId: values.unitId || undefined,
      };

      // Use API endpoint instead of direct function call (server-side only)
      const response = await fetch(`/api/rbac/users/${userId}/roles?userType=${userType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roleId,
          scope,
          assignedBy,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign scope');
      }

      notify.success('Scope assigned successfully');
      onSuccess?.();
    } catch (error: any) {
      console.error('Error assigning scope:', error);
      notify.error(error.message || 'Failed to assign scope');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <HiLocationMarker className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Assign Scope</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="portfolioId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Portfolio (optional)
          </label>
          <Select
            id="portfolioId"
            value={form.values.portfolioId || ''}
            onChange={(e) => form.setFieldsValue({ portfolioId: e.target.value })}
            className="w-full"
          >
            <option value="">Select portfolio (optional)</option>
            {portfolios.map((portfolio) => (
              <option key={portfolio.id} value={portfolio.id}>
                {portfolio.name}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="propertyId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Property (optional)
          </label>
          <Select
            id="propertyId"
            value={form.values.propertyId || ''}
            onChange={(e) => form.setFieldsValue({ propertyId: e.target.value })}
            className="w-full"
          >
            <option value="">Select property (optional)</option>
            {properties.map((property) => (
              <option key={property.id} value={property.id}>
                {property.name || property.addressLine1}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <label htmlFor="unitId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
            Unit (optional)
          </label>
          <Select
            id="unitId"
            value={form.values.unitId || ''}
            onChange={(e) => form.setFieldsValue({ unitId: e.target.value })}
            className="w-full"
          >
            <option value="">Select unit (optional)</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.id}>
                {unit.unitName || unit.name}
              </option>
            ))}
          </Select>
          <p className="mt-1 text-xs text-gray-500">
            Select the scope for this role assignment. Leave empty for global access.
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            color="blue"
            disabled={loading}
            className="flex items-center gap-2"
          >
            {loading ? (
              <>
                <Spinner size="sm" />
                Assigning...
              </>
            ) : (
              'Assign Scope'
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
