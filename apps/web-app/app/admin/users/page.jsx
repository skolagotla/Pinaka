"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from '@/lib/hooks';
import {
  Card,
  Table,
  Input,
  Select,
  Space,
  Tag,
  Modal,
  Form,
  message,
  Button,
  Typography,
  Tabs,
  Badge,
  Descriptions,
  Spin,
  Row,
  Col,
  Divider,
  Alert,
} from 'antd';
import {
  UserOutlined,
  PlusOutlined,
  EditOutlined,
  ReloadOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  LockOutlined,
  InfoCircleOutlined,
  SafetyOutlined,
  MailOutlined,
  PhoneOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import { PhoneDisplay, PageLayout, StandardModal, FormTextInput, FormSelect } from '@/components/shared';
import { FormPhoneInput } from '@/components/shared/FormFields';
import { formatPhoneNumber } from '@/lib/utils/formatters';
import { useGridActions } from '@/lib/hooks/useGridActions';
import { createGridActionsColumn } from '@/lib/utils/grid-actions-column';
import RoleAssignmentModal from '@/components/rbac/RoleAssignmentModal';
import { getRoleLabel } from '@/lib/rbac/resourceLabels';

const { Title, Text } = Typography;
const { Option } = Select;

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
  const [invitationForm] = Form.useForm();
  const [rejectForm] = Form.useForm();
  
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

  // Load current admin user ID
  useEffect(() => {
    const loadCurrentAdmin = async () => {
      try {
        const { adminApi } = await import('@/lib/api/admin-api');
        const data = await adminApi.getAdminUser();
        if (data.success) {
          setCurrentAdminId(data.data.id);
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
        message.error('Failed to load PMCs list');
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
        message.error(data.error || 'Failed to fetch users');
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
      message.error(err?.message || 'Failed to fetch users');
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
  const handleSendInvitation = async (values) => {
    try {
      // Use v1Api for invitations (business domain API)
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
        message.success('Invitation sent successfully');
        setInvitationModalVisible(false);
        invitationForm.resetFields();
        fetchInvitations(activeTab);
      } else {
        message.error(data.error || 'Failed to send invitation');
      }
    } catch (err) {
      message.error('Failed to send invitation');
    }
  };

  const handleApprove = useCallback(async (invitationId) => {
    try {
      const invitation = invitations.find((inv) => inv.id === invitationId);
      if (!invitation || invitation.status !== 'completed') {
        message.warning('Only completed invitations can be approved');
        return;
      }

      const response = await fetch(`/api/admin/applications/${invitationId}/approve`, {
        method: 'POST',
      });
      const data = await response.json();
      if (response.ok && data.success) {
        message.success('Application approved successfully');
        // Refresh invitations list (approved invitation will move to Archive tab)
        await fetchInvitations(activeTab);
        // Always refresh active users list so newly approved user appears
        // This ensures the user shows up in Active tab even if we're on a different tab
        await fetchUsers();
      } else {
        message.error(data.error || 'Failed to approve application');
      }
    } catch (err) {
      console.error('[handleApprove] Error:', err);
      message.error('Failed to approve application');
    }
  }, [invitations, activeTab, fetchInvitations, fetchUsers]);

  const handleReject = useCallback(async (invitationId, reason) => {
    try {
      const invitation = invitations.find((inv) => inv.id === invitationId);
      if (!invitation || invitation.status !== 'completed') {
        message.warning('Only completed invitations can be rejected');
        return;
      }

      const response = await fetch(`/api/admin/applications/${invitationId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        message.success('Application rejected');
        fetchInvitations(activeTab);
      } else {
        message.error(data.error || 'Failed to reject application');
      }
    } catch (err) {
      message.error('Failed to reject application');
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
        message.error(data.error || 'Failed to fetch application details');
      }
    } catch (err) {
      console.error('[handleViewDetails] Fetch error:', err);
      message.error('Failed to fetch application details');
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
        message.success('Invitation resent successfully');
        fetchInvitations(activeTab);
      } else {
        message.error(data.error || 'Failed to resend invitation');
      }
    } catch (err) {
      console.error('[handleResendInvitation] Error:', err);
      message.error('Failed to resend invitation');
    }
  }, [activeTab, fetchInvitations]);

  const handleDeleteInvitation = useCallback(async (invitationId) => {
    console.log('[handleDeleteInvitation] Called with:', invitationId);
    if (!invitationId) {
      console.error('[handleDeleteInvitation] No invitation ID provided');
      message.error('Invalid invitation ID');
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
        message.success('Invitation deleted successfully');
        // Refresh the list
        await fetchInvitations(activeTab);
      } else {
        console.error('[handleDeleteInvitation] API error:', data.error);
        message.error(data.error || 'Failed to delete invitation');
      }
    } catch (err) {
      console.error('[handleDeleteInvitation] Fetch error:', err);
      message.error('Failed to delete invitation');
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
  const [editForm] = Form.useForm();
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
        editForm.setFieldsValue({
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
  }, [editForm]);

  // Effect to set form value when both available roles and user roles are loaded
  useEffect(() => {
    if (!editModalVisible) return;
    
    // If available roles are loaded and user has no roles, clear the form
    if (availableRBACRoles.length > 0 && userRBACRoles.length === 0) {
      const timer = setTimeout(() => {
        editForm.setFieldsValue({
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
          editForm.setFieldsValue({
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
  }, [availableRBACRoles, userRBACRoles, editModalVisible, editForm]);

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
      editForm.resetFields();
      // Clear previous RBAC roles state
      setUserRBACRoles([]);
      setInitialRBACRoles([]);
      setSelectedPMCId(null); // Reset PMC selector
      
      // Fetch user details first
      const { adminApi } = await import('@/lib/api/admin-api');
      // Note: adminApi.getUsers() doesn't support getting single user by ID yet
      // For now, keep using fetch for this endpoint
      const response = await fetch(`/api/admin/users/${user.id}?role=${user.role}`);
      const data = await response.json();
      console.log('[handleEditUser] API response:', data);
      if (response.ok && data.success) {
        setEditingUser(data.data);
        
        // Load both available roles and user roles in parallel to avoid closure issues
        const [availableRolesData, userRolesResponse] = await Promise.all([
          adminApi.getRBACRoles(),
          fetch(`/api/rbac/users/${user.id}/roles?userType=${user.role}`),
        ]);
        
        const userRolesData = await userRolesResponse.json();
        
        let loadedAvailableRoles = [];
        let loadedUserRoles = [];
        
        if (availableRolesData.success) {
          loadedAvailableRoles = availableRolesData.data || [];
          setAvailableRBACRoles(loadedAvailableRoles);
          console.log('[handleEditUser] Loaded available roles:', loadedAvailableRoles.length);
        }
        
        if (userRolesResponse.ok && userRolesData.success) {
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
              editForm.setFieldsValue({
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
            editForm.setFieldsValue({
              companyName: data.data.companyName || '',
              phone: data.data.phone ? formatPhoneNumber(data.data.phone) : '',
              email: data.data.email || '',
              role: data.data.role,
              status: data.data.status || (data.data.approvalStatus === 'APPROVED' ? 'active' : data.data.approvalStatus === 'PENDING' ? 'pending' : 'inactive'),
            });
          } else if (data.data.role === 'admin') {
            editForm.setFieldsValue({
              firstName: data.data.firstName || '',
              lastName: data.data.lastName || '',
              phone: data.data.phone ? formatPhoneNumber(data.data.phone) : '',
              email: data.data.email || '',
              role: data.data.role,
              adminRole: data.data.adminRole || '',
              status: data.data.status || (data.data.isActive && !data.data.isLocked ? 'active' : data.data.isLocked ? 'locked' : 'inactive'),
            });
          } else {
            editForm.setFieldsValue({
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
        message.error(data.error || 'Failed to fetch user details');
      }
    } catch (err) {
      console.error('[handleEditUser] Error:', err);
      message.error('Failed to fetch user details');
    }
  }, [editForm, loadUserRBACRoles, loadAvailableRBACRoles]);

  // Handle save user edits
  const handleSaveUser = useCallback(async () => {
    if (!editingUser) {
      message.error('No user selected for editing');
      return false;
    }
    
    setSaving(true);
    try {
      const values = await editForm.validateFields();
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
              
              message.success('Role updated successfully');
            } else {
              console.warn('[RBAC Update] No new role ID provided, skipping role assignment');
            }
        } catch (rbacError) {
          console.error('Error updating RBAC role:', rbacError);
          message.warning('User updated but role may not have been updated: ' + rbacError.message);
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
                
                message.success('PMC company updated successfully');
              }
            }
        } catch (rbacError) {
          console.error('Error updating PMC for role:', rbacError);
          message.warning('User updated but PMC may not have been updated: ' + rbacError.message);
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
        message.success('User updated successfully');
        
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
        editForm.resetFields();
        // Refresh the users list
        await fetchUsers();
        return true;
      } else {
        message.error(data.error || 'Failed to update user');
        return false;
      }
    } catch (err) {
      if (err.errorFields) {
        // Form validation errors - Ant Design will show these automatically
        console.log('[handleSaveUser] Validation errors:', err.errorFields);
        return false;
      }
      console.error('[handleSaveUser] Error:', err);
      message.error(err.message || 'Failed to update user');
      return false;
    } finally {
      setSaving(false);
    }
  }, [editingUser, editForm, fetchUsers]);

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
        return <Tag color={colors[type] || 'default'}>{type?.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        if (!status) return <Tag>N/A</Tag>;
        const colors = {
          pending: 'orange',
          sent: 'blue',
          opened: 'cyan',
          completed: 'green',
          expired: 'default',
          cancelled: 'red',
        };
        return <Tag color={colors[status] || 'default'}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Approval Status',
      key: 'approvalStatus',
      render: (_, record) => {
        if (record?.status !== 'completed') {
          return <Tag>N/A</Tag>;
        }
        const approvalStatus = record?.approvalStatus;
        if (!approvalStatus || approvalStatus === 'PENDING') {
          return <Tag color="orange" icon={<ClockCircleOutlined />}>Pending Approval</Tag>;
        }
        if (approvalStatus === 'APPROVED') {
          return <Tag color="green" icon={<CheckCircleOutlined />}>Approved</Tag>;
        }
        if (approvalStatus === 'REJECTED') {
          return <Tag color="red" icon={<CloseCircleOutlined />}>Rejected</Tag>;
        }
        return <Tag>{approvalStatus}</Tag>;
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
            <Space>
              {renderOtherActions(record)}
              {isApproved && (
                <Tag color="green" icon={<CheckCircleOutlined />}>
                  Approved
                </Tag>
              )}
              {isRejected && (
                <Tag color="red" icon={<CloseCircleOutlined />}>
                  Rejected
                </Tag>
              )}
            </Space>
          );
        }
        return <span style={{ color: '#999' }}>-</span>;
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
                  <Tag color="purple">
                    {roleLabel}
                  </Tag>
                );
              }
            }
            // Fall back to base admin role if no RBAC role
            return (
              <Tag color="purple">
                ADMIN {record.adminRole ? `(${record.adminRole.replace('_', ' ')})` : ''}
              </Tag>
            );
          }
          const colors = { landlord: 'blue', pmc: 'green', vendor: 'orange', contractor: 'purple', tenant: 'cyan' };
          return <Tag color={colors[role] || 'default'}>{role?.toUpperCase()}</Tag>;
        },
      },
      {
        title: 'Status',
        dataIndex: 'status',
        key: 'status',
        render: (status) => {
          if (status === 'active') return <Tag color="success">Active</Tag>;
          if (status === 'pending') return <Tag color="warning">Pending</Tag>;
          if (status === 'inactive') return <Tag color="error">Inactive</Tag>;
          if (status === 'locked') return <Tag color="red">Locked</Tag>;
          return <Tag>N/A</Tag>;
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
        render: (_, record) => renderUserActions(record),
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
          <Space wrap style={{ marginBottom: 16 }}>
            <Input
              placeholder="Search by name, email, or role"
              prefix={<SearchOutlined />}
              style={{ width: 300 }}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onPressEnter={fetchUsers}
            />
            <Select
              style={{ width: 150 }}
              value={userFilters.role}
              onChange={(value) => {
                setUserFilters({ ...userFilters, role: value });
                // Reset to page 1 when filter changes
                setUserPagination(prev => ({ ...prev, page: 1 }));
              }}
            >
              <Option value="all">All Roles</Option>
              <Option value="admin">Admins</Option>
              <Option value="landlord">Landlords</Option>
              <Option value="pmc">PMCs</Option>
              <Option value="tenant">Tenants</Option>
            </Select>
            <Select
              style={{ width: 150 }}
              value={userFilters.status}
              onChange={(value) => {
                setUserFilters({ ...userFilters, status: value || 'all' });
                // Reset to page 1 when filter changes
                setUserPagination(prev => ({ ...prev, page: 1 }));
              }}
              placeholder="Status"
            >
              <Option value="all">All Status</Option>
              <Option value="active">Active</Option>
              <Option value="pending">Pending</Option>
              <Option value="inactive">Inactive</Option>
            </Select>
            <Button 
              type="primary" 
              icon={<SearchOutlined />}
              onClick={fetchUsers}
            >
              Search
            </Button>
          </Space>
          <Table
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
        <Table
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
      headerTitle={<><UserOutlined /> Users</>}
      headerActions={[
        <Button key="refresh" icon={<ReloadOutlined />} onClick={handleRefresh} size="small">
          Refresh
        </Button>,
        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => setInvitationModalVisible(true)} size="small">
          Send Invitation
        </Button>
      ]}
      contentStyle={{ padding: 0 }}
    >
      <Tabs
        activeKey={activeTab}
        onChange={(key) => {
          setActiveTab(key);
        }}
        style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        items={[
          {
            key: 'active',
            label: <span>Active</span>,
            children: (
              <div style={{ flex: 1, overflow: 'auto', paddingTop: 12 }}>
                {renderTabContent()}
              </div>
            ),
          },
          {
            key: 'pending',
            label: (
              <Badge count={invitationCounts.pending} offset={[10, 0]}>
                <span>Pending</span>
              </Badge>
            ),
            children: (
              <div style={{ flex: 1, overflow: 'auto', paddingTop: 12 }}>
                {renderTabContent()}
              </div>
            ),
          },
          {
            key: 'rejected',
            label: (
              <Badge count={invitationCounts.rejected} offset={[10, 0]}>
                <span>Rejected</span>
              </Badge>
            ),
            children: (
              <div style={{ flex: 1, overflow: 'auto', paddingTop: 12 }}>
                {renderTabContent()}
              </div>
            ),
          },
          {
            key: 'archive',
            label: (
              <Badge count={invitationCounts.archive || invitationCounts.approved || 0} offset={[10, 0]}>
                <span>Archive</span>
              </Badge>
            ),
            children: (
              <div style={{ flex: 1, overflow: 'auto', paddingTop: 12 }}>
                {renderTabContent()}
              </div>
            ),
          },
        ]}
      />
      {/* Send Invitation Modal */}
      <StandardModal
        title="Send Invitation"
        open={invitationModalVisible}
        form={invitationForm}
        loading={false}
        submitText="Send"
        onCancel={() => {
          setInvitationModalVisible(false);
          invitationForm.resetFields();
        }}
        onFinish={handleSendInvitation}
        initialValues={{ type: 'landlord' }}
      >
        <FormSelect
          name="type"
          label="Invitation Type"
          required
          options={[
            { label: 'Landlord', value: 'landlord' },
            { label: 'Property Management Company (PMC)', value: 'pmc' },
            { label: 'Vendor', value: 'vendor' },
            { label: 'Contractor', value: 'contractor' }
          ]}
        />
        <FormTextInput
          name="email"
          label="Email"
          type="email"
          required
          placeholder="email@example.com"
        />
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
        >
          {({ getFieldValue }) => {
            const type = getFieldValue('type');
            if (type === 'pmc') {
              return (
                <FormTextInput
                  name="companyName"
                  label="Company Name (Optional)"
                  placeholder="ABC Property Management"
                />
              );
            }
            if (type === 'vendor' || type === 'contractor') {
              return (
                <>
                  <FormTextInput
                    name="businessName"
                    label="Business Name (Optional)"
                    placeholder="ABC Services"
                  />
                  <FormTextInput
                    name="contactName"
                    label="Contact Name (Optional)"
                    placeholder="John Doe"
                  />
                </>
              );
            }
            return (
              <>
                <FormTextInput
                  name="firstName"
                  label="First Name (Optional)"
                />
                <FormTextInput
                  name="lastName"
                  label="Last Name (Optional)"
                />
              </>
            );
          }}
        </Form.Item>
      </StandardModal>

      {/* Reject Modal */}
      <StandardModal
        title="Reject Application"
        open={rejectModalVisible}
        form={rejectForm}
        loading={false}
        submitText="Reject"
        onCancel={() => {
          setRejectModalVisible(false);
          rejectForm.resetFields();
          setSelectedInvitation(null);
        }}
        onFinish={(values) => {
          if (selectedInvitation) {
            handleReject(selectedInvitation.id, values.reason);
            setRejectModalVisible(false);
            rejectForm.resetFields();
            setSelectedInvitation(null);
          }
        }}
      >
        <FormTextInput
          name="reason"
          label="Rejection Reason"
          textArea
          rows={4}
          required
          placeholder="Explain why this application is being rejected..."
        />
      </StandardModal>

      {/* View Details Modal - Used for both invitations and users */}
      <Modal
        title={
          editingUser && activeTab === 'active' 
            ? "User Details" 
            : selectedInvitation?.status === 'completed' 
              ? "Application Details" 
              : "Invitation Details"
        }
        open={viewModalVisible}
        onCancel={() => {
          setViewModalVisible(false);
          setApplicationDetails(null);
          setSelectedInvitation(null);
          setEditingUser(null);
          setLoadingDetails(false);
        }}
        footer={[
          <Button key="close" onClick={() => {
            setViewModalVisible(false);
            setApplicationDetails(null);
            setSelectedInvitation(null);
            setEditingUser(null);
            setLoadingDetails(false);
          }}>
            Close
          </Button>,
        ]}
        width={editingUser && activeTab === 'active' ? 500 : (selectedInvitation?.status === 'completed' ? 800 : 500)}
      >
        {editingUser && activeTab === 'active' ? (
          // Show user details for Active tab
          <div>
            <p><strong>Name:</strong> {editingUser.displayName || `${editingUser.firstName || ''} ${editingUser.lastName || ''}`.trim() || editingUser.companyName || 'N/A'}</p>
            <p><strong>Email:</strong> {editingUser.email}</p>
            <p><strong>Phone:</strong> {editingUser.phone || 'N/A'}</p>
            <p><strong>Role:</strong> {editingUser.role?.toUpperCase()}{editingUser.adminRole ? ` (${editingUser.adminRole.replace('_', ' ')})` : ''}</p>
            <p><strong>Status:</strong> {editingUser.status}</p>
            {editingUser.role !== 'admin' && (
              <p><strong>Properties:</strong> {editingUser.propertiesCount || 0}</p>
            )}
            <p><strong>Created:</strong> {editingUser.createdAt ? new Date(editingUser.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
        ) : loadingDetails ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin />
          </div>
        ) : selectedInvitation?.status !== 'completed' ? (
          // Show basic info for non-completed invitations
          <div>
            <p><strong>Email:</strong> {selectedInvitation?.email}</p>
            <p><strong>Type:</strong> {selectedInvitation?.type?.toUpperCase()}</p>
            <p><strong>Status:</strong> {selectedInvitation?.status?.toUpperCase()}</p>
            <p><strong>Created:</strong> {selectedInvitation?.createdAt ? new Date(selectedInvitation.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
        ) : applicationDetails ? (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Email">{applicationDetails.invitation?.email}</Descriptions.Item>
            <Descriptions.Item label="Type">{applicationDetails.invitation?.type?.toUpperCase()}</Descriptions.Item>
            <Descriptions.Item label="Status">{applicationDetails.invitation?.status}</Descriptions.Item>
            <Descriptions.Item label="Approval Status">
              {applicationDetails.approvalStatus === 'APPROVED' ? (
                <Tag color="green">Approved</Tag>
              ) : applicationDetails.approvalStatus === 'REJECTED' ? (
                <Tag color="red">Rejected</Tag>
              ) : (
                <Tag color="orange">Pending</Tag>
              )}
            </Descriptions.Item>
            {applicationDetails.user && (
              <>
                {applicationDetails.user.firstName && (
                  <Descriptions.Item label="First Name">{applicationDetails.user.firstName}</Descriptions.Item>
                )}
                {applicationDetails.user.lastName && (
                  <Descriptions.Item label="Last Name">{applicationDetails.user.lastName}</Descriptions.Item>
                )}
                {applicationDetails.user.companyName && (
                  <Descriptions.Item label="Company Name">{applicationDetails.user.companyName}</Descriptions.Item>
                )}
                {applicationDetails.user.phone && (
                  <Descriptions.Item label="Phone">{applicationDetails.user.phone}</Descriptions.Item>
                )}
              </>
            )}
          </Descriptions>
        ) : (
          <div>No details available</div>
        )}
      </Modal>

      {/* Edit User Modal */}
      <StandardModal
        title={
          <Space>
            <UserOutlined />
            <span>Edit {editingUser?.role === 'admin' ? 'Admin' : editingUser?.role === 'pmc' ? 'PMC' : editingUser?.role?.charAt(0).toUpperCase() + editingUser?.role?.slice(1)}</span>
          </Space>
        }
        open={editModalVisible}
        form={editForm}
        loading={saving}
        submitText="Save Changes"
        onCancel={() => {
          setEditModalVisible(false);
          setEditingUser(null);
          editForm.resetFields();
        }}
        onFinish={async (values) => {
          const success = await handleSaveUser();
          if (success) {
            setEditModalVisible(false);
            setEditingUser(null);
            editForm.resetFields();
          }
        }}
        width={650}
        destroyOnClose={false}
        preserve={false}
      >
        {/* Role and Status on same row */}
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="role"
              label="Role"
              rules={[{ required: true, message: 'Please select a role' }]}
            >
              <Select placeholder="Select Role" disabled={editingUser?.role === 'admin'}>
                <Select.Option value="landlord">Landlord</Select.Option>
                <Select.Option value="pmc">PMC</Select.Option>
                <Select.Option value="tenant">Tenant</Select.Option>
                <Select.Option value="admin" disabled>Admin (cannot be changed)</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <FormSelect
              name="status"
              label="Status"
              required
              options={[
                { label: 'Active', value: 'active' },
                { label: 'Pending', value: 'pending' },
                { label: 'Inactive', value: 'inactive' },
                ...(editingUser?.role === 'admin' ? [{ label: 'Locked', value: 'locked' }] : [])
              ]}
            />
          </Col>
        </Row>
        
        {editingUser?.role === 'pmc' ? (
          <>
            <FormTextInput
              name="companyName"
              label="Company Name"
              required
              placeholder="Company Name"
            />
            <Row gutter={16}>
              <Col span={12}>
                <FormPhoneInput
                  name="phone"
                  label="Phone"
                  placeholder="(XXX) XXX-XXXX"
                />
              </Col>
              <Col span={12}>
                <FormTextInput
                  name="email"
                  label="Email"
                  type="email"
                  required
                  placeholder="email@example.com"
                />
              </Col>
            </Row>
          </>
        ) : (
          <>
            {/* First Name and Last Name on same row */}
            <Row gutter={16}>
              <Col span={12}>
                <FormTextInput
                  name="firstName"
                  label="First Name"
                  required
                  placeholder="First Name"
                />
              </Col>
              <Col span={12}>
                <FormTextInput
                  name="lastName"
                  label="Last Name"
                  required
                  placeholder="Last Name"
                />
              </Col>
            </Row>
            
            {/* Phone and Email on same row */}
            <Row gutter={16}>
              <Col span={12}>
                <FormPhoneInput
                  name="phone"
                  label="Phone"
                  placeholder="(XXX) XXX-XXXX"
                />
              </Col>
              <Col span={12}>
                <FormTextInput
                  name="email"
                  label="Email"
                  type="email"
                  required
                  placeholder="email@example.com"
                />
              </Col>
            </Row>
            
          </>
        )}
        
        {/* User Role - Single Role Selection */}
        <Form.Item
          name="rbacRoles"
          label="Role"
          tooltip="Select the role for this user. This determines what they can do in the system."
          rules={[{ required: true, message: 'Please select a role' }]}
        >
          <Select
            placeholder="Select a role..."
            loading={loadingAvailableRoles || loadingRBACRoles}
            style={{ width: '100%' }}
            showSearch
            filterOption={(input, option) => {
              const label = option?.label || option?.children || '';
              return String(label).toLowerCase().includes(input.toLowerCase());
            }}
            notFoundContent={loadingAvailableRoles || loadingRBACRoles ? <Spin size="small" /> : 'No roles available'}
            onChange={(selectedRoleId) => {
              // Check if PMC_ADMIN is selected
              const selectedRole = availableRBACRoles.find(r => r.id === selectedRoleId);
              const hasPMCAdmin = selectedRole?.name === 'PMC_ADMIN';
              
              // If PMC_ADMIN is not selected, clear PMC selection
              if (!hasPMCAdmin) {
                setSelectedPMCId(null);
                editForm.setFieldsValue({ selectedPMC: null });
              }
            }}
          >
            {availableRBACRoles.map((role) => {
              const displayName = role.displayName || getRoleLabel(role.name) || role.name;
              return (
                <Select.Option key={role.id} value={role.id} label={displayName}>
                  {displayName}
                </Select.Option>
              );
            })}
          </Select>
        </Form.Item>
        
        {/* PMC Company - Show when PMC_ADMIN role is selected */}
        <Form.Item
          noStyle
          shouldUpdate={(prevValues, currentValues) => {
            const prevRole = prevValues.rbacRoles;
            const currentRole = currentValues.rbacRoles;
            return prevRole !== currentRole;
          }}
        >
          {({ getFieldValue }) => {
            const selectedRoleId = getFieldValue('rbacRoles');
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
            const currentPMCId = currentPMCAdminRole?.pmcId || selectedPMCId || getFieldValue('selectedPMC');
            
            return (
              <Form.Item
                name="selectedPMC"
                label="PMC Company"
                tooltip="Select the Property Management Company this admin will manage"
                rules={[
                  {
                    required: true,
                    message: 'Please select a PMC company',
                  },
                ]}
              >
                <Select
                  placeholder="Select a PMC company..."
                  loading={loadingPmcs}
                  style={{ width: '100%' }}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.children || '').toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(value) => {
                    setSelectedPMCId(value);
                  }}
                >
                  {pmcs.map((pmc) => (
                    <Select.Option key={pmc.id} value={pmc.id}>
                      {pmc.companyName} ({pmc.email})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            );
          }}
        </Form.Item>
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
            message.success('RBAC roles updated successfully');
          }}
          assignedBy={currentAdminId}
          assignedByType="admin"
          pmcId={editingUser.pmcId}
          landlordId={editingUser.landlordId}
        />
      )}
    </PageLayout>
  );
}
