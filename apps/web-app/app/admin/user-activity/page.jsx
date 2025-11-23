"use client";

import { useState, useEffect } from 'react';
import { Table, TableHead, TableHeadCell, TableBody, TableRow, TableCell, Badge, Card, Button, Spinner } from 'flowbite-react';
import {
  HiUser,
  HiRefresh,
} from 'react-icons/hi';
import { PageLayout, TableWrapper } from '@/components/shared';

export default function AdminUserActivityPage() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({});

  const fetchActivity = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...(filters.userRole && { userRole: filters.userRole }),
        ...(filters.action && { action: filters.action }),
        ...(filters.dateRange && filters.dateRange[0] && {
          startDate: filters.dateRange[0].toISOString(),
        }),
        ...(filters.dateRange && filters.dateRange[1] && {
          endDate: filters.dateRange[1].toISOString(),
        }),
      });

      const response = await fetch(`/api/admin/user-activity?${params}`);
      const data = await response.json();
      if (response.ok && data.success) {
        setActivities(data.data);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error fetching user activity:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [filters]);

  const statsData = stats ? [
    {
      title: 'Activities (24h)',
      value: stats.last24Hours || 0,
      prefix: <HiUser className="h-6 w-6" />,
    },
    {
      title: 'Unique Users',
      value: stats.uniqueUsers || 0,
      prefix: <HiUser className="h-6 w-6" />,
    },
    {
      title: 'Total Activities',
      value: stats.total || 0,
      prefix: <HiUser className="h-6 w-6" />,
    },
  ] : [];

  return (
    <PageLayout
      headerTitle="User Activity"
      stats={statsData}
      statsCols={3}
      headerActions={
        <Button color="gray" onClick={fetchActivity} disabled={loading}>
          <HiRefresh className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      }
    >
      <TableWrapper>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Spinner size="xl" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <HiUser className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No activity found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHead>
                <TableHeadCell>User</TableHeadCell>
                <TableHeadCell>Role</TableHeadCell>
                <TableHeadCell>Action</TableHeadCell>
                <TableHeadCell>Resource</TableHeadCell>
                <TableHeadCell>IP Address</TableHeadCell>
                <TableHeadCell>Timestamp</TableHeadCell>
              </TableHead>
              <TableBody className="divide-y">
                {activities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell>
                      {activity?.userName && activity?.userEmail
                        ? `${activity.userName} (${activity.userEmail})`
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {activity.userRole ? (
                        <Badge color="blue">{activity.userRole}</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      {activity.action ? (
                        <Badge color="gray">{activity.action}</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell>{activity.resource || '-'}</TableCell>
                    <TableCell>{activity.ipAddress || '-'}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {activity.createdAt ? new Date(activity.createdAt).toLocaleString() : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </TableWrapper>
    </PageLayout>
  );
}
