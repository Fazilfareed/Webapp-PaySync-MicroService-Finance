import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Calculator,
  DollarSign,
  Clock,
  TrendingUp,
  FileText,
  CheckCircle,
  AlertTriangle,
  Download,
  Sparkles,
  Settings,
  BarChart3,
  Eye,
  Save,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useToast } from '../../hooks/use-toast';
import { formatCurrency, formatDate, formatPercentage } from '../../lib/utils';
import { Loan, Installment } from '../../types';
import paymentService from '../../services/paymentService';
interface AutoPaymentScheduleGeneratorProps {
  loan: Loan;
  onScheduleGenerated?: (installments: Installment[]) => void;
  onScheduleSaved?: (installments: Installment[]) => void;
  showPreview?: boolean;
}
interface ScheduleSettings {
  paymentFrequency: 'monthly' | 'quarterly' | 'half-yearly';
  startDate: string;
  gracePeriod: number; // days
  lateFeeRate: number; // percentage
  compoundingFrequency: 'monthly' | 'quarterly' | 'annually';
  allowPrepayment: boolean;
  prepaymentPenalty: number; // percentage
}
export const AutoPaymentScheduleGenerator: React.FC<AutoPaymentScheduleGeneratorProps> = ({
  loan,
  onScheduleGenerated,
  onScheduleSaved,
  showPreview = true,
}) => {
  const { toast } = useToast();
  
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const [settings, setSettings] = useState<ScheduleSettings>({
    paymentFrequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    gracePeriod: 5,
    lateFeeRate: 2,
    compoundingFrequency: 'monthly',
    allowPrepayment: true,
    prepaymentPenalty: 1,
  });
  useEffect(() => {
    if (loan) {
      generateSchedule();
    }
  }, [loan, settings]);
  const generateSchedule = async () => {
    setIsGenerating(true);
    try {
      // Simulate processing time for complex calculations
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const generatedInstallments = paymentService.generatePaymentSchedule(loan);
      
      // Apply settings modifications
      const modifiedInstallments = generatedInstallments.map((installment, index) => {
        let dueDate = new Date(settings.startDate);
        
        // Calculate due date based on frequency
        switch (settings.paymentFrequency) {
          case 'monthly':
            dueDate.setMonth(dueDate.getMonth() + index + 1);
            break;
          case 'quarterly':
            dueDate.setMonth(dueDate.getMonth() + (index + 1) * 3);
            break;
          case 'half-yearly':
            dueDate.setMonth(dueDate.getMonth() + (index + 1) * 6);
            break;
        }
        
        return {
          ...installment,
          dueDate: dueDate.toISOString(),
        };
      });
      
      setInstallments(modifiedInstallments);
      onScheduleGenerated?.(modifiedInstallments);
      
      toast({
        title: 'Schedule generated',
        description: `Generated ${modifiedInstallments.length} installments`,
      });
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: 'Failed to generate payment schedule',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const saveSchedule = async () => {
    setIsGenerating(true);
    try {
      // Simulate API call to save schedule
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onScheduleSaved?.(installments);
      setPreviewMode(false);
      
      toast({
        title: 'Schedule saved',
        description: 'Payment schedule has been saved successfully',
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: 'Failed to save payment schedule',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  const calculateScheduleStats = () => {
    const totalPrincipal = installments.reduce((sum, i) => sum + i.principal, 0);
    const totalInterest = installments.reduce((sum, i) => sum + i.interest, 0);
    const totalAmount = totalPrincipal + totalInterest;
    const monthlyPayment = installments.length > 0 ? installments[0].principal + installments[0].interest : 0;
    
    return {
      totalPrincipal,
      totalInterest,
      totalAmount,
      monthlyPayment,
      totalPayments: installments.length,
      effectiveRate: loan.amount > 0 ? (totalInterest / loan.amount) * 100 : 0,
    };
  };
  const getChartData = () => {
    return installments.map((installment, index) => ({
      installment: index + 1,
      principal: installment.principal,
      interest: installment.interest,
      balance: installment.remainingBalance,
      cumulativePrincipal: installments.slice(0, index + 1).reduce((sum, i) => sum + i.principal, 0),
    }));
  };
  const stats = calculateScheduleStats();
  const chartData = getChartData();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-400" />
            Payment Schedule Generator
          </h2>
          <p className="text-muted-foreground">
            Automatically generate payment schedule for Loan #{loan.id}
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowSettings(true)}
            className="border-white/20 hover:bg-white/10"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button
            onClick={generateSchedule}
            disabled={isGenerating}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
          >
            {isGenerating ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? 'Generating...' : 'Regenerate'}
          </Button>
        </div>
      </div>
      {/* Loan Summary */}
      <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-foreground">Loan Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-muted-foreground">Principal Amount</p>
              <p className="text-xl font-bold text-foreground">{formatCurrency(loan.amount)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Interest Rate</p>
              <p className="text-xl font-bold text-foreground">{loan.interestRate}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Term</p>
              <p className="text-xl font-bold text-foreground">{loan.termMonths} months</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Frequency</p>
              <p className="text-xl font-bold text-foreground capitalize">{settings.paymentFrequency}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Schedule Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6">
        <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Monthly Payment</p>
                <p className="text-2xl font-bold text-blue-400">{formatCurrency(stats.monthlyPayment)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Interest</p>
                <p className="text-2xl font-bold text-orange-400">{formatCurrency(stats.totalInterest)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-400" />
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
              <Calculator className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Payments</p>
                <p className="text-2xl font-bold text-green-400">{stats.totalPayments}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Effective Rate</p>
                <p className="text-2xl font-bold text-red-400">{formatPercentage(stats.effectiveRate)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge className={previewMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}>
                  {previewMode ? 'Preview' : 'Saved'}
                </Badge>
              </div>
              {previewMode ? <Eye className="h-8 w-8 text-yellow-400" /> : <CheckCircle className="h-8 w-8 text-green-400" />}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Visualizations and Schedule */}
      <Tabs defaultValue="schedule" className="space-y-6">
        <TabsList className="glass-nav bg-white/10 backdrop-blur-xl border border-white/20">
          <TabsTrigger value="schedule" className="text-foreground data-[state=active]:bg-white/20">
            Payment Schedule
          </TabsTrigger>
          <TabsTrigger value="charts" className="text-foreground data-[state=active]:bg-white/20">
            Amortization Chart
          </TabsTrigger>
          <TabsTrigger value="summary" className="text-foreground data-[state=active]:bg-white/20">
            Summary
          </TabsTrigger>
        </TabsList>
        <TabsContent value="schedule" className="space-y-6">
          <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground">Payment Schedule</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Detailed breakdown of each installment
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  {previewMode && (
                    <Button
                      onClick={saveSchedule}
                      disabled={isGenerating}
                      className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Schedule
                    </Button>
                  )}
                  <Button variant="outline" className="border-white/20 hover:bg-white/10">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10">
                    <TableHead className="text-foreground">#</TableHead>
                    <TableHead className="text-foreground">Due Date</TableHead>
                    <TableHead className="text-foreground">Principal</TableHead>
                    <TableHead className="text-foreground">Interest</TableHead>
                    <TableHead className="text-foreground">Total Payment</TableHead>
                    <TableHead className="text-foreground">Remaining Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {installments.map((installment) => (
                    <TableRow key={installment.id} className="border-white/10 hover:bg-white/5">
                      <TableCell className="font-semibold text-foreground">
                        {installment.installmentNumber}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {formatDate(installment.dueDate)}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {formatCurrency(installment.principal)}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {formatCurrency(installment.interest)}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        {formatCurrency(installment.principal + installment.interest)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatCurrency(installment.remainingBalance)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="charts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Principal vs Interest Chart */}
            <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-foreground">Principal vs Interest</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Payment composition over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="installment" stroke="#ffffff60" />
                    <YAxis stroke="#ffffff60" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(12px)',
                      }}
                    />
                    <Bar dataKey="principal" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="interest" stackId="a" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            {/* Balance Reduction Chart */}
            <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-foreground">Balance Reduction</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Outstanding balance over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="installment" stroke="#ffffff60" />
                    <YAxis stroke="#ffffff60" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(12px)',
                      }}
                    />
                    <Line type="monotone" dataKey="balance" stroke="#10b981" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Summary */}
            <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-foreground">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Loan Amount:</span>
                  <span className="font-semibold text-foreground">{formatCurrency(loan.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Interest:</span>
                  <span className="font-semibold text-orange-400">{formatCurrency(stats.totalInterest)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total of Payments:</span>
                  <span className="font-semibold text-foreground">{formatCurrency(stats.totalAmount)}</span>
                </div>
                <Separator className="border-white/10" />
                <div className="flex justify-between text-lg">
                  <span className="text-foreground">Monthly Payment:</span>
                  <span className="font-bold text-blue-400">{formatCurrency(stats.monthlyPayment)}</span>
                </div>
              </CardContent>
            </Card>
            {/* Settings Summary */}
            <Card className="glass-card border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="text-foreground">Schedule Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Frequency:</span>
                  <span className="font-semibold text-foreground capitalize">{settings.paymentFrequency}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date:</span>
                  <span className="font-semibold text-foreground">{formatDate(settings.startDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Grace Period:</span>
                  <span className="font-semibold text-foreground">{settings.gracePeriod} days</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Late Fee Rate:</span>
                  <span className="font-semibold text-foreground">{settings.lateFeeRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Prepayment:</span>
                  <Badge className={settings.allowPrepayment ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                    {settings.allowPrepayment ? 'Allowed' : 'Not Allowed'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="glass-modal max-w-2xl border-white/20 bg-white/10 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">Schedule Settings</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Configure payment schedule parameters
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="frequency" className="text-foreground">Payment Frequency</Label>
                <Select 
                  value={settings.paymentFrequency} 
                  onValueChange={(value: any) => setSettings(prev => ({ ...prev, paymentFrequency: value }))}
                >
                  <SelectTrigger className="glass-input bg-white/5 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-modal bg-white/10 backdrop-blur-xl border-white/20">
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="half-yearly">Half-Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="startDate" className="text-foreground">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={settings.startDate}
                  onChange={(e) => setSettings(prev => ({ ...prev, startDate: e.target.value }))}
                  className="glass-input bg-white/5 border-white/20"
                />
              </div>
              
              <div>
                <Label htmlFor="gracePeriod" className="text-foreground">Grace Period (Days)</Label>
                <Input
                  id="gracePeriod"
                  type="number"
                  value={settings.gracePeriod}
                  onChange={(e) => setSettings(prev => ({ ...prev, gracePeriod: Number(e.target.value) }))}
                  className="glass-input bg-white/5 border-white/20"
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="lateFeeRate" className="text-foreground">Late Fee Rate (%)</Label>
                <Input
                  id="lateFeeRate"
                  type="number"
                  step="0.1"
                  value={settings.lateFeeRate}
                  onChange={(e) => setSettings(prev => ({ ...prev, lateFeeRate: Number(e.target.value) }))}
                  className="glass-input bg-white/5 border-white/20"
                />
              </div>
              
              <div>
                <Label htmlFor="compounding" className="text-foreground">Compounding Frequency</Label>
                <Select 
                  value={settings.compoundingFrequency} 
                  onValueChange={(value: any) => setSettings(prev => ({ ...prev, compoundingFrequency: value }))}
                >
                  <SelectTrigger className="glass-input bg-white/5 border-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-modal bg-white/10 backdrop-blur-xl border-white/20">
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="prepaymentPenalty" className="text-foreground">Prepayment Penalty (%)</Label>
                <Input
                  id="prepaymentPenalty"
                  type="number"
                  step="0.1"
                  value={settings.prepaymentPenalty}
                  onChange={(e) => setSettings(prev => ({ ...prev, prepaymentPenalty: Number(e.target.value) }))}
                  className="glass-input bg-white/5 border-white/20"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setShowSettings(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => {
                setShowSettings(false);
                generateSchedule();
              }}
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              Apply Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
export default AutoPaymentScheduleGenerator;