import { RolePermissions, UserRole } from '../types';

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  super_admin: {
    role: 'super_admin',
    permissions: {
      users: {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
      borrowers: {
        create: true,
        read: true,
        update: true,
        delete: true,
        approve: true,
      },
      loans: {
        create: true,
        read: true,
        update: true,
        delete: true,
        approve: true,
      },
      payments: {
        create: true,
        read: true,
        update: true,
        approve: true,
        uploadReceipt: true,
        viewHistory: true,
        generateSchedule: true,
        handleOverdue: true,
      },
      regions: {
        create: true,
        read: true,
        update: true,
        assign: true,
      },
      analytics: {
        viewAll: true,
        viewRegional: true,
        exportReports: true,
      },
      system: {
        viewLogs: true,
        manageSettings: true,
        overrideActions: true,
      },
    },
  },
  moderate_admin: {
    role: 'moderate_admin',
    permissions: {
      users: {
        create: true,
        read: true,
        update: true,
        delete: true,
      },
      borrowers: {
        create: false,
        read: true,
        update: true,
        delete: false,
        approve: false,
      },
      loans: {
        create: false,
        read: true,
        update: true,
        delete: false,
        approve: false,
      },
      payments: {
        create: false,
        read: true,
        update: false,
        approve: false,
        uploadReceipt: false,
        viewHistory: true,
        generateSchedule: false,
        handleOverdue: false,
      },
      regions: {
        create: true,
        read: true,
        update: true,
        assign: true,
      },
      analytics: {
        viewAll: true,
        viewRegional: true,
        exportReports: true,
      },
      system: {
        viewLogs: false,
        manageSettings: false,
        overrideActions: false,
      },
    },
  },
  ceo: {
    role: 'ceo',
    permissions: {
      users: {
        create: false,
        read: true,
        update: false,
        delete: false,
      },
      borrowers: {
        create: false,
        read: true,
        update: false,
        delete: false,
        approve: false,
      },
      loans: {
        create: false,
        read: true,
        update: false,
        delete: false,
        approve: false,
      },
      payments: {
        create: false,
        read: true,
        update: false,
        approve: false,
        uploadReceipt: false,
        viewHistory: true,
        generateSchedule: false,
        handleOverdue: false,
      },
      regions: {
        create: false,
        read: true,
        update: false,
        assign: false,
      },
      analytics: {
        viewAll: true,
        viewRegional: true,
        exportReports: true,
      },
      system: {
        viewLogs: false,
        manageSettings: false,
        overrideActions: false,
      },
    },
  },
  regional_admin: {
    role: 'regional_admin',
    permissions: {
      users: {
        create: false,
        read: true,
        update: false,
        delete: false,
      },
      borrowers: {
        create: false,
        read: true,
        update: true,
        delete: false,
        approve: true,
      },
      loans: {
        create: false,
        read: true,
        update: true,
        delete: false,
        approve: true,
      },
      payments: {
        create: false,
        read: true,
        update: true,
        approve: true,
        uploadReceipt: false,
        viewHistory: true,
        generateSchedule: false,
        handleOverdue: true,
      },
      regions: {
        create: false,
        read: true,
        update: false,
        assign: false,
      },
      analytics: {
        viewAll: false,
        viewRegional: true,
        exportReports: true,
      },
      system: {
        viewLogs: false,
        manageSettings: false,
        overrideActions: false,
      },
    },
  },
  agent: {
    role: 'agent',
    permissions: {
      users: {
        create: false,
        read: false,
        update: false,
        delete: false,
      },
      borrowers: {
        create: true,
        read: true,
        update: true,
        delete: false,
        approve: false,
      },
      loans: {
        create: true,
        read: true,
        update: true,
        delete: false,
        approve: false,
      },
      payments: {
        create: true,
        read: true,
        update: false,
        approve: false,
        uploadReceipt: true,
        viewHistory: true,
        generateSchedule: false,
        handleOverdue: false,
      },
      regions: {
        create: false,
        read: true,
        update: false,
        assign: false,
      },
      analytics: {
        viewAll: false,
        viewRegional: false,
        exportReports: false,
      },
      system: {
        viewLogs: false,
        manageSettings: false,
        overrideActions: false,
      },
    },
  },
};

// Dashboard route mapping based on user role
export const ROLE_DASHBOARD_ROUTES: Record<UserRole, string> = {
  super_admin: '/dashboard/super-admin',
  moderate_admin: '/dashboard/moderate-admin',
  ceo: '/dashboard/ceo',
  regional_admin: '/dashboard/regional-admin',
  agent: '/dashboard/agent',
};

// Navigation items for each role
export const ROLE_NAVIGATION: Record<UserRole, Array<{
  title: string;
  href: string;
  icon: string;
  description?: string;
}>> = {
  super_admin: [
    { title: 'Dashboard', href: '/dashboard/super-admin', icon: 'layout-dashboard', description: 'System overview and metrics' },
    { title: 'System Logs', href: '/dashboard/super-admin/logs', icon: 'file-bar-chart', description: 'Monitor system activity' },
    { title: 'User Management', href: '/dashboard/super-admin/users', icon: 'users', description: 'Manage all users' },
    { title: 'Role Management', href: '/dashboard/super-admin/roles', icon: 'shield', description: 'Configure user permissions' },
    { title: 'System Settings', href: '/dashboard/super-admin/settings', icon: 'settings', description: 'System configuration' },
    { title: 'Developer Tools', href: '/dashboard/super-admin/developer', icon: 'code', description: 'Development utilities' },
  ],
  moderate_admin: [
    { title: 'Dashboard', href: '/dashboard/moderate-admin', icon: 'layout-dashboard', description: 'Administrative overview' },
    { title: 'User Management', href: '/dashboard/moderate-admin/users', icon: 'users', description: 'Create and manage users' },
    { title: 'Region Management', href: '/dashboard/moderate-admin/regions', icon: 'map-pin', description: 'Manage geographical regions' },
    { title: 'Admin Assignment', href: '/dashboard/moderate-admin/assignments', icon: 'user-check', description: 'Assign regional admins' },
    { title: 'Reports', href: '/dashboard/moderate-admin/reports', icon: 'bar-chart-3', description: 'Administrative reports' },
  ],
  ceo: [
    { title: 'Dashboard', href: '/dashboard/ceo', icon: 'layout-dashboard', description: 'Executive overview' },
    { title: 'Business Intelligence', href: '/dashboard/ceo/analytics', icon: 'trending-up', description: 'Strategic insights' },
    { title: 'Performance Reports', href: '/dashboard/ceo/reports', icon: 'file-spreadsheet', description: 'Company performance' },
    { title: 'Regional Overview', href: '/dashboard/ceo/regions', icon: 'building-2', description: 'Regional performance' },
    { title: 'KPI Monitoring', href: '/dashboard/ceo/kpis', icon: 'target', description: 'Key performance indicators' },
  ],
  regional_admin: [
    { title: 'Dashboard', href: '/dashboard/regional-admin', icon: 'layout-dashboard', description: 'Regional overview' },
    { title: 'Borrower Approval', href: '/dashboard/regional-admin/borrowers', icon: 'user-check', description: 'Approve borrower applications' },
    { title: 'Loan Management', href: '/dashboard/regional-admin/loans', icon: 'handshake', description: 'Manage loan portfolio' },
    { title: 'Payment Approval', href: '/dashboard/regional-admin/payments', icon: 'check-circle', description: 'Review payment requests' },
    { title: 'Agent Oversight', href: '/dashboard/regional-admin/agents', icon: 'briefcase', description: 'Supervise field agents' },
    { title: 'Regional Reports', href: '/dashboard/regional-admin/reports', icon: 'file-bar-chart', description: 'Regional analytics' },
  ],
  agent: [
    { title: 'Dashboard', href: '/dashboard/agent', icon: 'layout-dashboard', description: 'Agent workspace' },
    { title: 'Borrower Registration', href: '/dashboard/agent/borrowers', icon: 'user-plus', description: 'Register new borrowers' },
    { title: 'Loan Applications', href: '/dashboard/agent/loans', icon: 'book-open', description: 'Process loan applications' },
    { title: 'Payment Upload', href: '/dashboard/agent/payments', icon: 'receipt', description: 'Upload payment receipts' },
    { title: 'Document Upload', href: '/dashboard/agent/documents', icon: 'upload', description: 'Manage documents' },
    { title: 'My Commission', href: '/dashboard/agent/commission', icon: 'calculator', description: 'Track earnings' },
    { title: 'Borrower List', href: '/dashboard/agent/my-borrowers', icon: 'users', description: 'Manage client portfolio' },
  ],
};

// Mock credentials for development
export const MOCK_CREDENTIALS = {
  super_admin: { email: 'superadmin@paysync.com', password: 'super123' },
  moderate_admin: { email: 'moderateadmin@paysync.com', password: 'moderate123' },
  ceo: { email: 'ceo@paysync.com', password: 'ceo123' },
  regional_admin: { email: 'regional@paysync.com', password: 'regional123' },
  agent: { email: 'agent@paysync.com', password: 'agent123' },
};

// Color scheme for roles (for UI differentiation)
export const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: '#ef4444', // Red
  moderate_admin: '#f59e0b', // Amber
  ceo: '#8b5cf6', // Violet
  regional_admin: '#06b6d4', // Cyan
  agent: '#10b981', // Emerald
};

// Default pagination settings
export const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc' as const,
};

// Application constants
export const APP_CONFIG = {
  name: 'PaySync',
  version: '1.0.0',
  description: 'Loan Management System',
  company: 'PaySync Financial Services',
  supportEmail: 'support@paysync.com',
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
};
