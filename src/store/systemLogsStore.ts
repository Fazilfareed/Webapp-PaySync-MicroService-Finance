import { create } from 'zustand';
import { SystemLog, UserActivity, AuditLog } from '../types';

interface SystemLogsStore {
  logs: SystemLog[];
  userActivities: UserActivity[];
  auditLogs: AuditLog[];
  isLoading: boolean;
  filters: {
    severity: string[];
    resource: string[];
    userId: string[];
    dateRange: {
      start: string;
      end: string;
    };
    searchTerm: string;
  };
  
  // Actions
  fetchLogs: () => Promise<void>;
  fetchUserActivities: () => Promise<void>;
  fetchAuditLogs: () => Promise<void>;
  setFilters: (filters: Partial<SystemLogsStore['filters']>) => void;
  clearFilters: () => void;
  exportLogs: (type: 'system' | 'activity' | 'audit', format: 'csv' | 'json') => Promise<void>;
}

// Mock data generators
const generateMockSystemLogs = (): SystemLog[] => {
  const actions = [
    'User Login', 'User Logout', 'Loan Created', 'Loan Approved', 'Payment Processed',
    'User Created', 'User Updated', 'Borrower Approved', 'Document Uploaded', 'Report Generated'
  ];
  
  const resources = ['users', 'loans', 'borrowers', 'payments', 'documents', 'reports'];
  const severities: ('info' | 'warning' | 'error' | 'critical')[] = ['info', 'warning', 'error', 'critical'];
  
  return Array.from({ length: 500 }, (_, i) => ({
    id: `log_${i + 1}`,
    userId: `user_${Math.floor(Math.random() * 20) + 1}`,
    action: actions[Math.floor(Math.random() * actions.length)],
    resource: resources[Math.floor(Math.random() * resources.length)],
    resourceId: `resource_${Math.floor(Math.random() * 100) + 1}`,
    details: `System action performed: ${actions[Math.floor(Math.random() * actions.length)]}`,
    ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    severity: severities[Math.floor(Math.random() * severities.length)],
  }));
};

const generateMockUserActivities = (): UserActivity[] => {
  const actions = [
    'Page View', 'Button Click', 'Form Submit', 'File Download', 'Search Performed',
    'Dashboard Access', 'Report View', 'Settings Update', 'Profile Update', 'Password Change'
  ];
  
  const resources = ['dashboard', 'loans', 'borrowers', 'payments', 'reports', 'settings'];
  const statuses: ('success' | 'failed' | 'pending')[] = ['success', 'failed', 'pending'];
  
  return Array.from({ length: 1000 }, (_, i) => ({
    id: `activity_${i + 1}`,
    userId: `user_${Math.floor(Math.random() * 20) + 1}`,
    userName: `User ${Math.floor(Math.random() * 20) + 1}`,
    action: actions[Math.floor(Math.random() * actions.length)],
    resource: resources[Math.floor(Math.random() * resources.length)],
    resourceId: Math.random() > 0.5 ? `resource_${Math.floor(Math.random() * 100) + 1}` : undefined,
    ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration: Math.floor(Math.random() * 5000),
    status: statuses[Math.floor(Math.random() * statuses.length)],
    details: { browser: 'Chrome', platform: 'Windows' },
  }));
};

const generateMockAuditLogs = (): AuditLog[] => {
  const actions = [
    'Create', 'Update', 'Delete', 'Approve', 'Reject', 'Archive', 'Restore', 'Export'
  ];
  
  const resources = ['user', 'loan', 'borrower', 'payment', 'document', 'setting'];
  const severities: ('low' | 'medium' | 'high' | 'critical')[] = ['low', 'medium', 'high', 'critical'];
  
  return Array.from({ length: 300 }, (_, i) => ({
    id: `audit_${i + 1}`,
    userId: `user_${Math.floor(Math.random() * 20) + 1}`,
    userName: `User ${Math.floor(Math.random() * 20) + 1}`,
    action: actions[Math.floor(Math.random() * actions.length)],
    resource: resources[Math.floor(Math.random() * resources.length)],
    resourceId: `resource_${Math.floor(Math.random() * 100) + 1}`,
    oldValues: { status: 'pending', amount: 100000 },
    newValues: { status: 'approved', amount: 100000 },
    ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
    timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    severity: severities[Math.floor(Math.random() * severities.length)],
  }));
};

export const useSystemLogsStore = create<SystemLogsStore>((set, get) => ({
  logs: [],
  userActivities: [],
  auditLogs: [],
  isLoading: false,
  filters: {
    severity: [],
    resource: [],
    userId: [],
    dateRange: {
      start: '',
      end: '',
    },
    searchTerm: '',
  },

  fetchLogs: async () => {
    set({ isLoading: true });
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      const logs = generateMockSystemLogs();
      set({ logs, isLoading: false });
    } catch (error) {
      console.error('Error fetching logs:', error);
      set({ isLoading: false });
    }
  },

  fetchUserActivities: async () => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const userActivities = generateMockUserActivities();
      set({ userActivities, isLoading: false });
    } catch (error) {
      console.error('Error fetching user activities:', error);
      set({ isLoading: false });
    }
  },

  fetchAuditLogs: async () => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const auditLogs = generateMockAuditLogs();
      set({ auditLogs, isLoading: false });
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      set({ isLoading: false });
    }
  },

  setFilters: (newFilters) => {
    const { filters } = get();
    set({ filters: { ...filters, ...newFilters } });
  },

  clearFilters: () => {
    set({
      filters: {
        severity: [],
        resource: [],
        userId: [],
        dateRange: { start: '', end: '' },
        searchTerm: '',
      },
    });
  },

  exportLogs: async (type, format) => {
    const { logs, userActivities, auditLogs } = get();
    
    let data: any[] = [];
    switch (type) {
      case 'system':
        data = logs;
        break;
      case 'activity':
        data = userActivities;
        break;
      case 'audit':
        data = auditLogs;
        break;
    }

    if (format === 'csv') {
      const csvContent = [
        Object.keys(data[0] || {}).join(','),
        ...data.map(row => Object.values(row).join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_logs_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_logs_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  },
}));
