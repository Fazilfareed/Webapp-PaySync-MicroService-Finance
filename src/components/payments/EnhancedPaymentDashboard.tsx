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
  Users,
  MapPin,
  Bell,
  CreditCard,
  Target,
  Activity,
  Zap,
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { usePaymentStore } from '../../store/paymentStore';
import { useLoanStore } from '../../store/loanStore';
import { PaymentUpload } from './PaymentUpload';
import { formatCurrency, formatDate, formatNumber, formatPercentage } from '../../lib/utils';
import { Payment, PaymentSummary,UserRole } from '../../types';
import analyticsService from '../../services/analyticsService';
import paymentService from '../../services/paymentService';
import { usePermissions } from '../../hooks/use-permissions';
interface EnhancedPaymentDashboardProps {
  userRole?: UserRole;
  regionId?: string;
  agentId?: string;
}
export const EnhancedPaymentDashboard: React.FC<EnhancedPaymentDashboardProps> = ({
  userRole = 'agent',
  regionId,
  agentId,
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
  const { loans } = useLoanStore();
  const { canViewAllAnalytics, canViewRegionalAnalytics } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [periodFilter, setPeriodFilter] = useState<string>('monthly');
  const [selectedView, setSelectedView] = useState<string>('overview');
  const [showUploadModal, setShowUploadModal] = useState(false);
  // Enhanced analytics data
  const [enhancedAnalytics, setEnhancedAnalytics] = useState<any>(null);
  const [kpis, setKpis] = useState<any>(null);
  useEffect(() => {
    fetchPayments();
    fetchPaymentAnalytics();
    fetchPaymentSummaries();
    
    // Generate enhanced analytics
    if (loans.length > 0 && payments.length > 0) {
      const mockInstallments = loans.flatMap(loan => 
        paymentService.generatePaymentSchedule(loan)
      );
      
      const analytics = analyticsService.generateAnalyticsReport(loans, payments, mockInstallments);
      const kpiData = analyticsService.calculateKPIs(loans, payments, mockInstallments);
      
      setEnhancedAnalytics(analytics);
      setKpis(kpiData);
    }
  }, [fetchPayments, fetchPaymentAnalytics, fetchPaymentSummaries, loans, payments]);
  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.loanId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };
  const StatCard = ({ title, value, change, icon: Icon, trend, description }: any) => (
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
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="glass-icon p-3 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
            <Icon className="h-6 w-6 text-blue-400" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
  const colors = ['#3b82f6', '#8b5cf6', '#ef4444', '#10b981', '#f59e0b', '#ec4899'];
  const RenderKPICards = () => {
    if (!kpis) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        <StatCard
          title="Total Portfolio"
          value={formatCurrency(kpis.totalLoanAmount)}
          change="+12.5%"
          icon={DollarSign}
          trend="up"
          description="Total loan portfolio value"
        />
        <StatCard
          title="Collection Rate"
          value={`${formatPercentage(kpis.collectionRate)}`}
          change="+3.2%"
          icon={Target}
          trend="up"
          description="Payment collection efficiency"
        />
        <StatCard
          title="On-Time Rate"
          value={`${formatPercentage(kpis.onTimePaymentRate)}`}
          change="+1.8%"
          icon={CheckCircle}
          trend="up"
          description="Payments made on time"
        />
        <StatCard
          title="Overdue Rate"
          value={`${formatPercentage(kpis.overdueRate)}`}
          change="-0.5%"
          icon={AlertTriangle}
          trend="down"
          description="Overdue installments"
        />
        <StatCard
          title="Avg Loan Size"
          value={formatCurrency(kpis.averageLoanSize)}
          change="+8.3%"
          icon={CreditCard}
          trend="up"
          description="Average loan amount"
        />
        <StatCard
          title="Portfolio Growth"
          value={`${formatPercentage(kpis.portfolioGrowth)}`}
          change="+2.1%"
          icon={TrendingUp}
          trend="up"
          description="Month-over-month growth"
        />
      </div>
    );
  };
  const RenderAdvancedCharts = () => {
    if (!enhancedAnalytics) return null;
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Trends */}
        <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Payment Trends Analysis
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Collection performance over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={enhancedAnalytics.paymentTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="period" stroke="#ffffff60" />
                <YAxis stroke="#ffffff60" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(12px)',
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="totalAmount" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.3}
                />
                <Area 
                  type="monotone" 
                  dataKey="collectionRate" 
                  stroke="#10b981" 
                  fill="#10b981" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Regional Performance */}
        <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Regional Performance
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Performance by region
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={enhancedAnalytics.regionalAnalytics}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="regionName" stroke="#ffffff60" />
                <YAxis stroke="#ffffff60" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    backdropFilter: 'blur(12px)',
                  }}
                />
                <Bar dataKey="collectionRate" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="onTimePaymentRate" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Payment Flow */}
        <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Payment Flow Analysis
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Payment processing pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Submitted</span>
                <span className="text-sm font-semibold text-foreground">
                  {enhancedAnalytics.paymentFlow.totalSubmitted}
                </span>
              </div>
              <Progress value={100} className="h-2" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Pending Approval</span>
                <span className="text-sm font-semibold text-yellow-400">
                  {enhancedAnalytics.paymentFlow.totalPending}
                </span>
              </div>
              <Progress 
                value={(enhancedAnalytics.paymentFlow.totalPending / enhancedAnalytics.paymentFlow.totalSubmitted) * 100} 
                className="h-2" 
              />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Approved</span>
                <span className="text-sm font-semibold text-green-400">
                  {enhancedAnalytics.paymentFlow.totalApproved}
                </span>
              </div>
              <Progress 
                value={(enhancedAnalytics.paymentFlow.totalApproved / enhancedAnalytics.paymentFlow.totalSubmitted) * 100} 
                className="h-2" 
              />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Rejected</span>
                <span className="text-sm font-semibold text-red-400">
                  {enhancedAnalytics.paymentFlow.totalRejected}
                </span>
              </div>
              <Progress 
                value={(enhancedAnalytics.paymentFlow.totalRejected / enhancedAnalytics.paymentFlow.totalSubmitted) * 100} 
                className="h-2" 
              />
            </div>
          </CardContent>
        </Card>
        {/* Agent Performance */}
        <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Users className="h-5 w-5" />
              Top Performing Agents
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Agent collection performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {enhancedAnalytics.agentPerformance.slice(0, 5).map((agent: any, index: number) => (
                <div key={agent.agentId} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{agent.agentName}</p>
                      <p className="text-xs text-muted-foreground">{agent.totalLoans} loans</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      {formatPercentage(agent.collectionRate)}
                    </p>
                    <p className="text-xs text-muted-foreground">collection rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Enhanced Payment Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive payment management and analytics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={periodFilter} onValueChange={setPeriodFilter}>
            <SelectTrigger className="w-[140px] glass-input bg-white/5 border-white/20">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent className="glass-modal bg-white/10 backdrop-blur-xl border-white/20">
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
          >
            <Zap className="h-4 w-4 mr-2" />
            Quick Upload
          </Button>
          
          <Button variant="outline" className="border-white/20 hover:bg-white/10">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>
      {/* KPI Cards */}
      <RenderKPICards />
      {/* Main Dashboard Tabs */}
      <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-6">
        <TabsList className="glass-nav bg-white/10 backdrop-blur-xl border border-white/20">
          <TabsTrigger value="overview" className="text-foreground data-[state=active]:bg-white/20">
            <BarChart3 className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="text-foreground data-[state=active]:bg-white/20">
            <TrendingUp className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="payments" className="text-foreground data-[state=active]:bg-white/20">
            <CreditCard className="h-4 w-4 mr-2" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-foreground data-[state=active]:bg-white/20">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-6">
          <RenderAdvancedCharts />
        </TabsContent>
        <TabsContent value="analytics" className="space-y-6">
          {enhancedAnalytics && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Portfolio Health */}
              <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-foreground">Portfolio Health</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Collection Efficiency</span>
                    <span className="text-sm font-semibold text-foreground">
                      {formatPercentage(enhancedAnalytics.portfolioHealth.collectionEfficiency)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">NPA Percentage</span>
                    <span className="text-sm font-semibold text-red-400">
                      {formatPercentage(enhancedAnalytics.portfolioHealth.npaPercentage)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Portfolio Growth</span>
                    <span className="text-sm font-semibold text-green-400">
                      {formatPercentage(enhancedAnalytics.portfolioHealth.portfolioGrowth)}
                    </span>
                  </div>
                </CardContent>
              </Card>
              {/* Risk Distribution */}
              <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl col-span-2">
                <CardHeader>
                  <CardTitle className="text-foreground">Risk Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={enhancedAnalytics.portfolioHealth.riskDistribution}
                        dataKey="amount"
                        nameKey="riskLevel"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {enhancedAnalytics.portfolioHealth.riskDistribution.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '12px',
                          backdropFilter: 'blur(12px)',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
        <TabsContent value="payments" className="space-y-6">
          {/* Payment Table */}
          <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Recent Payments</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Latest payment transactions
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search payments..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64 glass-input bg-white/5 border-white/20"
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
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-foreground">Payment ID</TableHead>
                    <TableHead className="text-foreground">Loan ID</TableHead>
                    <TableHead className="text-foreground">Amount</TableHead>
                    <TableHead className="text-foreground">Date</TableHead>
                    <TableHead className="text-foreground">Status</TableHead>
                    <TableHead className="text-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.slice(0, 10).map((payment) => (
                    <TableRow key={payment.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-mono text-sm text-foreground">
                        {payment.id.slice(-8)}
                      </TableCell>
                      <TableCell className="text-foreground">{payment.loanId}</TableCell>
                      <TableCell className="text-foreground">
                        {formatCurrency(payment.amount)}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {formatDate(payment.paidDate || payment.createdAt)}
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
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              Download Receipt
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
        <TabsContent value="notifications" className="space-y-6">
          <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-foreground">Notification Center</CardTitle>
              <CardDescription className="text-muted-foreground">
                Automated payment notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Bell className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Notification System</h3>
                <p className="text-muted-foreground">
                  Automated notifications for payment reminders, approvals, and overdue alerts will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      {/* Payment Upload Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="glass-modal max-w-2xl border-white/20 bg-white/10 backdrop-blur-xl">
          <PaymentUpload
            onSuccess={() => {
              setShowUploadModal(false);
              fetchPayments();
            }}
            onCancel={() => setShowUploadModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default EnhancedPaymentDashboard;