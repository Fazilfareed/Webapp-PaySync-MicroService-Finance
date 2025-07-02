import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  DollarSign,
  TrendingDown,
  BarChart3,
  Eye,
  Download,
  Filter,
  Sparkles,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

import { usePaymentStore } from '../../store/paymentStore';
import { formatCurrency, formatDate } from '../../lib/utils';
import { Installment, Loan } from '../../types';

interface PaymentScheduleProps {
  loanId: string;
  loan?: Loan;
  showHeader?: boolean;
}

export const PaymentSchedule: React.FC<PaymentScheduleProps> = ({
  loanId,
  loan,
  showHeader = true,
}) => {
  const {
    installments,
    isLoading,
    fetchInstallments,
    generatePaymentSchedule,
  } = usePaymentStore();

  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'calendar'>('grid');

  useEffect(() => {
    if (loanId) {
      fetchInstallments(loanId);
    }
  }, [loanId, fetchInstallments]);

  const getStatusColor = (status: string, isPastDue: boolean = false) => {
    if (isPastDue) return 'bg-red-500/20 text-red-400 border-red-500/30';
    
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'overdue': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string, isPastDue: boolean = false) => {
    if (isPastDue || status === 'overdue') return <AlertTriangle className="h-4 w-4" />;
    
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const isPastDue = (dueDate: string, status: string) => {
    return status !== 'paid' && new Date(dueDate) < new Date();
  };

  const calculateProgress = () => {
    const paidInstallments = installments.filter(i => i.status === 'paid').length;
    return installments.length > 0 ? (paidInstallments / installments.length) * 100 : 0;
  };

  const getPaymentStats = () => {
    const paid = installments.filter(i => i.status === 'paid');
    const overdue = installments.filter(i => i.status === 'overdue' || isPastDue(i.dueDate, i.status));
    const upcoming = installments.filter(i => i.status === 'pending' && !isPastDue(i.dueDate, i.status));
    
    return {
      totalPaid: paid.reduce((sum, i) => sum + i.principal + i.interest, 0),
      totalRemaining: upcoming.reduce((sum, i) => sum + i.principal + i.interest, 0),
      overdueAmount: overdue.reduce((sum, i) => sum + i.principal + i.interest, 0),
      paidCount: paid.length,
      overdueCount: overdue.length,
      upcomingCount: upcoming.length,
    };
  };

  const stats = getPaymentStats();

  const InstallmentCard = ({ installment, index }: { installment: Installment; index: number }) => {
    const pastDue = isPastDue(installment.dueDate, installment.status);
    const totalAmount = installment.principal + installment.interest;
    
    return (
      <Card 
        className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl cursor-pointer hover:bg-white/15 transition-all duration-300"
        onClick={() => setSelectedInstallment(installment)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-muted-foreground">
                #{installment.installmentNumber}
              </span>
              <Badge className={`${getStatusColor(installment.status, pastDue)} border text-xs`}>
                {getStatusIcon(installment.status, pastDue)}
                <span className="ml-1">
                  {pastDue ? 'Overdue' : installment.status}
                </span>
              </Badge>
            </div>
            {installment.status === 'paid' && (
              <CheckCircle className="h-4 w-4 text-green-400" />
            )}
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="text-sm font-semibold text-foreground">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Due Date</span>
              <span className={`text-sm ${pastDue ? 'text-red-400' : 'text-foreground'}`}>
                {formatDate(installment.dueDate)}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Balance</span>
              <span className="text-sm text-foreground">
                {formatCurrency(installment.remainingBalance)}
              </span>
            </div>
          </div>
          
          {installment.status === 'pending' && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <div className="text-xs text-muted-foreground">
                Principal: {formatCurrency(installment.principal)} | 
                Interest: {formatCurrency(installment.interest)}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const TimelineView = () => (
    <div className="space-y-4">
      {installments.map((installment, index) => {
        const pastDue = isPastDue(installment.dueDate, installment.status);
        const totalAmount = installment.principal + installment.interest;
        
        return (
          <div key={installment.id} className="relative">
            {/* Timeline Line */}
            {index < installments.length - 1 && (
              <div className="absolute left-6 top-12 w-0.5 h-16 bg-gradient-to-b from-white/20 to-white/10" />
            )}
            
            <div className="flex items-start space-x-4">
              {/* Timeline Node */}
              <div className={`
                flex-shrink-0 w-12 h-12 rounded-full border-2 flex items-center justify-center
                ${installment.status === 'paid' 
                  ? 'bg-green-500/20 border-green-500/50' 
                  : pastDue 
                    ? 'bg-red-500/20 border-red-500/50'
                    : 'bg-blue-500/20 border-blue-500/50'
                }
              `}>
                {getStatusIcon(installment.status, pastDue)}
              </div>
              
              {/* Content */}
              <Card className="flex-1 glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-medium text-foreground">
                      Installment #{installment.installmentNumber}
                    </h4>
                    <Badge className={`${getStatusColor(installment.status, pastDue)} border text-xs`}>
                      {pastDue ? 'Overdue' : installment.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-semibold text-foreground">{formatCurrency(totalAmount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Due Date</p>
                      <p className={pastDue ? 'text-red-400' : 'text-foreground'}>
                        {formatDate(installment.dueDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Balance</p>
                      <p className="text-foreground">{formatCurrency(installment.remainingBalance)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      })}
    </div>
  );

  const CalendarView = () => {
    const groupedByMonth = installments.reduce((acc, installment) => {
      const month = new Date(installment.dueDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });
      if (!acc[month]) acc[month] = [];
      acc[month].push(installment);
      return acc;
    }, {} as Record<string, Installment[]>);

    return (
      <div className="space-y-6">
        {Object.entries(groupedByMonth).map(([month, monthInstallments]) => (
          <Card key={month} className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {month}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {monthInstallments.length} installments due
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {monthInstallments.map((installment) => (
                  <InstallmentCard key={installment.id} installment={installment} index={0} />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {showHeader && (
        <>
          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Paid</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(stats.totalPaid)}</p>
                    <p className="text-xs text-muted-foreground">{stats.paidCount} installments</p>
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
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className="text-2xl font-bold text-blue-400">{formatCurrency(stats.totalRemaining)}</p>
                    <p className="text-xs text-muted-foreground">{stats.upcomingCount} installments</p>
                  </div>
                  <div className="glass-icon p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <Clock className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Overdue</p>
                    <p className="text-2xl font-bold text-red-400">{formatCurrency(stats.overdueAmount)}</p>
                    <p className="text-xs text-muted-foreground">{stats.overdueCount} installments</p>
                  </div>
                  <div className="glass-icon p-3 rounded-2xl bg-gradient-to-br from-red-500/20 to-pink-500/20">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="text-2xl font-bold text-foreground">{Math.round(calculateProgress())}%</p>
                    <Progress value={calculateProgress()} className="h-2 mt-2" />
                  </div>
                  <div className="glass-icon p-3 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                    <BarChart3 className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Controls */}
          <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Sparkles className="h-5 w-5" />
                    Payment Schedule
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Track your loan repayment schedule and progress
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Select value={viewMode} onValueChange={(value: 'grid' | 'timeline' | 'calendar') => setViewMode(value)}>
                    <SelectTrigger className="w-[140px] glass-input bg-white/5 border-white/20">
                      <SelectValue placeholder="View Mode" />
                    </SelectTrigger>
                    <SelectContent className="glass-modal bg-white/10 backdrop-blur-xl border-white/20">
                      <SelectItem value="grid">Grid View</SelectItem>
                      <SelectItem value="timeline">Timeline</SelectItem>
                      <SelectItem value="calendar">Calendar</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="border-white/20 hover:bg-white/10">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        </>
      )}

      {/* Schedule Display */}
      <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
        <CardContent className="p-6">
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {installments.map((installment, index) => (
                <InstallmentCard key={installment.id} installment={installment} index={index} />
              ))}
            </div>
          )}
          
          {viewMode === 'timeline' && <TimelineView />}
          
          {viewMode === 'calendar' && <CalendarView />}
          
          {installments.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="glass-icon p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 mx-auto w-fit mb-4">
                <Calendar className="h-8 w-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Payment Schedule</h3>
              <p className="text-muted-foreground mb-4">No payment schedule found for this loan.</p>
              <Button 
                onClick={() => generatePaymentSchedule(loanId)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Schedule
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Installment Details Modal */}
      <Dialog open={!!selectedInstallment} onOpenChange={() => setSelectedInstallment(null)}>
        <DialogContent className="glass-modal max-w-md border-white/20 bg-white/10 backdrop-blur-xl">
          {selectedInstallment && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-foreground flex items-center gap-3">
                  <div className="glass-icon p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                    <Eye className="h-5 w-5 text-blue-400" />
                  </div>
                  Installment #{selectedInstallment.installmentNumber}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="glass-card p-4 rounded-xl border border-white/20 bg-gradient-to-br from-white/5 to-white/10">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge className={`${getStatusColor(selectedInstallment.status, isPastDue(selectedInstallment.dueDate, selectedInstallment.status))} border`}>
                        {getStatusIcon(selectedInstallment.status, isPastDue(selectedInstallment.dueDate, selectedInstallment.status))}
                        <span className="ml-1">
                          {isPastDue(selectedInstallment.dueDate, selectedInstallment.status) ? 'Overdue' : selectedInstallment.status}
                        </span>
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Due Date:</span>
                      <span className="text-sm text-foreground">{formatDate(selectedInstallment.dueDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Principal:</span>
                      <span className="text-sm font-semibold text-foreground">{formatCurrency(selectedInstallment.principal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Interest:</span>
                      <span className="text-sm text-foreground">{formatCurrency(selectedInstallment.interest)}</span>
                    </div>
                    <div className="flex justify-between border-t border-white/10 pt-2">
                      <span className="text-sm font-medium text-muted-foreground">Total:</span>
                      <span className="text-sm font-bold text-foreground">
                        {formatCurrency(selectedInstallment.principal + selectedInstallment.interest)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Remaining Balance:</span>
                      <span className="text-sm text-foreground">{formatCurrency(selectedInstallment.remainingBalance)}</span>
                    </div>
                  </div>
                </div>

                {selectedInstallment.paymentId && (
                  <div className="glass-card p-4 rounded-xl border border-green-500/20 bg-green-500/10">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-sm text-green-400">
                        Paid via Payment ID: {selectedInstallment.paymentId}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
