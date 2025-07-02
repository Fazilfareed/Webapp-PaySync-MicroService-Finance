import { create } from 'zustand';
import { Payment, Installment, PaymentFormData, PaymentApprovalData, PaymentAnalytics, PaymentSummary, Loan } from '../types';

interface PaymentStore {
  payments: Payment[];
  installments: Installment[];
  paymentSummaries: PaymentSummary[];
  analytics: PaymentAnalytics | null;
  selectedPayment: Payment | null;
  isLoading: boolean;
  error: string | null;
  uploadProgress: number;
  
  // Actions
  fetchPayments: (filters?: any) => Promise<void>;
  fetchPaymentsByLoan: (loanId: string) => Promise<void>;
  fetchInstallments: (loanId: string) => Promise<void>;
  fetchPaymentAnalytics: () => Promise<void>;
  fetchPaymentSummaries: () => Promise<void>;
  uploadPayment: (data: PaymentFormData) => Promise<void>;
  approvePayment: (data: PaymentApprovalData) => Promise<void>;
  rejectPayment: (data: PaymentApprovalData) => Promise<void>;
  generatePaymentSchedule: (loanId: string) => Promise<Installment[]>;
  markInstallmentPaid: (installmentId: string, paymentId: string) => Promise<void>;
  setSelectedPayment: (payment: Payment | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setUploadProgress: (progress: number) => void;
}

// Mock data generators
const generateMockInstallments = (loanId: string): Installment[] => {
  const monthlyPayment = 25000;
  const principal = 500000;
  const interestRate = 0.20 / 12; // 20% annual / 12 months
  let remainingBalance = principal;

  return Array.from({ length: 24 }, (_, i) => {
    const interestAmount = remainingBalance * interestRate;
    const principalAmount = monthlyPayment - interestAmount;
    remainingBalance -= principalAmount;

    return {
      id: `installment_${loanId}_${i + 1}`,
      loanId,
      installmentNumber: i + 1,
      dueDate: new Date(Date.now() + (i * 30) * 24 * 60 * 60 * 1000).toISOString(),
      principal: Math.round(principalAmount),
      interest: Math.round(interestAmount),
      remainingBalance: Math.max(0, Math.round(remainingBalance)),
      status: i < 3 ? 'paid' : i < 5 ? 'overdue' : 'pending',
      paymentId: i < 3 ? `payment_${loanId}_${i}` : undefined,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
};

const generateMockPayments = (): Payment[] => {
  const paymentMethods: Array<'cash' | 'online'> = ['cash', 'online'];
  const statuses: Array<'pending' | 'approved' | 'rejected'> = ['pending', 'approved', 'rejected'];

  return Array.from({ length: 50 }, (_, i) => {
    const amount = Math.floor(Math.random() * 50000) + 15000;
    const principal = Math.floor(amount * 0.7);
    const interest = Math.floor(amount * 0.25);
    const lateFee = amount - principal - interest;

    return {
      id: `payment_${i}`,
      loanId: `loan_${Math.floor(Math.random() * 10)}`,
      installmentId: `installment_loan_${Math.floor(Math.random() * 10)}_${Math.floor(Math.random() * 24) + 1}`,
      amount,
      principal,
      interest,
      lateFee,
      dueDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      paidDate: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      paymentSlip: Math.random() > 0.2 ? {
        id: `doc_${i}`,
        name: `payment_receipt_${i}.pdf`,
        type: 'application/pdf',
        url: `/uploads/payment_receipts/receipt_${i}.pdf`,
        uploadedBy: `user_${Math.floor(Math.random() * 10)}`,
        uploadedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        size: Math.floor(Math.random() * 500000) + 100000,
      } : undefined,
      approvedBy: Math.random() > 0.6 ? `admin_${Math.floor(Math.random() * 5)}` : undefined,
      rejectionReason: Math.random() > 0.9 ? 'Insufficient payment amount' : undefined,
      createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
};

const generateMockPaymentAnalytics = (): PaymentAnalytics => {
  return {
    onTimePaymentRate: 87.5,
    averagePaymentAmount: 23450,
    totalPaymentsReceived: 1850000,
    overduePayments: 12,
    pendingApprovals: 8,
    monthlyPaymentTrend: Array.from({ length: 12 }, (_, i) => ({
      month: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
      amount: Math.floor(Math.random() * 200000) + 100000,
      count: Math.floor(Math.random() * 50) + 20,
    })),
  };
};

const generateMockPaymentSummaries = (): PaymentSummary[] => {
  return Array.from({ length: 15 }, (_, i) => {
    const totalInstallments = 24;
    const paidInstallments = Math.floor(Math.random() * 12) + 1;
    const overdueInstallments = Math.floor(Math.random() * 3);
    const pendingInstallments = totalInstallments - paidInstallments - overdueInstallments;
    const monthlyAmount = 25000;

    return {
      loanId: `loan_${i}`,
      borrowerName: `Borrower ${i + 1}`,
      totalInstallments,
      paidInstallments,
      pendingInstallments,
      overdueInstallments,
      nextDueDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      nextDueAmount: monthlyAmount,
      totalPaid: paidInstallments * monthlyAmount,
      totalRemaining: pendingInstallments * monthlyAmount,
    };
  });
};

export const usePaymentStore = create<PaymentStore>((set, get) => ({
  payments: [],
  installments: [],
  paymentSummaries: [],
  analytics: null,
  selectedPayment: null,
  isLoading: false,
  error: null,
  uploadProgress: 0,

  fetchPayments: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      let payments = generateMockPayments();
      
      // Apply filters
      if (filters?.status) {
        payments = payments.filter(p => p.status === filters.status);
      }
      if (filters?.loanId) {
        payments = payments.filter(p => p.loanId === filters.loanId);
      }
      if (filters?.paymentMethod) {
        payments = payments.filter(p => p.paymentMethod === filters.paymentMethod);
      }
      
      set({ payments, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch payments', isLoading: false });
    }
  },

  fetchPaymentsByLoan: async (loanId) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const allPayments = generateMockPayments();
      const payments = allPayments.filter(p => p.loanId === loanId);
      
      set({ payments, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch loan payments', isLoading: false });
    }
  },

  fetchInstallments: async (loanId) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const installments = generateMockInstallments(loanId);
      
      set({ installments, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch installments', isLoading: false });
    }
  },

  fetchPaymentAnalytics: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const analytics = generateMockPaymentAnalytics();
      
      set({ analytics, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch payment analytics', isLoading: false });
    }
  },

  fetchPaymentSummaries: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const paymentSummaries = generateMockPaymentSummaries();
      
      set({ paymentSummaries, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch payment summaries', isLoading: false });
    }
  },

  uploadPayment: async (data) => {
    set({ isLoading: true, error: null, uploadProgress: 0 });
    try {
      // Simulate file upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        set({ uploadProgress: progress });
      }
      
      // Simulate creating payment record
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newPayment: Payment = {
        id: `payment_${Date.now()}`,
        loanId: data.loanId,
        installmentId: data.installmentId,
        amount: data.amount,
        principal: Math.floor(data.amount * 0.7),
        interest: Math.floor(data.amount * 0.25),
        lateFee: Math.floor(data.amount * 0.05),
        dueDate: data.paymentDate,
        paidDate: data.paymentDate,
        status: 'pending',
        paymentMethod: data.paymentMethod,
        paymentSlip: {
          id: `doc_${Date.now()}`,
          name: data.paymentSlip.name,
          type: data.paymentSlip.type,
          url: `/uploads/payment_receipts/${data.paymentSlip.name}`,
          uploadedBy: 'current_user',
          uploadedAt: new Date().toISOString(),
          size: data.paymentSlip.size,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      set(state => ({
        payments: [newPayment, ...state.payments],
        isLoading: false,
        uploadProgress: 0,
      }));
    } catch (error) {
      set({ error: 'Failed to upload payment', isLoading: false, uploadProgress: 0 });
    }
  },

  approvePayment: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set(state => ({
        payments: state.payments.map(p => 
          p.id === data.paymentId 
            ? { ...p, status: 'approved', approvedBy: 'current_admin', updatedAt: new Date().toISOString() }
            : p
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to approve payment', isLoading: false });
    }
  },

  rejectPayment: async (data) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      set(state => ({
        payments: state.payments.map(p => 
          p.id === data.paymentId 
            ? { 
                ...p, 
                status: 'rejected', 
                rejectionReason: data.rejectionReason,
                approvedBy: 'current_admin',
                updatedAt: new Date().toISOString()
              }
            : p
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to reject payment', isLoading: false });
    }
  },

  generatePaymentSchedule: async (loanId) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const installments = generateMockInstallments(loanId);
      
      set({ installments, isLoading: false });
      return installments;
    } catch (error) {
      set({ error: 'Failed to generate payment schedule', isLoading: false });
      return [];
    }
  },

  markInstallmentPaid: async (installmentId, paymentId) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      
      set(state => ({
        installments: state.installments.map(i => 
          i.id === installmentId 
            ? { ...i, status: 'paid', paymentId, updatedAt: new Date().toISOString() }
            : i
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to mark installment as paid', isLoading: false });
    }
  },

  setSelectedPayment: (payment) => set({ selectedPayment: payment }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
}));
