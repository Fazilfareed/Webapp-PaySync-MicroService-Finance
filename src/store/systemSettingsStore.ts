import { create } from 'zustand';
import { SystemSettings, FeatureFlag, UserRole } from '../types';

interface SystemSettingsStore {
  settings: SystemSettings[];
  featureFlags: FeatureFlag[];
  isLoading: boolean;
  
  // Actions
  fetchSettings: () => Promise<void>;
  fetchFeatureFlags: () => Promise<void>;
  updateSetting: (id: string, value: any) => Promise<void>;
  createSetting: (setting: Omit<SystemSettings, 'id' | 'updatedBy' | 'updatedAt'>) => Promise<void>;
  deleteSetting: (id: string) => Promise<void>;
  
  // Feature flag actions
  updateFeatureFlag: (id: string, updates: Partial<FeatureFlag>) => Promise<void>;
  createFeatureFlag: (flag: Omit<FeatureFlag, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  deleteFeatureFlag: (id: string) => Promise<void>;
  toggleFeatureFlag: (id: string) => Promise<void>;
  
  // Bulk operations
  exportSettings: () => Promise<void>;
  importSettings: (file: File) => Promise<void>;
}

// Mock data generators
const generateMockSettings = (): SystemSettings[] => {
  return [
    // Application Settings
    {
      id: 'setting_1',
      category: 'Application',
      key: 'app.name',
      value: 'PaySync',
      description: 'Application name displayed in the UI',
      type: 'string',
      isEditable: true,
      updatedBy: 'admin@paysync.com',
      updatedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: 'setting_2',
      category: 'Application',
      key: 'app.version',
      value: '2.1.0',
      description: 'Current application version',
      type: 'string',
      isEditable: false,
      updatedBy: 'system',
      updatedAt: '2024-01-10T09:00:00Z',
    },
    {
      id: 'setting_3',
      category: 'Application',
      key: 'app.maintenance_mode',
      value: false,
      description: 'Enable maintenance mode to block user access',
      type: 'boolean',
      isEditable: true,
      updatedBy: 'admin@paysync.com',
      updatedAt: '2024-01-20T14:15:00Z',
    },
    
    // Security Settings
    {
      id: 'setting_4',
      category: 'Security',
      key: 'auth.session_timeout',
      value: 3600,
      description: 'Session timeout in seconds',
      type: 'number',
      isEditable: true,
      updatedBy: 'admin@paysync.com',
      updatedAt: '2024-01-18T11:45:00Z',
    },
    {
      id: 'setting_5',
      category: 'Security',
      key: 'auth.max_login_attempts',
      value: 5,
      description: 'Maximum failed login attempts before account lockout',
      type: 'number',
      isEditable: true,
      updatedBy: 'admin@paysync.com',
      updatedAt: '2024-01-12T16:20:00Z',
    },
    {
      id: 'setting_6',
      category: 'Security',
      key: 'auth.password_complexity',
      value: 'high',
      description: 'Password complexity requirements',
      type: 'select',
      options: ['low', 'medium', 'high'],
      isEditable: true,
      updatedBy: 'admin@paysync.com',
      updatedAt: '2024-01-08T13:30:00Z',
    },
    
    // Loan Settings
    {
      id: 'setting_7',
      category: 'Loans',
      key: 'loan.min_amount',
      value: 10000,
      description: 'Minimum loan amount in LKR',
      type: 'number',
      isEditable: true,
      updatedBy: 'admin@paysync.com',
      updatedAt: '2024-01-14T10:00:00Z',
    },
    {
      id: 'setting_8',
      category: 'Loans',
      key: 'loan.max_amount',
      value: 5000000,
      description: 'Maximum loan amount in LKR',
      type: 'number',
      isEditable: true,
      updatedBy: 'admin@paysync.com',
      updatedAt: '2024-01-14T10:00:00Z',
    },
    {
      id: 'setting_9',
      category: 'Loans',
      key: 'loan.default_interest_rate',
      value: 12.5,
      description: 'Default annual interest rate percentage',
      type: 'number',
      isEditable: true,
      updatedBy: 'admin@paysync.com',
      updatedAt: '2024-01-16T15:30:00Z',
    },
    {
      id: 'setting_10',
      category: 'Loans',
      key: 'loan.auto_approval_limit',
      value: 100000,
      description: 'Auto-approval limit for loans in LKR',
      type: 'number',
      isEditable: true,
      updatedBy: 'admin@paysync.com',
      updatedAt: '2024-01-19T09:15:00Z',
    },
    
    // Commission Settings
    {
      id: 'setting_11',
      category: 'Commission',
      key: 'commission.agent_rate',
      value: 2.5,
      description: 'Agent commission rate percentage',
      type: 'number',
      isEditable: true,
      updatedBy: 'admin@paysync.com',
      updatedAt: '2024-01-13T12:00:00Z',
    },
    {
      id: 'setting_12',
      category: 'Commission',
      key: 'commission.regional_admin_rate',
      value: 1.0,
      description: 'Regional admin commission rate percentage',
      type: 'number',
      isEditable: true,
      updatedBy: 'admin@paysync.com',
      updatedAt: '2024-01-13T12:00:00Z',
    },
    
    // Notification Settings
    {
      id: 'setting_13',
      category: 'Notifications',
      key: 'notifications.email_enabled',
      value: true,
      description: 'Enable email notifications',
      type: 'boolean',
      isEditable: true,
      updatedBy: 'admin@paysync.com',
      updatedAt: '2024-01-17T14:45:00Z',
    },
    {
      id: 'setting_14',
      category: 'Notifications',
      key: 'notifications.sms_enabled',
      value: false,
      description: 'Enable SMS notifications',
      type: 'boolean',
      isEditable: true,
      updatedBy: 'admin@paysync.com',
      updatedAt: '2024-01-17T14:45:00Z',
    },
    
    // File Upload Settings
    {
      id: 'setting_15',
      category: 'Files',
      key: 'upload.max_file_size',
      value: 10485760,
      description: 'Maximum file upload size in bytes (10MB)',
      type: 'number',
      isEditable: true,
      updatedBy: 'admin@paysync.com',
      updatedAt: '2024-01-11T08:30:00Z',
    },
    {
      id: 'setting_16',
      category: 'Files',
      key: 'upload.allowed_types',
      value: JSON.stringify(['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx']),
      description: 'Allowed file types for document uploads',
      type: 'json',
      isEditable: true,
      updatedBy: 'admin@paysync.com',
      updatedAt: '2024-01-11T08:30:00Z',
    },
  ];
};

const generateMockFeatureFlags = (): FeatureFlag[] => {
  return [
    {
      id: 'flag_1',
      name: 'Enhanced Dashboard',
      key: 'enhanced_dashboard',
      description: 'Enable the new enhanced dashboard interface',
      isEnabled: true,
      environment: 'all',
      rolloutPercentage: 100,
      targetRoles: ['super_admin', 'moderate_admin', 'ceo'],
      createdBy: 'admin@paysync.com',
      createdAt: '2024-01-10T10:00:00Z',
      updatedAt: '2024-01-15T14:30:00Z',
    },
    {
      id: 'flag_2',
      name: 'Mobile App Integration',
      key: 'mobile_app_integration',
      description: 'Enable mobile app API endpoints',
      isEnabled: false,
      environment: 'development',
      rolloutPercentage: 0,
      targetRoles: ['agent'],
      createdBy: 'admin@paysync.com',
      createdAt: '2024-01-12T09:15:00Z',
      updatedAt: '2024-01-12T09:15:00Z',
    },
    {
      id: 'flag_3',
      name: 'Advanced Analytics',
      key: 'advanced_analytics',
      description: 'Enable advanced analytics and reporting features',
      isEnabled: true,
      environment: 'production',
      rolloutPercentage: 50,
      targetRoles: ['super_admin', 'ceo', 'moderate_admin'],
      createdBy: 'admin@paysync.com',
      createdAt: '2024-01-08T16:45:00Z',
      updatedAt: '2024-01-18T11:20:00Z',
    },
    {
      id: 'flag_4',
      name: 'Auto Loan Approval',
      key: 'auto_loan_approval',
      description: 'Enable automatic loan approval for qualifying applications',
      isEnabled: false,
      environment: 'staging',
      rolloutPercentage: 25,
      targetRoles: ['regional_admin', 'agent'],
      createdBy: 'admin@paysync.com',
      createdAt: '2024-01-14T13:00:00Z',
      updatedAt: '2024-01-19T10:15:00Z',
    },
    {
      id: 'flag_5',
      name: 'Real-time Notifications',
      key: 'realtime_notifications',
      description: 'Enable real-time push notifications',
      isEnabled: true,
      environment: 'all',
      rolloutPercentage: 75,
      targetRoles: ['super_admin', 'moderate_admin', 'regional_admin', 'agent'],
      createdBy: 'admin@paysync.com',
      createdAt: '2024-01-16T12:30:00Z',
      updatedAt: '2024-01-20T15:45:00Z',
    },
    {
      id: 'flag_6',
      name: 'Document OCR',
      key: 'document_ocr',
      description: 'Enable OCR processing for uploaded documents',
      isEnabled: false,
      environment: 'development',
      rolloutPercentage: 10,
      targetRoles: ['agent', 'regional_admin'],
      createdBy: 'admin@paysync.com',
      createdAt: '2024-01-20T08:00:00Z',
      updatedAt: '2024-01-20T08:00:00Z',
    },
  ];
};

export const useSystemSettingsStore = create<SystemSettingsStore>((set, get) => ({
  settings: [],
  featureFlags: [],
  isLoading: false,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const settings = generateMockSettings();
      set({ settings, isLoading: false });
    } catch (error) {
      console.error('Error fetching settings:', error);
      set({ isLoading: false });
    }
  },

  fetchFeatureFlags: async () => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const featureFlags = generateMockFeatureFlags();
      set({ featureFlags, isLoading: false });
    } catch (error) {
      console.error('Error fetching feature flags:', error);
      set({ isLoading: false });
    }
  },

  updateSetting: async (id, value) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { settings } = get();
      const updatedSettings = settings.map(setting =>
        setting.id === id
          ? {
              ...setting,
              value,
              updatedBy: 'admin@paysync.com', // In real app, get from auth
              updatedAt: new Date().toISOString(),
            }
          : setting
      );
      
      set({ settings: updatedSettings, isLoading: false });
    } catch (error) {
      console.error('Error updating setting:', error);
      set({ isLoading: false });
    }
  },

  createSetting: async (newSetting) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const setting: SystemSettings = {
        ...newSetting,
        id: `setting_${Date.now()}`,
        updatedBy: 'admin@paysync.com',
        updatedAt: new Date().toISOString(),
      };
      
      const { settings } = get();
      set({ 
        settings: [setting, ...settings],
        isLoading: false,
      });
    } catch (error) {
      console.error('Error creating setting:', error);
      set({ isLoading: false });
    }
  },

  deleteSetting: async (id) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const { settings } = get();
      const filteredSettings = settings.filter(setting => setting.id !== id);
      
      set({ 
        settings: filteredSettings,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error deleting setting:', error);
      set({ isLoading: false });
    }
  },

  updateFeatureFlag: async (id, updates) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const { featureFlags } = get();
      const updatedFlags = featureFlags.map(flag =>
        flag.id === id
          ? { ...flag, ...updates, updatedAt: new Date().toISOString() }
          : flag
      );
      
      set({ featureFlags: updatedFlags, isLoading: false });
    } catch (error) {
      console.error('Error updating feature flag:', error);
      set({ isLoading: false });
    }
  },

  createFeatureFlag: async (newFlag) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const flag: FeatureFlag = {
        ...newFlag,
        id: `flag_${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      const { featureFlags } = get();
      set({ 
        featureFlags: [flag, ...featureFlags],
        isLoading: false,
      });
    } catch (error) {
      console.error('Error creating feature flag:', error);
      set({ isLoading: false });
    }
  },

  deleteFeatureFlag: async (id) => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const { featureFlags } = get();
      const filteredFlags = featureFlags.filter(flag => flag.id !== id);
      
      set({ 
        featureFlags: filteredFlags,
        isLoading: false,
      });
    } catch (error) {
      console.error('Error deleting feature flag:', error);
      set({ isLoading: false });
    }
  },

  toggleFeatureFlag: async (id) => {
    const { featureFlags } = get();
    const flag = featureFlags.find(f => f.id === id);
    if (flag) {
      await get().updateFeatureFlag(id, { isEnabled: !flag.isEnabled });
    }
  },

  exportSettings: async () => {
    const { settings, featureFlags } = get();
    
    const exportData = {
      settings,
      featureFlags,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    };
    
    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system_settings_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importSettings: async (file) => {
    set({ isLoading: true });
    try {
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (importData.settings && importData.featureFlags) {
        set({
          settings: importData.settings,
          featureFlags: importData.featureFlags,
          isLoading: false,
        });
      } else {
        throw new Error('Invalid settings file format');
      }
    } catch (error) {
      console.error('Error importing settings:', error);
      set({ isLoading: false });
      throw error;
    }
  },
}));
