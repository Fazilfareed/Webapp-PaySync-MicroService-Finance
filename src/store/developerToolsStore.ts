import { create } from 'zustand';
import { ApiEndpoint, DatabaseTable, SystemHealth, PerformanceMetrics } from '../types';

interface ApiTestRequest {
  endpoint: string;
  method: string;
  headers: Record<string, string>;
  body?: any;
  parameters?: Record<string, any>;
}

interface ApiTestResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  responseTime: number;
  timestamp: string;
}

interface DeveloperToolsStore {
  apiEndpoints: ApiEndpoint[];
  databaseTables: DatabaseTable[];
  systemHealth: SystemHealth | null;
  performanceMetrics: PerformanceMetrics[];
  apiTestHistory: { request: ApiTestRequest; response: ApiTestResponse }[];
  isLoading: boolean;
  
  // Actions
  fetchApiEndpoints: () => Promise<void>;
  fetchDatabaseTables: () => Promise<void>;
  fetchSystemHealth: () => Promise<void>;
  fetchPerformanceMetrics: () => Promise<void>;
  
  // API Testing
  testApiEndpoint: (request: ApiTestRequest) => Promise<ApiTestResponse>;
  clearTestHistory: () => void;
  
  // Database Operations
  runDatabaseQuery: (query: string) => Promise<any>;
  exportTableData: (tableName: string) => Promise<void>;
  
  // System Operations
  clearCache: () => Promise<void>;
  restartService: (serviceName: string) => Promise<void>;
  generateDiagnosticReport: () => Promise<void>;
}

// Mock data generators
const generateMockApiEndpoints = (): ApiEndpoint[] => {
  return [
    {
      id: 'api_1',
      method: 'GET',
      path: '/api/v1/users',
      description: 'Get all users with pagination',
      category: 'Users',
      requiredAuth: true,
      requiredRole: ['super_admin', 'moderate_admin'],
      parameters: [
        { name: 'page', type: 'number', required: false, description: 'Page number', example: 1 },
        { name: 'limit', type: 'number', required: false, description: 'Items per page', example: 10 },
        { name: 'role', type: 'string', required: false, description: 'Filter by role', example: 'agent' },
      ],
      responseExample: {
        data: [{ id: '1', name: 'John Doe', email: 'john@example.com' }],
        pagination: { page: 1, limit: 10, total: 100 },
      },
      isActive: true,
    },
    {
      id: 'api_2',
      method: 'POST',
      path: '/api/v1/users',
      description: 'Create a new user',
      category: 'Users',
      requiredAuth: true,
      requiredRole: ['super_admin', 'moderate_admin'],
      parameters: [
        { name: 'name', type: 'string', required: true, description: 'User full name', example: 'Jane Smith' },
        { name: 'email', type: 'string', required: true, description: 'User email', example: 'jane@example.com' },
        { name: 'role', type: 'string', required: true, description: 'User role', example: 'agent' },
        { name: 'region', type: 'string', required: false, description: 'User region', example: 'Colombo' },
      ],
      responseExample: {
        id: '123',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'agent',
        createdAt: '2024-01-20T10:00:00Z',
      },
      isActive: true,
    },
    {
      id: 'api_3',
      method: 'GET',
      path: '/api/v1/loans',
      description: 'Get loans with filtering options',
      category: 'Loans',
      requiredAuth: true,
      requiredRole: ['super_admin', 'moderate_admin', 'regional_admin', 'agent'],
      parameters: [
        { name: 'status', type: 'string', required: false, description: 'Filter by status', example: 'active' },
        { name: 'borrowerId', type: 'string', required: false, description: 'Filter by borrower', example: 'borrower_123' },
        { name: 'minAmount', type: 'number', required: false, description: 'Minimum loan amount', example: 10000 },
        { name: 'maxAmount', type: 'number', required: false, description: 'Maximum loan amount', example: 1000000 },
      ],
      responseExample: {
        data: [{ id: '1', amount: 100000, status: 'active', borrowerId: 'borrower_123' }],
        pagination: { page: 1, limit: 10, total: 50 },
      },
      isActive: true,
    },
    {
      id: 'api_4',
      method: 'POST',
      path: '/api/v1/loans/{id}/approve',
      description: 'Approve a loan application',
      category: 'Loans',
      requiredAuth: true,
      requiredRole: ['super_admin', 'regional_admin'],
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Loan ID', example: 'loan_123' },
        { name: 'notes', type: 'string', required: false, description: 'Approval notes', example: 'Approved with conditions' },
      ],
      responseExample: {
        id: 'loan_123',
        status: 'approved',
        approvedAt: '2024-01-20T10:00:00Z',
        approvedBy: 'admin@example.com',
      },
      isActive: true,
    },
    {
      id: 'api_5',
      method: 'GET',
      path: '/api/v1/analytics/dashboard',
      description: 'Get dashboard analytics data',
      category: 'Analytics',
      requiredAuth: true,
      requiredRole: ['super_admin', 'moderate_admin', 'ceo'],
      parameters: [
        { name: 'period', type: 'string', required: false, description: 'Time period', example: '30d' },
        { name: 'region', type: 'string', required: false, description: 'Filter by region', example: 'Colombo' },
      ],
      responseExample: {
        totalLoans: 1250,
        totalAmount: 125000000,
        activeLoans: 850,
        defaultRate: 2.5,
      },
      isActive: true,
    },
    {
      id: 'api_6',
      method: 'POST',
      path: '/api/v1/payments/{id}/process',
      description: 'Process a payment',
      category: 'Payments',
      requiredAuth: true,
      requiredRole: ['super_admin', 'regional_admin'],
      parameters: [
        { name: 'id', type: 'string', required: true, description: 'Payment ID', example: 'payment_123' },
        { name: 'amount', type: 'number', required: true, description: 'Payment amount', example: 5000 },
        { name: 'notes', type: 'string', required: false, description: 'Payment notes', example: 'Regular monthly payment' },
      ],
      responseExample: {
        id: 'payment_123',
        status: 'processed',
        processedAt: '2024-01-20T10:00:00Z',
        processedBy: 'admin@example.com',
      },
      isActive: true,
    },
  ];
};

const generateMockDatabaseTables = (): DatabaseTable[] => {
  return [
    {
      name: 'users',
      description: 'System users and their roles',
      recordCount: 125,
      sizeBytes: 1024000,
      lastModified: '2024-01-20T09:30:00Z',
      columns: [
        { name: 'id', type: 'varchar(36)', nullable: false, primaryKey: true, description: 'Unique identifier' },
        { name: 'email', type: 'varchar(255)', nullable: false, primaryKey: false, description: 'User email address' },
        { name: 'name', type: 'varchar(255)', nullable: false, primaryKey: false, description: 'Full name' },
        { name: 'role', type: 'enum', nullable: false, primaryKey: false, description: 'User role' },
        { name: 'region', type: 'varchar(100)', nullable: true, primaryKey: false, description: 'Assigned region' },
        { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, description: 'Creation timestamp' },
        { name: 'updated_at', type: 'timestamp', nullable: false, primaryKey: false, description: 'Last update timestamp' },
        { name: 'is_active', type: 'boolean', nullable: false, primaryKey: false, description: 'Account status' },
      ],
    },
    {
      name: 'borrowers',
      description: 'Loan applicants and borrowers',
      recordCount: 2547,
      sizeBytes: 5120000,
      lastModified: '2024-01-20T11:15:00Z',
      columns: [
        { name: 'id', type: 'varchar(36)', nullable: false, primaryKey: true, description: 'Unique identifier' },
        { name: 'name', type: 'varchar(255)', nullable: false, primaryKey: false, description: 'Full name' },
        { name: 'email', type: 'varchar(255)', nullable: false, primaryKey: false, description: 'Email address' },
        { name: 'phone', type: 'varchar(20)', nullable: false, primaryKey: false, description: 'Phone number' },
        { name: 'address', type: 'text', nullable: false, primaryKey: false, description: 'Home address' },
        { name: 'id_number', type: 'varchar(50)', nullable: false, primaryKey: false, description: 'National ID number' },
        { name: 'status', type: 'enum', nullable: false, primaryKey: false, description: 'Application status' },
        { name: 'agent_id', type: 'varchar(36)', nullable: false, primaryKey: false, foreignKey: 'users.id', description: 'Assigned agent' },
        { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, description: 'Creation timestamp' },
      ],
    },
    {
      name: 'loans',
      description: 'Loan applications and active loans',
      recordCount: 1836,
      sizeBytes: 3072000,
      lastModified: '2024-01-20T10:45:00Z',
      columns: [
        { name: 'id', type: 'varchar(36)', nullable: false, primaryKey: true, description: 'Unique identifier' },
        { name: 'borrower_id', type: 'varchar(36)', nullable: false, primaryKey: false, foreignKey: 'borrowers.id', description: 'Borrower reference' },
        { name: 'amount', type: 'decimal(15,2)', nullable: false, primaryKey: false, description: 'Loan amount' },
        { name: 'purpose', type: 'varchar(500)', nullable: false, primaryKey: false, description: 'Loan purpose' },
        { name: 'interest_rate', type: 'decimal(5,2)', nullable: false, primaryKey: false, description: 'Annual interest rate' },
        { name: 'term_months', type: 'int', nullable: false, primaryKey: false, description: 'Loan term in months' },
        { name: 'status', type: 'enum', nullable: false, primaryKey: false, description: 'Loan status' },
        { name: 'agent_id', type: 'varchar(36)', nullable: false, primaryKey: false, foreignKey: 'users.id', description: 'Processing agent' },
        { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, description: 'Application timestamp' },
      ],
    },
    {
      name: 'payments',
      description: 'Loan payments and payment history',
      recordCount: 12654,
      sizeBytes: 8192000,
      lastModified: '2024-01-20T12:00:00Z',
      columns: [
        { name: 'id', type: 'varchar(36)', nullable: false, primaryKey: true, description: 'Unique identifier' },
        { name: 'loan_id', type: 'varchar(36)', nullable: false, primaryKey: false, foreignKey: 'loans.id', description: 'Loan reference' },
        { name: 'amount', type: 'decimal(15,2)', nullable: false, primaryKey: false, description: 'Payment amount' },
        { name: 'due_date', type: 'date', nullable: false, primaryKey: false, description: 'Payment due date' },
        { name: 'paid_date', type: 'date', nullable: true, primaryKey: false, description: 'Actual payment date' },
        { name: 'status', type: 'enum', nullable: false, primaryKey: false, description: 'Payment status' },
        { name: 'created_at', type: 'timestamp', nullable: false, primaryKey: false, description: 'Creation timestamp' },
      ],
    },
    {
      name: 'system_logs',
      description: 'System activity and audit logs',
      recordCount: 45897,
      sizeBytes: 15360000,
      lastModified: '2024-01-20T12:30:00Z',
      columns: [
        { name: 'id', type: 'varchar(36)', nullable: false, primaryKey: true, description: 'Unique identifier' },
        { name: 'user_id', type: 'varchar(36)', nullable: true, primaryKey: false, foreignKey: 'users.id', description: 'User who performed action' },
        { name: 'action', type: 'varchar(255)', nullable: false, primaryKey: false, description: 'Action performed' },
        { name: 'resource', type: 'varchar(100)', nullable: false, primaryKey: false, description: 'Resource affected' },
        { name: 'details', type: 'json', nullable: true, primaryKey: false, description: 'Additional details' },
        { name: 'ip_address', type: 'varchar(45)', nullable: true, primaryKey: false, description: 'User IP address' },
        { name: 'timestamp', type: 'timestamp', nullable: false, primaryKey: false, description: 'Action timestamp' },
        { name: 'severity', type: 'enum', nullable: false, primaryKey: false, description: 'Log severity level' },
      ],
    },
    {
      name: 'documents',
      description: 'Uploaded documents and files',
      recordCount: 8765,
      sizeBytes: 102400000,
      lastModified: '2024-01-20T11:45:00Z',
      columns: [
        { name: 'id', type: 'varchar(36)', nullable: false, primaryKey: true, description: 'Unique identifier' },
        { name: 'name', type: 'varchar(255)', nullable: false, primaryKey: false, description: 'Original filename' },
        { name: 'type', type: 'varchar(100)', nullable: false, primaryKey: false, description: 'Document type' },
        { name: 'size', type: 'bigint', nullable: false, primaryKey: false, description: 'File size in bytes' },
        { name: 'url', type: 'varchar(500)', nullable: false, primaryKey: false, description: 'Storage URL' },
        { name: 'uploaded_by', type: 'varchar(36)', nullable: false, primaryKey: false, foreignKey: 'users.id', description: 'Uploader' },
        { name: 'uploaded_at', type: 'timestamp', nullable: false, primaryKey: false, description: 'Upload timestamp' },
      ],
    },
  ];
};

const generateMockSystemHealth = (): SystemHealth => {
  return {
    status: 'healthy',
    uptime: 432000, // 5 days in seconds
    cpuUsage: 45.2,
    memoryUsage: 67.8,
    diskUsage: 34.5,
    databaseConnections: 23,
    lastChecked: new Date().toISOString(),
    services: [
      {
        name: 'Web Server',
        status: 'running',
        responseTime: 120,
        lastChecked: new Date().toISOString(),
      },
      {
        name: 'Database',
        status: 'running',
        responseTime: 45,
        lastChecked: new Date().toISOString(),
      },
      {
        name: 'Redis Cache',
        status: 'running',
        responseTime: 15,
        lastChecked: new Date().toISOString(),
      },
      {
        name: 'Email Service',
        status: 'running',
        responseTime: 890,
        lastChecked: new Date().toISOString(),
      },
      {
        name: 'File Storage',
        status: 'running',
        responseTime: 234,
        lastChecked: new Date().toISOString(),
      },
      {
        name: 'Background Jobs',
        status: 'running',
        responseTime: 67,
        lastChecked: new Date().toISOString(),
      },
    ],
  };
};

const generateMockPerformanceMetrics = (): PerformanceMetrics[] => {
  const metrics: PerformanceMetrics[] = [];
  const now = new Date();
  
  for (let i = 0; i < 24; i++) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    metrics.push({
      timestamp: timestamp.toISOString(),
      cpuUsage: 30 + Math.random() * 40,
      memoryUsage: 50 + Math.random() * 30,
      diskUsage: 25 + Math.random() * 20,
      networkIn: Math.random() * 1000,
      networkOut: Math.random() * 800,
      activeUsers: Math.floor(50 + Math.random() * 100),
      activeConnections: Math.floor(10 + Math.random() * 40),
      responseTime: 100 + Math.random() * 200,
    });
  }
  
  return metrics.reverse();
};

export const useDeveloperToolsStore = create<DeveloperToolsStore>((set, get) => ({
  apiEndpoints: [],
  databaseTables: [],
  systemHealth: null,
  performanceMetrics: [],
  apiTestHistory: [],
  isLoading: false,

  fetchApiEndpoints: async () => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      const apiEndpoints = generateMockApiEndpoints();
      set({ apiEndpoints, isLoading: false });
    } catch (error) {
      console.error('Error fetching API endpoints:', error);
      set({ isLoading: false });
    }
  },

  fetchDatabaseTables: async () => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const databaseTables = generateMockDatabaseTables();
      set({ databaseTables, isLoading: false });
    } catch (error) {
      console.error('Error fetching database tables:', error);
      set({ isLoading: false });
    }
  },

  fetchSystemHealth: async () => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      const systemHealth = generateMockSystemHealth();
      set({ systemHealth, isLoading: false });
    } catch (error) {
      console.error('Error fetching system health:', error);
      set({ isLoading: false });
    }
  },

  fetchPerformanceMetrics: async () => {
    set({ isLoading: true });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const performanceMetrics = generateMockPerformanceMetrics();
      set({ performanceMetrics, isLoading: false });
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      set({ isLoading: false });
    }
  },

  testApiEndpoint: async (request) => {
    try {
      const startTime = Date.now();
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 800));
      
      const responseTime = Date.now() - startTime;
      const response: ApiTestResponse = {
        status: Math.random() > 0.1 ? 200 : Math.random() > 0.5 ? 400 : 500,
        statusText: 'OK',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-ID': Math.random().toString(36).substring(7),
        },
        data: {
          success: true,
          message: 'API test successful',
          timestamp: new Date().toISOString(),
          data: { mock: 'response data' },
        },
        responseTime,
        timestamp: new Date().toISOString(),
      };

      const { apiTestHistory } = get();
      set({
        apiTestHistory: [{ request, response }, ...apiTestHistory.slice(0, 49)],
      });

      return response;
    } catch (error) {
      const response: ApiTestResponse = {
        status: 500,
        statusText: 'Internal Server Error',
        headers: {},
        data: { error: 'Network error or server unavailable' },
        responseTime: 0,
        timestamp: new Date().toISOString(),
      };

      const { apiTestHistory } = get();
      set({
        apiTestHistory: [{ request, response }, ...apiTestHistory.slice(0, 49)],
      });

      return response;
    }
  },

  clearTestHistory: () => {
    set({ apiTestHistory: [] });
  },

  runDatabaseQuery: async (query) => {
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 700));
    
    // Mock query results based on query type
    if (query.toLowerCase().includes('select')) {
      return {
        rows: [
          { id: 1, name: 'Sample Data 1', created_at: '2024-01-20T10:00:00Z' },
          { id: 2, name: 'Sample Data 2', created_at: '2024-01-20T11:00:00Z' },
        ],
        rowCount: 2,
        executionTime: Math.floor(Math.random() * 500),
      };
    } else {
      return {
        affectedRows: Math.floor(Math.random() * 10),
        executionTime: Math.floor(Math.random() * 200),
      };
    }
  },

  exportTableData: async (tableName) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const csvContent = `id,name,created_at\n1,Sample Data 1,2024-01-20T10:00:00Z\n2,Sample Data 2,2024-01-20T11:00:00Z`;
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${tableName}_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },

  clearCache: async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Mock cache clearing
  },

  restartService: async (serviceName) => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    // Mock service restart
  },

  generateDiagnosticReport: async () => {
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const report = {
      timestamp: new Date().toISOString(),
      system: get().systemHealth,
      performance: get().performanceMetrics.slice(-6),
      database: get().databaseTables.map(t => ({
        name: t.name,
        recordCount: t.recordCount,
        sizeBytes: t.sizeBytes,
      })),
    };
    
    const jsonContent = JSON.stringify(report, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diagnostic_report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
}));
