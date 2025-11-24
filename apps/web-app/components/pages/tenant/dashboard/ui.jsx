"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { formatCurrency, getCurrencyFromCountry, formatAmount } from '@/lib/currency-utils';
import { getOrdinal, formatRelativeTime, getStatusColor } from '@/lib/utils/dashboard-helpers';
import { Card, Button, Badge, Alert, Progress, Avatar, Accordion, Spinner } from 'flowbite-react';
import FlowbiteStatistic from '@/components/shared/FlowbiteStatistic';
import OptimizedButton from '@/components/shared/OptimizedButton';
import PaymentHistoryChart from '@/components/charts/PaymentHistoryChart';
import {
  HiHome,
  HiDocumentText,
  HiCog,
  HiLockClosed,
  HiCalendar,
  HiTrendingUp,
  HiExclamation,
  HiUser,
  HiMail,
  HiPhone,
  HiCheckCircle,
  HiClock,
  HiArrowRight,
  HiRefresh,
} from 'react-icons/hi';

export default function TenantDashboardClient({ tenant, landlord, stats, loading = false }) {
  const router = useRouter();
  
  // Extract lease information
  const activeLeases = stats.activeLeases || [];
  const activeLease = activeLeases.length > 0 ? activeLeases[0] : null;

  // Actionable insights for tenant
  const actionableInsights = useMemo(() => {
    const insights = [];
    
    // Document upload prompt after approval
    if (tenant.approvalStatus === 'APPROVED' && tenant.hasAccess) {
      // Check if required documents are missing (credit report, etc.)
      const hasRequiredDocuments = stats.documentsCount > 0;
      if (!hasRequiredDocuments) {
        insights.push({
          priority: 0, // Highest priority
          type: 'info',
          title: 'Upload Required Documents',
          description: 'Your application has been approved Please upload required documents such as credit report, identification, and employment letters.',
          action: {
            label: 'Upload Documents',
            onClick: () => router.push('/library'),
          },
        });
      }
    }
    
    // Overdue rent
    if (stats.overdueRentAmount > 0) {
      insights.push({
        priority: 1,
        type: 'failure',
        title: 'Overdue Rent Payment',
        description: `You have ${Object.keys(stats.overdueByCurrency).map(curr => `$${formatAmount(stats.overdueByCurrency[curr])} ${curr}`).join(', ')} in overdue rent`,
        action: {
          label: 'View Payment Details',
          onClick: () => router.push('/payments'),
        },
      });
    }

    // Upcoming payment due soon
    if (stats.upcomingRentPayment && stats.daysUntilNextRent !== null) {
      if (stats.daysUntilNextRent <= 7 && stats.upcomingRentPayment.status === 'Unpaid') {
        insights.push({
          priority: 2,
          type: 'warning',
          title: 'Rent Payment Due Soon',
          description: `$${formatAmount(stats.upcomingRentPayment.amount)} due in ${stats.daysUntilNextRent} days`,
          action: {
            label: 'View Payment',
            onClick: () => router.push('/payments'),
          },
        });
      }
    }

    // Urgent maintenance
    if (stats.openMaintenanceCount > 0) {
      insights.push({
        priority: 3,
        type: 'info',
        title: 'Open Maintenance Requests',
        description: `${stats.openMaintenanceCount} maintenance request${stats.openMaintenanceCount > 1 ? 's' : ''} ${stats.openMaintenanceCount > 1 ? 'are' : 'is'} open`,
        action: {
          label: 'View Maintenance',
          onClick: () => router.push('/operations?tab=maintenance'),
        },
      });
    }

    return insights.sort((a, b) => a.priority - b.priority);
  }, [stats, router, tenant]);

  // Quick actions
  const quickActions = [
    {
      label: "Contact Landlord",
      icon: <HiMail className="h-5 w-5" />,
      onClick: () => landlord && (window.location.href = `mailto:${landlord.email}`),
      primary: true,
    },
    {
      label: "Submit Maintenance",
      icon: <HiCog className="h-5 w-5" />,
      onClick: () => router.push("/operations?tab=maintenance"),
    },
    {
      label: "View Receipts",
      icon: <HiDocumentText className="h-5 w-5" />,
      onClick: () => router.push("/payments"),
    },
    {
      label: "My Documents",
      icon: <HiLockClosed className="h-5 w-5" />,
      onClick: () => router.push("/library"),
    },
  ];

  // Chart data for payment history
  const paymentHistoryData = stats.monthlyPayments && stats.monthlyPayments.length > 0 && stats.monthlyPayments.some(mp => mp.amount > 0) 
    ? stats.monthlyPayments 
    : null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="h-32">
                <div className="h-20 bg-gray-200 rounded"></div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with Flowbite Pro styling */}
      <div className="flex justify-between items-center flex-wrap gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <HiHome className="h-8 w-8 text-blue-600" />
            Welcome back, <span className="text-blue-600">{tenant.firstName}</span>!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your rental information and account overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button color="light" size="sm" onClick={() => router.push('/payments')}>
            <HiCurrencyDollar className="h-4 w-4 mr-1" />
            Payments
          </Button>
          <Button color="gray" size="sm" onClick={() => window.location.reload()}>
            <HiRefresh className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Actionable Insights with Flowbite Pro enhanced styling */}
      {actionableInsights.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Action Required</h2>
            <Badge color="red" size="sm">{actionableInsights.length} items</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actionableInsights.map((insight, index) => (
              <Card 
                key={index}
                className={`border-l-4 ${
                  insight.type === 'failure' ? 'border-l-red-500 bg-red-50 dark:bg-red-900/10' :
                  insight.type === 'warning' ? 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' :
                  'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10'
                } hover:shadow-lg transition-shadow duration-200`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {insight.type === 'failure' && <HiExclamation className="h-5 w-5 text-red-600" />}
                      {insight.type === 'warning' && <HiClock className="h-5 w-5 text-yellow-600" />}
                      {insight.type === 'info' && <HiCheckCircle className="h-5 w-5 text-blue-600" />}
                      <h3 className="font-semibold text-gray-900 dark:text-white">{insight.title}</h3>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{insight.description}</p>
                    <Button
                      color={insight.type === 'failure' ? 'failure' : 'gray'}
                      size="sm"
                      onClick={insight.action.onClick}
                      className="flex items-center gap-2"
                    >
                      {insight.action.label}
                      <HiArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Active Lease Information - Most Important */}
      {activeLease && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Rental Home</h2>
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {activeLease.unit.property.addressLine1}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {activeLease.unit.property.city}, {activeLease.unit.property.provinceState} {activeLease.unit.property.postalZip}
                </p>
                <Badge color="blue">Unit: {activeLease.unit.unitName}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <Card className="text-center">
                  <p className="text-xs uppercase text-gray-500 mb-2">Monthly Rent</p>
                  <p className="text-lg font-bold text-green-600 mb-1">
                    {formatAmount(activeLease.rentAmount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getCurrencyFromCountry(activeLease.unit.property.country)}
                  </p>
                </Card>
                <Card className="text-center">
                  <p className="text-xs uppercase text-gray-500 mb-2">Due Day</p>
                  <p className="text-lg font-bold text-blue-600 mb-1">
                    {getOrdinal(activeLease.rentDueDay)}
                  </p>
                  <p className="text-xs text-gray-500">of each month</p>
                </Card>
                <Card className="text-center">
                  <p className="text-xs uppercase text-gray-500 mb-2">Next Due</p>
                  <p className="text-lg font-bold text-yellow-600 mb-1">
                    {stats.daysUntilNextRent || 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {stats.daysUntilNextRent ? 'days' : ''}
                  </p>
                </Card>
              </div>
              {landlord && (
                <div className="col-span-2 border-t border-gray-200 pt-6 mt-6">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar size="lg" rounded className="bg-blue-600">
                        <HiUser className="h-6 w-6 text-white" />
                      </Avatar>
                      <div>
                        <p className="text-xs uppercase text-gray-500 mb-1">Your Landlord</p>
                        <p className="font-semibold text-gray-900 mb-1">
                          {landlord.firstName} {landlord.lastName}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-600">
                          <span className="flex items-center gap-1">
                            <HiMail className="h-3 w-3" />
                            {landlord.email}
                          </span>
                          {landlord.phone && (
                            <span className="flex items-center gap-1">
                              <HiPhone className="h-3 w-3" />
                              {landlord.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button
                      color="blue"
                      onClick={() => window.location.href = `mailto:${landlord.email}`}
                      className="flex items-center gap-2"
                    >
                      <HiMail className="h-4 w-4" />
                      Contact Landlord
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* No Active Lease */}
      {!activeLease && (
        <Card className="mb-8 text-center">
          <h3 className="text-lg font-semibold text-gray-500 mb-2">No Active Leases</h3>
          <p className="text-gray-600">
            You don't have any active leases at the moment.
          </p>
        </Card>
      )}

      {/* Quick Actions with Flowbite Pro enhanced styling */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
          <Button color="light" size="sm" className="text-sm">
            View All
            <HiArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Card
              key={index}
              className={`cursor-pointer hover:shadow-xl transition-all duration-200 border-2 ${
                action.primary 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 hover:border-blue-600' 
                  : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
              } group`}
              onClick={action.onClick}
            >
              <div className="flex flex-col items-center justify-center gap-3 h-20">
                <div className={`p-3 rounded-xl ${
                  action.primary 
                    ? 'bg-blue-100 dark:bg-blue-900/40 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60' 
                    : 'bg-gray-100 dark:bg-gray-700 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                } transition-colors`}>
                  {action.icon}
                </div>
                <span className={`text-sm font-semibold ${
                  action.primary 
                    ? 'text-blue-700 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-300'
                }`}>
                  {action.label}
                </span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Financial Summary */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Financial Summary</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/payments')}
        >
          <FlowbiteStatistic
            title="Next Payment"
            value={stats.daysUntilNextRent || 'N/A'}
            suffix={stats.daysUntilNextRent ? "days" : ""}
            prefix={<HiCalendar className={`h-6 w-6 ${stats.daysUntilNextRent && stats.daysUntilNextRent <= 7 ? 'text-yellow-500' : 'text-blue-500'}`} />}
          />
          {stats.nextRentAmount && (
            <p className="text-sm text-gray-600 mt-3">
              Amount: {formatAmount(stats.nextRentAmount)}
            </p>
          )}
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/payments')}
        >
          <FlowbiteStatistic
            title="Paid This Year"
            value={stats.totalPaidThisYear > 0 ? `$${formatAmount(stats.totalPaidThisYear)}` : '$0'}
            prefix={<HiCurrencyDollar className="h-6 w-6 text-green-500" />}
          />
          {activeLease && (
            <p className="text-sm text-gray-600 mt-3">
              {getCurrencyFromCountry(activeLease.unit.property.country)}
            </p>
          )}
        </Card>
        <Card>
          <FlowbiteStatistic
            title="Lease Progress"
            value={stats.leaseProgress || 'N/A'}
            suffix={stats.leaseProgress ? "%" : ""}
            prefix={<HiTrendingUp className="h-6 w-6 text-cyan-500" />}
          />
          {stats.leaseProgress && (
            <div className="mt-3">
              <Progress 
                progress={parseFloat(stats.leaseProgress)} 
                color="cyan"
                size="sm"
              />
              {stats.daysUntilLeaseEnd && (
                <p className="text-xs text-gray-500 mt-2">
                  {stats.daysUntilLeaseEnd} days remaining
                </p>
              )}
            </div>
          )}
        </Card>
      </div>

      {/* Activity Overview */}
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Activity Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/payments')}
        >
          <FlowbiteStatistic
            title="Rent Receipts"
            value={stats.rentReceiptsCount}
            prefix={<HiDocumentText className="h-6 w-6 text-green-500" />}
          />
          <Button 
            color="light"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              router.push('/payments');
            }}
            className="mt-3 p-0 h-auto text-blue-600 hover:text-blue-800"
          >
            View All Receipts →
          </Button>
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/library')}
        >
          <FlowbiteStatistic
            title="My Documents"
            value={stats.documentsCount + stats.leaseDocumentsCount}
            prefix={<HiLockClosed className="h-6 w-6 text-cyan-500" />}
          />
          <Button 
            color="light"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              router.push('/library');
            }}
            className="mt-3 p-0 h-auto text-blue-600 hover:text-blue-800"
          >
            View Documents →
          </Button>
        </Card>
        <Card 
          className="cursor-pointer hover:shadow-lg transition-shadow"
          onClick={() => router.push('/operations?tab=maintenance')}
        >
          <FlowbiteStatistic
            title="Maintenance"
            value={`${stats.openMaintenanceCount} / ${stats.maintenanceRequestsCount}`}
            suffix="Open / Total"
            prefix={<HiCog className={`h-6 w-6 ${stats.openMaintenanceCount > 0 ? 'text-yellow-500' : 'text-green-500'}`} />}
          />
          <Button 
            color="light"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              router.push('/operations?tab=maintenance');
            }}
            className="mt-3 p-0 h-auto text-blue-600 hover:text-blue-800"
          >
            View Requests →
          </Button>
        </Card>
      </div>

      {/* Payment Status - Detailed */}
      {stats.upcomingRentPayment && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Status</h2>
          <Alert
            color={stats.upcomingRentPayment.status === 'Unpaid' && new Date(stats.upcomingRentPayment.dueDate) < new Date() ? "failure" : "success"}
            className="rounded-lg"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Avatar 
                  size="lg" 
                  rounded
                  className={stats.upcomingRentPayment.status === 'Unpaid' && new Date(stats.upcomingRentPayment.dueDate) < new Date() ? 'bg-red-500' : 'bg-green-500'}
                >
                  {stats.upcomingRentPayment.status === 'Unpaid' && new Date(stats.upcomingRentPayment.dueDate) < new Date() ? 
                    <HiExclamation className="h-6 w-6 text-white" /> : <HiCurrencyDollar className="h-6 w-6 text-white" />
                  }
                </Avatar>
                <div>
                  <p className="text-xs uppercase text-gray-500 mb-1">
                    {stats.upcomingRentPayment.status === 'Unpaid' && new Date(stats.upcomingRentPayment.dueDate) < new Date() ? 
                      'Overdue Payment' : 'Next Payment'
                    }
                  </p>
                  <p className={`text-xl font-bold mb-1 ${
                    stats.upcomingRentPayment.status === 'Unpaid' && new Date(stats.upcomingRentPayment.dueDate) < new Date() ? 
                      'text-red-600' : 'text-green-600'
                  }`}>
                    {formatAmount(stats.upcomingRentPayment.amount)} {stats.upcomingRentPayment?.lease?.unit?.property?.country ? getCurrencyFromCountry(stats.upcomingRentPayment.lease.unit.property.country) : ''}
                  </p>
                  <p className="text-sm text-gray-600">
                    Due: {new Date(stats.upcomingRentPayment.dueDate).toLocaleDateString()}
                    {stats.upcomingRentPayment.status === 'Partial' && stats.upcomingRentPayment.partialPayments.length > 0 && (
                      <Badge color="warning" className="ml-2">
                        Partial: {formatAmount(stats.upcomingRentPayment.partialPayments.reduce((sum, pp) => sum + pp.amount, 0))} paid
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
              {stats.upcomingRentPayment.status === 'Unpaid' && new Date(stats.upcomingRentPayment.dueDate) < new Date() && (
                <Badge color="failure">Action Required</Badge>
              )}
            </div>
          </Alert>
        </div>
      )}

      {/* More Details - Collapsible */}
      <Accordion className="mb-8">
        <Accordion.Panel>
          <Accordion.Title className="text-xl font-semibold">
            More Details & History
          </Accordion.Title>
          <Accordion.Content>
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Payments */}
                {stats.paymentHistory && stats.paymentHistory.length > 0 && (
                  <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Payments</h3>
                    <div className="space-y-3">
                      {stats.paymentHistory.slice(0, 5).map((payment, index) => (
                        <div
                          key={index}
                          onClick={() => router.push('/payments')}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0"
                        >
                          <Avatar className="bg-green-500">
                            <HiCheckCircle className="h-5 w-5 text-white" />
                          </Avatar>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {formatAmount(payment.amount)} {payment?.lease?.unit?.property?.country ? getCurrencyFromCountry(payment.lease.unit.property.country) : ''}
                            </p>
                            <p className="text-xs text-gray-500">
                              {payment.paidDate ? new Date(payment.paidDate).toLocaleDateString() : 'N/A'}
                              {payment.receiptNumber && ` • Receipt #${payment.receiptNumber}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Button 
                      color="gray"
                      className="w-full mt-4"
                      onClick={() => router.push('/payments')}
                    >
                      View All Receipts
                    </Button>
                  </Card>
                )}

                {/* Lease Information */}
                {activeLease && (
                  <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Lease Information</h3>
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Start Date</p>
                        <p className="font-semibold text-gray-900">{new Date(activeLease.leaseStart).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">End Date</p>
                        <p className="font-semibold text-gray-900">{new Date(activeLease.leaseEnd).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-2">Progress</p>
                        <Progress 
                          progress={stats.leaseProgress ? parseFloat(stats.leaseProgress) : 0} 
                          color="blue"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Days Remaining</p>
                        <p className="font-semibold text-gray-900">{stats.daysUntilLeaseEnd || 'N/A'} days</p>
                      </div>
                    </div>
                  </Card>
                )}
              </div>

              {/* Payment History Chart */}
              {paymentHistoryData && (
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment History (Last 6 Months)</h3>
                  <PaymentHistoryChart data={paymentHistoryData} />
                </Card>
              )}

              {/* Recent Maintenance */}
              {stats.recentMaintenanceUpdates && stats.recentMaintenanceUpdates.length > 0 && (
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Maintenance Updates</h3>
                  <div className="space-y-3">
                    {stats.recentMaintenanceUpdates.map((req, index) => (
                      <div
                        key={index}
                        onClick={() => router.push('/operations?tab=maintenance')}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer border-b border-gray-200 last:border-b-0"
                      >
                        <Avatar 
                          className={
                            req.status === 'Completed' ? 'bg-green-500' : 
                            req.status === 'In Progress' ? 'bg-blue-500' : 
                            'bg-yellow-500'
                          }
                        >
                          <HiCog className="h-5 w-5 text-white" />
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{req.title}</p>
                            <Badge color={getStatusColor(req.status)}>
                              {req.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500">
                            Status: {req.status} • {req.priority} Priority
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatRelativeTime(req.updatedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button 
                    color="gray"
                    className="w-full mt-4"
                    onClick={() => router.push('/operations?tab=maintenance')}
                  >
                    View All Requests
                  </Button>
                </Card>
              )}
            </div>
          </Accordion.Content>
        </Accordion.Panel>
      </Accordion>
    </div>
  );
}
