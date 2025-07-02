import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  AlertCircle,
  Download,
  Filter,
  Search,
  Calendar,
  DollarSign,
  User,
  CreditCard,
  Sparkles,
  MoreHorizontal,
  MessageSquare,
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

import { usePaymentStore } from '../../store/paymentStore';
import { useToast } from '../../hooks/use-toast';
import { formatCurrency, formatDate, getInitials } from '../../lib/utils';
import { Payment, PaymentApprovalData } from '../../types';
import { usePermissions } from '../../hooks/use-permissions';

interface PaymentApprovalProps {
  regionId?: string;
}

export const PaymentApproval: React.FC<PaymentApprovalProps> = ({ regionId }) => {
  const { toast } = useToast();
  const {
    payments,
    isLoading,
    fetchPayments,
    approvePayment,
    rejectPayment,
  } = usePaymentStore();
  const { canApprovePayments, canViewPaymentHistory, user } = usePermissions();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    fetchPayments({ status: 'pending', region: regionId });
  }, [fetchPayments, regionId]);

  const pendingPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.loanId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;
    
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const handleApproval = async (paymentId: string, action: 'approve' | 'reject') => {
    try {
      const approvalData: PaymentApprovalData = {
        paymentId,
        status: action === 'approve' ? 'approved' : 'rejected',
        rejectionReason: action === 'reject' ? rejectionReason : undefined,
      };

      if (action === 'approve') {
        await approvePayment(approvalData);
        toast({
          title: 'Payment approved',
          description: 'The payment has been successfully approved',
        });
      } else {
        await rejectPayment(approvalData);
        toast({
          title: 'Payment rejected',
          description: 'The payment has been rejected with reason provided',
        });
      }

      setShowApprovalModal(false);
      setSelectedPayment(null);
      setRejectionReason('');
      fetchPayments({ status: 'pending', region: regionId });
    } catch (error) {
      toast({
        title: 'Action failed',
        description: 'Failed to process payment approval',
        variant: 'destructive',
      });
    }
  };

  const openApprovalModal = (payment: Payment, action: 'approve' | 'reject') => {
    setSelectedPayment(payment);
    setApprovalAction(action);
    setShowApprovalModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'online': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'cash': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityLevel = (payment: Payment) => {
    const daysSinceSubmission = Math.floor(
      (new Date().getTime() - new Date(payment.createdAt).getTime()) / (1000 * 3600 * 24)
    );
    
    if (daysSinceSubmission > 7) return { level: 'high', color: 'text-red-400', label: 'High Priority' };
    if (daysSinceSubmission > 3) return { level: 'medium', color: 'text-yellow-400', label: 'Medium Priority' };
    return { level: 'low', color: 'text-green-400', label: 'Normal' };
  };

  const stats = {
    pending: payments.filter(p => p.status === 'pending').length,
    approved: payments.filter(p => p.status === 'approved').length,
    rejected: payments.filter(p => p.status === 'rejected').length,
    totalAmount: payments
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0),
  };

  // Permission check
  if (!canApprovePayments() && !canViewPaymentHistory()) {
    return (
      <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
        <CardContent className="p-8 text-center">
          <div className="glass-icon p-4 rounded-2xl bg-gradient-to-br from-red-500/20 to-orange-500/20 mx-auto mb-4 w-fit">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Access Restricted</h3>
          <p className="text-muted-foreground">
            You don't have permission to view or approve payments. Please contact your administrator.
          </p>
          <Badge variant="outline" className="mt-4 border-red-500/30 text-red-400">
            Role: {user?.role}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Pending Approvals</p>
                <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
              </div>
              <div className="glass-icon p-3 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Approved Today</p>
                <p className="text-2xl font-bold text-green-400">{stats.approved}</p>
              </div>
              <div className="glass-icon p-3 rounded-2xl bg-gradient-to-br from-green-500/20 to-blue-500/20">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Rejected Today</p>
                <p className="text-2xl font-bold text-red-400">{stats.rejected}</p>
              </div>
              <div className="glass-icon p-3 rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-500/20">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold text-blue-400">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="glass-icon p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                <DollarSign className="h-6 w-6 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="queue" className="space-y-6">
        <TabsList className="glass-nav bg-white/10 backdrop-blur-xl border border-white/20">
          <TabsTrigger value="queue" className="text-foreground data-[state=active]:bg-white/20">
            Approval Queue
          </TabsTrigger>
          <TabsTrigger value="history" className="text-foreground data-[state=active]:bg-white/20">
            Approval History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-6">
          {/* Filter Controls */}
          <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Payment Approval Queue
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Review and approve pending payment submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search payments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 glass-input bg-white/5 border-white/20"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] glass-input bg-white/5 border-white/20">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="glass-modal bg-white/10 backdrop-blur-xl border-white/20">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={methodFilter} onValueChange={setMethodFilter}>
                  <SelectTrigger className="w-[140px] glass-input bg-white/5 border-white/20">
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent className="glass-modal bg-white/10 backdrop-blur-xl border-white/20">
                    <SelectItem value="all">All Methods</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Payment Approval Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pendingPayments.map((payment) => {
              const priority = getPriorityLevel(payment);
              return (
                <Card key={payment.id} className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 ring-2 ring-white/20">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                            {getInitials(`User ${payment.id.slice(-2)}`)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-foreground">Payment #{payment.id.slice(-6)}</p>
                          <p className="text-xs text-muted-foreground">Loan: {payment.loanId}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={`${priority.color} bg-transparent text-xs`}>
                          {priority.label}
                        </Badge>
                        <Badge className={`${getStatusColor(payment.status)} border text-xs`}>
                          {payment.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Amount</p>
                        <p className="text-lg font-semibold text-foreground">{formatCurrency(payment.amount)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Method</p>
                        <Badge className={`${getMethodColor(payment.paymentMethod)} border text-xs`}>
                          {payment.paymentMethod}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Payment Date</p>
                        <p className="text-foreground">{formatDate(payment.paidDate || payment.dueDate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Submitted</p>
                        <p className="text-foreground">{formatDate(payment.createdAt)}</p>
                      </div>
                    </div>

                    {payment.paymentSlip && (
                      <div className="glass-card p-3 rounded-xl border border-white/20 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-blue-400" />
                            <span className="text-sm text-foreground">{payment.paymentSlip.name}</span>
                          </div>
                          <Button size="sm" variant="ghost" className="hover:bg-white/10">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}

                    <Separator className="border-white/10" />

                    <div className="flex items-center justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedPayment(payment)}
                        className="border-white/20 hover:bg-white/10"
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <div className="flex items-center space-x-2">
                        {canApprovePayments() ? (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openApprovalModal(payment, 'reject')}
                              className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openApprovalModal(payment, 'approve')}
                              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                          </>
                        ) : (
                          <Badge variant="outline" className="border-yellow-500/30 text-yellow-400">
                            View Only
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {pendingPayments.length === 0 && (
            <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
              <CardContent className="p-12">
                <div className="text-center space-y-4">
                  <div className="glass-icon p-4 rounded-2xl bg-gradient-to-br from-green-500/20 to-blue-500/20 mx-auto w-fit">
                    <CheckCircle className="h-8 w-8 text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">All caught up!</h3>
                    <p className="text-muted-foreground">No pending payments require approval at this time.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Recent Approvals Table */}
          <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Approval History</CardTitle>
              <CardDescription className="text-muted-foreground">
                View your recent payment approval decisions
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-foreground">Payment ID</TableHead>
                    <TableHead className="text-foreground">Amount</TableHead>
                    <TableHead className="text-foreground">Decision</TableHead>
                    <TableHead className="text-foreground">Date</TableHead>
                    <TableHead className="text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.filter(p => p.status !== 'pending').slice(0, 10).map((payment) => (
                    <TableRow key={payment.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-mono text-sm text-foreground">
                        {payment.id}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(payment.status)} border`}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {formatDate(payment.updatedAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedPayment(payment)}
                          className="hover:bg-white/10"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Approval Action Modal */}
      <Dialog open={showApprovalModal} onOpenChange={setShowApprovalModal}>
        <DialogContent className="glass-modal max-w-md border-white/20 bg-white/10 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-3">
              <div className={`glass-icon p-2 rounded-xl ${
                approvalAction === 'approve' 
                  ? 'bg-gradient-to-br from-green-500/20 to-blue-500/20' 
                  : 'bg-gradient-to-br from-red-500/20 to-pink-500/20'
              }`}>
                {approvalAction === 'approve' ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-400" />
                )}
              </div>
              {approvalAction === 'approve' ? 'Approve Payment' : 'Reject Payment'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="glass-card p-4 rounded-xl border border-white/20 bg-gradient-to-br from-white/5 to-white/10">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Payment ID:</span>
                    <span className="text-sm font-mono text-foreground">{selectedPayment.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <span className="text-sm font-semibold text-foreground">{formatCurrency(selectedPayment.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Loan ID:</span>
                    <span className="text-sm text-foreground">{selectedPayment.loanId}</span>
                  </div>
                </div>
              </div>

              {approvalAction === 'reject' && (
                <div className="space-y-2">
                  <Label htmlFor="rejectionReason" className="text-sm font-medium text-foreground">
                    Rejection Reason *
                  </Label>
                  <Textarea
                    id="rejectionReason"
                    placeholder="Please provide a reason for rejection..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="glass-input bg-white/5 border-white/20 focus:border-white/40 focus:bg-white/10"
                    rows={3}
                  />
                </div>
              )}

              <div className="flex items-center justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowApprovalModal(false)}
                  className="border-white/20 hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleApproval(selectedPayment.id, approvalAction)}
                  disabled={isLoading || (approvalAction === 'reject' && !rejectionReason.trim())}
                  className={
                    approvalAction === 'approve'
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
                      : 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white'
                  }
                >
                  {isLoading ? (
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                  ) : approvalAction === 'approve' ? (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  {approvalAction === 'approve' ? 'Approve Payment' : 'Reject Payment'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Payment Details Modal */}
      <Dialog open={!!selectedPayment && !showApprovalModal} onOpenChange={() => setSelectedPayment(null)}>
        <DialogContent className="glass-modal max-w-2xl border-white/20 bg-white/10 backdrop-blur-xl">
          {selectedPayment && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-3">
                  <div className="glass-icon p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <Eye className="h-5 w-5 text-blue-400" />
                  </div>
                  Payment Details
                </DialogTitle>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Information</p>
                    <div className="glass-card p-4 rounded-xl border border-white/20 bg-gradient-to-br from-white/5 to-white/10 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">ID:</span>
                        <span className="text-sm font-mono text-foreground">{selectedPayment.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Amount:</span>
                        <span className="text-sm font-semibold text-foreground">{formatCurrency(selectedPayment.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Principal:</span>
                        <span className="text-sm text-foreground">{formatCurrency(selectedPayment.principal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Interest:</span>
                        <span className="text-sm text-foreground">{formatCurrency(selectedPayment.interest)}</span>
                      </div>
                      {selectedPayment.lateFee > 0 && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Late Fee:</span>
                          <span className="text-sm text-red-400">{formatCurrency(selectedPayment.lateFee)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status & Timing</p>
                    <div className="glass-card p-4 rounded-xl border border-white/20 bg-gradient-to-br from-white/5 to-white/10 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge className={`${getStatusColor(selectedPayment.status)} border`}>
                          {selectedPayment.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Method:</span>
                        <Badge className={`${getMethodColor(selectedPayment.paymentMethod)} border`}>
                          {selectedPayment.paymentMethod}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Due Date:</span>
                        <span className="text-sm text-foreground">{formatDate(selectedPayment.dueDate)}</span>
                      </div>
                      {selectedPayment.paidDate && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Paid Date:</span>
                          <span className="text-sm text-foreground">{formatDate(selectedPayment.paidDate)}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Submitted:</span>
                        <span className="text-sm text-foreground">{formatDate(selectedPayment.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {selectedPayment.paymentSlip && (
                <div className="glass-card p-4 rounded-xl border border-white/20 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="glass-icon p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                        <FileText className="h-4 w-4 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Payment Receipt</p>
                        <p className="text-xs text-muted-foreground">{selectedPayment.paymentSlip.name}</p>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" className="border-white/20 hover:bg-white/10">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {selectedPayment.rejectionReason && (
                <div className="glass-card p-4 rounded-xl border border-red-500/20 bg-red-500/10">
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="h-5 w-5 text-red-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-red-400">Rejection Reason</p>
                      <p className="text-sm text-foreground mt-1">{selectedPayment.rejectionReason}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
