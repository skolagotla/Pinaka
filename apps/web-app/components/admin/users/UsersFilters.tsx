/**
 * Users Filters Component
 * Extracted from admin/users/page.jsx for better code organization
 */

"use client";

import { TextInput, Select, Button } from 'flowbite-react';
import { HiSearch, HiRefresh } from 'react-icons/hi';

interface UsersFiltersProps {
  role: string;
  status: string;
  search: string;
  onRoleChange: (role: string) => void;
  onStatusChange: (status: string) => void;
  onSearchChange: (search: string) => void;
  onRefresh: () => void;
}

export default function UsersFilters({
  role,
  status,
  search,
  onRoleChange,
  onStatusChange,
  onSearchChange,
  onRefresh,
}: UsersFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <TextInput
        icon={HiSearch}
        placeholder="Search by email, name..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-72"
      />
      <Select
        value={role}
        onChange={(e) => onRoleChange(e.target.value)}
        className="w-40"
      >
        <option value="all">All Roles</option>
        <option value="admin">Admin</option>
        <option value="pmc">PMC</option>
        <option value="landlord">Landlord</option>
        <option value="tenant">Tenant</option>
      </Select>
      <Select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className="w-40"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="locked">Locked</option>
      </Select>
      <Button
        color="light"
        onClick={onRefresh}
        className="flex items-center gap-2"
      >
        <HiRefresh className="h-4 w-4" />
        Refresh
      </Button>
    </div>
  );
}
