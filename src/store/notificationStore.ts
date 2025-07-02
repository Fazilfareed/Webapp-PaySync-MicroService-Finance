import { create } from 'zustand';
import { Notification } from '../types';

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  removeNotification: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

// Mock data generator
const generateMockNotifications = (): Notification[] => {
  const types: Array<'info' | 'success' | 'warning' | 'error'> = ['info', 'success', 'warning', 'error'];
  const titles = [
    'New Borrower Registration',
    'Loan Application Approved',
    'Payment Received',
    'Document Upload Required',
    'System Maintenance',
    'Commission Payment',
    'Regional Admin Assignment',
    'Monthly Report Available'
  ];

  const messages = [
    'A new borrower has been registered and requires approval.',
    'Loan application #LA123 has been approved by Regional Admin.',
    'Payment of LKR 25,000 received for loan #L456.',
    'Please upload required documents for borrower verification.',
    'System maintenance scheduled for tonight 2:00 AM - 4:00 AM.',
    'Your commission of LKR 15,000 has been processed.',
    'You have been assigned as Regional Admin for Colombo district.',
    'Monthly performance report for November is now available.'
  ];

  return Array.from({ length: 15 }, (_, i) => ({
    id: `notification_${i}`,
    userId: 'current_user_id',
    title: titles[Math.floor(Math.random() * titles.length)],
    message: messages[Math.floor(Math.random() * messages.length)],
    type: types[Math.floor(Math.random() * types.length)],
    isRead: Math.random() > 0.6,
    createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    actionUrl: Math.random() > 0.5 ? `/dashboard/action-${i}` : undefined,
  }));
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      const notifications = generateMockNotifications();
      const unreadCount = notifications.filter(n => !n.isRead).length;
      
      set({ 
        notifications: notifications.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ),
        unreadCount,
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to fetch notifications', isLoading: false });
    }
  },

  markAsRead: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const currentNotifications = get().notifications;
      const updatedNotifications = currentNotifications.map(notification =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      );
      
      const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
      
      set({ 
        notifications: updatedNotifications,
        unreadCount,
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to mark notification as read', isLoading: false });
    }
  },

  markAllAsRead: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const currentNotifications = get().notifications;
      const updatedNotifications = currentNotifications.map(notification => ({
        ...notification,
        isRead: true
      }));
      
      set({ 
        notifications: updatedNotifications,
        unreadCount: 0,
        isLoading: false 
      });
    } catch (error) {
      set({ error: 'Failed to mark all notifications as read', isLoading: false });
    }
  },

  addNotification: (notificationData) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notification_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    const currentNotifications = get().notifications;
    const updatedNotifications = [newNotification, ...currentNotifications];
    const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
    
    set({ 
      notifications: updatedNotifications,
      unreadCount 
    });
  },

  removeNotification: (id) => {
    const currentNotifications = get().notifications;
    const updatedNotifications = currentNotifications.filter(n => n.id !== id);
    const unreadCount = updatedNotifications.filter(n => !n.isRead).length;
    
    set({ 
      notifications: updatedNotifications,
      unreadCount 
    });
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
}));
