import { Payment, Installment, Loan, PaymentFormData } from '../types';
/**
 * Enhanced Payment Service
 * Provides advanced payment processing and schedule generation
 */
// Advanced EMI calculation with various scenarios
export const calculateAdvancedEMI = (
  principal: number,
  annualRate: number,
  termMonths: number,
  paymentFrequency: 'monthly' | 'quarterly' | 'half-yearly' = 'monthly'
): number => {
  const periodsPerYear = paymentFrequency === 'monthly' ? 12 : 
                        paymentFrequency === 'quarterly' ? 4 : 2;
  
  const periodRate = annualRate / 100 / periodsPerYear;
  const totalPeriods = termMonths / (12 / periodsPerYear);
  
  if (periodRate === 0) {
    return principal / totalPeriods;
  }
  
  const emi = principal * periodRate * Math.pow(1 + periodRate, totalPeriods) / 
              (Math.pow(1 + periodRate, totalPeriods) - 1);
  
  return Math.round(emi * 100) / 100;
};
// Generate comprehensive payment schedule
export const generatePaymentSchedule = (loan: Loan): Installment[] => {
  const { amount, interestRate, termMonths } = loan;
  const monthlyEMI = calculateAdvancedEMI(amount, interestRate, termMonths);
  
  let remainingPrincipal = amount;
  const installments: Installment[] = [];
  
  for (let i = 1; i <= termMonths; i++) {
    const interestComponent = (remainingPrincipal * interestRate / 100) / 12;
    const principalComponent = monthlyEMI - interestComponent;
    
    remainingPrincipal = Math.max(0, remainingPrincipal - principalComponent);
    
    // Calculate due date
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + i);
    dueDate.setDate(1); // Set to 1st of each month
    
    const installment: Installment = {
      id: `installment_${loan.id}_${i}`,
      loanId: loan.id,
      installmentNumber: i,
      dueDate: dueDate.toISOString(),
      principal: Math.round(principalComponent * 100) / 100,
      interest: Math.round(interestComponent * 100) / 100,
      remainingBalance: Math.round(remainingPrincipal * 100) / 100,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    installments.push(installment);
  }
  
  return installments;
};
// Calculate late fees based on days overdue
export const calculateLateFee = (
  originalAmount: number,
  daysOverdue: number,
  lateFeeRate: number = 2 // 2% per month default
): number => {
  if (daysOverdue <= 0) return 0;
  
  const monthsOverdue = daysOverdue / 30;
  const lateFee = originalAmount * (lateFeeRate / 100) * monthsOverdue;
  
  return Math.round(lateFee * 100) / 100;
};
// Check if payment is overdue
export const isPaymentOverdue = (dueDate: string): boolean => {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today
  
  return due < today;
};
// Get overdue days
export const getOverdueDays = (dueDate: string): number => {
  if (!isPaymentOverdue(dueDate)) return 0;
  
  const due = new Date(dueDate);
  const today = new Date();
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};
// Process overdue installments
export const processOverdueInstallments = (installments: Installment[]): Installment[] => {
  return installments.map(installment => {
    if (installment.status === 'pending' && isPaymentOverdue(installment.dueDate)) {
      return {
        ...installment,
        status: 'overdue' as const,
        updatedAt: new Date().toISOString(),
      };
    }
    return installment;
  });
};
// Calculate payment breakdown with late fees
export const calculatePaymentBreakdown = (installment: Installment) => {
  const isOverdue = installment.status === 'overdue' || 
                   (installment.status === 'pending' && isPaymentOverdue(installment.dueDate));
  
  const daysOverdue = isOverdue ? getOverdueDays(installment.dueDate) : 0;
  const lateFee = calculateLateFee(installment.principal + installment.interest, daysOverdue);
  
  return {
    principal: installment.principal,
    interest: installment.interest,
    lateFee,
    totalAmount: installment.principal + installment.interest + lateFee,
    daysOverdue,
    isOverdue,
  };
};
// Validate payment amount
export const validatePaymentAmount = (
  paymentAmount: number,
  installment: Installment,
  allowPartialPayment: boolean = false
): { isValid: boolean; message?: string; breakdown: any } => {
  const breakdown = calculatePaymentBreakdown(installment);
  
  if (paymentAmount <= 0) {
    return {
      isValid: false,
      message: 'Payment amount must be greater than zero',
      breakdown,
    };
  }
  
  if (!allowPartialPayment && paymentAmount < breakdown.totalAmount) {
    return {
      isValid: false,
      message: `Full payment of ${breakdown.totalAmount} is required`,
      breakdown,
    };
  }
  
  if (paymentAmount > breakdown.totalAmount * 1.1) { // Allow 10% overpayment
    return {
      isValid: false,
      message: 'Payment amount exceeds expected amount significantly',
      breakdown,
    };
  }
  
  return {
    isValid: true,
    breakdown,
  };
};
// Generate payment receipt data
export const generatePaymentReceiptData = (payment: Payment, installment: Installment) => {
  return {
    receiptNumber: `PAY-${payment.id.slice(-8).toUpperCase()}`,
    paymentDate: payment.paidDate || payment.createdAt,
    paymentMethod: payment.paymentMethod,
    loanId: payment.loanId,
    installmentNumber: installment.installmentNumber,
    breakdown: {
      principal: payment.principal,
      interest: payment.interest,
      lateFee: payment.lateFee,
      totalAmount: payment.amount,
    },
    remainingBalance: installment.remainingBalance,
    nextDueDate: getNextInstallmentDueDate(installment),
  };
};
// Get next installment due date
export const getNextInstallmentDueDate = (currentInstallment: Installment): string => {
  const currentDue = new Date(currentInstallment.dueDate);
  const nextDue = new Date(currentDue);
  nextDue.setMonth(nextDue.getMonth() + 1);
  
  return nextDue.toISOString();
};
// Calculate loan repayment summary
export const calculateLoanRepaymentSummary = (
  loan: Loan,
  installments: Installment[],
  payments: Payment[]
) => {
  const totalInstallments = installments.length;
  const paidInstallments = installments.filter(i => i.status === 'paid').length;
  const overdueInstallments = installments.filter(i => i.status === 'overdue').length;
  const pendingInstallments = totalInstallments - paidInstallments - overdueInstallments;
  
  const totalPaid = payments
    .filter(p => p.status === 'approved')
    .reduce((sum, p) => sum + p.amount, 0);
  
  const totalDue = installments
    .filter(i => i.status !== 'paid')
    .reduce((sum, i) => {
      const breakdown = calculatePaymentBreakdown(i);
      return sum + breakdown.totalAmount;
    }, 0);
  
  const progressPercentage = (paidInstallments / totalInstallments) * 100;
  
  return {
    totalInstallments,
    paidInstallments,
    overdueInstallments,
    pendingInstallments,
    totalPaid,
    totalDue,
    remainingBalance: loan.amount - totalPaid,
    progressPercentage: Math.round(progressPercentage * 100) / 100,
    onTimePaymentRate: calculateOnTimePaymentRate(installments, payments),
    nextDueDate: getNextDueInstallment(installments)?.dueDate,
    isFullyPaid: paidInstallments === totalInstallments,
  };
};
// Calculate on-time payment rate
export const calculateOnTimePaymentRate = (
  installments: Installment[],
  payments: Payment[]
): number => {
  const paidInstallments = installments.filter(i => i.status === 'paid');
  if (paidInstallments.length === 0) return 100;
  
  const onTimePayments = paidInstallments.filter(installment => {
    const payment = payments.find(p => p.installmentId === installment.id);
    if (!payment || !payment.paidDate) return false;
    
    const paidDate = new Date(payment.paidDate);
    const dueDate = new Date(installment.dueDate);
    
    return paidDate <= dueDate;
  });
  
  return Math.round((onTimePayments.length / paidInstallments.length) * 100);
};
// Get next due installment
export const getNextDueInstallment = (installments: Installment[]): Installment | null => {
  const unpaidInstallments = installments
    .filter(i => i.status === 'pending' || i.status === 'overdue')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  
  return unpaidInstallments.length > 0 ? unpaidInstallments[0] : null;
};
// Format payment reminder message
export const formatPaymentReminderMessage = (installment: Installment, daysUntilDue: number): string => {
  const breakdown = calculatePaymentBreakdown(installment);
  
  if (daysUntilDue < 0) {
    return `Your payment for installment #${installment.installmentNumber} is ${Math.abs(daysUntilDue)} days overdue. Please pay ${breakdown.totalAmount} immediately to avoid additional late fees.`;
  } else if (daysUntilDue === 0) {
    return `Your payment for installment #${installment.installmentNumber} is due today. Amount: ${breakdown.totalAmount}`;
  } else if (daysUntilDue <= 3) {
    return `Your payment for installment #${installment.installmentNumber} is due in ${daysUntilDue} days. Amount: ${breakdown.totalAmount}`;
  } else {
    return `Your next payment for installment #${installment.installmentNumber} is due on ${new Date(installment.dueDate).toLocaleDateString()}. Amount: ${breakdown.totalAmount}`;
  }
};
export default {
  calculateAdvancedEMI,
  generatePaymentSchedule,
  calculateLateFee,
  isPaymentOverdue,
  getOverdueDays,
  processOverdueInstallments,
  calculatePaymentBreakdown,
  validatePaymentAmount,
  generatePaymentReceiptData,
  calculateLoanRepaymentSummary,
  calculateOnTimePaymentRate,
  getNextDueInstallment,
  formatPaymentReminderMessage,
};