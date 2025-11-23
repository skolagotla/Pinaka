"use client";

import { useState, useEffect } from 'react';
import { serializePrismaData } from '@/lib/utils/serialize-prisma-data';
import VerificationsClient from '../../verifications/ui';
import { Spinner } from 'flowbite-react';
import { adminApi } from '@/lib/api/admin-api';

/**
 * Admin Verifications Page
 * Admin-specific verifications page that shows all verifications
 * Note: Authentication is handled by the admin layout, so we just fetch admin data
 */
export default function AdminVerificationsPage() {
  const [admin, setAdmin] = useState(null);
  const [stats, setStats] = useState({
    pending: 0,
    verified: 0,
    rejected: 0,
    expired: 0,
    total: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch admin data - layout already handles auth, so we just get the user
    fetchAdmin();
  }, []);

  const fetchAdmin = async () => {
    try {
      const data = await adminApi.getCurrentUser();

      if (data.success) {
        setAdmin(data.user);
        // Fetch verification stats
        await fetchStats();
      } else {
        console.error('[Admin Verifications] Auth check failed:', data);
        // Layout will handle redirect if not authenticated
      }
    } catch (err) {
      console.error('[Admin Verifications] Error fetching admin:', err);
      // Layout will handle redirect if not authenticated
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const statsData = await adminApi.getVerificationStats();
      setStats(statsData || {
        pending: 0,
        verified: 0,
        rejected: 0,
        expired: 0,
        total: 0,
      });
    } catch (error) {
      console.error('[Admin Verifications] Error loading stats:', error);
      // Continue with default stats
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!admin) {
    return null;
  }

  // Serialize admin data
  const serializedUser = serializePrismaData({
    id: admin.id,
    email: admin.email,
    firstName: admin.firstName,
    lastName: admin.lastName,
    role: 'admin',
  });

  return (
    <main className="page">
      <VerificationsClient
        user={serializedUser}
        initialStats={stats}
      />
    </main>
  );
}

