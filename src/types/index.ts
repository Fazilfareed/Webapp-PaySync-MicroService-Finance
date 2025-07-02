// User Roles
export type UserRole = 'super_admin' | 'moderate_admin' | 'ceo' | 'regional_admin' | 'agent';

// User Interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  region?: string; // For regional admins and agents
  profileImage?: string;
  createdAt: string;
  lastLogin?: string;
  isActive: boolean;
}

// Authentication
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

// Borrower Interface
export interface Borrower {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  idNumber: string;
  idType: 'nic' | 'passport' | 'license';
  status: 'pending' | 'approved' | 'rejected' | 'agent_approved';
  agentId: string;
  regionalAdminId?: string;
  createdAt: string;
  updatedAt: string;
  documents: Document[];
}

// Loan Interface (Enhanced)
export interface Loan {
  id: string;
  borrowerId: string;
  amount: number;
  purpose: string;
  interestRate: number;
  termMonths: number;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'defaulted' | 'rejected';
  monthlyPayment: number;
  totalAmount: number;
  agentId: string;
  regionalAdminId?: string;
  approvedAt?: string;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  guarantors: Guarantor[];
  downPaymentSlip?: Document;
  paymentSchedule: Installment[];
}

// Guarantor Interface
export interface Guarantor {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  idNumber: string;
  relationship: string;
  documents: Document[];
}

// Payment Interface (Enhanced)
export interface Payment {
  id: string;
  loanId: string;
  installmentId: string;
  amount: number;
  principal: number;
  interest: number;
  lateFee: number;
  dueDate: string;
  paidDate?: string;
  status: 'pending' | 'approved' | 'rejected';
  paymentMethod: 'cash' | 'online';
  paymentSlip?: Document;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// Installment Interface (New)
export interface Installment {
  id: string;
  loanId: string;
  installmentNumber: number;
  dueDate: string;
  principal: number;
  interest: number;
  remainingBalance: number;
  status: 'pending' | 'paid' | 'overdue';
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
}

// Document Interface
export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  size: number;
}

// Region Interface (Sri Lankan Districts)
export interface Region {
  id: string;
  name: string;
  district: string;
  province: string;
  assignedAdminId?: string;
  agentCount: number;
  borrowerCount: number;
  activeLoans: number;
  totalLoanAmount: number;
}

// Commission Interface
export interface Commission {
  id: string;
  agentId: string;
  loanId: string;
  amount: number;
  percentage: number;
  status: 'pending' | 'approved' | 'paid';
  approvedBy?: string;
  paidAt?: string;
  createdAt: string;
}

// Dashboard Analytics
export interface DashboardStats {
  totalUsers: number;
  totalBorrowers: number;
  totalLoans: number;
  totalLoanAmount: number;
  activeLoans: number;
  defaultedLoans: number;
  monthlyRevenue: number;
  commissionsPaid: number;
  regionsActive: number;
  agentsActive: number;
}

// System Log Interface
export interface SystemLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

// Notification Interface
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

// Role Permissions
export interface RolePermissions {
  role: UserRole;
  permissions: {
    users: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
    };
    borrowers: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      approve: boolean;
    };
    loans: {
      create: boolean;
      read: boolean;
      update: boolean;
      delete: boolean;
      approve: boolean;
    };
    payments: {
      create: boolean;
      read: boolean;
      update: boolean;
      approve: boolean;
      uploadReceipt: boolean;
      viewHistory: boolean;
      generateSchedule: boolean;
      handleOverdue: boolean;
    };
    regions: {
      create: boolean;
      read: boolean;
      update: boolean;
      assign: boolean;
    };
    analytics: {
      viewAll: boolean;
      viewRegional: boolean;
      exportReports: boolean;
    };
    system: {
      viewLogs: boolean;
      manageSettings: boolean;
      overrideActions: boolean;
    };
  };
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form Types
export interface BorrowerFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  idNumber: string;
  idType: 'nic' | 'passport' | 'license';
}

export interface LoanFormData {
  borrowerId: string;
  amount: number;
  purpose: string;
  termMonths: number;
  guarantors: Guarantor[];
}

export interface PaymentFormData {
  loanId: string;
  installmentId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'cash' | 'online';
  paymentSlip: File;
}

export interface PaymentApprovalData {
  paymentId: string;
  status: 'approved' | 'rejected';
  rejectionReason?: string;
}

// Sri Lankan Districts for Regional Assignment
export const SRI_LANKAN_DISTRICTS = [
  // Western Province
  'Colombo', 'Gampaha', 'Kalutara',
  // Central Province
  'Kandy', 'Matale', 'Nuwara Eliya',
  // Southern Province
  'Galle', 'Matara', 'Hambantota',
  // Northern Province
  'Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya',
  // Eastern Province
  'Batticaloa', 'Ampara', 'Trincomalee',
  // North Western Province
  'Kurunegala', 'Puttalam',
  // North Central Province
  'Anuradhapura', 'Polonnaruwa',
  // Uva Province
  'Badulla', 'Monaragala',
  // Sabaragamuwa Province
  'Ratnapura', 'Kegalle'
] as const;

export type SriLankanDistrict = typeof SRI_LANKAN_DISTRICTS[number];

// Additional Types for SuperAdmin Dashboard

// System Settings Interface
export interface SystemSettings {
  id: string;
  category: string;
  key: string;
  value: string | number | boolean;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'json';
  options?: string[];
  isEditable: boolean;
  updatedBy: string;
  updatedAt: string;
}

// Feature Flag Interface
export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  isEnabled: boolean;
  environment: 'development' | 'staging' | 'production' | 'all';
  rolloutPercentage: number;
  targetRoles: UserRole[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// API Endpoint Interface for Developer Tools
export interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  description: string;
  category: string;
  requiredAuth: boolean;
  requiredRole: UserRole[];
  parameters: ApiParameter[];
  responseExample: any;
  isActive: boolean;
}

export interface ApiParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  example: any;
}

// Database Table Interface for Developer Tools
export interface DatabaseTable {
  name: string;
  description: string;
  recordCount: number;
  sizeBytes: number;
  lastModified: string;
  columns: DatabaseColumn[];
}

export interface DatabaseColumn {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey?: string;
  description?: string;
}

// System Health Interface
export interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  uptime: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  databaseConnections: number;
  lastChecked: string;
  services: ServiceStatus[];
}

export interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error';
  responseTime: number;
  lastChecked: string;
  details?: string;
}

// Permission Action Types
export interface PermissionAction {
  id: string;
  name: string;
  description: string;
  resource: string;
  isSystemLevel: boolean;
}

// Role Management Interface
export interface RoleManagement {
  id: string;
  roleName: string;
  displayName: string;
  description: string;
  level: number;
  isSystemRole: boolean;
  permissions: string[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

// User Activity Interface
export interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  duration?: number;
  status: 'success' | 'failed' | 'pending';
  details?: any;
}

// Audit Log Interface
export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// System Performance Metrics
export interface PerformanceMetrics {
  timestamp: string;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
  activeUsers: number;
  activeConnections: number;
  responseTime: number;
}

// Borrower Statistics
export interface BorrowerStats {
  approved: number;
  pending: number;
  rejected: number;
  total: number;
  growth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

// Loan Statistics
export interface LoanStats {
  active: number;
  completed: number;
  defaulted: number;
  pending: number;
  totalAmount: number;
  avgAmount: number;
  growth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

// Payment Analytics Interface
export interface PaymentAnalytics {
  onTimePaymentRate: number;
  averagePaymentAmount: number;
  totalPaymentsReceived: number;
  overduePayments: number;
  pendingApprovals: number;
  monthlyPaymentTrend: {
    month: string;
    amount: number;
    count: number;
  }[];
}

// Payment Summary Interface
export interface PaymentSummary {
  loanId: string;
  borrowerName: string;
  totalInstallments: number;
  paidInstallments: number;
  pendingInstallments: number;
  overdueInstallments: number;
  nextDueDate: string;
  nextDueAmount: number;
  totalPaid: number;
  totalRemaining: number;
}
