import React, { useEffect, useState } from 'react';
import {
  AlertTriangle,
  Clock,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  MessageSquare,
  FileText,
  CheckCircle,
  XCircle,
  CreditCard,
  User,
  MapPin,
  AlertCircle,
  Zap,
  MoreHorizontal,
  Eye,
  Download,
  Send,
  Bell,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Progress } from '../ui/progress';
import { usePaymentStore } from '../../store/paymentStore';
import { useLoanStore } from '../../store/loanStore';
import { useToast } from '../../hooks/use-toast';
import { formatCurrency, formatDate, getInitials } from '../../lib/utils';
import { Payment, Installment, Loan } from '../../types';
import paymentService from '../../services/paymentService';
import notificationService from '../../services/notificationService';
import { usePermissions } from '../../hooks/use-permissions';
interface OverduePaymentManagerProps {
  regionId?: string;
  agentId?: string;
}
interface OverdueItem {
  installment: Installment;
  loan: Loan;
  borrowerName: string;
  agentName: string;
  daysOverdue: number;
  originalAmount: number;
  lateFee: number;
  totalAmount: number;
  contactInfo: {
    phone: string;
    email: string;
    address: string;
  };
  lastContactDate?: string;
  remindersSent: number;
}
export const OverduePaymentManager: React.FC<OverduePaymentManagerProps> = ({
  regionId,
  agentId,
}) => {
  const { toast } = useToast();
  const { payments, fetchPayments } = usePaymentStore();
  const { loans, fetchLoans } = useLoanStore();
  const { canHandleOverduePayments, canViewPaymentHistory } = usePermissions();
  const [overdueItems, setOverdueItems] = useState<OverdueItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedOverdue, setSelectedOverdue] = useState<OverdueItem | null>(null);
  const [actionType, setActionType] = useState<'contact' | 'reminder' | 'payment_plan' | null>(null);
  const [contactMessage, setContactMessage] = useState('');
  const [paymentPlanAmount, setPaymentPlanAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  useEffect(() => {
    fetchPayments();
    fetchLoans();
  }, [fetchPayments, fetchLoans]);
  useEffect(() => {
    if (loans.length > 0) {
      generateOverdueItems();
    }
  }, [loans, payments]);
  const generateOverdueItems = () => {
    const overdueList: OverdueItem[] = [];
    loans.forEach(loan => {
      // Generate installments for this loan
      const installments = paymentService.generatePaymentSchedule(loan);
      const processedInstallments = paymentService.processOverdueInstallments(installments);
      processedInstallments.forEach(installment => {
        if (installment.status === 'overdue') {
          const daysOverdue = paymentService.getOverdueDays(installment.dueDate);
          const breakdown = paymentService.calculatePaymentBreakdown(installment);
          overdueList.push({
            installment,
            loan,
            borrowerName: `Borrower ${loan.borrowerId}`,
            agentName: `Agent ${loan.agentId}`,
            daysOverdue,
            originalAmount: installment.principal + installment.interest,
            lateFee: breakdown.lateFee,
            totalAmount: breakdown.totalAmount,
            contactInfo: {
              phone: '+94 77 123 4567', // Mock data
              email: 'borrower@email.com',
              address: 'Colombo, Sri Lanka',
            },
            lastContactDate: undefined,
            remindersSent: Math.floor(Math.random() * 3),
          });
        }
      });
    });
    setOverdueItems(overdueList.sort((a, b) => b.daysOverdue - a.daysOverdue));
  };
  const getDaysOverdueColor = (days: number) => {
    if (days <= 7) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    if (days <= 30) return 'text-orange-400 bg-orange-500/20 border-orange-500/30';
    if (days <= 90) return 'text-red-400 bg-red-500/20 border-red-500/30';
    return 'text-red-500 bg-red-600/20 border-red-600/30';
  };
  const getPriorityLevel = (days: number) => {
    if (days <= 7) return { level: 'Medium', color: 'text-yellow-400' };
    if (days <= 30) return { level: 'High', color: 'text-orange-400' };
    if (days <= 90) return { level: 'Critical', color: 'text-red-400' };
    return { level: 'Urgent', color: 'text-red-500' };
  };
  const handleSendReminder = async (overdueItem: OverdueItem) => {
    setIsProcessing(true);
    try {
      // Create reminder notification
      const notification = notificationService.createPaymentReminderNotification(
        overdueItem.installment,
        overdueItem.loan.borrowerId,
        -overdueItem.daysOverdue
      );
      // Send notification
      await notificationService.sendNotification(notification);
      toast({
        title: 'Reminder sent',
        description: `Payment reminder sent to ${overdueItem.borrowerName}`,
      });
      // Update reminder count
      setOverdueItems(prev => prev.map(item => 
        item.installment.id === overdueItem.installment.id 
          ? { ...item, remindersSent: item.remindersSent + 1, lastContactDate: new Date().toISOString() }
          : item
      ));
    } catch (error) {
      toast({
        title: 'Failed to send reminder',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const handleBulkReminders = async () => {
    setIsProcessing(true);
    try {
      const selectedOverdueItems = overdueItems.filter(item => 
        selectedItems.includes(item.installment.id)
      );
      const notifications = selectedOverdueItems.map(item =>
        notificationService.createPaymentReminderNotification(
          item.installment,
          item.loan.borrowerId,
          -item.daysOverdue
        )
      );
      const result = await notificationService.batchSendNotifications(notifications);
      toast({
        title: 'Bulk reminders sent',
        description: `${result.successCount} reminders sent successfully`,
      });
      setSelectedItems([]);
      generateOverdueItems(); // Refresh data
    } catch (error) {
      toast({
        title: 'Failed to send bulk reminders',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const handleContactBorrower = async () => {
    if (!selectedOverdue || !contactMessage.trim()) return;
    setIsProcessing(true);
    try {
      // Simulate contact action
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Contact logged',
        description: `Contact attempt recorded for ${selectedOverdue.borrowerName}`,
      });
      // Update last contact date
      setOverdueItems(prev => prev.map(item => 
        item.installment.id === selectedOverdue.installment.id 
          ? { ...item, lastContactDate: new Date().toISOString() }
          : item
      ));
      setActionType(null);
      setContactMessage('');
    } catch (error) {
      toast({
        title: 'Failed to log contact',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const handleCreatePaymentPlan = async () => {
    if (!selectedOverdue || !paymentPlanAmount) return;
    setIsProcessing(true);
    try {
      // Simulate creating payment plan
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast({
        title: 'Payment plan created',
        description: `Payment plan of ${formatCurrency(paymentPlanAmount)} created for ${selectedOverdue.borrowerName}`,
      });
      setActionType(null);
      setPaymentPlanAmount(0);
    } catch (error) {
      toast({
        title: 'Failed to create payment plan',
        description: 'Please try again later',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };
  const OverdueCard = ({ overdueItem }: { overdueItem: OverdueItem }) => {
    const priority = getPriorityLevel(overdueItem.daysOverdue);
    
    return (
      <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10 ring-2 ring-white/20">
                <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-600 text-white">
                  {getInitials(overdueItem.borrowerName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium text-foreground">{overdueItem.borrowerName}</p>
                <p className="text-xs text-muted-foreground">Loan: {overdueItem.loan.id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={`${priority.color} bg-transparent text-xs`}>
                {priority.level}
              </Badge>
              <Badge className={`${getDaysOverdueColor(overdueItem.daysOverdue)} border text-xs`}>
                {overdueItem.daysOverdue} days overdue
              </Badge>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-muted-foreground">Original Amount</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(overdueItem.originalAmount)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Late Fee</p>
              <p className="text-lg font-semibold text-red-400">
                {formatCurrency(overdueItem.lateFee)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Due</p>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(overdueItem.totalAmount)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Reminders Sent</p>
              <p className="text-foreground">{overdueItem.remindersSent}</p>
            </div>
          </div>
          {overdueItem.lastContactDate && (
            <div className="mb-4 p-3 glass-card rounded-xl border border-blue-500/20 bg-blue-500/10">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-blue-400">
                  Last contact: {formatDate(overdueItem.lastContactDate)}
                </span>
              </div>
            </div>
          )}
          <Separator className="border-white/10 mb-4" />
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{overdueItem.contactInfo.phone}</span>
              <Mail className="h-3 w-3 ml-2" />
              <span>{overdueItem.contactInfo.email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedOverdue(overdueItem);
                  setActionType('contact');
                }}
                className="border-white/20 hover:bg-white/10"
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Contact
              </Button>
              <Button
                size="sm"
                onClick={() => handleSendReminder(overdueItem)}
                disabled={isProcessing}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                <Send className="h-4 w-4 mr-1" />
                Remind
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  const stats = {
    totalOverdue: overdueItems.length,
    totalAmount: overdueItems.reduce((sum, item) => sum + item.totalAmount, 0),
    criticalCases: overdueItems.filter(item => item.daysOverdue > 30).length,
    avgDaysOverdue: overdueItems.length > 0 
      ? Math.round(overdueItems.reduce((sum, item) => sum + item.daysOverdue, 0) / overdueItems.length)
      : 0,
  };
  // Permission check
  if (!canHandleOverduePayments() && !canViewPaymentHistory()) {
    return (
      <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">
            You don't have permission to manage overdue payments.
          </p>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            Overdue Payment Manager
          </h1>
          <p className="text-muted-foreground">Manage and follow up on overdue payments</p>
        </div>
        <div className="flex items-center space-x-3">
          {selectedItems.length > 0 && (
            <Button
              onClick={handleBulkReminders}
              disabled={isProcessing}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              <Bell className="h-4 w-4 mr-2" />
              Send Bulk Reminders ({selectedItems.length})
            </Button>
          )}
          <Button variant="outline" className="border-white/20 hover:bg-white/10">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Overdue</p>
                <p className="text-2xl font-bold text-red-400">{stats.totalOverdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Critical Cases</p>
                <p className="text-2xl font-bold text-red-500">{stats.criticalCases}</p>
                <p className="text-xs text-muted-foreground">30+ days overdue</p>
              </div>
              <Zap className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Avg Days Overdue</p>
                <p className="text-2xl font-bold text-foreground">{stats.avgDaysOverdue}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Overdue Items */}
      <Tabs defaultValue="cards" className="space-y-6">
        <TabsList className="glass-nav bg-white/10 backdrop-blur-xl border border-white/20">
          <TabsTrigger value="cards" className="text-foreground data-[state=active]:bg-white/20">
            Card View
          </TabsTrigger>
          <TabsTrigger value="table" className="text-foreground data-[state=active]:bg-white/20">
            Table View
          </TabsTrigger>
        </TabsList>
        <TabsContent value="cards" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {overdueItems.map((item) => (
              <OverdueCard key={item.installment.id} overdueItem={item} />
            ))}
          </div>
          {overdueItems.length === 0 && (
            <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
              <CardContent className="p-12">
                <div className="text-center space-y-4">
                  <CheckCircle className="h-16 w-16 mx-auto text-green-400" />
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">All Caught Up!</h3>
                    <p className="text-muted-foreground">
                      No overdue payments found. Great job on collections!
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        <TabsContent value="table" className="space-y-6">
          <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-foreground">Borrower</TableHead>
                    <TableHead className="text-foreground">Loan ID</TableHead>
                    <TableHead className="text-foreground">Days Overdue</TableHead>
                    <TableHead className="text-foreground">Original Amount</TableHead>
                    <TableHead className="text-foreground">Late Fee</TableHead>
                    <TableHead className="text-foreground">Total Due</TableHead>
                    <TableHead className="text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {overdueItems.map((item) => (
                    <TableRow key={item.installment.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="text-foreground">{item.borrowerName}</TableCell>
                      <TableCell className="text-foreground">{item.loan.id}</TableCell>
                      <TableCell>
                        <Badge className={`${getDaysOverdueColor(item.daysOverdue)} border`}>
                          {item.daysOverdue} days
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {formatCurrency(item.originalAmount)}
                      </TableCell>
                      <TableCell className="text-red-400">
                        {formatCurrency(item.lateFee)}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {formatCurrency(item.totalAmount)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-white/10">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="glass-modal bg-white/10 backdrop-blur-xl border-white/20">
                            <DropdownMenuItem onClick={() => handleSendReminder(item)}>
                              <Send className="h-4 w-4 mr-2" />
                              Send Reminder
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedOverdue(item);
                              setActionType('contact');
                            }}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Contact Borrower
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              setSelectedOverdue(item);
                              setActionType('payment_plan');
                            }}>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Create Payment Plan
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Action Modals */}
      <Dialog open={!!actionType} onOpenChange={() => setActionType(null)}>
        <DialogContent className="glass-modal max-w-md border-white/20 bg-white/10 backdrop-blur-xl">
          {actionType === 'contact' && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-foreground">Contact Borrower</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Log contact attempt with {selectedOverdue?.borrowerName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="message" className="text-foreground">Contact Message</Label>
                  <Textarea
                    id="message"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Enter details about the contact attempt..."
                    className="glass-input bg-white/5 border-white/20"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setActionType(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleContactBorrower} disabled={isProcessing}>
                    Log Contact
                  </Button>
                </div>
              </div>
            </div>
          )}
          {actionType === 'payment_plan' && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-foreground">Create Payment Plan</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Set up a payment plan for {selectedOverdue?.borrowerName}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount" className="text-foreground">Monthly Payment Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={paymentPlanAmount}
                    onChange={(e) => setPaymentPlanAmount(Number(e.target.value))}
                    placeholder="Enter monthly payment amount"
                    className="glass-input bg-white/5 border-white/20"
                  />
                </div>
                <div className="glass-card p-4 rounded-xl border border-blue-500/20 bg-blue-500/10">
                  <p className="text-sm text-blue-400">
                    Total due: {formatCurrency(selectedOverdue?.totalAmount || 0)}
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setActionType(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreatePaymentPlan} disabled={isProcessing}>
                    Create Plan
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default OverduePaymentManager;