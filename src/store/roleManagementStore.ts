import { create } from 'zustand';
import { RoleManagement, PermissionAction, UserRole } from '../types';

interface RoleFormData {
  roleName: string;
  displayName: string;
  description: string;
  level: number;
  permissions: string[];
}

interface RoleManagementStore {
  roles: RoleManagement[];
  permissions: PermissionAction[];
  selectedRole: RoleManagement | null;
  isLoading: boolean;
  isModalOpen: boolean;
  modalMode: 'create' | 'edit' | 'view';
  
  // Actions
  fetchRoles: () => Promise<void>;
  fetchPermissions: () => Promise<void>;
  createRole: (roleData: RoleFormData) => Promise<void>;
  updateRole: (id: string, roleData: Partial<RoleFormData>) => Promise<void>;
  deleteRole: (id: string) => Promise<void>;
  duplicateRole: (id: string) => Promise<void>;
  
  // Permission actions
  updateRolePermissions: (roleId: string, permissions: string[]) => Promise<void>;
  
  // Modal actions
  openModal: (mode: 'create' | 'edit' | 'view', role?: RoleManagement) => void;
  closeModal: () => void;
}

// Mock data generators
const generateMockPermissions = (): PermissionAction[] => {
  const resourcePermissions = [
    // User permissions
    { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'manage_roles'] },
    // Borrower permissions
    { resource: 'borrowers', actions: ['create', 'read', 'update', 'delete', 'approve', 'reject'] },
    // Loan permissions
    { resource: 'loans', actions: ['create', 'read', 'update', 'delete', 'approve', 'reject', 'disburse'] },
    // Payment permissions
    { resource: 'payments', actions: ['create', 'read', 'update', 'approve', 'reject', 'process'] },
    // Region permissions
    { resource: 'regions', actions: ['create', 'read', 'update', 'assign', 'manage'] },
    // Analytics permissions
    { resource: 'analytics', actions: ['view_all', 'view_regional', 'export_reports', 'view_financial'] },
    // System permissions
    { resource: 'system', actions: ['view_logs', 'manage_settings', 'override_actions', 'backup', 'restore'] },
    // Document permissions
    { resource: 'documents', actions: ['upload', 'download', 'delete', 'approve', 'reject'] },
    // Commission permissions
    { resource: 'commissions', actions: ['calculate', 'approve', 'pay', 'view', 'manage'] },
    // Report permissions
    { resource: 'reports', actions: ['generate', 'schedule', 'export', 'share', 'archive'] },
  ];

  const permissions: PermissionAction[] = [];
  let id = 1;

  resourcePermissions.forEach(({ resource, actions }) => {
    actions.forEach(action => {
      permissions.push({
        id: `perm_${id++}`,
        name: `${resource}.${action}`,
        description: `${action.replace('_', ' ')} ${resource}`,
        resource,
        isSystemLevel: ['system', 'analytics'].includes(resource),
      });
    });
  });

  return permissions;
};

const generateMockRoles = (): RoleManagement[] => {
  return [
    {
      id: 'role_1',
      roleName: 'super_admin',
      displayName: 'Super Administrator',
      description: 'Full system access with all permissions',
      level: 1,
      isSystemRole: true,
      permissions: [
        'users.create', 'users.read', 'users.update', 'users.delete', 'users.manage_roles',
        'borrowers.create', 'borrowers.read', 'borrowers.update', 'borrowers.delete', 'borrowers.approve', 'borrowers.reject',
        'loans.create', 'loans.read', 'loans.update', 'loans.delete', 'loans.approve', 'loans.reject', 'loans.disburse',
        'payments.create', 'payments.read', 'payments.update', 'payments.approve', 'payments.reject', 'payments.process',
        'regions.create', 'regions.read', 'regions.update', 'regions.assign', 'regions.manage',
        'analytics.view_all', 'analytics.view_regional', 'analytics.export_reports', 'analytics.view_financial',
        'system.view_logs', 'system.manage_settings', 'system.override_actions', 'system.backup', 'system.restore',
        'documents.upload', 'documents.download', 'documents.delete', 'documents.approve', 'documents.reject',
        'commissions.calculate', 'commissions.approve', 'commissions.pay', 'commissions.view', 'commissions.manage',
        'reports.generate', 'reports.schedule', 'reports.export', 'reports.share', 'reports.archive',
      ],
      userCount: 2,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'role_2',
      roleName: 'moderate_admin',
      displayName: 'Moderate Administrator',
      description: 'Administrative access with limited system permissions',
      level: 2,
      isSystemRole: true,
      permissions: [
        'users.create', 'users.read', 'users.update', 'users.delete',
        'borrowers.read', 'borrowers.update',
        'loans.read', 'loans.update',
        'payments.read',
        'regions.create', 'regions.read', 'regions.update', 'regions.assign', 'regions.manage',
        'analytics.view_all', 'analytics.view_regional', 'analytics.export_reports',
        'documents.upload', 'documents.download', 'documents.approve',
        'commissions.view', 'commissions.manage',
        'reports.generate', 'reports.export',
      ],
      userCount: 5,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'role_3',
      roleName: 'ceo',
      displayName: 'Chief Executive Officer',
      description: 'Executive level access focused on analytics and reporting',
      level: 1,
      isSystemRole: true,
      permissions: [
        'borrowers.read',
        'loans.read',
        'payments.read',
        'regions.read',
        'analytics.view_all', 'analytics.view_regional', 'analytics.export_reports', 'analytics.view_financial',
        'documents.download',
        'commissions.view',
        'reports.generate', 'reports.schedule', 'reports.export', 'reports.share',
      ],
      userCount: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'role_4',
      roleName: 'regional_admin',
      displayName: 'Regional Administrator',
      description: 'Regional management with approval authority',
      level: 3,
      isSystemRole: true,
      permissions: [
        'borrowers.create', 'borrowers.read', 'borrowers.update', 'borrowers.approve', 'borrowers.reject',
        'loans.create', 'loans.read', 'loans.update', 'loans.approve', 'loans.reject',
        'payments.read', 'payments.approve', 'payments.reject',
        'regions.read',
        'analytics.view_regional',
        'documents.upload', 'documents.download', 'documents.approve', 'documents.reject',
        'commissions.calculate', 'commissions.approve', 'commissions.view',
        'reports.generate', 'reports.export',
      ],
      userCount: 12,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'role_5',
      roleName: 'agent',
      displayName: 'Sales Agent',
      description: 'Field agent with customer and loan management capabilities',
      level: 4,
      isSystemRole: true,
      permissions: [
        'borrowers.create', 'borrowers.read', 'borrowers.update',
        'loans.create', 'loans.read', 'loans.update',
        'payments.create', 'payments.read',
        'documents.upload', 'documents.download',
        'commissions.view',
        'reports.generate',
      ],
      userCount: 45,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'role_6',
      roleName: 'borrower',
      displayName: 'Borrower',
      description: 'Customer access to personal loan and payment information',
      level: 5,
      isSystemRole: true,
      permissions: [
        'loans.read',
        'payments.read', 'payments.create',
        'documents.upload', 'documents.download',
      ],
      userCount: 1250,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ];
};

export const useRoleManagementStore = create<RoleManagementStore>((set, get) => ({
  roles: [],
  permissions: [],
  selectedRole: null,
  isLoading: false,
  isModalOpen: false,
  modalMode: 'create',

  fetchRoles: async () => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const roles = generateMockRoles();
      set({ roles, isLoading: false });
    } catch (error) {
      console.error('Error fetching roles:', error);
      set({ isLoading: false });
    }
  },

  fetchPermissions: async () => {
    try {
      const permissions = generateMockPermissions();
      set({ permissions });
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  },

  createRole: async (roleData) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newRole: RoleManagement = {
        id: `role_${Date.now()}`,
        roleName: roleData.roleName,
        displayName: roleData.displayName,
        description: roleData.description,
        level: roleData.level,
        isSystemRole: false,
        permissions: roleData.permissions,
        userCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const { roles } = get();
      set({ 
        roles: [newRole, ...roles],
        isLoading: false,
        isModalOpen: false,
        selectedRole: null,
      });
    } catch (error) {
      console.error('Error creating role:', error);
      set({ isLoading: false });
    }
  },

  updateRole: async (id, roleData) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const { roles } = get();
      const updatedRoles = roles.map(role => 
        role.id === id 
          ? { ...role, ...roleData, updatedAt: new Date().toISOString() }
          : role
      );

      set({ 
        roles: updatedRoles,
        isLoading: false,
        isModalOpen: false,
        selectedRole: null,
      });
    } catch (error) {
      console.error('Error updating role:', error);
      set({ isLoading: false });
    }
  },

  deleteRole: async (id) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { roles } = get();
      const role = roles.find(r => r.id === id);
      
      if (role?.isSystemRole) {
        throw new Error('Cannot delete system roles');
      }
      
      const filteredRoles = roles.filter(role => role.id !== id);
      
      set({ 
        roles: filteredRoles,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error deleting role:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  duplicateRole: async (id) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const { roles } = get();
      const originalRole = roles.find(r => r.id === id);
      
      if (!originalRole) {
        throw new Error('Role not found');
      }
      
      const duplicatedRole: RoleManagement = {
        ...originalRole,
        id: `role_${Date.now()}`,
        roleName: `${originalRole.roleName}_copy`,
        displayName: `${originalRole.displayName} (Copy)`,
        isSystemRole: false,
        userCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      set({ 
        roles: [duplicatedRole, ...roles],
        isLoading: false,
      });
    } catch (error) {
      console.error('Error duplicating role:', error);
      set({ isLoading: false });
    }
  },

  updateRolePermissions: async (roleId, permissions) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const { roles } = get();
      const updatedRoles = roles.map(role => 
        role.id === roleId 
          ? { ...role, permissions, updatedAt: new Date().toISOString() }
          : role
      );

      set({ 
        roles: updatedRoles,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error updating role permissions:', error);
      set({ isLoading: false });
    }
  },

  openModal: (mode, role) => {
    set({ 
      isModalOpen: true, 
      modalMode: mode,
      selectedRole: role || null,
    });
  },

  closeModal: () => {
    set({ 
      isModalOpen: false,
      selectedRole: null,
    });
  },
}));
