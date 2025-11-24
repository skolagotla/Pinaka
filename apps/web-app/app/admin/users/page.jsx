"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from '@/lib/hooks';
import { Card, Button, Badge, Modal, Tabs, TextInput, Select, Textarea, Spinner, Alert, Label, Checkbox } from 'flowbite-react';
import {
  HiUser,
  HiPlus,
  HiPencil,
  HiRefresh,
  HiSearch,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiLockClosed,
  HiInformationCircle,
  HiShieldCheck,
  HiMail,
  HiPhone,
  HiUserGroup,
  HiCog,
} from 'react-icons/hi';
import { PhoneDisplay, PageLayout, StandardModal, FormTextInput, FormSelect } from '@/components/shared';
import { FormPhoneInput } from '@/components/shared/FormFields';
import { formatPhoneNumber } from '@/lib/utils/formatters';
import FlowbiteTable from '@/components/shared/FlowbiteTable';
import { useFormState } from '@/lib/hooks/useFormState';
import { useGridActions } from '@/lib/hooks/useGridActions';
import RoleAssignmentModal from '@/components/rbac/RoleAssignmentModal';
import ImpersonationSelector from '@/components/admin/ImpersonationSelector';
import { getRoleLabel } from '@/lib/rbac/resourceLabels';

export default function AdminUsersPage() {
  // Tab state: 'active', 'pending', 'rejected', 'archive'
  const [activeTab, setActiveTab] = useState('active');
  
  // Invitations state (for pending/rejected tabs)
  const [invitations, setInvitations] = useState([]);
  const [invitationLoading, setInvitationLoading] = useState(false);
  const [invitationCounts, setInvitationCounts] = useState({ pending: 0, approved: 0, rejected: 0, archive: 0 });
  
  // Users state (for active tab)
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userPagination, setUserPagination] = useState({ page: 1, limit: 50, total: 0 });
  const [userFilters, setUserFilters] = useState({ role: 'all', search: '', status: 'all' }); // Default to 'all' to show all users
  const [searchInput, setSearchInput] = useState(''); // Local search input state
  const debouncedSearch = useDebounce(searchInput, 500); // Debounce search by 500ms
  
  // Modal states
  const [invitationModalVisible, setInvitationModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [applicationDetails, setApplicationDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // Forms
  const invitationFormState = useFormState({
    email: '',
    type: 'landlord',
    companyName: '',
    firstName: '',
    lastName: '',
  });
  const rejectFormState = useFormState({ reason: '' });
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  
  // RBAC Role Assignment state
  const [rbacRoleModalVisible, setRbacRoleModalVisible] = useState(false);
  const [userRBACRoles, setUserRBACRoles] = useState([]);
  const [initialRBACRoles, setInitialRBACRoles] = useState([]); // Store initial roles for comparison
  const [loadingRBACRoles, setLoadingRBACRoles] = useState(false);
  const [currentAdminId, setCurrentAdminId] = useState('');
  const [availableRBACRoles, setAvailableRBACRoles] = useState([]);
  const [loadingAvailableRoles, setLoadingAvailableRoles] = useState(false);
  
  // PMC selector state
  const [pmcs, setPmcs] = useState([]);
  const [loadingPmcs, setLoadingPmcs] = useState(false);
  const [selectedPMCId, setSelectedPMCId] = useState(null);

  // Role change modal state
  const [roleChangeModalVisible, setRoleChangeModalVisible] = useState(false);
  const [roleChangeUser, setRoleChangeUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('');
  const [changingRole, setChangingRole] = useState(false);
  const [currentAdminRole, setCurrentAdminRole] = useState<string | null>(null);

  // Load current admin user ID and role
  useEffect(() => {
    const loadCurrentAdmin = async () => {
      try {
        const { adminApi } = await import('@/lib/api/admin-api');
        const data = await adminApi.getCurrentUser();
        if (data.success && data.user) {
          setCurrentAdminId(data.user.id);
          setCurrentAdminRole(data.user.role || null);
        }
      } catch (error) {
        console.error('Error loading current admin:', error);
      }
    };
    loadCurrentAdmin();
  }, []);

  // Fetch PMCs list for PMC selector
  useEffect(() => {
    const fetchPMCs = async () => {
      setLoadingPmcs(true);
      try {
        // Fetch PMCs from admin users API - they return as users with role='pmc'
        const { adminApi } = await import('@/lib/api/admin-api');
        const data = await adminApi.getUsers({ role: 'pmc', limit: 1000 });
        if (data.success && Array.isArray(data.data)) {
          // Extract PMCs from the users data
          // Note: For PMC users, the user.id is the PropertyManagementCompany.id
          const pmcList = data.data
            .filter(user => user.role === 'pmc')
            .map(user => ({
              id: user.id, // This is the PropertyManagementCompany.id
              companyName: user.companyName || user.email,
              email: user.email,
            }));
          setPmcs(pmcList);
        } else {
          console.warn('Failed to fetch PMCs:', data.error);
          setPmcs([]);
        }
      } catch (error) {
        console.error('Error fetching PMCs:', error);
        setErrorMessage('Failed to load PMCs list');
        setSuccessMessage(null);
        setPmcs([]);
      } finally {
        setLoadingPmcs(false);
      }
    };
    fetchPMCs();
  }, []);

  // Fetch invitations (for pending/rejected/archive tabs)
  const fetchInvitations = useCallback(async (tab = 'pending') => {
    setInvitationLoading(true);
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const archive = tab === 'archive';
      const data = await adminApi.getInvitations({ archive });
      if (data.success) {
        // Filter based on tab
        // BUG FIX: Added null check to prevent runtime errors
        let filtered = Array.isArray(data.data) ? data.data : [];
        if (tab === 'pending') {
          filtered = filtered.filter(inv => inv &&
            (inv.status !== 'completed' || (inv.status === 'completed' && inv.approvalStatus !== 'APPROVED' && inv.approvalStatus !== 'REJECTED'))
          );
        } else if (tab === 'rejected') {
          filtered = filtered.filter(inv => inv &&
            inv.status === 'completed' && inv.approvalStatus === 'REJECTED'
          );
        } else if (tab === 'archive') {
          // Archive tab shows approved invitations
          filtered = filtered.filter(inv => inv &&
            inv.status === 'completed' && inv.approvalStatus === 'APPROVED'
          );
        }
        setInvitations(filtered);
        if (data.counts) {
          setInvitationCounts(data.counts);
        }
      } else {
        setInvitations([]);
      }
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setInvitations([]);
    } finally {
      setInvitationLoading(false);
    }
  }, []);

  // Fetch users (for active tab)
  const fetchUsers = useCallback(async () => {
    setUserLoading(true);
    try {
      // Use current filter values directly (including debouncedSearch)
      const currentSearch = debouncedSearch || userFilters.search || '';
      const params = new URLSearchParams({
        page: userPagination.page.toString(),
        limit: userPagination.limit.toString(),
        ...(userFilters.role !== 'all' && { role: userFilters.role }),
        ...(currentSearch && { search: currentSearch }),
        // Only filter by status if not 'all'
        ...(userFilters.status && userFilters.status !== 'all' && { status: userFilters.status }),
      });

      const { adminApi } = await import('@/lib/api/admin-api');
      const queryParams = {
        role: userFilters.role !== 'all' ? userFilters.role : undefined,
        search: currentSearch || undefined,
        // Only include status if it's not 'all'
        ...(userFilters.status && userFilters.status !== 'all' && { status: userFilters.status }),
        page: userPagination.page,
        limit: userPagination.limit,
      };
      
      console.log('[Admin Users] Fetching users with params:', queryParams);
      
      const data = await adminApi.getUsers(queryParams);
      
      console.log('[Admin Users] API response:', { 
        success: data.success, 
        dataLength: Array.isArray(data.data) ? data.data.length : 0,
        pagination: data.pagination,
        error: data.error 
      });
      
      if (data.success) {
        // Filter by role in search if search term matches role names
        // BUG FIX: Added null check for data.data to prevent runtime errors
        let filteredUsers = Array.isArray(data.data) ? data.data : [];
        
        console.log('[Admin Users] Filtered users count:', filteredUsers.length);
        if (currentSearch && filteredUsers.length > 0) {
          const searchLower = currentSearch.toLowerCase();
          const roleKeywords = {
            'admin': 'admin',
            'landlord': 'landlord',
            'pmc': 'pmc',
            'tenant': 'tenant',
          };
          
          // If search matches a role keyword, filter by that role (in addition to name/email search)
          // The API already searches by name/email, so we just need to filter by role if keyword matches
          for (const [keyword, role] of Object.entries(roleKeywords)) {
            if (searchLower === keyword || searchLower.includes(keyword)) {
              filteredUsers = filteredUsers.filter(u => u && u.role === role);
              break;
            }
          }
        }
        
        console.log('[Admin Users] Setting users:', { 
          count: filteredUsers.length, 
          firstUser: filteredUsers[0] || null,
          allUsers: filteredUsers 
        });
        
        setUsers(filteredUsers);
        setUserPagination(prev => ({ ...prev, total: data.pagination?.total || 0 }));
        
        if (filteredUsers.length === 0) {
          console.warn('[Admin Users] ⚠️ No users found with current filters:', queryParams);
          console.warn('[Admin Users] Check server logs for RBAC role assignments');
        }
      } else {
        console.error('[Admin Users] API returned error:', data.error);
        setErrorMessage(data.error || 'Failed to fetch users');
        setSuccessMessage(null);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      // Log more details about the error
      const errorInfo = {
        message: err?.message || 'Unknown error',
        stack: err?.stack,
        name: err?.name,
        fullError: err,
      };
      console.error('[Admin Users] Fetch Error Details:', errorInfo);
      setErrorMessage(err?.message || 'Failed to fetch users');
      setSuccessMessage(null);
    } finally {
      setUserLoading(false);
    }
  }, [userPagination.page, userPagination.limit, userFilters.role, userFilters.status, userFilters.search, debouncedSearch]);

  // Load data based on active tab
  // Fetch data when tab changes
  useEffect(() => {
    if (activeTab === 'active') {
      fetchUsers();
    } else {
      fetchInvitations(activeTab);
    }
  }, [activeTab, fetchUsers, fetchInvitations]);

  // Auto-fetch users when filters change (debounced search)
  useEffect(() => {
    if (activeTab === 'active') {
      fetchUsers();
    }
  }, [debouncedSearch, userFilters.role, userFilters.status, fetchUsers]);

  // Invitation handlers
  const handleSendInvitation = async () => {
    const values = invitationFormState.values;
    try {
      // TODO: Implement v2 endpoint for admin invitations
      const { v1Api } = await import('@/lib/api/v1-client');
      const data = await v1Api.invitations.create({
        email: values.email,
        type: values.type || 'landlord',
        metadata: values.type === 'pmc' ? {
          companyName: values.companyName,
        } : values.type === 'vendor' || values.type === 'contractor' ? {
          businessName: values.businessName,
          contactName: values.contactName,
        } : {
          firstName: values.firstName,
          lastName: values.lastName,
        },
      });
      if (data.success) {
        setSuccessMessage('Invitation sent successfully');
        setErrorMessage(null);
        setInvitationModalVisible(false);
        invitationFormState.resetFields();
        fetchInvitations(activeTab);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setErrorMessage(data.error || 'Failed to send invitation');
        setSuccessMessage(null);
      }
    } catch (err) {
      setErrorMessage('Failed to send invitation');
      setSuccessMessage(null);
    }
  };

  const handleApprove = useCallback(async (invitationId) => {
    try {
      const invitation = invitations.find((inv) => inv.id === invitationId);
      if (!invitation || invitation.status !== 'completed') {
        setErrorMessage('Only completed invitations can be approved');
        setSuccessMessage(null);
        return;
      }

      const response = await fetch(`/api/admin/applications/${invitationId}/approve`, {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMessage('Application approved successfully');
        setErrorMessage(null);
        // Refresh invitations list (approved invitation will move to Archive tab)
        await fetchInvitations(activeTab);
        // Always refresh active users list so newly approved user appears
        // This ensures the user shows up in Active tab even if we're on a different tab
        await fetchUsers();
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setErrorMessage(data.error || 'Failed to approve application');
        setSuccessMessage(null);
      }
    } catch (err) {
      console.error('[handleApprove] Error:', err);
      setErrorMessage('Failed to approve application');
      setSuccessMessage(null);
    }
  }, [invitations, activeTab, fetchInvitations, fetchUsers]);

  const handleReject = useCallback(async (invitationId, reason) => {
    try {
      const invitation = invitations.find((inv) => inv.id === invitationId);
      if (!invitation || invitation.status !== 'completed') {
        setErrorMessage('Only completed invitations can be rejected');
        setSuccessMessage(null);
        return;
      }

      const response = await fetch(`/api/admin/applications/${invitationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMessage('Application rejected');
        setErrorMessage(null);
        fetchInvitations(activeTab);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setErrorMessage(data.error || 'Failed to reject application');
        setSuccessMessage(null);
      }
    } catch (err) {
      setErrorMessage('Failed to reject application');
      setSuccessMessage(null);
    }
  }, [invitations, activeTab, fetchInvitations]);

  const handleViewDetails = useCallback(async (invitation) => {
    console.log('[handleViewDetails] Called with:', invitation);
    // Allow viewing any invitation - show basic info for non-completed, full details for completed
    if (!invitation) {
      console.warn('[handleViewDetails] No invitation provided');
      return;
    }
    
    if (invitation.status !== 'completed') {
      // Show basic info for non-completed invitations
      console.log('[handleViewDetails] Showing basic info for non-completed invitation');
      // Use setState to show modal instead of Modal.info for better control
      setSelectedInvitation(invitation);
      setApplicationDetails({
        invitation: {
          email: invitation.email,
          type: invitation.type,
          status: invitation.status,
          createdAt: invitation.createdAt,
        },
      });
      setViewModalVisible(true);
      return;
    }

    console.log('[handleViewDetails] Opening modal for completed invitation:', invitation.id);
    setLoadingDetails(true);
    setSelectedInvitation(invitation);
    setViewModalVisible(true);
    try {
      console.log('[handleViewDetails] Fetching application details for:', invitation.id);
      const response = await fetch(`/api/admin/invitations/${invitation.id}/application`);
      const data = await response.json();
      console.log('[handleViewDetails] API response:', { ok: response.ok, success: data.success, data });
      if (response.ok && data.success) {
        setApplicationDetails(data.data);
      } else {
        console.error('[handleViewDetails] API error:', data.error);
        setErrorMessage(data.error || 'Failed to fetch application details');
        setSuccessMessage(null);
      }
    } catch (err) {
      console.error('[handleViewDetails] Fetch error:', err);
      setErrorMessage('Failed to fetch application details');
      setSuccessMessage(null);
    } finally {
      setLoadingDetails(false);
    }
  }, []);

  const handleResendInvitation = useCallback(async (invitationId) => {
    console.log('[handleResendInvitation] Called with:', invitationId);
    try {
      const response = await fetch(`/api/admin/invitations/${invitationId}/resend`, {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMessage('Invitation resent successfully');
        setErrorMessage(null);
        fetchInvitations(activeTab);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setErrorMessage(data.error || 'Failed to resend invitation');
        setSuccessMessage(null);
      }
    } catch (err) {
      console.error('[handleResendInvitation] Error:', err);
      setErrorMessage('Failed to resend invitation');
      setSuccessMessage(null);
    }
  }, [activeTab, fetchInvitations]);

  const handleDeleteInvitation = useCallback(async (invitationId) => {
    console.log('[handleDeleteInvitation] Called with:', invitationId);
    if (!invitationId) {
      console.error('[handleDeleteInvitation] No invitation ID provided');
      setErrorMessage('Invalid invitation ID');
      setSuccessMessage(null);
      return;
    }
    try {
      console.log('[handleDeleteInvitation] Sending DELETE request to:', `/api/admin/invitations/${invitationId}`);
      const response = await fetch(`/api/admin/invitations/${invitationId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      console.log('[handleDeleteInvitation] API response:', { ok: response.ok, success: data.success, data });
      if (response.ok && data.success) {
        setSuccessMessage('Invitation deleted successfully');
        setErrorMessage(null);
        // Refresh the list
        await fetchInvitations(activeTab);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        console.error('[handleDeleteInvitation] API error:', data.error);
        setErrorMessage(data.error || 'Failed to delete invitation');
        setSuccessMessage(null);
      }
    } catch (err) {
      console.error('[handleDeleteInvitation] Fetch error:', err);
      setErrorMessage('Failed to delete invitation');
      setSuccessMessage(null);
    }
  }, [activeTab, fetchInvitations]);

  // Grid Actions for Pending tab - Icon-only with tooltips
  // For non-completed invitations: show send, view, delete
  // For completed invitations needing approval: show approve, reject, view
  const { renderActions: renderPendingActions } = useGridActions({
    actions: [
      {
        type: 'send',
        onClick: (record) => handleResendInvitation(record.id),
        condition: (record) => record?.status !== 'completed', // Only show for non-completed
        tooltip: 'Resend Invitation',
      },
      {
        type: 'view',
        onClick: (record) => handleViewDetails(record),
        tooltip: 'View Details',
      },
      {
        type: 'approve',
        onClick: (record) => handleApprove(record.id),
        condition: (record) => {
          // Show for completed invitations that need approval
          const isCompleted = record?.status === 'completed';
          const isApproved = record?.approvalStatus === 'APPROVED';
          const isRejected = record?.approvalStatus === 'REJECTED';
          return isCompleted && !isApproved && !isRejected;
        },
        tooltip: 'Approve',
      },
      {
        type: 'reject',
        onClick: (record) => {
          setSelectedInvitation(record);
          setRejectModalVisible(true);
        },
        condition: (record) => {
          // Show for completed invitations that need approval
          const isCompleted = record?.status === 'completed';
          const isApproved = record?.approvalStatus === 'APPROVED';
          const isRejected = record?.approvalStatus === 'REJECTED';
          return isCompleted && !isApproved && !isRejected;
        },
        tooltip: 'Reject',
      },
      {
        type: 'delete',
        onClick: (record) => handleDeleteInvitation(record.id),
        condition: (record) => record?.status !== 'completed', // Only show for non-completed
        confirm: {
          title: 'Delete Invitation',
          content: 'Are you sure you want to delete this invitation?',
        },
        tooltip: 'Delete Invitation',
      },
    ],
    size: 'small',
    buttonType: 'text', // Icon-only button with tooltip
  });

  // Grid Actions for Rejected/Archive tabs - Icon-only with tooltips
  const { renderActions: renderOtherActions } = useGridActions({
    actions: [
      {
        type: 'view',
        onClick: (record) => handleViewDetails(record),
        condition: (record) => record?.status === 'completed',
        tooltip: 'View Details',
      },
      {
        type: 'approve',
        onClick: (record) => handleApprove(record.id),
        condition: (record) => {
          const isApproved = record?.approvalStatus === 'APPROVED';
          const isRejected = record?.approvalStatus === 'REJECTED';
          return record?.status === 'completed' && !isApproved && !isRejected;
        },
        tooltip: 'Approve',
      },
      {
        type: 'reject',
        onClick: (record) => {
          setSelectedInvitation(record);
          setRejectModalVisible(true);
        },
        condition: (record) => {
          const isApproved = record?.approvalStatus === 'APPROVED';
          const isRejected = record?.approvalStatus === 'REJECTED';
          return record?.status === 'completed' && !isApproved && !isRejected;
        },
        tooltip: 'Reject',
      },
    ],
    size: 'small',
    buttonType: 'text', // Icon-only button with tooltip
  });

  // Edit modal state
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const editFormState = useFormState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    role: '',
    status: '',
    adminRole: '',
    companyName: '',
    rbacRoles: undefined,
    selectedPMC: null,
  });
  const [saving, setSaving] = useState(false);

  // Load user RBAC roles
  const loadUserRBACRoles = useCallback(async (userId, userType) => {
    setLoadingRBACRoles(true);
    try {
      console.log('[loadUserRBACRoles] Fetching roles:', { userId, userType, url: `/api/rbac/users/${userId}/roles?userType=${userType}` });
      // Use API endpoint instead of direct function call (client-side safe)
      const response = await fetch(`/api/rbac/users/${userId}/roles?userType=${userType}`);
      const data = await response.json();
      console.log('[loadUserRBACRoles] API response:', data);
      if (response.ok && data.success) {
        const roles = data.data || [];
        console.log('[loadUserRBACRoles] Loaded roles:', roles);
        setUserRBACRoles(roles);
        setInitialRBACRoles(roles); // Store initial roles for comparison
        // Form value will be set by useEffect when both availableRBACRoles and userRBACRoles are loaded
      } else {
        console.warn('[loadUserRBACRoles] Failed to load roles:', data.error);
        setUserRBACRoles([]);
        setInitialRBACRoles([]);
        // Clear form value if no roles found
        editFormState.setFieldsValue({
          rbacRoles: undefined,
          selectedPMC: null,
        });
        setSelectedPMCId(null);
      }
    } catch (error) {
      console.error('Error loading user RBAC roles:', error);
      setUserRBACRoles([]);
      setInitialRBACRoles([]);
    } finally {
      setLoadingRBACRoles(false);
    }
  }, [editFormState]);

  // Effect to set form value when both available roles and user roles are loaded
  useEffect(() => {
    if (!editModalVisible) return;
    
    // If available roles are loaded and user has no roles, clear the form
    if (availableRBACRoles.length > 0 && userRBACRoles.length === 0) {
      const timer = setTimeout(() => {
        editFormState.setFieldsValue({
          rbacRoles: undefined,
          selectedPMC: null,
        });
        setSelectedPMCId(null);
      }, 100);
      return () => clearTimeout(timer);
    }
    
    // If both are loaded, set the form value
    if (availableRBACRoles.length > 0 && userRBACRoles.length > 0) {
      // Wait a bit to ensure Select component is rendered
      const timer = setTimeout(() => {
        // Get the first role (prioritize SUPER_ADMIN if exists, otherwise first role)
        const superAdminRole = userRBACRoles.find(r => {
          const roleName = r.roleName || r.role;
          return roleName === 'SUPER_ADMIN';
        });
        const pmcAdminRole = userRBACRoles.find(r => {
          const roleName = r.roleName || r.role;
          return roleName === 'PMC_ADMIN';
        });
        // Prioritize SUPER_ADMIN, then PMC_ADMIN, then first role
        const primaryRole = superAdminRole || pmcAdminRole || userRBACRoles[0];
        const roleId = primaryRole.roleId;
        
        console.log('[useEffect] Checking role:', {
          roleId,
          roleName: primaryRole.roleName || primaryRole.role,
          availableRolesCount: availableRBACRoles.length,
          userRolesCount: userRBACRoles.length,
        });
        
        // Check if the role exists in available roles (to ensure Select can display it)
        const roleExists = availableRBACRoles.some(r => r.id === roleId);
        if (roleExists) {
          console.log('[useEffect] Setting form value with roleId:', roleId, 'roleName:', primaryRole.roleName || primaryRole.role);
          editFormState.setFieldsValue({
            rbacRoles: roleId,
            selectedPMC: pmcAdminRole?.pmcId || null,
          });
          
          if (pmcAdminRole?.pmcId) {
            setSelectedPMCId(pmcAdminRole.pmcId);
          } else {
            setSelectedPMCId(null);
          }
        } else {
          console.warn('[useEffect] Role not found in available roles:', {
            roleId,
            roleName: primaryRole.roleName || primaryRole.role,
            availableRoleIds: availableRBACRoles.map(r => r.id),
            availableRoleNames: availableRBACRoles.map(r => r.name),
          });
        }
      }, 500); // Increased timeout to ensure Select is fully rendered and state is updated
      
      return () => clearTimeout(timer);
    }
  }, [availableRBACRoles, userRBACRoles, editModalVisible, editFormState]);

  // State to track current user's role (both base and RBAC)
  const [currentUserIsAdmin, setCurrentUserIsAdmin] = useState(false);

  // Load current user's role
  useEffect(() => {
    const loadCurrentUserRole = async () => {
      try {
        const { adminApi } = await import('@/lib/api/admin-api');
        const meData = await adminApi.getAdminUser();
        if (meData.success) {
          // Check if user is admin (base role)
          const isAdmin = meData.data.role === 'admin' || meData.data.role === 'SUPER_ADMIN';
          setCurrentUserIsAdmin(isAdmin);
          
          // Also check RBAC role
          if (isAdmin) {
            const adminId = meData.data.id;
            const rolesResponse = await fetch(`/api/rbac/users/${adminId}/roles?userType=admin`);
            const rolesData = await rolesResponse.json();
            if (rolesResponse.ok && rolesData.success && rolesData.data.length > 0) {
              // If user has SUPER_ADMIN RBAC role, they can see all roles
              const hasSuperAdmin = rolesData.data.some(r => r.roleName === 'SUPER_ADMIN');
              if (hasSuperAdmin) {
                console.log('[loadCurrentUserRole] User has SUPER_ADMIN RBAC role');
              }
            }
          }
        }
      } catch (error) {
        console.error('Error loading current user role:', error);
      }
    };
    loadCurrentUserRole();
  }, []);

  // Load available RBAC roles for user type
  const loadAvailableRBACRoles = useCallback(async (userType) => {
    setLoadingAvailableRoles(true);
    try {
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getRBACRoles();
      if (data.success) {
        // The API already filters roles based on the logged-in user's permissions
        // If the user is an admin, the API returns ALL roles
        // If the user is a PMC, the API returns only PMC and user roles
        // So we can trust the API response and show all roles it returns
        console.log('[loadAvailableRBACRoles] Loaded roles from API:', data.data.length);
        console.log('[loadAvailableRBACRoles] Roles:', data.data.map(r => r.name).join(', '));
        setAvailableRBACRoles(data.data);
      }
    } catch (error) {
      console.error('Error loading available RBAC roles:', error);
      setAvailableRBACRoles([]);
    } finally {
      setLoadingAvailableRoles(false);
    }
  }, []);

  // Handle edit user
  const handleEditUser = useCallback(async (user) => {
    console.log('[handleEditUser] Called with user:', user);
    try {
      // Reset form first
      editFormState.resetFields();
      // Clear previous RBAC roles state
      setUserRBACRoles([]);
      setInitialRBACRoles([]);
      setSelectedPMCId(null); // Reset PMC selector
      
      // Fetch user details first
      const { adminApi } = await import('@/lib/api/admin-api');
      const data = await adminApi.getUserById(user.id, user.role);
      console.log('[handleEditUser] API response:', data);
      if (data.success) {
        setEditingUser(data.data);
        
        // Load both available roles and user roles in parallel to avoid closure issues
        const [availableRolesData, userRolesData] = await Promise.all([
          adminApi.getRBACRoles(),
          adminApi.getUserRoles(user.id, user.role),
        ]);
        
        let loadedAvailableRoles = [];
        let loadedUserRoles = [];
        
        if (availableRolesData.success) {
          loadedAvailableRoles = availableRolesData.data || [];
          setAvailableRBACRoles(loadedAvailableRoles);
          console.log('[handleEditUser] Loaded available roles:', loadedAvailableRoles.length);
        }
        
        if (userRolesData.success) {
          loadedUserRoles = userRolesData.data || [];
          setUserRBACRoles(loadedUserRoles);
          setInitialRBACRoles(loadedUserRoles);
          console.log('[handleEditUser] Loaded user roles:', loadedUserRoles.map(r => r.roleName || r.role));
        }
        
        // Also call the load functions to update state properly
        await loadAvailableRBACRoles(user.role);
        await loadUserRBACRoles(user.id, user.role);
        
        // Wait a bit to ensure state is set
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Open modal after roles are loaded
        setEditModalVisible(true);
        
        // Set form values after modal is open (use setTimeout to ensure form is rendered)
        setTimeout(() => {
          // Set RBAC role directly using the loaded roles (avoid closure issue)
          if (loadedAvailableRoles.length > 0 && loadedUserRoles.length > 0) {
            const superAdminRole = loadedUserRoles.find(r => {
              const roleName = r.roleName || r.role;
              return roleName === 'SUPER_ADMIN';
            });
            const pmcAdminRole = loadedUserRoles.find(r => {
              const roleName = r.roleName || r.role;
              return roleName === 'PMC_ADMIN';
            });
            const primaryRole = superAdminRole || pmcAdminRole || loadedUserRoles[0];
            const roleId = primaryRole.roleId;
            
            // Check if the role exists in available roles
            const roleExists = loadedAvailableRoles.some(r => r.id === roleId);
            if (roleExists) {
              console.log('[handleEditUser] Setting RBAC role in form:', roleId, primaryRole.roleName);
              editFormState.setFieldsValue({
                rbacRoles: roleId,
                selectedPMC: pmcAdminRole?.pmcId || null,
              });
              if (pmcAdminRole?.pmcId) {
                setSelectedPMCId(pmcAdminRole.pmcId);
              }
            } else {
              console.warn('[handleEditUser] Role not found in available roles:', {
                roleId,
                roleName: primaryRole.roleName,
                availableRoleIds: loadedAvailableRoles.map(r => r.id),
                availableRoleNames: loadedAvailableRoles.map(r => r.name),
              });
            }
          } else {
            console.warn('[handleEditUser] Missing roles data:', {
              availableRolesCount: loadedAvailableRoles.length,
              userRolesCount: loadedUserRoles.length,
            });
          }
          
          // Set other form values
          if (data.data.role === 'pmc') {
            editFormState.setFieldsValue({
              companyName: data.data.companyName || '',
              phone: data.data.phone ? formatPhoneNumber(data.data.phone) : '',
              email: data.data.email || '',
              role: data.data.role,
              status: data.data.status || (data.data.approvalStatus === 'APPROVED' ? 'active' : data.data.approvalStatus === 'PENDING' ? 'pending' : 'inactive'),
            });
          } else if (data.data.role === 'admin') {
            editFormState.setFieldsValue({
              firstName: data.data.firstName || '',
              lastName: data.data.lastName || '',
              phone: data.data.phone ? formatPhoneNumber(data.data.phone) : '',
              email: data.data.email || '',
              role: data.data.role,
              adminRole: data.data.adminRole || '',
              status: data.data.status || (data.data.isActive && !data.data.isLocked ? 'active' : data.data.isLocked ? 'locked' : 'inactive'),
            });
          } else {
            editFormState.setFieldsValue({
              firstName: data.data.firstName || '',
              lastName: data.data.lastName || '',
              phone: data.data.phone ? formatPhoneNumber(data.data.phone) : '',
              email: data.data.email || '',
              role: data.data.role,
              status: data.data.status || (data.data.approvalStatus === 'APPROVED' ? 'active' : data.data.approvalStatus === 'PENDING' ? 'pending' : 'inactive'),
            });
          }
        }, 100);
      } else {
        setErrorMessage(data.error || 'Failed to fetch user details');
        setSuccessMessage(null);
      }
    } catch (err) {
      console.error('[handleEditUser] Error:', err);
      setErrorMessage('Failed to fetch user details');
      setSuccessMessage(null);
    }
  }, [editFormState, loadUserRBACRoles, loadAvailableRBACRoles]);

  // Handle save user edits
  const handleSaveUser = useCallback(async () => {
    if (!editingUser) {
      setErrorMessage('No user selected for editing');
      setSuccessMessage(null);
      return false;
    }
    
    setSaving(true);
    try {
      const values = editFormState.values;
      console.log('[handleSaveUser] Form values:', values);

      // Determine user role for API (this identifies which table to update)
      const userRole = values.role || editingUser.role;
      
      // Handle RBAC role assignment (single role)
      // Always check if role needs to be updated (even if field wasn't touched)
      const newRoleId = values.rbacRoles;
      const currentRoles = initialRBACRoles.length > 0 ? initialRBACRoles : userRBACRoles;
      const currentRoleId = currentRoles.length > 0 ? currentRoles[0].roleId : null;
      
      // Check if role changed (including case where user had no role before)
      const hasRBACChanges = newRoleId !== undefined && newRoleId !== currentRoleId;
      
      console.log('[handleSaveUser] RBAC Role Check:', {
        newRoleId,
        currentRoleId,
        hasRBACChanges,
        initialRBACRolesCount: initialRBACRoles.length,
        userRBACRolesCount: userRBACRoles.length,
      });
      
      if (hasRBACChanges) {
        try {
          // Remove old role if exists
          if (currentRoleId && currentRoles.length > 0) {
              const currentUserRole = currentRoles[0];
              if (currentUserRole.id) {
                console.log('[RBAC Update] Removing old role:', {
                  userRoleId: currentUserRole.id,
                  roleId: currentRoleId,
                  roleName: currentUserRole.roleName,
                });
                
                const deleteResponse = await fetch(`/api/rbac/users/${editingUser.id}/roles?userType=${editingUser.role}`, {
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    userRoleId: currentUserRole.id,
                    roleId: currentRoleId,
                  }),
                });
                
                if (!deleteResponse.ok) {
                  const errorData = await deleteResponse.json();
                  console.error('[RBAC Update] Failed to remove old role:', errorData);
                  throw new Error(errorData.error || 'Failed to remove old role');
                }
                
                console.log('[RBAC Update] Old role removed successfully');
              }
            }
            
            // Add new role
            if (newRoleId) {
              // Check if this is PMC_ADMIN role
              const roleToAdd = availableRBACRoles.find(r => r.id === newRoleId);
              const isPMCAdmin = roleToAdd?.name === 'PMC_ADMIN';
              
              console.log('[RBAC Update] Adding new role:', {
                roleId: newRoleId,
                roleName: roleToAdd?.name,
                isPMCAdmin,
              });
              
              // For PMC_ADMIN, use selected PMC from form, otherwise use existing pmcId
              const pmcIdToUse = isPMCAdmin 
                ? (values.selectedPMC || selectedPMCId || editingUser.pmcId)
                : editingUser.pmcId;
              
              // Validate PMC selection for PMC_ADMIN
              if (isPMCAdmin && !pmcIdToUse) {
                throw new Error('Please select a PMC company when assigning PMC Admin role');
              }
              
              console.log('[RBAC Update] POST request details:', {
                url: `/api/rbac/users/${editingUser.id}/roles?userType=${editingUser.role}`,
                userId: editingUser.id,
                userType: editingUser.role,
                roleId: newRoleId,
                scope: {
                  pmcId: pmcIdToUse,
                  landlordId: editingUser.landlordId,
                },
              });
              
              const postResponse = await fetch(`/api/rbac/users/${editingUser.id}/roles?userType=${editingUser.role}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  roleId: newRoleId,
                  scope: {
                    pmcId: pmcIdToUse,
                    landlordId: editingUser.landlordId,
                  },
                  assignedBy: currentAdminId,
                  assignedByType: 'admin',
                }),
              });
              
              if (!postResponse.ok) {
                const errorData = await postResponse.json();
                console.error('[RBAC Update] Failed to assign role:', errorData);
                throw new Error(errorData.error || 'Failed to assign role');
              }
              
              const postData = await postResponse.json();
              console.log('[RBAC Update] Role assigned successfully:', postData);
              
              // Wait a bit for the database transaction to commit
              await new Promise(resolve => setTimeout(resolve, 500));
              
              setSuccessMessage('Role updated successfully');
              setErrorMessage(null);
              setTimeout(() => setSuccessMessage(null), 5000);
            } else {
              console.warn('[RBAC Update] No new role ID provided, skipping role assignment');
            }
        } catch (rbacError) {
          console.error('Error updating RBAC role:', rbacError);
          setErrorMessage('User updated but role may not have been updated: ' + rbacError.message);
          setSuccessMessage(null);
        }
      } else if (newRoleId && newRoleId === currentRoleId) {
        // Role didn't change, but check if PMC changed for PMC_ADMIN
        try {
          const roleToAdd = availableRBACRoles.find(r => r.id === newRoleId);
            const isPMCAdmin = roleToAdd?.name === 'PMC_ADMIN';
            
            if (isPMCAdmin) {
              const pmcIdToUse = values.selectedPMC || selectedPMCId;
              const currentPMCId = currentRoles[0]?.pmcId;
              
              if (pmcIdToUse && pmcIdToUse !== currentPMCId) {
                // PMC changed, need to update the role assignment
                // Remove old role
                if (currentRoles[0]?.id) {
                  await fetch(`/api/rbac/users/${editingUser.id}/roles?userType=${editingUser.role}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      userRoleId: currentRoles[0].id,
                      roleId: newRoleId,
                    }),
                  });
                }
                
                // Add with new PMC
                await fetch(`/api/rbac/users/${editingUser.id}/roles?userType=${editingUser.role}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    roleId: newRoleId,
                    scope: {
                      pmcId: pmcIdToUse,
                      landlordId: editingUser.landlordId,
                    },
                    assignedBy: currentAdminId,
                    assignedByType: 'admin',
                  }),
                });
                
                setSuccessMessage('PMC company updated successfully');
                setErrorMessage(null);
                setTimeout(() => setSuccessMessage(null), 5000);
              }
            }
        } catch (rbacError) {
          console.error('Error updating PMC for role:', rbacError);
          setErrorMessage('User updated but PMC may not have been updated: ' + rbacError.message);
          setSuccessMessage(null);
        }
      }
      
      // Prepare update data based on role
      let updateData = {};
      
      // Handle email update (if changed)
      if (values.email && values.email !== editingUser.email) {
        updateData.email = values.email;
      }
      
      // Handle status update
      if (values.status && values.status !== editingUser.status) {
        if (userRole === 'admin') {
          // For admin, status maps to isActive and isLocked
          if (values.status === 'active') {
            updateData.isActive = true;
            updateData.isLocked = false;
          } else if (values.status === 'locked') {
            updateData.isLocked = true;
          } else if (values.status === 'inactive') {
            updateData.isActive = false;
          }
        } else if (userRole === 'pmc') {
          // For PMC, status maps to approvalStatus
          if (values.status === 'active') {
            updateData.approvalStatus = 'APPROVED';
          } else if (values.status === 'pending') {
            updateData.approvalStatus = 'PENDING';
          } else if (values.status === 'inactive') {
            updateData.approvalStatus = 'REJECTED';
          }
        } else if (userRole === 'tenant') {
          // For tenant, status maps to hasAccess
          updateData.hasAccess = values.status === 'active';
        } else {
          // For landlord, status maps to approvalStatus
          if (values.status === 'active') {
            updateData.approvalStatus = 'APPROVED';
          } else if (values.status === 'pending') {
            updateData.approvalStatus = 'PENDING';
          } else if (values.status === 'inactive') {
            updateData.approvalStatus = 'REJECTED';
          }
        }
      }
      
      // Helper to unformat phone (remove formatting, keep digits only)
      const unformatPhone = (phone) => {
        if (!phone) return null;
        return phone.replace(/\D/g, '') || null;
      };

      if (userRole === 'pmc') {
        // For PMC, update companyName and phone
        updateData.companyName = values.companyName;
        updateData.phone = unformatPhone(values.phone);
      } else if (userRole === 'admin') {
        // For admin, update firstName, lastName, phone, and adminRole
        updateData.firstName = values.firstName;
        updateData.lastName = values.lastName;
        updateData.phone = unformatPhone(values.phone);
        // Use 'adminRole' key to avoid conflict with 'role' that identifies the table
        // The API will map 'adminRole' to the Admin model's 'role' field
        if (values.adminRole) {
          updateData.adminRole = values.adminRole;
        }
      } else {
        // For landlord/tenant, update firstName, lastName, and phone
        updateData.firstName = values.firstName;
        updateData.lastName = values.lastName;
        updateData.phone = unformatPhone(values.phone);
      }

      // The API destructures: const { role, ...updateData } = req.body;
      // 'role' identifies the table, and the rest goes into updateData
      // For admin, we use 'adminRole' in updateData to avoid conflict
      const requestBody = {
        role: userRole, // 'admin', 'pmc', 'landlord', 'tenant' - identifies the table
        ...updateData,  // The actual fields to update
      };

      console.log('[handleSaveUser] Sending update:', requestBody);

      const response = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setSuccessMessage('User updated successfully');
        setErrorMessage(null);
        
        // Refresh RBAC roles if they were changed
        if (hasRBACChanges && editingUser) {
          console.log('[handleSaveUser] Refreshing RBAC roles after save...');
          // Wait a bit for the API to process the changes
          await new Promise(resolve => setTimeout(resolve, 500));
          // Reload user roles to verify the save worked
          await loadUserRBACRoles(editingUser.id, editingUser.role);
          // Wait a bit more for state to update
          await new Promise(resolve => setTimeout(resolve, 300));
          // Reload available roles to ensure we have the latest data
          await loadAvailableRBACRoles(editingUser.role);
          console.log('[handleSaveUser] RBAC roles refreshed, userRBACRoles:', userRBACRoles.length);
        }
        
        setEditModalVisible(false);
        setEditingUser(null);
        editFormState.resetFields();
        // Refresh the users list
        await fetchUsers();
        setTimeout(() => setSuccessMessage(null), 5000);
        return true;
      } else {
        setErrorMessage(data.error || 'Failed to update user');
        setSuccessMessage(null);
        return false;
      }
    } catch (err) {
      if (err.errorFields) {
        // Form validation errors
        console.log('[handleSaveUser] Validation errors:', err.errorFields);
        return false;
      }
      console.error('[handleSaveUser] Error:', err);
      setErrorMessage(err.message || 'Failed to update user');
      setSuccessMessage(null);
      return false;
    } finally {
      setSaving(false);
    }
  }, [editingUser, editFormState, fetchUsers]);

  // View user details handler
  const handleViewUser = useCallback((record) => {
    const displayName = record.role === 'pmc' 
      ? record.companyName 
      : `${record.firstName || ''} ${record.lastName || ''}`.trim();
    
    setEditingUser({
      ...record,
      displayName,
    });
    setViewModalVisible(true);
  }, []);

  // Handle role change
  const handleChangeRole = useCallback((user) => {
    setRoleChangeUser(user);
    setSelectedRole(user.role || '');
    setRoleChangeModalVisible(true);
  }, []);

  const handleSaveRoleChange = useCallback(async () => {
    if (!roleChangeUser || !selectedRole) return;

    setChangingRole(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/admin/users/${roleChangeUser.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ role: selectedRole }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage('User role changed successfully');
        setErrorMessage(null);
        setRoleChangeModalVisible(false);
        setRoleChangeUser(null);
        // Refresh users list
        await fetchUsers();
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        setErrorMessage(data.error || 'Failed to change role');
        setSuccessMessage(null);
      }
    } catch (err) {
      setErrorMessage(err?.message || 'Failed to change role');
      setSuccessMessage(null);
    } finally {
      setChangingRole(false);
    }
  }, [roleChangeUser, selectedRole, fetchUsers]);

  // Grid Actions for Active Users tab - Icon-only with tooltips
  const { renderActions: renderUserActions } = useGridActions({
    actions: [
      {
        type: 'view',
        onClick: (record) => handleViewUser(record),
        tooltip: 'View User Details',
      },
      {
        type: 'edit',
        onClick: (record) => {
          console.log('[Edit] Clicked for record:', record);
          handleEditUser(record);
        },
        tooltip: 'Edit User',
      },
      // Only show "Change Role" for super_admin
      ...(currentAdminRole === 'super_admin' || currentAdminRole === 'SUPER_ADMIN' ? [{
        type: 'edit', // Use edit type as base, but with custom icon
        onClick: (record) => handleChangeRole(record),
        tooltip: 'Change Role',
        customIcon: <HiCog className="h-4 w-4" />,
      }] : []),
    ],
    size: 'small',
    buttonType: 'text', // Icon-only button with tooltip
  });

  // Invitation columns (for pending/rejected tabs)
  const invitationColumns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const colors = { landlord: 'blue', pmc: 'green', vendor: 'orange', contractor: 'purple' };
        return <Badge color={colors[type] || 'gray'}>{type?.toUpperCase()}</Badge>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (!status) return <Badge color="gray">N/A</Badge>;
        const colors = {
          pending: 'warning',
          sent: 'info',
          opened: 'info',
          completed: 'success',
          expired: 'gray',
          cancelled: 'failure',
        };
        return <Badge color={colors[status] || 'gray'}>{status.toUpperCase()}</Badge>;
      },
    },
    {
      title: 'Approval Status',
      key: 'approvalStatus',
      render: (_, record) => {
        if (record?.status !== 'completed') {
          return <Badge color="gray">N/A</Badge>;
        }
        const approvalStatus = record?.approvalStatus;
        if (!approvalStatus || approvalStatus === 'PENDING') {
          return <Badge color="warning" icon={HiClock}>Pending Approval</Badge>;
        }
        if (approvalStatus === 'APPROVED') {
          return <Badge color="success" icon={HiCheckCircle}>Approved</Badge>;
        }
        if (approvalStatus === 'REJECTED') {
          return <Badge color="failure" icon={HiXCircle}>Rejected</Badge>;
        }
        return <Badge color="gray">{approvalStatus}</Badge>;
      },
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => {
        if (!date) return 'N/A';
        try {
          const d = new Date(date);
          return isNaN(d.getTime()) ? 'N/A' : d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
        } catch {
          return 'N/A';
        }
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        // For pending tab, use pending actions
        if (activeTab === 'pending') {
          return renderPendingActions(record);
        }
        
        // For other tabs (rejected, archive), use other actions
        if (record?.status === 'completed') {
          const isApproved = record?.approvalStatus === 'APPROVED';
          const isRejected = record?.approvalStatus === 'REJECTED';
          
          return (
            <div className="flex items-center gap-2">
              {renderOtherActions(record)}
              {isApproved && (
                <Badge color="success" icon={HiCheckCircle}>
                  Approved
                </Badge>
              )}
              {isRejected && (
                <Badge color="failure" icon={HiXCircle}>
                  Rejected
                </Badge>
              )}
            </div>
          );
        }
        return <span className="text-gray-400">-</span>;
      },
    },
  ];

  // User columns (for active tab) - conditionally exclude Properties for admin users
  const userColumns = useMemo(() => {
    const baseColumns = [
      {
        title: 'Name',
        dataIndex: 'firstName',
        key: 'name',
        render: (text, record) => {
          if (record.role === 'pmc') {
            return record.companyName || '-';
          }
          return `${record.firstName || ''} ${record.lastName || ''}`.trim() || '-';
        },
      },
      {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
      },
      {
        title: 'Phone',
        dataIndex: 'phone',
        key: 'phone',
        render: (phone) => <PhoneDisplay phone={phone} fallback="-" />,
      },
      {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
        render: (role, record) => {
          if (role === 'admin') {
            // Check if user has RBAC roles - prioritize RBAC role display
            if (record.rbacRoles && Array.isArray(record.rbacRoles) && record.rbacRoles.length > 0) {
              // Get the first RBAC role (or find PMC_ADMIN if it exists)
              const pmcAdminRole = record.rbacRoles.find(r => r.role?.name === 'PMC_ADMIN');
              const displayRole = pmcAdminRole || record.rbacRoles[0];
              
              if (displayRole?.role) {
                const roleLabel = getRoleLabel(displayRole.role.name) || displayRole.role.displayName || displayRole.role.name;
                return (
                  <Badge color="purple">
                    {roleLabel}
                  </Badge>
                );
              }
            }
            // Fall back to base admin role if no RBAC role
            return (
              <Badge color="purple">
                ADMIN {record.adminRole ? `(${record.adminRole.replace('_', ' ')})` : ''}
              </Badge>
            );
          }
          const colors = { landlord: 'info', pmc: 'success', vendor: 'warning', contractor: 'purple', tenant: 'info' };
          return <Badge color={colors[role] || 'gray'}>{role?.toUpperCase()}</Badge>;
        },
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
          if (status === 'active') return <Badge color="success">Active</Badge>;
          if (status === 'pending') return <Badge color="warning">Pending</Badge>;
          if (status === 'inactive') return <Badge color="failure">Inactive</Badge>;
          if (status === 'locked') return <Badge color="failure">Locked</Badge>;
          return <Badge color="gray">N/A</Badge>;
        },
      },
      {
        title: 'Created',
        dataIndex: 'createdAt',
        key: 'createdAt',
        render: (date) => new Date(date).toLocaleDateString(),
      },
      {
        title: 'Actions',
        key: 'actions',
        render: (_, record) => (
          <div className="flex items-center gap-2">
            {renderUserActions(record)}
            {/* Role change button - only for super_admin */}
            {(currentAdminRole === 'super_admin' || currentAdminRole === 'SUPER_ADMIN') && (
              <Button
                size="sm"
                color="light"
                onClick={(e) => {
                  e.stopPropagation();
                  handleChangeRole(record);
                }}
                title="Change Role"
              >
                <HiCog className="h-4 w-4" />
              </Button>
            )}
          </div>
        ),
      },
    ];

    return baseColumns;
  }, [renderUserActions]);

  const renderTabContent = () => {
    // Ensure arrays are always defined
    const safeUsers = Array.isArray(users) ? users : [];
    const safeInvitations = Array.isArray(invitations) ? invitations : [];
    if (activeTab === 'active') {
      return (
        <>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <TextInput
              placeholder="Search by name, email, or role"
              icon={HiSearch}
              className="w-full sm:w-64"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  fetchUsers();
                }
              }}
            />
            <Select
              className="w-full sm:w-40"
              value={userFilters.role}
              onChange={(e) => {
                setUserFilters({ ...userFilters, role: e.target.value });
                // Reset to page 1 when filter changes
                setUserPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              <option value="all">All Roles</option>
              <option value="admin">Admins</option>
              <option value="landlord">Landlords</option>
              <option value="pmc">PMCs</option>
              <option value="tenant">Tenants</option>
            </Select>
            <Select
              className="w-full sm:w-40"
              value={userFilters.status}
              onChange={(e) => {
                setUserFilters({ ...userFilters, status: e.target.value || 'all' });
                // Reset to page 1 when filter changes
                setUserPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </Select>
            <Button 
              color="blue"
              onClick={fetchUsers}
            >
              <HiSearch className="mr-2 h-4 w-4" />
              Search
            </Button>
          </div>
          <FlowbiteTable
            columns={userColumns}
            dataSource={safeUsers}
            loading={userLoading}
            rowKey="id"
            pagination={{
              current: userPagination.page,
              pageSize: userPagination.limit,
              total: userPagination.total,
              onChange: (page) => setUserPagination({ ...userPagination, page }),
            }}
          />
        </>
      );
    } else {
      // Pending, Rejected, or Archive tab
      return (
        <FlowbiteTable
          columns={invitationColumns}
          dataSource={safeInvitations}
          loading={invitationLoading}
          rowKey={(record) => record?.id || 'unknown'}
          pagination={{ pageSize: 50 }}
        />
      );
    }
  };

  // Common refresh handler
  const handleRefresh = useCallback(() => {
    if (activeTab === 'active') {
      fetchUsers();
    } else {
      fetchInvitations(activeTab);
    }
  }, [activeTab, fetchUsers, fetchInvitations]);

  return (
    <PageLayout
      headerTitle={
        <div className="flex items-center gap-2">
          <HiUser className="h-5 w-5" />
          <span>Users</span>
        </div>
      }
      headerActions={[
        <Button key="refresh" color="gray" onClick={handleRefresh} size="sm">
          <HiRefresh className="mr-2 h-4 w-4" />
          Refresh
        </Button>,
        <Button key="add" color="blue" onClick={() => setInvitationModalVisible(true)} size="sm">
          <HiPlus className="mr-2 h-4 w-4" />
          Send Invitation
        </Button>
      ]}
      contentStyle={{ padding: 0 }}
    >
      {successMessage && (
        <Alert color="success" className="mb-6 mx-6 mt-6" onDismiss={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert color="failure" className="mb-6 mx-6 mt-6" onDismiss={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      <Card className="m-6">
        <Tabs
          aria-label="User tabs"
          variant="underline"
          onActiveTabChange={(tabIndex) => {
            const tabKeys = ['active', 'pending', 'rejected', 'archive'];
            const selectedKey = tabKeys[tabIndex];
            if (selectedKey) {
              setActiveTab(selectedKey);
            }
          }}
        >
          <Tabs.Item active={activeTab === 'active'} title="Active">
            <div className="pt-4 px-4">
              {renderTabContent()}
            </div>
          </Tabs.Item>
          <Tabs.Item active={activeTab === 'pending'} title={
            <div className="flex items-center gap-2">
              <span>Pending</span>
              {invitationCounts.pending > 0 && (
                <Badge color="warning" size="sm">{invitationCounts.pending}</Badge>
              )}
            </div>
          }>
            <div className="pt-4 px-4">
              {renderTabContent()}
            </div>
          </Tabs.Item>
          <Tabs.Item active={activeTab === 'rejected'} title={
            <div className="flex items-center gap-2">
              <span>Rejected</span>
              {invitationCounts.rejected > 0 && (
                <Badge color="failure" size="sm">{invitationCounts.rejected}</Badge>
              )}
            </div>
          }>
            <div className="pt-4 px-4">
              {renderTabContent()}
            </div>
          </Tabs.Item>
          <Tabs.Item active={activeTab === 'archive'} title={
            <div className="flex items-center gap-2">
              <span>Archive</span>
              {(invitationCounts.archive || invitationCounts.approved || 0) > 0 && (
                <Badge color="success" size="sm">{invitationCounts.archive || invitationCounts.approved || 0}</Badge>
              )}
            </div>
          }>
            <div className="pt-4 px-4">
              {renderTabContent()}
            </div>
          </Tabs.Item>
        </Tabs>
      </Card>
      {/* Send Invitation Modal */}
      <StandardModal
        title="Send Invitation"
        open={invitationModalVisible}
        onCancel={() => {
          setInvitationModalVisible(false);
          invitationFormState.resetFields();
        }}
        onFinish={handleSendInvitation}
        submitText="Send"
      >
        <div className="space-y-4">
          <FormSelect
            name="type"
            label="Invitation Type"
            value={invitationFormState.values.type || 'landlord'}
            onChange={(e) => invitationFormState.setFieldsValue({ type: e.target.value })}
            required
            options={
              { label: 'Landlord', value: 'landlord' },
              { label: 'Property Management Company (PMC)', value: 'pmc' },
              { label: 'Vendor', value: 'vendor' },
              { label: 'Contractor', value: 'contractor' }
            }
          />
          <FormTextInput
            name="email"
            label="Email"
            type="email"
            value={invitationFormState.values.email}
            onChange={(e) => invitationFormState.setFieldsValue({ email: e.target.value })}
            required
            placeholder="email@example.com"
          />
          {invitationFormState.values.type === 'pmc' ? (
            <FormTextInput
              name="companyName"
              label="Company Name (Optional)"
              value={invitationFormState.values.companyName}
              onChange={(e) => invitationFormState.setFieldsValue({ companyName: e.target.value })}
              placeholder="ABC Property Management"
            />
          ) : invitationFormState.values.type === 'vendor' || invitationFormState.values.type === 'contractor' ? (
            <>
              <FormTextInput
                name="businessName"
                label="Business Name (Optional)"
                value={invitationFormState.values.businessName}
                onChange={(e) => invitationFormState.setFieldsValue({ businessName: e.target.value })}
                placeholder="ABC Services"
              />
              <FormTextInput
                name="contactName"
                label="Contact Name (Optional)"
                value={invitationFormState.values.contactName}
                onChange={(e) => invitationFormState.setFieldsValue({ contactName: e.target.value })}
                placeholder="John Doe"
              />
            </>
          ) : (
            <>
              <FormTextInput
                name="firstName"
                label="First Name (Optional)"
                value={invitationFormState.values.firstName}
                onChange={(e) => invitationFormState.setFieldsValue({ firstName: e.target.value })}
              />
              <FormTextInput
                name="lastName"
                label="Last Name (Optional)"
                value={invitationFormState.values.lastName}
                onChange={(e) => invitationFormState.setFieldsValue({ lastName: e.target.value })}
              />
            </>
          )}
        </div>
      </StandardModal>

      {/* Reject Modal */}
      <StandardModal
        title="Reject Application"
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          rejectFormState.resetFields();
          setSelectedInvitation(null);
        }}
        onFinish={() => {
          if (selectedInvitation) {
            handleReject(selectedInvitation.id, rejectFormState.values.reason);
            setRejectModalVisible(false);
            rejectFormState.resetFields();
            setSelectedInvitation(null);
          }
        }}
        submitText="Reject"
        submitColor="failure"
      >
        <div>
          <Label htmlFor="reason" className="mb-2 block">
            Rejection Reason
            <span className="text-red-500 ml-1">*</span>
          </Label>
          <Textarea
            id="reason"
            name="reason"
            value={rejectFormState.values.reason}
            onChange={(e) => rejectFormState.setFieldsValue({ reason: e.target.value })}
            required
            rows={4}
            placeholder="Explain why this application is being rejected..."
          />
        </div>
      </StandardModal>

      {/* View Details Modal - Used for both invitations and users */}
      <Modal
        show={viewModalVisible}
        onClose={() => {
          setViewModalVisible(false);
          setApplicationDetails(null);
          setSelectedInvitation(null);
          setEditingUser(null);
          setLoadingDetails(false);
        }}
        size={editingUser && activeTab === 'active' ? 'md' : (selectedInvitation?.status === 'completed' ? 'xl' : 'md')}
      >
        <Modal.Header>
          {editingUser && activeTab === 'active' 
            ? "User Details" 
            : selectedInvitation?.status === 'completed' 
              ? "Application Details" 
              : "Invitation Details"}
        </Modal.Header>
        <Modal.Body>
          {editingUser && activeTab === 'active' ? (
            // Show user details for Active tab
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Name</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">
                  {editingUser.displayName || `${editingUser.firstName || ''} ${editingUser.lastName || ''}`.trim() || editingUser.companyName || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{editingUser.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{editingUser.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Role</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">
                  {editingUser.role?.toUpperCase()}{editingUser.adminRole ? ` (${editingUser.adminRole.replace('_', ' ')})` : ''}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{editingUser.status}</p>
              </div>
              {editingUser.role !== 'admin' && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Properties</label>
                  <p className="text-sm text-gray-900 dark:text-white mt-1">{editingUser.propertiesCount || 0}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">
                  {editingUser.createdAt ? new Date(editingUser.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          ) : loadingDetails ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="xl" />
            </div>
          ) : selectedInvitation?.status !== 'completed' ? (
            // Show basic info for non-completed invitations
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedInvitation?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedInvitation?.type?.toUpperCase()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{selectedInvitation?.status?.toUpperCase()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">
                  {selectedInvitation?.createdAt ? new Date(selectedInvitation.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          ) : applicationDetails ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{applicationDetails.invitation?.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{applicationDetails.invitation?.type?.toUpperCase()}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
                <p className="text-sm text-gray-900 dark:text-white mt-1">{applicationDetails.invitation?.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Approval Status</label>
                <div className="mt-1">
                  {applicationDetails.approvalStatus === 'APPROVED' ? (
                    <Badge color="success">Approved</Badge>
                  ) : applicationDetails.approvalStatus === 'REJECTED' ? (
                    <Badge color="failure">Rejected</Badge>
                  ) : (
                    <Badge color="warning">Pending</Badge>
                  )}
                </div>
              </div>
              {applicationDetails.user && (
                <>
                  {applicationDetails.user.firstName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">First Name</label>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">{applicationDetails.user.firstName}</p>
                    </div>
                  )}
                  {applicationDetails.user.lastName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Last Name</label>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">{applicationDetails.user.lastName}</p>
                    </div>
                  )}
                  {applicationDetails.user.companyName && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Company Name</label>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">{applicationDetails.user.companyName}</p>
                    </div>
                  )}
                  {applicationDetails.user.phone && (
                    <div>
                      <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone</label>
                      <p className="text-sm text-gray-900 dark:text-white mt-1">{applicationDetails.user.phone}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">No details available</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={() => {
            setViewModalVisible(false);
            setApplicationDetails(null);
            setSelectedInvitation(null);
            setEditingUser(null);
            setLoadingDetails(false);
          }}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit User Modal */}
      <StandardModal
        title={
          <div className="flex items-center gap-2">
            <HiUser className="h-5 w-5" />
            <span>Edit {editingUser?.role === 'admin' ? 'Admin' : editingUser?.role === 'pmc' ? 'PMC' : editingUser?.role?.charAt(0).toUpperCase() + editingUser?.role?.slice(1)}</span>
          </div>
        }
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingUser(null);
          editFormState.resetFields();
        }}
        onFinish={async () => {
          const success = await handleSaveUser();
          if (success) {
            setEditModalVisible(false);
            setEditingUser(null);
            editFormState.resetFields();
          }
        }}
        submitText="Save Changes"
        loading={saving}
        width={650}
      >
        <div className="space-y-4">
          {/* Role and Status on same row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="role" className="mb-2 block">
                Role
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                id="role"
                value={editFormState.values.role}
                onChange={(e) => editFormState.setFieldsValue({ role: e.target.value })}
                disabled={editingUser?.role === 'admin'}
                required
              >
                <option value="landlord">Landlord</option>
                <option value="pmc">PMC</option>
                <option value="tenant">Tenant</option>
                <option value="admin" disabled>Admin (cannot be changed)</option>
              </Select>
            </div>
            <FormSelect
              name="status"
              label="Status"
              value={editFormState.values.status}
              onChange={(e) => editFormState.setFieldsValue({ status: e.target.value })}
              required
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Pending', value: 'pending' },
                { label: 'Inactive', value: 'inactive' },
                ...(editingUser?.role === 'admin' ? [{ label: 'Locked', value: 'locked' }] : [])
              ]}
            />
          </div>
          
          {editingUser?.role === 'pmc' ? (
            <>
              <FormTextInput
                name="companyName"
                label="Company Name"
                value={editFormState.values.companyName}
                onChange={(e) => editFormState.setFieldsValue({ companyName: e.target.value })}
                required
                placeholder="Company Name"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormPhoneInput
                  name="phone"
                  label="Phone"
                  value={editFormState.values.phone}
                  onChange={(e) => editFormState.setFieldsValue({ phone: e.target.value })}
                  placeholder="(XXX) XXX-XXXX"
                />
                <FormTextInput
                  name="email"
                  label="Email"
                  type="email"
                  value={editFormState.values.email}
                  onChange={(e) => editFormState.setFieldsValue({ email: e.target.value })}
                  required
                  placeholder="email@example.com"
                />
              </div>
            </>
          ) : (
            <>
              {/* First Name and Last Name on same row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormTextInput
                  name="firstName"
                  label="First Name"
                  value={editFormState.values.firstName}
                  onChange={(e) => editFormState.setFieldsValue({ firstName: e.target.value })}
                  required
                  placeholder="First Name"
                />
                <FormTextInput
                  name="lastName"
                  label="Last Name"
                  value={editFormState.values.lastName}
                  onChange={(e) => editFormState.setFieldsValue({ lastName: e.target.value })}
                  required
                  placeholder="Last Name"
                />
              </div>
              
              {/* Phone and Email on same row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormPhoneInput
                  name="phone"
                  label="Phone"
                  value={editFormState.values.phone}
                  onChange={(e) => editFormState.setFieldsValue({ phone: e.target.value })}
                  placeholder="(XXX) XXX-XXXX"
                />
                <FormTextInput
                  name="email"
                  label="Email"
                  type="email"
                  value={editFormState.values.email}
                  onChange={(e) => editFormState.setFieldsValue({ email: e.target.value })}
                  required
                  placeholder="email@example.com"
                />
              </div>
            </>
          )}
          
          {/* User Role - Single Role Selection */}
          <div>
            <Label htmlFor="rbacRoles" className="mb-2 block">
              Role
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              id="rbacRoles"
              value={editFormState.values.rbacRoles}
              onChange={(e) => {
                const selectedRoleId = e.target.value;
                editFormState.setFieldsValue({ rbacRoles: selectedRoleId });
                // Check if PMC_ADMIN is selected
                const selectedRole = availableRBACRoles.find(r => r.id === selectedRoleId);
                const hasPMCAdmin = selectedRole?.name === 'PMC_ADMIN';
                
                // If PMC_ADMIN is not selected, clear PMC selection
                if (!hasPMCAdmin) {
                  setSelectedPMCId(null);
                  editFormState.setFieldsValue({ selectedPMC: null });
                }
              }}
              required
              disabled={loadingAvailableRoles || loadingRBACRoles}
            >
              <option value="">Select a role...</option>
              {availableRBACRoles.map((role) => {
                const displayName = role.displayName || getRoleLabel(role.name) || role.name;
                return (
                  <option key={role.id} value={role.id}>
                    {displayName}
                  </option>
                );
              })}
            </Select>
            {loadingAvailableRoles || loadingRBACRoles && (
              <div className="mt-2">
                <Spinner size="sm" />
              </div>
            )}
          </div>
          
          {/* PMC Company - Show when PMC_ADMIN role is selected */}
          {(() => {
            const selectedRoleId = editFormState.values.rbacRoles;
            const selectedRole = availableRBACRoles.find(r => r.id === selectedRoleId);
            const hasPMCAdmin = selectedRole?.name === 'PMC_ADMIN';
            
            // Also check if user already has PMC_ADMIN role
            const userHasPMCAdmin = userRBACRoles.some(r => r.roleName === 'PMC_ADMIN');
            const showPMCSelector = hasPMCAdmin || userHasPMCAdmin;
            
            if (!showPMCSelector) {
              return null;
            }
            
            // Get current PMC name if available
            const currentPMCAdminRole = userRBACRoles.find(r => r.roleName === 'PMC_ADMIN');
            const currentPMCId = currentPMCAdminRole?.pmcId || selectedPMCId || editFormState.values.selectedPMC;
            
            return (
              <div>
                <Label htmlFor="selectedPMC" className="mb-2 block">
                  PMC Company
                  <span className="text-red-500 ml-1">*</span>
                </Label>
                <Select
                  id="selectedPMC"
                  value={currentPMCId || editFormState.values.selectedPMC || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedPMCId(value);
                    editFormState.setFieldsValue({ selectedPMC: value });
                  }}
                  required
                  disabled={loadingPmcs}
                >
                  <option value="">Select a PMC company...</option>
                  {pmcs.map((pmc) => (
                    <option key={pmc.id} value={pmc.id}>
                      {pmc.companyName} ({pmc.email})
                    </option>
                  ))}
                </Select>
                {loadingPmcs && (
                  <div className="mt-2">
                    <Spinner size="sm" />
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </StandardModal>
      
      {/* RBAC Role Assignment Modal */}
      {editingUser && (
        <RoleAssignmentModal
          visible={rbacRoleModalVisible}
          userId={editingUser.id}
          userType={editingUser.role}
          userName={editingUser.firstName && editingUser.lastName 
            ? `${editingUser.firstName} ${editingUser.lastName}` 
            : editingUser.companyName || editingUser.email}
          userEmail={editingUser.email}
          onClose={() => {
            setRbacRoleModalVisible(false);
          }}
          onSuccess={async () => {
            // Reload RBAC roles after assignment
            if (editingUser) {
              await loadUserRBACRoles(editingUser.id, editingUser.role);
            }
            setSuccessMessage('RBAC roles updated successfully');
            setErrorMessage(null);
            setTimeout(() => setSuccessMessage(null), 5000);
          }}
          assignedBy={currentAdminId}
          assignedByType="admin"
          pmcId={editingUser.pmcId}
          landlordId={editingUser.landlordId}
        />
      )}

      {/* Role Change Modal */}
      <Modal show={roleChangeModalVisible} onClose={() => setRoleChangeModalVisible(false)}>
        <Modal.Header>Change User Role</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <Label>User</Label>
              <p className="text-sm text-gray-600">
                {roleChangeUser?.firstName && roleChangeUser?.lastName
                  ? `${roleChangeUser.firstName} ${roleChangeUser.lastName}`
                  : roleChangeUser?.companyName || roleChangeUser?.email}
                {roleChangeUser?.email && ` (${roleChangeUser.email})`}
              </p>
            </div>
            <div>
              <Label>Current Role</Label>
              <Badge color="blue">{roleChangeUser?.role || 'N/A'}</Badge>
            </div>
            <div>
              <Label htmlFor="role-select">New Role</Label>
              <Select
                id="role-select"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                <option value="super_admin">Super Admin</option>
                <option value="pmc_admin">PMC Admin</option>
                <option value="pm">Property Manager</option>
                <option value="landlord">Landlord</option>
                <option value="tenant">Tenant</option>
                <option value="vendor">Vendor</option>
              </Select>
            </div>
            {errorMessage && (
              <Alert color="failure">{errorMessage}</Alert>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button color="gray" onClick={() => setRoleChangeModalVisible(false)} disabled={changingRole}>
            Cancel
          </Button>
          <Button color="blue" onClick={handleSaveRoleChange} disabled={changingRole || !selectedRole}>
            {changingRole ? <Spinner size="sm" className="mr-2" /> : null}
            Change Role
          </Button>
        </Modal.Footer>
      </Modal>
    </PageLayout>
  );
}
