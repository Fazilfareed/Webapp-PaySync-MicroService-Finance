import { Notification, Payment, Installment, User } from '../types';
import { formatPaymentReminderMessage, getOverdueDays, isPaymentOverdue } from './paymentService';
import { formatCurrency, formatDate } from '../lib/utils';
/**
 * Notification Service
 * Handles automated notifications for payment events
 */
export type NotificationType = 
  | 'payment_reminder'
  | 'payment_overdue'
  | 'payment_received'
  | 'payment_approved'
  | 'payment_rejected'
  | 'loan_approved'
  | 'installment_due'
  | 'late_fee_applied';
export interface NotificationTemplate {
  type: NotificationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  recipients: string[]; // User IDs
  channels: ('email' | 'sms' | 'push' | 'in-app')[];
}
// Notification templates
const NOTIFICATION_TEMPLATES: Record<NotificationType, Omit<NotificationTemplate, 'recipients'>> = {
  payment_reminder: {
    type: 'payment_reminder',
    title: 'Payment Reminder',
    message: 'You have an upcoming payment due.',
    priority: 'medium',
    channels: ['email', 'sms', 'in-app'],
  },
  payment_overdue: {
    type: 'payment_overdue',
    title: 'Payment Overdue',
    message: 'Your payment is overdue. Please pay immediately.',
    priority: 'urgent',
    channels: ['email', 'sms', 'push', 'in-app'],
  },
  payment_received: {
    type: 'payment_received',
    title: 'Payment Received',
    message: 'Your payment has been received and is being processed.',
    priority: 'medium',
    channels: ['email', 'in-app'],
  },
  payment_approved: {
    type: 'payment_approved',
    title: 'Payment Approved',
    message: 'Your payment has been approved and processed.',
    priority: 'medium',
    channels: ['email', 'sms', 'in-app'],
  },
  payment_rejected: {
    type: 'payment_rejected',
    title: 'Payment Rejected',
    message: 'Your payment has been rejected. Please contact support.',
    priority: 'high',
    channels: ['email', 'sms', 'in-app'],
  },
  loan_approved: {
    type: 'loan_approved',
    title: 'Loan Approved',
    message: 'Your loan application has been approved.',
    priority: 'high',
    channels: ['email', 'sms', 'in-app'],
  },
  installment_due: {
    type: 'installment_due',
    title: 'Installment Due',
    message: 'Your loan installment is due soon.',
    priority: 'medium',
    channels: ['email', 'sms', 'in-app'],
  },
  late_fee_applied: {
    type: 'late_fee_applied',
    title: 'Late Fee Applied',
    message: 'A late fee has been applied to your overdue payment.',
    priority: 'high',
    channels: ['email', 'sms', 'in-app'],
  },
};
// Create payment reminder notification
export const createPaymentReminderNotification = (
  installment: Installment,
  borrowerUserId: string,
  daysUntilDue: number
): NotificationTemplate => {
  const template = NOTIFICATION_TEMPLATES.payment_reminder;
  const reminderMessage = formatPaymentReminderMessage(installment, daysUntilDue);
  
  return {
    ...template,
    title: daysUntilDue <= 0 ? 'Payment Overdue' : 'Payment Reminder',
    message: reminderMessage,
    priority: daysUntilDue <= 0 ? 'urgent' : daysUntilDue <= 1 ? 'high' : 'medium',
    recipients: [borrowerUserId],
  };
};
// Create payment status notification
export const createPaymentStatusNotification = (
  payment: Payment,
  status: 'received' | 'approved' | 'rejected',
  borrowerUserId: string,
  rejectionReason?: string
): NotificationTemplate => {
  const typeMap = {
    received: 'payment_received',
    approved: 'payment_approved',
    rejected: 'payment_rejected',
  } as const;
  
  const template = NOTIFICATION_TEMPLATES[typeMap[status]];
  
  let customMessage = template.message;
  if (status === 'approved') {
    customMessage = `Your payment of ${formatCurrency(payment.amount)} for installment #${payment.installmentId.split('_').pop()} has been approved and processed successfully.`;
  } else if (status === 'rejected' && rejectionReason) {
    customMessage = `Your payment of ${formatCurrency(payment.amount)} has been rejected. Reason: ${rejectionReason}. Please contact support for assistance.`;
  } else if (status === 'received') {
    customMessage = `Your payment of ${formatCurrency(payment.amount)} has been received and is pending approval.`;
  }
  
  return {
    ...template,
    message: customMessage,
    recipients: [borrowerUserId],
  };
};
// Create loan approval notification
export const createLoanApprovalNotification = (
  loanId: string,
  amount: number,
  borrowerUserId: string,
  monthlyPayment: number,
  termMonths: number
): NotificationTemplate => {
  const template = NOTIFICATION_TEMPLATES.loan_approved;
  
  const customMessage = `Congratulations! Your loan application for ${formatCurrency(amount)} has been approved. Your monthly payment will be ${formatCurrency(monthlyPayment)} for ${termMonths} months.`;
  
  return {
    ...template,
    message: customMessage,
    recipients: [borrowerUserId],
  };
};
// Create installment due notification
export const createInstallmentDueNotification = (
  installment: Installment,
  borrowerUserId: string
): NotificationTemplate => {
  const template = NOTIFICATION_TEMPLATES.installment_due;
  const dueDate = new Date(installment.dueDate);
  const amount = installment.principal + installment.interest;
  
  const customMessage = `Your installment #${installment.installmentNumber} of ${formatCurrency(amount)} is due on ${formatDate(installment.dueDate)}.`;
  
  return {
    ...template,
    message: customMessage,
    recipients: [borrowerUserId],
  };
};
// Create late fee notification
export const createLateFeeNotification = (
  installment: Installment,
  lateFeeAmount: number,
  borrowerUserId: string
): NotificationTemplate => {
  const template = NOTIFICATION_TEMPLATES.late_fee_applied;
  const overdueDays = getOverdueDays(installment.dueDate);
  
  const customMessage = `A late fee of ${formatCurrency(lateFeeAmount)} has been applied to your overdue payment (${overdueDays} days overdue). Please pay immediately to avoid additional charges.`;
  
  return {
    ...template,
    message: customMessage,
    recipients: [borrowerUserId],
  };
};
// Schedule payment reminders
export const schedulePaymentReminders = (installments: Installment[]): NotificationTemplate[] => {
  const notifications: NotificationTemplate[] = [];
  const today = new Date();
  
  installments.forEach(installment => {
    if (installment.status === 'paid') return;
    
    const dueDate = new Date(installment.dueDate);
    const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Send reminders at different intervals
    const reminderDays = [7, 3, 1, 0, -1, -3, -7]; // Days before/after due date
    
    if (reminderDays.includes(daysUntilDue)) {
      const notification = createPaymentReminderNotification(
        installment,
        'borrower_user_id', // This would be dynamic
        daysUntilDue
      );
      notifications.push(notification);
    }
  });
  
  return notifications;
};
// Notification delivery simulation
export const deliverNotification = async (
  notification: NotificationTemplate,
  channel: 'email' | 'sms' | 'push' | 'in-app'
): Promise<boolean> => {
  // Simulate API call to notification service
  console.log(`Delivering ${channel} notification:`, {
    type: notification.type,
    title: notification.title,
    message: notification.message,
    recipients: notification.recipients,
    priority: notification.priority,
  });
  
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
  
  // Simulate 95% success rate
  return Math.random() > 0.05;
};
// Send notification through all channels
export const sendNotification = async (notification: NotificationTemplate): Promise<{
  success: boolean;
  deliveryResults: Record<string, boolean>;
}> => {
  const deliveryResults: Record<string, boolean> = {};
  
  for (const channel of notification.channels) {
    try {
      deliveryResults[channel] = await deliverNotification(notification, channel);
    } catch (error) {
      console.error(`Failed to deliver ${channel} notification:`, error);
      deliveryResults[channel] = false;
    }
  }
  
  const success = Object.values(deliveryResults).some(result => result);
  
  return {
    success,
    deliveryResults,
  };
};
// Create notification record for database
export const createNotificationRecord = (
  notification: NotificationTemplate,
  userId: string
): Notification => {
  return {
    id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    title: notification.title,
    message: notification.message,
    type: notification.priority === 'urgent' ? 'error' : 
           notification.priority === 'high' ? 'warning' : 'info',
    isRead: false,
    createdAt: new Date().toISOString(),
  };
};
// Batch send notifications
export const batchSendNotifications = async (
  notifications: NotificationTemplate[]
): Promise<{
  totalSent: number;
  successCount: number;
  failureCount: number;
  results: Array<{ notification: NotificationTemplate; success: boolean; deliveryResults: Record<string, boolean> }>;
}> => {
  const results = [];
  let successCount = 0;
  let failureCount = 0;
  
  for (const notification of notifications) {
    try {
      const result = await sendNotification(notification);
      results.push({ notification, ...result });
      
      if (result.success) {
        successCount++;
      } else {
        failureCount++;
      }
    } catch (error) {
      console.error('Failed to send notification:', error);
      results.push({
        notification,
        success: false,
        deliveryResults: {},
      });
      failureCount++;
    }
  }
  
  return {
    totalSent: notifications.length,
    successCount,
    failureCount,
    results,
  };
};
// Get notification preferences for user
export const getNotificationPreferences = (userId: string) => {
  // This would typically come from user settings
  return {
    email: true,
    sms: true,
    push: true,
    inApp: true,
    paymentReminders: true,
    loanUpdates: true,
    marketingEmails: false,
  };
};
// Filter notifications based on user preferences
export const filterNotificationsByPreferences = (
  notifications: NotificationTemplate[],
  userId: string
): NotificationTemplate[] => {
  const preferences = getNotificationPreferences(userId);
  
  return notifications.map(notification => ({
    ...notification,
    channels: notification.channels.filter(channel => {
      switch (channel) {
        case 'email': return preferences.email;
        case 'sms': return preferences.sms;
        case 'push': return preferences.push;
        case 'in-app': return preferences.inApp;
        default: return true;
      }
    }),
  })).filter(notification => notification.channels.length > 0);
};
export default {
  createPaymentReminderNotification,
  createPaymentStatusNotification,
  createLoanApprovalNotification,
  createInstallmentDueNotification,
  createLateFeeNotification,
  schedulePaymentReminders,
  sendNotification,
  batchSendNotifications,
  createNotificationRecord,
  getNotificationPreferences,
  filterNotificationsByPreferences,
};