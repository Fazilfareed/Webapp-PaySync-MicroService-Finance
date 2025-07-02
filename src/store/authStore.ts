import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User, LoginCredentials, UserRole } from '../types';
import { ROLE_DASHBOARD_ROUTES } from '../constants/permissions';

interface AuthStore extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  checkAuth: () => boolean;
  getUserPermissions: () => any;
  hasPermission: (resource: string, action: string) => boolean;
}

// Mock authentication function
const mockLogin = async (credentials: LoginCredentials): Promise<{ user: User; token: string }> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock user mapping based on email
  const userMapping: Record<string, { role: UserRole; name: string }> = {
    'superadmin@paysync.com': { role: 'super_admin', name: 'Super Administrator' },
    'moderateadmin@paysync.com': { role: 'moderate_admin', name: 'Moderate Admin' },
    'ceo@paysync.com': { role: 'ceo', name: 'Chief Executive Officer' },
    'regional@paysync.com': { role: 'regional_admin', name: 'Regional Administrator' },
    'agent@paysync.com': { role: 'agent', name: 'Sales Agent' },
  };

  const userInfo = userMapping[credentials.email];
  if (!userInfo) {
    throw new Error('Invalid credentials');
  }

  // Mock password validation
  const validPasswords: Record<string, string> = {
    'superadmin@paysync.com': 'super123',
    'moderateadmin@paysync.com': 'moderate123',
    'ceo@paysync.com': 'ceo123',
    'regional@paysync.com': 'regional123',
    'agent@paysync.com': 'agent123',
  };

  if (validPasswords[credentials.email] !== credentials.password) {
    throw new Error('Invalid credentials');
  }

  const user: User = {
    id: Math.random().toString(36).substring(7),
    email: credentials.email,
    name: userInfo.name,
    role: userInfo.role,
    region: userInfo.role === 'regional_admin' || userInfo.role === 'agent' ? 'Colombo' : undefined,
    profileImage: `https://api.dicebear.com/7.x/initials/svg?seed=${userInfo.name}`,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isActive: true,
  };

  const token = `mock_jwt_token_${Date.now()}`;

  return { user, token };
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const { user, token } = await mockLogin(credentials);
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
          
          // Redirect to appropriate dashboard
          const dashboardRoute = ROLE_DASHBOARD_ROUTES[user.role];
          window.location.href = dashboardRoute;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
        window.location.href = '/login';
      },

      setUser: (user) => {
        set({ user, isAuthenticated: true });
      },

      setLoading: (loading) => {
        set({ isLoading: loading });
      },

      checkAuth: () => {
        const { token, user } = get();
        return !!(token && user);
      },

      getUserPermissions: () => {
        const { user } = get();
        if (!user) return null;
        
        // Return permissions based on user role
        // This would typically come from the backend
        return user.role;
      },

      hasPermission: (resource: string, action: string) => {
        const { user } = get();
        if (!user) return false;
        
        // Simplified permission check
        // In a real app, this would check against a proper permissions system
        switch (user.role) {
          case 'super_admin':
            return true;
          case 'moderate_admin':
            return ['users', 'regions', 'analytics'].includes(resource);
          case 'ceo':
            return ['analytics', 'reports'].includes(resource) && action === 'read';
          case 'regional_admin':
            return ['borrowers', 'loans', 'payments'].includes(resource);
          case 'agent':
            return ['borrowers', 'loans'].includes(resource) && ['create', 'read', 'update'].includes(action);
          default:
            return false;
        }
      },
    }),
    {
      name: 'paysync-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
