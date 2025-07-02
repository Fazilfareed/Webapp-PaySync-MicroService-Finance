import { useAuthStore } from '../store/authStore';
import { ROLE_PERMISSIONS } from '../constants/permissions';
import { UserRole } from '../types';

/**
 * Hook to check user permissions based on role
 */
export const usePermissions = () => {
  const { user } = useAuthStore();

  const getUserPermissions = () => {
    if (!user) return null;
    return ROLE_PERMISSIONS[user.role];
  };

  const hasPermission = (resource: string, action: string): boolean => {
    const permissions = getUserPermissions();
    if (!permissions) return false;

    // Type-safe permission checking
    const resourcePermissions = permissions.permissions[resource as keyof typeof permissions.permissions];
    if (!resourcePermissions) return false;

    return resourcePermissions[action as keyof typeof resourcePermissions] === true;
  };

  const canUploadPaymentReceipt = (): boolean => {
    return hasPermission('payments', 'uploadReceipt');
  };

  const canApprovePayments = (): boolean => {
    return hasPermission('payments', 'approve');
  };

  const canViewPaymentHistory = (): boolean => {
    return hasPermission('payments', 'viewHistory');
  };

  const canCreatePayments = (): boolean => {
    return hasPermission('payments', 'create');
  };

  const canUpdatePayments = (): boolean => {
    return hasPermission('payments', 'update');
  };

  const canGeneratePaymentSchedule = (): boolean => {
    return hasPermission('payments', 'generateSchedule');
  };

  const canHandleOverduePayments = (): boolean => {
    return hasPermission('payments', 'handleOverdue');
  };

  const canReadPayments = (): boolean => {
    return hasPermission('payments', 'read');
  };

  // Borrower permissions
  const canCreateBorrowers = (): boolean => {
    return hasPermission('borrowers', 'create');
  };

  const canApproveBorrowers = (): boolean => {
    return hasPermission('borrowers', 'approve');
  };

  // Loan permissions
  const canCreateLoans = (): boolean => {
    return hasPermission('loans', 'create');
  };

  const canApproveLoans = (): boolean => {
    return hasPermission('loans', 'approve');
  };

  // User management permissions
  const canManageUsers = (): boolean => {
    return hasPermission('users', 'create') || hasPermission('users', 'update') || hasPermission('users', 'delete');
  };

  // System permissions
  const canViewSystemLogs = (): boolean => {
    return hasPermission('system', 'viewLogs');
  };

  const canManageSystemSettings = (): boolean => {
    return hasPermission('system', 'manageSettings');
  };

  // Analytics permissions
  const canViewAllAnalytics = (): boolean => {
    return hasPermission('analytics', 'viewAll');
  };

  const canViewRegionalAnalytics = (): boolean => {
    return hasPermission('analytics', 'viewRegional');
  };

  return {
    user,
    permissions: getUserPermissions(),
    hasPermission,
    
    // Payment permissions
    canUploadPaymentReceipt,
    canApprovePayments,
    canViewPaymentHistory,
    canCreatePayments,
    canUpdatePayments,
    canGeneratePaymentSchedule,
    canHandleOverduePayments,
    canReadPayments,
    
    // Borrower permissions
    canCreateBorrowers,
    canApproveBorrowers,
    
    // Loan permissions  
    canCreateLoans,
    canApproveLoans,
    
    // User management permissions
    canManageUsers,
    
    // System permissions
    canViewSystemLogs,
    canManageSystemSettings,
    
    // Analytics permissions
    canViewAllAnalytics,
    canViewRegionalAnalytics,
  };
};

export default usePermissions;
