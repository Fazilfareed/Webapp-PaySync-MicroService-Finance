import { create } from 'zustand';
import { User, UserRole, SriLankanDistrict, SRI_LANKAN_DISTRICTS } from '../types';

interface UserFormData {
  name: string;
  email: string;
  role: UserRole;
  region?: string;
  isActive: boolean;
  password?: string;
}

interface UserManagementStore {
  users: User[];
  selectedUser: User | null;
  isLoading: boolean;
  isModalOpen: boolean;
  modalMode: 'create' | 'edit' | 'view';
  filters: {
    role: UserRole[];
    region: string[];
    status: ('active' | 'inactive')[];
    searchTerm: string;
  };
  bulkSelection: string[];
  
  // Actions
  fetchUsers: () => Promise<void>;
  createUser: (userData: UserFormData) => Promise<void>;
  updateUser: (id: string, userData: Partial<UserFormData>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  toggleUserStatus: (id: string) => Promise<void>;
  resetPassword: (id: string) => Promise<string>;
  
  // Modal actions
  openModal: (mode: 'create' | 'edit' | 'view', user?: User) => void;
  closeModal: () => void;
  
  // Selection actions
  setFilters: (filters: Partial<UserManagementStore['filters']>) => void;
  clearFilters: () => void;
  toggleBulkSelection: (userId: string) => void;
  selectAllUsers: () => void;
  clearBulkSelection: () => void;
  bulkToggleStatus: (status: boolean) => Promise<void>;
  bulkDelete: () => Promise<void>;
}

// Mock user data generator
const generateMockUsers = (): User[] => {
  const roles: UserRole[] = ['super_admin', 'moderate_admin', 'ceo', 'regional_admin', 'agent'];
  const names = [
    'John Doe', 'Jane Smith', 'Mike Johnson', 'Sarah Wilson', 'David Brown',
    'Lisa Garcia', 'Robert Taylor', 'Emily Davis', 'Michael Miller', 'Jessica Anderson',
    'Christopher Moore', 'Amanda Jackson', 'Matthew Martin', 'Ashley Thompson', 'Joshua White',
    'Samantha Harris', 'Andrew Clark', 'Nicole Rodriguez', 'Daniel Lewis', 'Stephanie Walker',
  ];

  return Array.from({ length: 100 }, (_, i) => {
    const role = roles[Math.floor(Math.random() * roles.length)];
    const name = names[i % names.length];
    const needsRegion = role === 'regional_admin' || role === 'agent';
    
    return {
      id: `user_${i + 1}`,
      email: `${name.toLowerCase().replace(' ', '.')}${i > 19 ? i : ''}@paysync.com`,
      name,
      role,
      region: needsRegion ? SRI_LANKAN_DISTRICTS[Math.floor(Math.random() * SRI_LANKAN_DISTRICTS.length)] : undefined,
      profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
      createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      lastLogin: Math.random() > 0.1 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      isActive: Math.random() > 0.1,
    };
  });
};

export const useUserManagementStore = create<UserManagementStore>((set, get) => ({
  users: [],
  selectedUser: null,
  isLoading: false,
  isModalOpen: false,
  modalMode: 'create',
  filters: {
    role: [],
    region: [],
    status: [],
    searchTerm: '',
  },
  bulkSelection: [],

  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const users = generateMockUsers();
      set({ users, isLoading: false });
    } catch (error) {
      console.error('Error fetching users:', error);
      set({ isLoading: false });
    }
  },

  createUser: async (userData) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newUser: User = {
        id: `user_${Date.now()}`,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        region: userData.region,
        profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${userData.name}`,
        createdAt: new Date().toISOString(),
        isActive: userData.isActive,
      };

      const { users } = get();
      set({ 
        users: [newUser, ...users],
        isLoading: false,
        isModalOpen: false,
        selectedUser: null,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      set({ isLoading: false });
    }
  },

  updateUser: async (id, userData) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const { users } = get();
      const updatedUsers = users.map(user => 
        user.id === id 
          ? { ...user, ...userData, updatedAt: new Date().toISOString() }
          : user
      );

      set({ 
        users: updatedUsers,
        isLoading: false,
        isModalOpen: false,
        selectedUser: null,
      });
    } catch (error) {
      console.error('Error updating user:', error);
      set({ isLoading: false });
    }
  },

  deleteUser: async (id) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { users } = get();
      const filteredUsers = users.filter(user => user.id !== id);
      
      set({ 
        users: filteredUsers,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      set({ isLoading: false });
    }
  },

  toggleUserStatus: async (id) => {
    const { users } = get();
    const user = users.find(u => u.id === id);
    if (user) {
      await get().updateUser(id, { isActive: !user.isActive });
    }
  },

  resetPassword: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const newPassword = Math.random().toString(36).slice(-8);
    // In a real app, this would send an email to the user
    return newPassword;
  },

  openModal: (mode, user) => {
    set({ 
      isModalOpen: true, 
      modalMode: mode,
      selectedUser: user || null,
    });
  },

  closeModal: () => {
    set({ 
      isModalOpen: false,
      selectedUser: null,
    });
  },

  setFilters: (newFilters) => {
    const { filters } = get();
    set({ filters: { ...filters, ...newFilters } });
  },

  clearFilters: () => {
    set({
      filters: {
        role: [],
        region: [],
        status: [],
        searchTerm: '',
      },
    });
  },

  toggleBulkSelection: (userId) => {
    const { bulkSelection } = get();
    const newSelection = bulkSelection.includes(userId)
      ? bulkSelection.filter(id => id !== userId)
      : [...bulkSelection, userId];
    
    set({ bulkSelection: newSelection });
  },

  selectAllUsers: () => {
    const { users } = get();
    set({ bulkSelection: users.map(user => user.id) });
  },

  clearBulkSelection: () => {
    set({ bulkSelection: [] });
  },

  bulkToggleStatus: async (status) => {
    const { bulkSelection, users } = get();
    set({ isLoading: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUsers = users.map(user =>
        bulkSelection.includes(user.id)
          ? { ...user, isActive: status }
          : user
      );
      
      set({ 
        users: updatedUsers,
        bulkSelection: [],
        isLoading: false,
      });
    } catch (error) {
      console.error('Error in bulk status update:', error);
      set({ isLoading: false });
    }
  },

  bulkDelete: async () => {
    const { bulkSelection, users } = get();
    set({ isLoading: true });
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const filteredUsers = users.filter(user => !bulkSelection.includes(user.id));
      
      set({ 
        users: filteredUsers,
        bulkSelection: [],
        isLoading: false,
      });
    } catch (error) {
      console.error('Error in bulk delete:', error);
      set({ isLoading: false });
    }
  },
}));
