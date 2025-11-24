/**
 * Pending Approval Page - Migrated to v2 FastAPI
 * 
 * Uses v2 API to check user approval status.
 * Removed all v1 API dependencies.
 */
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Alert, Spinner } from 'flowbite-react';
import { HiClock, HiCheckCircle, HiXCircle } from 'react-icons/hi';
import { useV2Auth } from '@/lib/hooks/useV2Auth';

export default function PendingApprovalPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useV2Auth();
  const [approvalStatus, setApprovalStatus] = useState('PENDING');

  useEffect(() => {
    if (!authLoading && user) {
      // Check user status from v2 API
      // In v2, approval status is typically handled via user.status or tenant.approval_status
      // For now, we'll check if user is active
      if (user.user?.status === 'active') {
        setApprovalStatus('APPROVED');
      } else {
        setApprovalStatus('PENDING');
      }
    } else if (!authLoading && !user) {
      // Not logged in, redirect to login
      router.push('/login');
    }
  }, [authLoading, user, router]);

  // Auto-redirect if approved
  useEffect(() => {
    if (approvalStatus === 'APPROVED') {
      const timer = setTimeout(() => {
        router.push('/dashboard');
      }, 3000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [approvalStatus, router]);

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  const getStatusInfo = () => {
    const status = approvalStatus || 'PENDING';
    switch (status) {
      case 'APPROVED':
        return {
          title: 'Your Account Has Been Approved',
          message: 'You can now access the system. Redirecting you to your dashboard...',
          type: 'success',
          icon: <HiCheckCircle className="h-12 w-12 text-green-500" />,
        };
      case 'REJECTED':
        return {
          title: 'Your Application Has Been Rejected',
          message: 'Your application has been rejected. Please contact support for more information.',
          type: 'failure',
          icon: <HiXCircle className="h-12 w-12 text-red-500" />,
        };
      default:
        return {
          title: 'Your Application is Pending Approval',
          message: 'Your account is currently pending approval. You will be notified once your application has been reviewed. Please check back later.',
          type: 'warning',
          icon: <HiClock className="h-12 w-12 text-yellow-500" />,
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <div className="text-center mb-6">
          {statusInfo.icon}
        </div>
        <h2 className="text-2xl font-bold text-center mb-4">
          {statusInfo.title}
        </h2>
        <Alert color={statusInfo.type} className="mb-4">
          {statusInfo.message}
        </Alert>
        {user?.user && (
          <p className="text-center text-gray-600">
            Email: <strong>{user.user.email}</strong>
          </p>
        )}
        {approvalStatus === 'PENDING' && (
          <p className="text-center text-gray-500 text-sm mt-4">
            This page will automatically refresh when your status changes.
          </p>
        )}
      </Card>
    </div>
  );
}
