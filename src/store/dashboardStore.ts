import { create } from 'zustand';
import { DashboardStats, SystemLog, Region } from '../types';

interface DashboardStore {
  stats: DashboardStats | null;
  logs: SystemLog[];
  regions: Region[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchDashboardStats: () => Promise<void>;
  fetchSystemLogs: () => Promise<void>;
  fetchRegions: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Mock data generators
const generateMockStats = (): DashboardStats => ({
  totalUsers: 1247,
  totalBorrowers: 8934,
  totalLoans: 6782,
  totalLoanAmount: 125670000, // LKR 125.67M
  activeLoans: 4521,
  defaultedLoans: 234,
  monthlyRevenue: 12890000, // LKR 12.89M
  commissionsPaid: 892000, // LKR 892K
  regionsActive: 25,
  agentsActive: 187,
});

const generateMockLogs = (): SystemLog[] => {
  const actions = ['LOGIN', 'CREATE_USER', 'APPROVE_LOAN', 'REJECT_BORROWER', 'UPDATE_PAYMENT'];
  const resources = ['USER', 'BORROWER', 'LOAN', 'PAYMENT', 'REGION'];
  const severities: Array<'info' | 'warning' | 'error' | 'critical'> = ['info', 'warning', 'error', 'critical'];
  
  return Array.from({ length: 50 }, (_, i) => ({
    id: `log_${i}`,
    userId: `user_${Math.floor(Math.random() * 100)}`,
    action: actions[Math.floor(Math.random() * actions.length)],
    resource: resources[Math.floor(Math.random() * resources.length)],
    resourceId: `resource_${Math.floor(Math.random() * 1000)}`,
    details: `System performed ${actions[Math.floor(Math.random() * actions.length)]} on ${resources[Math.floor(Math.random() * resources.length)]}`,
    ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    severity: severities[Math.floor(Math.random() * severities.length)],
  }));
};

const generateMockRegions = (): Region[] => {
  const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Monaragala', 'Ratnapura', 'Kegalle', 'Batticaloa', 'Ampara', 'Trincomalee'
  ];

  return districts.map((district, i) => ({
    id: `region_${i}`,
    name: `${district} Region`,
    district,
    province: getProvinceForDistrict(district),
    assignedAdminId: Math.random() > 0.3 ? `admin_${i}` : undefined,
    agentCount: Math.floor(Math.random() * 20) + 5,
    borrowerCount: Math.floor(Math.random() * 500) + 100,
    activeLoans: Math.floor(Math.random() * 300) + 50,
    totalLoanAmount: Math.floor(Math.random() * 10000000) + 1000000,
  }));
};

const getProvinceForDistrict = (district: string): string => {
  const provinceMap: Record<string, string> = {
    'Colombo': 'Western', 'Gampaha': 'Western', 'Kalutara': 'Western',
    'Kandy': 'Central', 'Matale': 'Central', 'Nuwara Eliya': 'Central',
    'Galle': 'Southern', 'Matara': 'Southern', 'Hambantota': 'Southern',
    'Jaffna': 'Northern', 'Kilinochchi': 'Northern', 'Mannar': 'Northern',
    'Kurunegala': 'North Western', 'Puttalam': 'North Western',
    'Anuradhapura': 'North Central', 'Polonnaruwa': 'North Central',
    'Badulla': 'Uva', 'Monaragala': 'Uva',
    'Ratnapura': 'Sabaragamuwa', 'Kegalle': 'Sabaragamuwa',
    'Batticaloa': 'Eastern', 'Ampara': 'Eastern', 'Trincomalee': 'Eastern',
  };
  return provinceMap[district] || 'Unknown';
};

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  stats: null,
  logs: [],
  regions: [],
  isLoading: false,
  error: null,

  fetchDashboardStats: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      const stats = generateMockStats();
      set({ stats, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch dashboard stats', isLoading: false });
    }
  },

  fetchSystemLogs: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      const logs = generateMockLogs();
      set({ logs, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch system logs', isLoading: false });
    }
  },

  fetchRegions: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const regions = generateMockRegions();
      set({ regions, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch regions', isLoading: false });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
