import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  UserCheck,
  CreditCard,
  CheckCircle,
  Users,
  FileBarChart,
  Clock,
  AlertCircle,
  Eye,
  Check,
  X,
  Calendar,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { Label } from '../../components/ui/label';
import { useBorrowerStore } from '../../store/borrowerStore';
import { useLoanStore } from '../../store/loanStore';
import { useDashboardStore } from '../../store/dashboardStore';
import { PaymentApproval } from '../../components/payments';
import { formatCurrency, formatDate, formatNumber, getInitials } from '../../lib/utils';

const RegionalAdminDashboard = () => {
  const location = useLocation();
  const { borrowers, fetchBorrowers, approveBorrower, rejectBorrower, isLoading: borrowersLoading } = useBorrowerStore();
  const { loans, payments, fetchLoans, fetchPaymentsByLoanId, approveLoan, rejectLoan, approvePayment, rejectPayment, isLoading: loansLoading } = useLoanStore();
  const { stats, fetchDashboardStats } = useDashboardStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchDashboardStats();
    fetchBorrowers({ status: 'pending' });
    fetchLoans({ status: 'pending' });
    fetchPaymentsByLoanId('loan_1'); // Mock call
  }, [fetchDashboardStats, fetchBorrowers, fetchLoans, fetchPaymentsByLoanId]);

  // Set active tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/borrowers')) setActiveTab('borrowers');
    else if (path.includes('/loans')) setActiveTab('loans');
    else if (path.includes('/payments')) setActiveTab('payments');
    else if (path.includes('/agents')) setActiveTab('agents');
    else if (path.includes('/reports')) setActiveTab('reports');
    else setActiveTab('overview');
  }, [location.pathname]);

  const handleApproveBorrower = async (borrowerId: string) => {
    await approveBorrower(borrowerId);
  };

  const handleRejectBorrower = async (borrowerId: string) => {
    await rejectBorrower(borrowerId, rejectionReason);
    setRejectionReason('');
    setSelectedItem(null);
  };

  const handleApproveLoan = async (loanId: string) => {
    await approveLoan(loanId);
  };

  const handleRejectLoan = async (loanId: string) => {
    await rejectLoan(loanId, rejectionReason);
    setRejectionReason('');
    setSelectedItem(null);
  };

  const handleApprovePayment = async (paymentId: string) => {
    await approvePayment(paymentId);
  };

  const handleRejectPayment = async (paymentId: string) => {
    await rejectPayment(paymentId, rejectionReason);
    setRejectionReason('');
    setSelectedItem(null);
  };

  const overviewCards = [
    {
      title: 'Pending Approvals',
      value: formatNumber(borrowers.filter(b => b.status === 'pending').length + loans.filter(l => l.status === 'pending').length),
      description: 'Requires your approval',
      icon: Clock,
      color: 'text-yellow-500',
    },
    {
      title: 'Active Loans',
      value: formatNumber(stats?.activeLoans || 0),
      description: 'In your region',
      icon: CreditCard,
      color: 'text-blue-500',
    },
    {
      title: 'Active Agents',
      value: formatNumber(stats?.agentsActive || 0),
      description: 'Working under you',
      icon: Users,
      color: 'text-green-500',
    },
    {
      title: 'Monthly Collections',
      value: formatCurrency(stats?.monthlyRevenue || 0),
      description: 'This month',
      icon: CheckCircle,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Regional Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage approvals and oversee regional operations</p>
        </div>
        <Badge variant="outline" className="border-cyan-500 text-cyan-400">
          Regional Admin Access
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6 bg-gray-900 border-gray-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gray-800">
            Overview
          </TabsTrigger>
          <TabsTrigger value="borrowers" className="data-[state=active]:bg-gray-800">
            Borrower Approval
          </TabsTrigger>
          <TabsTrigger value="loans" className="data-[state=active]:bg-gray-800">
            Loan Management
          </TabsTrigger>
          <TabsTrigger value="payments" className="data-[state=active]:bg-gray-800">
            Payment Approval
          </TabsTrigger>
          <TabsTrigger value="agents" className="data-[state=active]:bg-gray-800">
            Agent Oversight
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-gray-800">
            Regional Reports
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card key={index} className="bg-gray-900 border-gray-800">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">
                      {card.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{card.value}</div>
                    <p className="text-xs text-gray-500 mt-1">{card.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Pending Borrower Approvals</CardTitle>
                <CardDescription className="text-gray-400">
                  Borrowers waiting for approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {borrowers.filter(b => b.status === 'pending').slice(0, 5).map((borrower) => (
                    <div key={borrower.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-gray-700 text-white text-xs">
                            {getInitials(borrower.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-white text-sm">{borrower.name}</div>
                          <div className="text-gray-500 text-xs">
                            {formatDate(borrower.createdAt)}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                        Pending
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Pending Loan Approvals</CardTitle>
                <CardDescription className="text-gray-400">
                  Loans requiring approval
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loans.filter(l => l.status === 'pending').slice(0, 5).map((loan) => (
                    <div key={loan.id} className="flex items-center justify-between">
                      <div>
                        <div className="text-white text-sm">
                          Loan #{loan.id.slice(-6)}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {formatCurrency(loan.amount)} - {loan.purpose}
                        </div>
                      </div>
                      <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                        Pending
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Borrower Approval Tab */}
        <TabsContent value="borrowers" className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Borrower Registration Approval
              </CardTitle>
              <CardDescription className="text-gray-400">
                Review and approve borrower registrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-400">Borrower</TableHead>
                    <TableHead className="text-gray-400">Contact</TableHead>
                    <TableHead className="text-gray-400">ID Number</TableHead>
                    <TableHead className="text-gray-400">Agent</TableHead>
                    <TableHead className="text-gray-400">Date Applied</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {borrowers.filter(b => b.status === 'pending').map((borrower) => (
                    <TableRow key={borrower.id} className="border-gray-800">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gray-700 text-white text-xs">
                              {getInitials(borrower.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-white text-sm">{borrower.name}</div>
                            <div className="text-gray-500 text-xs">{borrower.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-300">{borrower.phone}</TableCell>
                      <TableCell className="text-gray-300">{borrower.idNumber}</TableCell>
                      <TableCell className="text-gray-300">{borrower.agentId}</TableCell>
                      <TableCell className="text-gray-300">
                        {formatDate(borrower.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-yellow-500 text-yellow-400">
                          {borrower.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-900 border-gray-800">
                              <DialogHeader>
                                <DialogTitle className="text-white">Borrower Details</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                  Review borrower information
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <Label className="text-gray-400">Name</Label>
                                    <div className="text-white">{borrower.name}</div>
                                  </div>
                                  <div>
                                    <Label className="text-gray-400">Email</Label>
                                    <div className="text-white">{borrower.email}</div>
                                  </div>
                                  <div>
                                    <Label className="text-gray-400">Phone</Label>
                                    <div className="text-white">{borrower.phone}</div>
                                  </div>
                                  <div>
                                    <Label className="text-gray-400">ID Number</Label>
                                    <div className="text-white">{borrower.idNumber}</div>
                                  </div>
                                </div>
                                <div>
                                  <Label className="text-gray-400">Address</Label>
                                  <div className="text-white">{borrower.address}</div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-400 hover:text-green-300"
                            onClick={() => handleApproveBorrower(borrower.id)}
                            disabled={borrowersLoading}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300"
                                onClick={() => setSelectedItem(borrower)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-900 border-gray-800">
                              <DialogHeader>
                                <DialogTitle className="text-white">Reject Borrower</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                  Please provide a reason for rejection
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="reason" className="text-gray-400">
                                    Rejection Reason
                                  </Label>
                                  <Textarea
                                    id="reason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Enter reason for rejection..."
                                    className="bg-gray-800 border-gray-700 text-white"
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" size="sm">
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => selectedItem && handleRejectBorrower(selectedItem.id)}
                                    disabled={borrowersLoading || !rejectionReason.trim()}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Loan Management Tab */}
        <TabsContent value="loans" className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Loan Application Management
              </CardTitle>
              <CardDescription className="text-gray-400">
                Review and approve loan applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-800">
                    <TableHead className="text-gray-400">Loan ID</TableHead>
                    <TableHead className="text-gray-400">Borrower</TableHead>
                    <TableHead className="text-gray-400">Amount</TableHead>
                    <TableHead className="text-gray-400">Purpose</TableHead>
                    <TableHead className="text-gray-400">Term</TableHead>
                    <TableHead className="text-gray-400">Agent</TableHead>
                    <TableHead className="text-gray-400">Date Applied</TableHead>
                    <TableHead className="text-gray-400">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.filter(l => l.status === 'pending').map((loan) => (
                    <TableRow key={loan.id} className="border-gray-800">
                      <TableCell className="text-gray-300">
                        #{loan.id.slice(-6)}
                      </TableCell>
                      <TableCell className="text-gray-300">{loan.borrowerId}</TableCell>
                      <TableCell className="text-gray-300">
                        {formatCurrency(loan.amount)}
                      </TableCell>
                      <TableCell className="text-gray-300">{loan.purpose}</TableCell>
                      <TableCell className="text-gray-300">{loan.termMonths} months</TableCell>
                      <TableCell className="text-gray-300">{loan.agentId}</TableCell>
                      <TableCell className="text-gray-300">
                        {formatDate(loan.createdAt)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-400 hover:text-green-300"
                            onClick={() => handleApproveLoan(loan.id)}
                            disabled={loansLoading}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-400 hover:text-red-300"
                                onClick={() => setSelectedItem(loan)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-900 border-gray-800">
                              <DialogHeader>
                                <DialogTitle className="text-white">Reject Loan</DialogTitle>
                                <DialogDescription className="text-gray-400">
                                  Please provide a reason for rejection
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="loan-reason" className="text-gray-400">
                                    Rejection Reason
                                  </Label>
                                  <Textarea
                                    id="loan-reason"
                                    value={rejectionReason}
                                    onChange={(e) => setRejectionReason(e.target.value)}
                                    placeholder="Enter reason for rejection..."
                                    className="bg-gray-800 border-gray-700 text-white"
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" size="sm">
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => selectedItem && handleRejectLoan(selectedItem.id)}
                                    disabled={loansLoading || !rejectionReason.trim()}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Approval Tab */}
        <TabsContent value="payments" className="space-y-4">
          <PaymentApproval />
        </TabsContent>

        {/* Agent Oversight Tab */}
        <TabsContent value="agents" className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Agent Activity Oversight
              </CardTitle>
              <CardDescription className="text-gray-400">
                Monitor agent performance and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Agent oversight interface would be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regional Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileBarChart className="h-5 w-5" />
                Regional Performance Reports
              </CardTitle>
              <CardDescription className="text-gray-400">
                Generate reports for your region
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                Regional reporting interface would be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RegionalAdminDashboard;
