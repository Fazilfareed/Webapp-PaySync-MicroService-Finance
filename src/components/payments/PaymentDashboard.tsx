import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  Filter,
  Search,
  Download,
  Eye,
  MoreHorizontal,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

import { usePaymentStore } from '../../store/paymentStore';
import { PaymentUpload } from './PaymentUpload';
import { formatCurrency, formatDate, formatNumber } from '../../lib/utils';
import { Payment, PaymentSummary } from '../../types';

interface PaymentDashboardProps {
  userRole?: 'agent' | 'regional_admin' | 'borrower';
  loanId?: string;
}

export const PaymentDashboard: React.FC<PaymentDashboardProps> = ({
  userRole = 'agent',
  loanId,
}) => {
  const {
    payments,
    paymentSummaries,
    analytics,
    isLoading,
    fetchPayments,
    fetchPaymentAnalytics,
    fetchPaymentSummaries,
  } = usePaymentStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchPayments();
    fetchPaymentAnalytics();
    fetchPaymentSummaries();
  }, [fetchPayments, fetchPaymentAnalytics, fetchPaymentSummaries]);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.loanId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;
    const matchesLoan = !loanId || payment.loanId === loanId;
    
    return matchesSearch && matchesStatus && matchesMethod && matchesLoan;
  });

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

  const StatCard = ({ title, value, change, icon: Icon, trend }: any) => (
    <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {change && (
              <div className={`flex items-center space-x-1 text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {trend === 'up' ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                <span>{change}</span>
              </div>
            )}
          </div>
          <div className="glass-icon p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <Icon className="h-6 w-6 text-blue-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Payments"
            value={formatCurrency(analytics.totalPaymentsReceived)}
            change="+12.5%"
            icon={DollarSign}
            trend="up"
          />
          <StatCard
            title="On-Time Rate"
            value={`${analytics.onTimePaymentRate}%`}
            change="+3.2%"
            icon={CheckCircle}
            trend="up"
          />
          <StatCard
            title="Pending Approvals"
            value={formatNumber(analytics.pendingApprovals)}
            change="-8"
            icon={Clock}
            trend="down"
          />
          <StatCard
            title="Overdue Payments"
            value={formatNumber(analytics.overduePayments)}
            change="-2"
            icon={AlertTriangle}
            trend="down"
          />
        </div>
      )}

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList className="glass-nav bg-white/10 backdrop-blur-xl border border-white/20">
          <TabsTrigger value="payments" className="text-foreground data-[state=active]:bg-white/20">
            Payment History
          </TabsTrigger>
          <TabsTrigger value="schedule" className="text-foreground data-[state=active]:bg-white/20">
            Payment Schedule
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-foreground data-[state=active]:bg-white/20">
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-6">
          {/* Payment Controls */}
          <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Payment Management</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Track and manage all payment transactions
                  </CardDescription>
                </div>
                {(userRole === 'agent' || userRole === 'borrower') && (
                  <Button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Upload Payment
                  </Button>
                )}
              </div>
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
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
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
                <Button variant="outline" className="border-white/20 hover:bg-white/10">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Table */}
          <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-foreground">Payment ID</TableHead>
                    <TableHead className="text-foreground">Loan ID</TableHead>
                    <TableHead className="text-foreground">Amount</TableHead>
                    <TableHead className="text-foreground">Date</TableHead>
                    <TableHead className="text-foreground">Method</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-mono text-sm text-foreground">
                        {payment.id}
                      </TableCell>
                      <TableCell className="text-foreground">{payment.loanId}</TableCell>
                      <TableCell className="text-foreground">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {formatDate(payment.paidDate || payment.dueDate)}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getMethodColor(payment.paymentMethod)} border`}>
                          {payment.paymentMethod}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(payment.status)} border`}>
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:bg-white/10">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="glass-modal bg-white/10 backdrop-blur-xl border-white/20">
                            <DropdownMenuItem onClick={() => setSelectedPayment(payment)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
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

        <TabsContent value="schedule" className="space-y-6">
          {/* Payment Schedule Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {paymentSummaries.map((summary) => (
              <Card key={summary.loanId} className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm text-foreground">{summary.borrowerName}</CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        Loan: {summary.loanId}
                      </CardDescription>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {summary.paidInstallments}/{summary.totalInstallments}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="text-foreground">
                        {Math.round((summary.paidInstallments / summary.totalInstallments) * 100)}%
                      </span>
                    </div>
                    <Progress value={(summary.paidInstallments / summary.totalInstallments) * 100} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Paid</p>
                      <p className="text-green-400 font-medium">{formatCurrency(summary.totalPaid)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Remaining</p>
                      <p className="text-foreground font-medium">{formatCurrency(summary.totalRemaining)}</p>
                    </div>
                  </div>

                  {summary.overdueInstallments > 0 && (
                    <div className="glass-card p-3 rounded-xl border border-red-500/20 bg-red-500/10">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                        <span className="text-sm text-red-400">
                          {summary.overdueInstallments} overdue installments
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-white/10">
                    <div>
                      <p className="text-xs text-muted-foreground">Next Due</p>
                      <p className="text-sm text-foreground">{formatDate(summary.nextDueDate)}</p>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {formatCurrency(summary.nextDueAmount)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Trend Chart */}
              <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Monthly Payment Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics.monthlyPaymentTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="month" stroke="#ffffff60" />
                      <YAxis stroke="#ffffff60" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '12px',
                          backdropFilter: 'blur(12px)',
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="amount" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Payment Count Chart */}
              <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Payment Volume
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics.monthlyPaymentTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="month" stroke="#ffffff60" />
                      <YAxis stroke="#ffffff60" />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '12px',
                          backdropFilter: 'blur(12px)',
                        }}
                      />
                      <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Payment Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="glass-modal max-w-2xl border-white/20 bg-white/10 backdrop-blur-xl">
          <PaymentUpload
            loanId={loanId}
            onSuccess={() => {
              setShowUploadModal(false);
              fetchPayments();
            }}
            onCancel={() => setShowUploadModal(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Payment Details Modal */}
      <Dialog open={!!selectedPayment} onOpenChange={() => setSelectedPayment(null)}>
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
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Payment ID</p>
                    <p className="font-mono text-sm text-foreground">{selectedPayment.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Amount</p>
                    <p className="text-lg font-semibold text-foreground">{formatCurrency(selectedPayment.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <Badge className={`${getMethodColor(selectedPayment.paymentMethod)} border`}>
                      {selectedPayment.paymentMethod}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Loan ID</p>
                    <p className="text-sm text-foreground">{selectedPayment.loanId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className={`${getStatusColor(selectedPayment.status)} border`}>
                      {selectedPayment.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="text-sm text-foreground">
                      {formatDate(selectedPayment.paidDate || selectedPayment.dueDate)}
                    </p>
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
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default PaymentDashboard;