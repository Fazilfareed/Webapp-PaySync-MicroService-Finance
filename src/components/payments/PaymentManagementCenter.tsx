import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  AlertTriangle,
  Calculator,
  CreditCard,
  BarChart3,
  Bell,
  Users,
  FileText,
  Settings,
  Sparkles,
  TrendingUp,
  DollarSign,
  Calendar,
  Target,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import EnhancedPaymentDashboard from './EnhancedPaymentDashboard';
import OverduePaymentManager from './OverduePaymentManager';
import AutoPaymentScheduleGenerator from './AutoPaymentScheduleGenerator';
import { PaymentApproval } from './PaymentApproval';
import { PaymentSchedule } from './PaymentSchedule';
import { usePaymentStore } from '../../store/paymentStore';
import { useLoanStore } from '../../store/loanStore';
import { usePermissions } from '../../hooks/use-permissions';
import { formatCurrency, formatNumber, formatPercentage } from '../../lib/utils';
import { UserRole } from '../../types';
import paymentService from '../../services/paymentService';
import analyticsService from '../../services/analyticsService';
interface PaymentManagementCenterProps {
  userRole: UserRole;
  regionId?: string;
  agentId?: string;
}
export const PaymentManagementCenter: React.FC<PaymentManagementCenterProps> = ({
  userRole,
  regionId,
  agentId,
}) => {
  const {
    payments,
    fetchPayments,
    fetchPaymentAnalytics,
  } = usePaymentStore();
  const { loans, fetchLoans } = useLoanStore();
  
  const {
    canHandleOverduePayments,
    canApprovePayments,
    canViewAllAnalytics,
    canViewRegionalAnalytics,
    canGeneratePaymentSchedule,
  } = usePermissions();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [quickStats, setQuickStats] = useState<any>(null);
  const [showScheduleGenerator, setShowScheduleGenerator] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);
  useEffect(() => {
    fetchPayments();
    fetchPaymentAnalytics();
    fetchLoans();
  }, []);
  useEffect(() => {
    if (loans.length > 0 && payments.length > 0) {
      calculateQuickStats();
    }
  }, [loans, payments]);
  const calculateQuickStats = () => {
    // Generate mock installments for calculations
    const installments = loans.flatMap(loan => 
      paymentService.generatePaymentSchedule(loan)
    );
    const overdueInstallments = installments.filter(i => 
      paymentService.isPaymentOverdue(i.dueDate) && i.status !== 'paid'
    );
    const pendingApprovals = payments.filter(p => p.status === 'pending').length;
    const totalOverdueAmount = overdueInstallments.reduce((sum, i) => {
      const breakdown = paymentService.calculatePaymentBreakdown(i);
      return sum + breakdown.totalAmount;
    }, 0);
    const onTimePaymentRate = paymentService.calculateOnTimePaymentRate(installments, payments);
    const totalCollected = payments
      .filter(p => p.status === 'approved')
      .reduce((sum, p) => sum + p.amount, 0);
    setQuickStats({
      totalLoans: loans.length,
      activeLoans: loans.filter(l => l.status === 'active').length,
      totalOverdue: overdueInstallments.length,
      totalOverdueAmount,
      pendingApprovals,
      onTimePaymentRate,
      totalCollected,
      portfolioValue: loans.reduce((sum, l) => sum + l.amount, 0),
    });
  };
  const getRoleBasedTabs = () => {
    const baseTabs = [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, component: EnhancedPaymentDashboard },
    ];
    if (canApprovePayments()) {
      baseTabs.push({
        id: 'approvals',
        label: 'Approvals',
        icon: CreditCard,
        component: PaymentApproval,
      });
    }
    if (canHandleOverduePayments()) {
      baseTabs.push({
        id: 'overdue',
        label: 'Overdue',
        icon: AlertTriangle,
        component: OverduePaymentManager,
      });
    }
    if (canViewAllAnalytics() || canViewRegionalAnalytics()) {
      baseTabs.push({
        id: 'analytics',
        label: 'Analytics',
        icon: BarChart3,
        component: () => <EnhancedPaymentDashboard userRole={userRole} />,
      });
    }
    return baseTabs;
  };
  const QuickActionCard = ({ title, description, icon: Icon, action, badge, color = 'blue' }: any) => (
    <Card 
      className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl cursor-pointer hover:bg-white/15 transition-all duration-300"
      onClick={action}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-medium text-foreground">{title}</h3>
              {badge && (
                <Badge className={`bg-${color}-500/20 text-${color}-400 text-xs`}>
                  {badge}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className={`glass-icon p-3 rounded-2xl bg-gradient-to-br from-${color}-500/20 to-purple-500/20`}>
            <Icon className={`h-6 w-6 text-${color}-400`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  const tabs = getRoleBasedTabs();
  return (
    <div className="space-y-6">
      {/* Header with Quick Stats */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Payment Management Center</h1>
            <p className="text-muted-foreground">
              Comprehensive payment management for {userRole.replace('_', ' ')} dashboard
            </p>
          </div>
          <div className="flex items-center space-x-3">
            {canGeneratePaymentSchedule() && (
              <Button
                onClick={() => setShowScheduleGenerator(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
              >
                <Calculator className="h-4 w-4 mr-2" />
                Schedule Generator
              </Button>
            )}
            <Button variant="outline" className="border-white/20 hover:bg-white/10">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
        {/* Quick Stats Cards */}
        {quickStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
            <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Portfolio</p>
                    <p className="text-2xl font-bold text-foreground">
                      {formatCurrency(quickStats.portfolioValue)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Collected</p>
                    <p className="text-2xl font-bold text-green-400">
                      {formatCurrency(quickStats.totalCollected)}
                    </p>
                  </div>
                  <Target className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Active Loans</p>
                    <p className="text-2xl font-bold text-blue-400">{quickStats.activeLoans}</p>
                    <p className="text-xs text-muted-foreground">of {quickStats.totalLoans} total</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">On-Time Rate</p>
                    <p className="text-2xl font-bold text-green-400">
                      {formatPercentage(quickStats.onTimePaymentRate)}
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Overdue Amount</p>
                    <p className="text-2xl font-bold text-red-400">
                      {formatCurrency(quickStats.totalOverdueAmount)}
                    </p>
                    <p className="text-xs text-muted-foreground">{quickStats.totalOverdue} items</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Pending Approvals</p>
                    <p className="text-2xl font-bold text-yellow-400">{quickStats.pendingApprovals}</p>
                  </div>
                  <Bell className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <QuickActionCard
            title="Upload Payment"
            description="Submit payment receipt for processing"
            icon={CreditCard}
            action={() => setActiveTab('dashboard')}
            color="green"
          />
          
          {canApprovePayments() && (
            <QuickActionCard
              title="Review Approvals"
              description="Process pending payment approvals"
              icon={CreditCard}
              badge={quickStats?.pendingApprovals}
              action={() => setActiveTab('approvals')}
              color="blue"
            />
          )}
          
          {canHandleOverduePayments() && (
            <QuickActionCard
              title="Manage Overdue"
              description="Handle overdue payments and follow-ups"
              icon={AlertTriangle}
              badge={quickStats?.totalOverdue}
              action={() => setActiveTab('overdue')}
              color="red"
            />
          )}
          
          <QuickActionCard
            title="View Analytics"
            description="Payment performance insights"
            icon={BarChart3}
            action={() => setActiveTab('analytics')}
            color="purple"
          />
        </div>
      </div>
      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="glass-nav bg-white/10 backdrop-blur-xl border border-white/20 grid grid-cols-4 w-fit">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id} 
              className="text-foreground data-[state=active]:bg-white/20 flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6">
            <tab.component 
              userRole={userRole}
              regionId={regionId}
              agentId={agentId}
            />
          </TabsContent>
        ))}
      </Tabs>
      {/* Schedule Generator Modal */}
      <Dialog open={showScheduleGenerator} onOpenChange={setShowScheduleGenerator}>
        <DialogContent className="glass-modal max-w-6xl border-white/20 bg-white/10 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Payment Schedule Generator</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Generate payment schedules for approved loans
            </DialogDescription>
          </DialogHeader>
          
          {selectedLoan ? (
            <AutoPaymentScheduleGenerator
              loan={selectedLoan}
              onScheduleGenerated={(installments) => {
                console.log('Schedule generated:', installments);
              }}
              onScheduleSaved={(installments) => {
                console.log('Schedule saved:', installments);
                setShowScheduleGenerator(false);
                setSelectedLoan(null);
              }}
            />
          ) : (
            <div className="space-y-6">
              <div className="text-center py-8">
                <Calculator className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Select a Loan</h3>
                <p className="text-muted-foreground mb-6">
                  Choose a loan to generate its payment schedule
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                  {loans.filter(loan => loan.status === 'approved').map((loan) => (
                    <Card 
                      key={loan.id}
                      className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl cursor-pointer hover:bg-white/15 transition-all duration-300"
                      onClick={() => setSelectedLoan(loan)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-foreground">Loan #{loan.id}</h4>
                            <Badge className="bg-green-500/20 text-green-400 text-xs">
                              {loan.status}
                            </Badge>
                          </div>
                          <p className="text-lg font-bold text-foreground">
                            {formatCurrency(loan.amount)}
                          </p>
                          <div className="text-xs text-muted-foreground">
                            <p>{loan.interestRate}% • {loan.termMonths} months</p>
                            <p>{loan.purpose}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {loans.filter(loan => loan.status === 'approved').length === 0 && (
                  <p className="text-muted-foreground">No approved loans available for schedule generation.</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default PaymentManagementCenter;