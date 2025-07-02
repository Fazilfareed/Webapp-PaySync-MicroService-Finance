import { create } from 'zustand';
import { Borrower, BorrowerFormData } from '../types';

interface BorrowerStore {
  borrowers: Borrower[];
  selectedBorrower: Borrower | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchBorrowers: (filters?: any) => Promise<void>;
  fetchBorrowerById: (id: string) => Promise<void>;
  createBorrower: (data: BorrowerFormData) => Promise<void>;
  updateBorrower: (id: string, data: Partial<BorrowerFormData>) => Promise<void>;
  approveBorrower: (id: string) => Promise<void>;
  rejectBorrower: (id: string, reason: string) => Promise<void>;
  setSelectedBorrower: (borrower: Borrower | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Mock data generator
const generateMockBorrowers = (): Borrower[] => {
  const statuses: Array<'pending' | 'approved' | 'rejected'> = ['pending', 'approved', 'rejected'];
  const idTypes: Array<'nic' | 'passport' | 'license'> = ['nic', 'passport', 'license'];
  
  const names = [
    'Kamal Perera', 'Nimal Silva', 'Sunil Fernando', 'Ravi Wickramasinghe',
    'Chamika Rathnayake', 'Dilshan Jayawardena', 'Tharaka Bandara', 'Kasun Mendis',
    'Amara Gunasekara', 'Sanduni Wijesekara', 'Priyanka Rajapaksa', 'Malini Fonseka'
  ];

  return Array.from({ length: 25 }, (_, i) => ({
    id: `borrower_${i}`,
    name: names[Math.floor(Math.random() * names.length)],
    email: `borrower${i}@example.com`,
    phone: `+94${Math.floor(Math.random() * 900000000) + 100000000}`,
    address: `No. ${Math.floor(Math.random() * 200) + 1}, Main Street, Colombo ${Math.floor(Math.random() * 15) + 1}`,
    idNumber: `${Math.floor(Math.random() * 900000000) + 100000000}V`,
    idType: idTypes[Math.floor(Math.random() * idTypes.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    agentId: `agent_${Math.floor(Math.random() * 10)}`,
    regionalAdminId: Math.random() > 0.5 ? `admin_${Math.floor(Math.random() * 5)}` : undefined,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    documents: [],
  }));
};

export const useBorrowerStore = create<BorrowerStore>((set, get) => ({
  borrowers: [],
  selectedBorrower: null,
  isLoading: false,
  error: null,

  fetchBorrowers: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 700));
      const borrowers = generateMockBorrowers();
      
      // Apply filters if provided
      let filteredBorrowers = borrowers;
      if (filters?.status) {
        filteredBorrowers = borrowers.filter(b => b.status === filters.status);
      }
      if (filters?.agentId) {
        filteredBorrowers = filteredBorrowers.filter(b => b.agentId === filters.agentId);
      }
      
      set({ borrowers: filteredBorrowers, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch borrowers', isLoading: false });
    }
  },

  fetchBorrowerById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      const borrowers = generateMockBorrowers();
      const borrower = borrowers.find(b => b.id === id);
      
      if (!borrower) {
        throw new Error('Borrower not found');
      }
      
      set({ selectedBorrower: borrower, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to fetch borrower', isLoading: false });
    }
  },

  createBorrower: async (data) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newBorrower: Borrower = {
        id: `borrower_${Date.now()}`,
        ...data,
        status: 'pending',
        agentId: 'current_agent_id', // This would come from auth context
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        documents: [],
      };
      
      const currentBorrowers = get().borrowers;
      set({ 
        borrowers: [newBorrower, ...currentBorrowers],
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to create borrower', isLoading: false });
    }
  },

  updateBorrower: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const currentBorrowers = get().borrowers;
      const updatedBorrowers = currentBorrowers.map(borrower =>
        borrower.id === id
          ? { ...borrower, ...data, updatedAt: new Date().toISOString() }
          : borrower
      );
      
      set({ borrowers: updatedBorrowers, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to update borrower', isLoading: false });
    }
  },

  approveBorrower: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const currentBorrowers = get().borrowers;
      const updatedBorrowers = currentBorrowers.map(borrower =>
        borrower.id === id
          ? { ...borrower, status: 'approved' as const, updatedAt: new Date().toISOString() }
          : borrower
      );
      
      set({ borrowers: updatedBorrowers, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to approve borrower', isLoading: false });
    }
  },

  rejectBorrower: async (id, reason) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const currentBorrowers = get().borrowers;
      const updatedBorrowers = currentBorrowers.map(borrower =>
        borrower.id === id
          ? { ...borrower, status: 'rejected' as const, updatedAt: new Date().toISOString() }
          : borrower
      );
      
      set({ borrowers: updatedBorrowers, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to reject borrower', isLoading: false });
    }
  },

  setSelectedBorrower: (borrower) => set({ selectedBorrower: borrower }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
