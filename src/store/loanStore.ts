import { create } from 'zustand';
import { Loan, LoanFormData, Payment } from '../types';

interface LoanStore {
  loans: Loan[];
  payments: Payment[];
  selectedLoan: Loan | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchLoans: (filters?: any) => Promise<void>;
  fetchLoanById: (id: string) => Promise<void>;
  fetchPaymentsByLoanId: (loanId: string) => Promise<void>;
  createLoan: (data: LoanFormData) => Promise<void>;
  updateLoan: (id: string, data: Partial<LoanFormData>) => Promise<void>;
  approveLoan: (id: string) => Promise<void>;
  rejectLoan: (id: string, reason: string) => Promise<void>;
  approvePayment: (paymentId: string) => Promise<void>;
  rejectPayment: (paymentId: string, reason: string) => Promise<void>;
  setSelectedLoan: (loan: Loan | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Mock data generators
const generateMockLoans = (): Loan[] => {
  const statuses: Array<'pending' | 'approved' | 'active' | 'completed' | 'defaulted'> = 
    ['pending', 'approved', 'active', 'completed', 'defaulted'];
  const purposes = [
    'Business Expansion', 'Home Renovation', 'Education', 'Medical Emergency',
    'Vehicle Purchase', 'Debt Consolidation', 'Working Capital', 'Agriculture'
  ];

  return Array.from({ length: 30 }, (_, i) => {
    const amount = Math.floor(Math.random() * 2000000) + 100000; // 100K - 2M LKR
    const termMonths = [6, 12, 18, 24, 36, 48][Math.floor(Math.random() * 6)];
    const interestRate = Math.floor(Math.random() * 10) + 15; // 15-25%
    const monthlyPayment = calculateMonthlyPayment(amount, interestRate, termMonths);
    const totalAmount = monthlyPayment * termMonths;

    return {
      id: `loan_${i}`,
      borrowerId: `borrower_${Math.floor(Math.random() * 25)}`,
      amount,
      purpose: purposes[Math.floor(Math.random() * purposes.length)],
      interestRate,
      termMonths,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      monthlyPayment,
      totalAmount,
      agentId: `agent_${Math.floor(Math.random() * 10)}`,
      regionalAdminId: Math.random() > 0.5 ? `admin_${Math.floor(Math.random() * 5)}` : undefined,
      approvedAt: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      startDate: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      endDate: Math.random() > 0.5 ? new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      guarantors: [],
      paymentSchedule: [],
    };
  });
};

const generateMockPayments = (loanId: string): Payment[] => {
  const statuses: Array<'pending' | 'approved' | 'rejected'> = 
    ['pending', 'approved', 'rejected'];
  const paymentMethods: Array<'cash' | 'online'> = ['cash', 'online'];

  return Array.from({ length: 12 }, (_, i) => {
    const amount = Math.floor(Math.random() * 50000) + 10000; // 10K - 60K LKR
    const principal = Math.floor(amount * 0.7);
    const interest = Math.floor(amount * 0.25);
    const lateFee = amount - principal - interest;
    
    return {
      id: `payment_${loanId}_${i}`,
      loanId,
      installmentId: `installment_${loanId}_${i + 1}`,
      amount,
      principal,
      interest,
      lateFee,
      dueDate: new Date(Date.now() + (i * 30 - 15) * 24 * 60 * 60 * 1000).toISOString(),
      paidDate: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
      approvedBy: Math.random() > 0.5 ? `admin_${Math.floor(Math.random() * 5)}` : undefined,
      rejectionReason: Math.random() > 0.8 ? 'Insufficient payment amount' : undefined,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    };
  });
};

const calculateMonthlyPayment = (principal: number, annualRate: number, termMonths: number): number => {
  const monthlyRate = annualRate / 100 / 12;
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                  (Math.pow(1 + monthlyRate, termMonths) - 1);
  return Math.round(payment);
};

export const useLoanStore = create<LoanStore>((set, get) => ({
  loans: [],
  payments: [],
  selectedLoan: null,
  isLoading: false,
  error: null,

  fetchLoans: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      const loans = generateMockLoans();
      
      // Apply filters if provided
      let filteredLoans = loans;
      if (filters?.status) {
        filteredLoans = loans.filter(l => l.status === filters.status);
      }
      if (filters?.agentId) {
        filteredLoans = filteredLoans.filter(l => l.agentId === filters.agentId);
      }
      if (filters?.regionalAdminId) {
        filteredLoans = filteredLoans.filter(l => l.regionalAdminId === filters.regionalAdminId);
      }
      
      set({ loans: filteredLoans, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch loans', isLoading: false });
    }
  },

  fetchLoanById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const loans = generateMockLoans();
      const loan = loans.find(l => l.id === id);
      
      if (!loan) {
        throw new Error('Loan not found');
      }
      
      set({ selectedLoan: loan, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch loan', isLoading: false });
    }
  },

  fetchPaymentsByLoanId: async (loanId) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      const payments = generateMockPayments(loanId);
      set({ payments, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch payments', isLoading: false });
    }
  },

  createLoan: async (data) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      const monthlyPayment = calculateMonthlyPayment(data.amount, 20, data.termMonths); // Default 20% interest
      const totalAmount = monthlyPayment * data.termMonths;
      
      const newLoan: Loan = {
        id: `loan_${Date.now()}`,
        ...data,
        interestRate: 20,
        status: 'pending',
        monthlyPayment,
        totalAmount,
        agentId: 'current_agent_id', // This would come from auth context
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        guarantors: [], // Empty guarantors array for now
        paymentSchedule: [], // Empty payment schedule initially
      };
      
      const currentLoans = get().loans;
      set({ 
        loans: [newLoan, ...currentLoans],
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to create loan', isLoading: false });
    }
  },

  updateLoan: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 900));
      
      const currentLoans = get().loans;
      const updatedLoans = currentLoans.map(loan =>
        loan.id === id
          ? { ...loan, ...data, updatedAt: new Date().toISOString() }
          : loan
      );
      
      set({ loans: updatedLoans, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to update loan', isLoading: false });
    }
  },

  approveLoan: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const currentLoans = get().loans;
      const updatedLoans = currentLoans.map(loan =>
        loan.id === id
          ? { 
              ...loan, 
              status: 'approved' as const, 
              approvedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString() 
            }
          : loan
      );
      
      set({ loans: updatedLoans, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to approve loan', isLoading: false });
    }
  },

  rejectLoan: async (id, reason) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 700));
      
      const currentLoans = get().loans;
      const updatedLoans = currentLoans.map(loan =>
        loan.id === id
          ? { ...loan, status: 'rejected' as const, updatedAt: new Date().toISOString() }
          : loan
      );
      
      set({ loans: updatedLoans, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to reject loan', isLoading: false });
    }
  },

  approvePayment: async (paymentId) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const currentPayments = get().payments;
      const updatedPayments = currentPayments.map(payment =>
        payment.id === paymentId
          ? { 
              ...payment, 
              status: 'approved' as const,
              paidDate: new Date().toISOString(),
              updatedAt: new Date().toISOString() 
            }
          : payment
      );
      
      set({ payments: updatedPayments, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to approve payment', isLoading: false });
    }
  },

  rejectPayment: async (paymentId, reason) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const currentPayments = get().payments;
      const updatedPayments = currentPayments.map(payment =>
        payment.id === paymentId
          ? { 
              ...payment, 
              status: 'rejected' as const,
              rejectionReason: reason,
              updatedAt: new Date().toISOString() 
            }
          : payment
      );
      
      set({ payments: updatedPayments, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to reject payment', isLoading: false });
    }
  },

  setSelectedLoan: (loan) => set({ selectedLoan: loan }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
