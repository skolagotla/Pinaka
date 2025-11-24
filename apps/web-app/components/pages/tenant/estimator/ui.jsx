"use client";

import { useState, useMemo } from 'react';
import { Card, Button, Select, Label, TextInput, Alert, Spinner } from 'flowbite-react';
import { HiCalculator, HiCurrencyDollar, HiCalendar, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import { PageLayout, FlowbiteTable } from '@/components/shared';
import CurrencyInput from '@/components/rules/CurrencyInput';
import CurrencyDisplay from '@/components/rules/CurrencyDisplay';
import { useFormState } from '@/lib/hooks/useFormState';
import dayjs from 'dayjs';

export default function EstimatorClient({ tenant }) {
  const activeLease = tenant?.leaseTenants?.find(lt => lt.lease?.status === 'Active')?.lease;
  
  const { formData, updateField, resetForm } = useFormState({
    calculationType: 'prorated',
    monthlyRent: activeLease?.rentAmount || 0,
    rentDueDay: activeLease?.rentDueDay || 1,
    securityDeposit: activeLease?.securityDeposit || 0,
    moveInDate: '',
    moveOutDate: '',
    cleaningFee: 0,
    repairFee: 0,
    otherDeduction: 0,
  });
  const [results, setResults] = useState(null);

  const calculateProratedRent = (monthlyRent, moveInDate, moveOutDate, rentDueDay) => {
    if (!moveInDate || !moveOutDate) return null;

    const start = dayjs(moveInDate);
    const end = dayjs(moveOutDate);
    const daysInMonth = end.daysInMonth();
    const daysRented = end.diff(start, 'days') + 1;
    const proratedAmount = (monthlyRent / daysInMonth) * daysRented;
    
    return {
      daysRented,
      daysInMonth,
      proratedAmount,
      fullMonthAmount: monthlyRent
    };
  };

  const calculateSecurityDepositReturn = (deposit, deductions) => {
    const totalDeductions = deductions.reduce((sum, d) => sum + (d.amount || 0), 0);
    return {
      originalDeposit: deposit,
      totalDeductions,
      returnAmount: deposit - totalDeductions
    };
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    const calculations = {};

    // Prorated Rent
    if (formData.calculationType === 'prorated' && formData.monthlyRent && formData.moveInDate && formData.moveOutDate) {
      calculations.proratedRent = calculateProratedRent(
        formData.monthlyRent,
        formData.moveInDate,
        formData.moveOutDate,
        formData.rentDueDay || 1
      );
    }

    // Security Deposit Return
    if (formData.calculationType === 'deposit' && formData.securityDeposit) {
      const deductions = [
        { description: 'Cleaning', amount: parseFloat(formData.cleaningFee) || 0 },
        { description: 'Repairs', amount: parseFloat(formData.repairFee) || 0 },
        { description: 'Other', amount: parseFloat(formData.otherDeduction) || 0 }
      ].filter(d => d.amount > 0);
      
      calculations.depositReturn = calculateSecurityDepositReturn(formData.securityDeposit, deductions);
      calculations.depositReturn.deductions = deductions;
    }

    setResults(calculations);
  };

  const depositColumns = [
    {
      header: 'Description',
      accessorKey: 'description',
    },
    {
      header: 'Amount',
      accessorKey: 'amount',
      cell: ({ row }) => <CurrencyDisplay value={row.original.amount} country="CA" />,
    },
  ];

  const statsData = [
    {
      title: 'Active Lease',
      value: activeLease ? 'Yes' : 'No',
      prefix: activeLease ? <HiCheckCircle className="h-5 w-5" /> : <HiXCircle className="h-5 w-5" />,
      valueStyle: { color: activeLease ? '#52c41a' : '#ff4d4f' },
    },
  ];

  return (
    <PageLayout
      headerTitle={<><HiCalculator className="inline mr-2" /> Payment Estimator</>}
      headerDescription="Calculate prorated rent, security deposit returns, and more"
      stats={statsData}
      statsCols={1}
    >
      <Card className="mb-6">
        <form onSubmit={handleCalculate} className="space-y-4">
          <div>
            <Label htmlFor="calculationType" className="mb-2 block">
              Calculation Type <span className="text-red-500">*</span>
            </Label>
            <Select
              id="calculationType"
              value={formData.calculationType}
              onChange={(e) => updateField('calculationType', e.target.value)}
              required
            >
              <option value="prorated">Prorated Rent</option>
              <option value="deposit">Security Deposit Return</option>
            </Select>
          </div>

          {formData.calculationType === 'prorated' && (
            <>
              <div>
                <Label htmlFor="monthlyRent" className="mb-2 block">
                  Monthly Rent <span className="text-red-500">*</span>
                </Label>
                <CurrencyInput
                  id="monthlyRent"
                  country="CA"
                  placeholder="0.00"
                  min={0.01}
                  value={formData.monthlyRent}
                  onChange={(value) => updateField('monthlyRent', value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="moveInDate" className="mb-2 block">
                    Move-in Date <span className="text-red-500">*</span>
                  </Label>
                  <TextInput
                    id="moveInDate"
                    type="date"
                    value={formData.moveInDate}
                    onChange={(e) => updateField('moveInDate', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="moveOutDate" className="mb-2 block">
                    Move-out Date <span className="text-red-500">*</span>
                  </Label>
                  <TextInput
                    id="moveOutDate"
                    type="date"
                    value={formData.moveOutDate}
                    onChange={(e) => updateField('moveOutDate', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="rentDueDay" className="mb-2 block">Rent Due Day (of month)</Label>
                <TextInput
                  id="rentDueDay"
                  type="number"
                  min={1}
                  max={31}
                  value={formData.rentDueDay}
                  onChange={(e) => updateField('rentDueDay', e.target.value)}
                />
              </div>
            </>
          )}

          {formData.calculationType === 'deposit' && (
            <>
              <div>
                <Label htmlFor="securityDeposit" className="mb-2 block">
                  Security Deposit Amount <span className="text-red-500">*</span>
                </Label>
                <CurrencyInput
                  id="securityDeposit"
                  country="CA"
                  placeholder="0.00"
                  min={0}
                  value={formData.securityDeposit}
                  onChange={(value) => updateField('securityDeposit', value)}
                />
              </div>
              <div>
                <h5 className="text-lg font-semibold mb-3">Deductions (if any)</h5>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cleaningFee" className="mb-2 block">Cleaning Fee</Label>
                    <CurrencyInput
                      id="cleaningFee"
                      country="CA"
                      placeholder="0.00"
                      min={0}
                      value={formData.cleaningFee}
                      onChange={(value) => updateField('cleaningFee', value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="repairFee" className="mb-2 block">Repair Fee</Label>
                    <CurrencyInput
                      id="repairFee"
                      country="CA"
                      placeholder="0.00"
                      min={0}
                      value={formData.repairFee}
                      onChange={(value) => updateField('repairFee', value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="otherDeduction" className="mb-2 block">Other Deduction</Label>
                    <CurrencyInput
                      id="otherDeduction"
                      country="CA"
                      placeholder="0.00"
                      min={0}
                      value={formData.otherDeduction}
                      onChange={(value) => updateField('otherDeduction', value)}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <Button type="submit" color="blue" size="lg">
              <HiCalculator className="mr-2 h-5 w-5" />
              Calculate
            </Button>
          </div>
        </form>
      </Card>

      {results && (
        <>
          {results.proratedRent && (
            <Card className="mb-4">
              <h5 className="text-xl font-semibold mb-4">Prorated Rent Calculation</h5>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Days Rented</div>
                  <div className="text-2xl font-semibold">{results.proratedRent.daysRented} days</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Days in Month</div>
                  <div className="text-2xl font-semibold">{results.proratedRent.daysInMonth} days</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Prorated Amount</div>
                  <div className="text-2xl font-semibold">
                    <CurrencyDisplay value={results.proratedRent.proratedAmount} country="CA" />
                  </div>
                </div>
              </div>
              <hr className="my-4" />
              <Alert color="info">
                <div>
                  <div className="mb-2">
                    <span className="font-semibold">Full Month Rent: </span>
                    <span className="font-bold"><CurrencyDisplay value={results.proratedRent.fullMonthAmount} country="CA" /></span>
                  </div>
                  <div>
                    <span className="font-semibold">Prorated Rent ({results.proratedRent.daysRented} days): </span>
                    <span className="font-bold text-green-600 text-lg">
                      <CurrencyDisplay value={results.proratedRent.proratedAmount} country="CA" />
                    </span>
                  </div>
                </div>
              </Alert>
            </Card>
          )}

          {results.depositReturn && (
            <Card className="mb-4">
              <h5 className="text-xl font-semibold mb-4">Security Deposit Return Calculation</h5>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Original Deposit</div>
                  <div className="text-2xl font-semibold">
                    <CurrencyDisplay value={results.depositReturn.originalDeposit} country="CA" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Total Deductions</div>
                  <div className="text-2xl font-semibold text-red-600">
                    <CurrencyDisplay value={results.depositReturn.totalDeductions} country="CA" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">Return Amount</div>
                  <div className="text-2xl font-semibold text-green-600">
                    <CurrencyDisplay value={results.depositReturn.returnAmount} country="CA" />
                  </div>
                </div>
              </div>
              {results.depositReturn.deductions.length > 0 && (
                <>
                  <hr className="my-4" />
                  <FlowbiteTable
                    data={results.depositReturn.deductions}
                    columns={depositColumns}
                    keyField="description"
                    pagination={false}
                  />
                </>
              )}
              <hr className="my-4" />
              <Alert color={results.depositReturn.returnAmount >= 0 ? 'success' : 'failure'}>
                <div>
                  <div className="mb-2">
                    <span className="font-semibold">Security Deposit: </span>
                    <span className="font-bold"><CurrencyDisplay value={results.depositReturn.originalDeposit} country="CA" /></span>
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Less Deductions: </span>
                    <span className="font-bold text-red-600">
                      <CurrencyDisplay value={results.depositReturn.totalDeductions} country="CA" />
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Return Amount: </span>
                    <span className="font-bold text-green-600 text-lg">
                      <CurrencyDisplay value={results.depositReturn.returnAmount} country="CA" />
                    </span>
                  </div>
                </div>
              </Alert>
            </Card>
          )}
        </>
      )}
    </PageLayout>
  );
}
