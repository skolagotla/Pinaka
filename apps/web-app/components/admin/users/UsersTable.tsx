/**
 * Users Table Component
 * Extracted from admin/users/page.jsx for better code organization
 */

"use client";

import { Table, Badge, Button, Tooltip } from 'flowbite-react';
import { HiPencil, HiRefresh } from 'react-icons/hi';
import { PhoneDisplay } from '@/components/shared';
import { formatPhoneNumber } from '@/lib/utils/formatters';
import { getRoleLabel } from '@/lib/rbac/resourceLabels';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  status: string;
  createdAt: string;
  companyName?: string; // For PMC users
  rbacRoles?: Array<{ role: { name: string; displayName: string } }>;
}

interface UsersTableProps {
  users: User[];
  loading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
  onEdit: (user: User) => void;
  onRefresh: () => void;
}

export default function UsersTable({
  users,
  loading,
  pagination,
  onEdit,
  onRefresh,
}: UsersTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table hoverable>
        <Table.Head>
          <Table.HeadCell>Email</Table.HeadCell>
          <Table.HeadCell>Name</Table.HeadCell>
          <Table.HeadCell>Phone</Table.HeadCell>
          <Table.HeadCell>Role</Table.HeadCell>
          <Table.HeadCell>Status</Table.HeadCell>
          <Table.HeadCell>Created</Table.HeadCell>
          <Table.HeadCell>Actions</Table.HeadCell>
        </Table.Head>
        <Table.Body className="divide-y">
          {loading ? (
            <Table.Row>
              <Table.Cell colSpan={7} className="text-center py-8">
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </Table.Cell>
            </Table.Row>
          ) : users.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={7} className="text-center py-8">
                <p className="text-gray-500">No users found</p>
              </Table.Cell>
            </Table.Row>
          ) : (
            users.map((user) => {
              const roleLabel = getRoleLabel(user.role);
              const rbacRoles = user.rbacRoles || [];
              const statusColorMap: Record<string, string> = {
                active: 'success',
                inactive: 'gray',
                locked: 'failure',
              };

              return (
                <Table.Row key={user.id}>
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {user.email}
                  </Table.Cell>
                  <Table.Cell>
                    {user.firstName && user.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user.companyName || '-'}
                  </Table.Cell>
                  <Table.Cell>
                    {user.phone ? <PhoneDisplay phone={user.phone} /> : '-'}
                  </Table.Cell>
                  <Table.Cell>
                    <div className="flex flex-col gap-1">
                      <Badge color={user.role === 'admin' ? 'failure' : user.role === 'pmc' ? 'info' : 'success'}>
                        {roleLabel}
                      </Badge>
                      {rbacRoles.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {rbacRoles.map((ur, idx) => (
                            <Badge key={idx} color="purple" size="sm">
                              {ur.role.displayName || ur.role.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </Table.Cell>
                  <Table.Cell>
                    <Badge color={statusColorMap[user.status] || 'gray'}>
                      {user.status}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell className="whitespace-nowrap text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Table.Cell>
                  <Table.Cell>
                    <Tooltip content="Edit User">
                      <Button
                        color="light"
                        size="sm"
                        onClick={() => onEdit(user)}
                        className="p-2"
                      >
                        <HiPencil className="h-4 w-4" />
                      </Button>
                    </Tooltip>
                  </Table.Cell>
                </Table.Row>
              );
            })
          )}
        </Table.Body>
      </Table>
      
      {/* Pagination */}
      {pagination.total > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
          </p>
        </div>
      )}
    </div>
  );
}
