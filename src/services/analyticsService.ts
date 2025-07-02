import { Payment, Installment, Loan, PaymentAnalytics } from '../types';
import { calculateOnTimePaymentRate, getOverdueDays, isPaymentOverdue } from './paymentService';
/**
 * Enhanced Analytics Service
 * Provides comprehensive payment analytics and insights
 */
export interface PaymentTrendData {
    period: string;
    totalAmount: number;
    totalCount: number;
    onTimeCount: number;
    lateCount: number;
    averageAmount: number;
    collectionRate: number;
  }
  export interface RegionalAnalytics {
    regionId: string;
    regionName: string;
    totalLoans: number;
    totalPayments: number;
    collectionRate: number;
    onTimePaymentRate: number;
    averageTicketSize: number;
    overdueAmount: number;
    monthlyGrowth: number;
  }
  export interface AgentPerformance {
    agentId: string;
    agentName: string;
    totalLoans: number;
    activeLoans: number;
    completedLoans: number;
    collectionRate: number;
    onTimePaymentRate: number;
    totalCommission: number;
    averageLoanSize: number;
    customerSatisfaction: number;
  }
  export interface PaymentFlowAnalytics {
    totalSubmitted: number;
    totalPending: number;
    totalApproved: number;
    totalRejected: number;
    approvalRate: number;
    averageProcessingTime: number; // in hours
    rejectionReasons: Array<{ reason: string; count: number; percentage: number }>;
  }
  export interface LoanPortfolioHealth {
    totalPortfolioValue: number;
    totalOutstanding: number;
    totalCollected: number;
    collectionEfficiency: number;
    npaPercentage: number;
    averageLoanTenure: number;
    portfolioGrowth: number;
    riskDistribution: Array<{ riskLevel: string; amount: number; count: number }>;
  }
  // Calculate detailed payment trends
  export const calculatePaymentTrends = (
    payments: Payment[],
    installments: Installment[],
    period: 'daily' | 'weekly' | 'monthly' | 'quarterly' = 'monthly'
  ): PaymentTrendData[] => {
    const groupedData = new Map<string, Payment[]>();
    
    payments.forEach(payment => {
      let periodKey: string;
      const date = new Date(payment.paidDate || payment.createdAt);
      
      switch (period) {
        case 'daily':
          periodKey = date.toISOString().split('T')[0];
          break;
        case 'weekly':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          periodKey = weekStart.toISOString().split('T')[0];
          break;
        case 'monthly':
          periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'quarterly':
          const quarter = Math.floor(date.getMonth() / 3) + 1;
          periodKey = `${date.getFullYear()}-Q${quarter}`;
          break;
      }
      
      if (!groupedData.has(periodKey)) {
        groupedData.set(periodKey, []);
      }
      groupedData.get(periodKey)!.push(payment);
    });
    
    return Array.from(groupedData.entries()).map(([period, periodPayments]) => {
      const totalAmount = periodPayments.reduce((sum, p) => sum + p.amount, 0);
      const totalCount = periodPayments.length;
      
      // Calculate on-time vs late payments
      const onTimeCount = periodPayments.filter(payment => {
        const installment = installments.find(i => i.id === payment.installmentId);
        if (!installment || !payment.paidDate) return false;
        
        return new Date(payment.paidDate) <= new Date(installment.dueDate);
      }).length;
      
      const lateCount = totalCount - onTimeCount;
      const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;
      const collectionRate = periodPayments.filter(p => p.status === 'approved').length / totalCount * 100;
      
      return {
        period,
        totalAmount,
        totalCount,
        onTimeCount,
        lateCount,
        averageAmount,
        collectionRate,
      };
    }).sort((a, b) => a.period.localeCompare(b.period));
  };
  // Calculate regional analytics
  export const calculateRegionalAnalytics = (
    loans: Loan[],
    payments: Payment[],
    installments: Installment[]
  ): RegionalAnalytics[] => {
    const regions = new Map<string, {
      loans: Loan[];
      payments: Payment[];
      installments: Installment[];
    }>();
    
    // Group data by region (using regionalAdminId as proxy)
    loans.forEach(loan => {
      const regionId = loan.regionalAdminId || 'unassigned';
      if (!regions.has(regionId)) {
        regions.set(regionId, { loans: [], payments: [], installments: [] });
      }
      regions.get(regionId)!.loans.push(loan);
      
      // Add related payments and installments
      const loanPayments = payments.filter(p => p.loanId === loan.id);
      const loanInstallments = installments.filter(i => i.loanId === loan.id);
      
      regions.get(regionId)!.payments.push(...loanPayments);
      regions.get(regionId)!.installments.push(...loanInstallments);
    });
    
    return Array.from(regions.entries()).map(([regionId, data]) => {
      const totalLoans = data.loans.length;
      const totalPayments = data.payments.filter(p => p.status === 'approved').length;
      const totalDue = data.installments.filter(i => i.status !== 'paid').length;
      
      const collectionRate = totalDue > 0 ? (totalPayments / (totalPayments + totalDue)) * 100 : 100;
      const onTimePaymentRate = calculateOnTimePaymentRate(data.installments, data.payments);
      
      const averageTicketSize = data.loans.length > 0 
        ? data.loans.reduce((sum, l) => sum + l.amount, 0) / data.loans.length 
        : 0;
      
      const overdueAmount = data.installments
        .filter(i => i.status === 'overdue')
        .reduce((sum, i) => sum + i.principal + i.interest, 0);
      
      return {
        regionId,
        regionName: `Region ${regionId}`,
        totalLoans,
        totalPayments,
        collectionRate,
        onTimePaymentRate,
        averageTicketSize,
        overdueAmount,
        monthlyGrowth: 0, // Would be calculated with historical data
      };
    });
  };
  // Calculate agent performance metrics
  export const calculateAgentPerformance = (
    loans: Loan[],
    payments: Payment[],
    installments: Installment[]
  ): AgentPerformance[] => {
    const agents = new Map<string, {
      loans: Loan[];
      payments: Payment[];
      installments: Installment[];
    }>();
    
    // Group data by agent
    loans.forEach(loan => {
      const agentId = loan.agentId;
      if (!agents.has(agentId)) {
        agents.set(agentId, { loans: [], payments: [], installments: [] });
      }
      agents.get(agentId)!.loans.push(loan);
      
      const loanPayments = payments.filter(p => p.loanId === loan.id);
      const loanInstallments = installments.filter(i => i.loanId === loan.id);
      
      agents.get(agentId)!.payments.push(...loanPayments);
      agents.get(agentId)!.installments.push(...loanInstallments);
    });
    
    return Array.from(agents.entries()).map(([agentId, data]) => {
      const totalLoans = data.loans.length;
      const activeLoans = data.loans.filter(l => l.status === 'active').length;
      const completedLoans = data.loans.filter(l => l.status === 'completed').length;
      
      const collectionRate = calculateOnTimePaymentRate(data.installments, data.payments);
      const onTimePaymentRate = calculateOnTimePaymentRate(data.installments, data.payments);
      
      const totalCommission = data.loans.reduce((sum, l) => sum + (l.amount * 0.02), 0); // 2% commission
      const averageLoanSize = totalLoans > 0 
        ? data.loans.reduce((sum, l) => sum + l.amount, 0) / totalLoans 
        : 0;
      
      return {
        agentId,
        agentName: `Agent ${agentId}`,
        totalLoans,
        activeLoans,
        completedLoans,
        collectionRate,
        onTimePaymentRate,
        totalCommission,
        averageLoanSize,
        customerSatisfaction: 4.2 + Math.random() * 0.6, // Mock rating
      };
    });
  };
  // Calculate payment flow analytics
  export const calculatePaymentFlowAnalytics = (payments: Payment[]): PaymentFlowAnalytics => {
    const totalSubmitted = payments.length;
    const totalPending = payments.filter(p => p.status === 'pending').length;
    const totalApproved = payments.filter(p => p.status === 'approved').length;
    const totalRejected = payments.filter(p => p.status === 'rejected').length;
    
    const approvalRate = totalSubmitted > 0 ? (totalApproved / totalSubmitted) * 100 : 0;
    
    // Calculate average processing time
    const processedPayments = payments.filter(p => p.status !== 'pending' && p.updatedAt !== p.createdAt);
    const averageProcessingTime = processedPayments.length > 0
      ? processedPayments.reduce((sum, p) => {
          const created = new Date(p.createdAt);
          const updated = new Date(p.updatedAt);
          return sum + (updated.getTime() - created.getTime()) / (1000 * 60 * 60); // hours
        }, 0) / processedPayments.length
      : 0;
    
    // Calculate rejection reasons
    const rejectedPayments = payments.filter(p => p.status === 'rejected' && p.rejectionReason);
    const reasonCounts = new Map<string, number>();
    
    rejectedPayments.forEach(p => {
      const reason = p.rejectionReason || 'Unknown';
      reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1);
    });
    
    const rejectionReasons = Array.from(reasonCounts.entries()).map(([reason, count]) => ({
      reason,
      count,
      percentage: (count / totalRejected) * 100,
    })).sort((a, b) => b.count - a.count);
    
    return {
      totalSubmitted,
      totalPending,
      totalApproved,
      totalRejected,
      approvalRate,
      averageProcessingTime,
      rejectionReasons,
    };
  };
  // Calculate loan portfolio health
  export const calculateLoanPortfolioHealth = (
    loans: Loan[],
    payments: Payment[],
    installments: Installment[]
  ): LoanPortfolioHealth => {
    const totalPortfolioValue = loans.reduce((sum, l) => sum + l.amount, 0);
    const totalCollected = payments
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalOutstanding = installments
      .filter(i => i.status !== 'paid')
      .reduce((sum, i) => sum + i.principal + i.interest, 0);
    
    const collectionEfficiency = totalPortfolioValue > 0 
      ? (totalCollected / totalPortfolioValue) * 100 
      : 0;
    
    // Calculate NPA (Non-Performing Assets) - loans with overdue > 90 days
    const npaLoans = loans.filter(loan => {
      const loanInstallments = installments.filter(i => i.loanId === loan.id);
      return loanInstallments.some(i => 
        i.status === 'overdue' && getOverdueDays(i.dueDate) > 90
      );
    });
    
    const npaPercentage = loans.length > 0 ? (npaLoans.length / loans.length) * 100 : 0;
    
    const averageLoanTenure = loans.length > 0
      ? loans.reduce((sum, l) => sum + l.termMonths, 0) / loans.length
      : 0;
    
    // Risk distribution (simplified)
    const riskDistribution = [
      { riskLevel: 'Low Risk', amount: totalPortfolioValue * 0.6, count: Math.floor(loans.length * 0.6) },
      { riskLevel: 'Medium Risk', amount: totalPortfolioValue * 0.3, count: Math.floor(loans.length * 0.3) },
      { riskLevel: 'High Risk', amount: totalPortfolioValue * 0.1, count: Math.floor(loans.length * 0.1) },
    ];
    
    return {
      totalPortfolioValue,
      totalOutstanding,
      totalCollected,
      collectionEfficiency,
      npaPercentage,
      averageLoanTenure,
      portfolioGrowth: 15.5, // Mock value - would be calculated with historical data
      riskDistribution,
    };
  };
  // Generate comprehensive analytics report
  export const generateAnalyticsReport = (
    loans: Loan[],
    payments: Payment[],
    installments: Installment[]
  ) => {
    return {
      overview: {
        totalLoans: loans.length,
        totalPayments: payments.length,
        totalAmount: loans.reduce((sum, l) => sum + l.amount, 0),
        collectionRate: calculateOnTimePaymentRate(installments, payments),
      },
      paymentTrends: calculatePaymentTrends(payments, installments),
      regionalAnalytics: calculateRegionalAnalytics(loans, payments, installments),
      agentPerformance: calculateAgentPerformance(loans, payments, installments),
      paymentFlow: calculatePaymentFlowAnalytics(payments),
      portfolioHealth: calculateLoanPortfolioHealth(loans, payments, installments),
      generatedAt: new Date().toISOString(),
    };
  };
  // Calculate key performance indicators
  export const calculateKPIs = (
    loans: Loan[],
    payments: Payment[],
    installments: Installment[]
  ) => {
    const totalLoanAmount = loans.reduce((sum, l) => sum + l.amount, 0);
    const totalCollected = payments
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const onTimePayments = installments.filter(i => {
      if (i.status !== 'paid') return false;
      const payment = payments.find(p => p.installmentId === i.id);
      return payment && payment.paidDate && new Date(payment.paidDate) <= new Date(i.dueDate);
    }).length;
    
    const totalPaidInstallments = installments.filter(i => i.status === 'paid').length;
    const overdueInstallments = installments.filter(i => i.status === 'overdue').length;
    
    return {
      totalLoanAmount,
      totalCollected,
      collectionRate: totalLoanAmount > 0 ? (totalCollected / totalLoanAmount) * 100 : 0,
      onTimePaymentRate: totalPaidInstallments > 0 ? (onTimePayments / totalPaidInstallments) * 100 : 100,
      overdueRate: installments.length > 0 ? (overdueInstallments / installments.length) * 100 : 0,
      averageLoanSize: loans.length > 0 ? totalLoanAmount / loans.length : 0,
      portfolioGrowth: 12.5, // Mock value
      netInterestMargin: 15.8, // Mock value
    };
  };
  export default {
    calculatePaymentTrends,
    calculateRegionalAnalytics,
    calculateAgentPerformance,
    calculatePaymentFlowAnalytics,
    calculateLoanPortfolioHealth,
    generateAnalyticsReport,
    calculateKPIs,
  };