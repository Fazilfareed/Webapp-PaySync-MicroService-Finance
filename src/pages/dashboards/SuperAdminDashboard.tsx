import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Users,
  Building2,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  Activity,
  FileText,
  Shield,
  Settings,
  Code,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Database,
  Monitor,
  Server,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Search,
  Download,
  Upload,
  Play,
  Pause,
  RotateCcw,
  Filter,
  Plus,
  Edit,
  Trash2,
  Copy,
  Save,
  MoreHorizontal,
  ExternalLink,
  Zap,
  Globe,
  Lock,
  Unlock,
  BarChart3,
  PieChart,
  LineChart,
  Calendar,
  MapPin,
  UserCheck,
  Target,
  DollarSign,
  RefreshCw,
  Mail,
  Phone,
  Bell,
  AlertCircle,
  Info,
  Loader2,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Progress } from '../../components/ui/progress';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Switch } from '../../components/ui/switch';
import { Textarea } from '../../components/ui/textarea';
import { Checkbox } from '../../components/ui/checkbox';
import { Slider } from '../../components/ui/slider';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../../components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Separator } from '../../components/ui/separator';

import { useDashboardStore } from '../../store/dashboardStore';
import { useSystemLogsStore } from '../../store/systemLogsStore';
import { useUserManagementStore } from '../../store/userManagementStore';
import { useRoleManagementStore } from '../../store/roleManagementStore';
import { useSystemSettingsStore } from '../../store/systemSettingsStore';
import { useDeveloperToolsStore } from '../../store/developerToolsStore';
import { formatCurrency, formatDate, formatNumber } from '../../lib/utils';
import { UserRole } from '../../types';

// Import SuperAdmin components
import RoleManagement from '../../components/superadmin/RoleManagement';
import SystemSettings from '../../components/superadmin/SystemSettings';
import DeveloperTools from '../../components/superadmin/DeveloperTools';

const SuperAdminDashboard = () => {
  const location = useLocation();
  const { stats, fetchDashboardStats, isLoading: dashboardLoading } = useDashboardStore();
  
  // Store hooks
  const systemLogsStore = useSystemLogsStore();
  const userManagementStore = useUserManagementStore();
  const roleManagementStore = useRoleManagementStore();
  const systemSettingsStore = useSystemSettingsStore();
  const developerToolsStore = useDeveloperToolsStore();
  
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Fetch initial data
    fetchDashboardStats();
    systemLogsStore.fetchLogs();
    userManagementStore.fetchUsers();
    roleManagementStore.fetchRoles();
    roleManagementStore.fetchPermissions();
    systemSettingsStore.fetchSettings();
    systemSettingsStore.fetchFeatureFlags();
    developerToolsStore.fetchSystemHealth();
    developerToolsStore.fetchApiEndpoints();
    developerToolsStore.fetchDatabaseTables();
    developerToolsStore.fetchPerformanceMetrics();
  }, []);

  // Set active tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/logs')) setActiveTab('logs');
    else if (path.includes('/users')) setActiveTab('users');
    else if (path.includes('/roles')) setActiveTab('roles');
    else if (path.includes('/settings')) setActiveTab('settings');
    else if (path.includes('/developer')) setActiveTab('developer');
    else setActiveTab('overview');
  }, [location.pathname]);

  if (dashboardLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Helper functions for overview
  const getHealthStatus = (health: any) => {
    if (!health) return { status: 'unknown', color: 'text-gray-500' };
    const cpuOk = health.cpuUsage < 80;
    const memoryOk = health.memoryUsage < 85;
    const diskOk = health.diskUsage < 90;
    
    if (cpuOk && memoryOk && diskOk) return { status: 'healthy', color: 'text-green-500' };
    if (!cpuOk || !memoryOk) return { status: 'warning', color: 'text-yellow-500' };
    return { status: 'critical', color: 'text-red-500' };
  };

  const getRecentActivities = () => {
    return systemLogsStore.logs.slice(0, 10).map(log => ({
      id: log.id,
      action: log.action,
      resource: log.resource,
      timestamp: log.timestamp,
      severity: log.severity,
      user: `User ${log.userId}`,
    }));
  };

  const overviewCards = [
    {
      title: 'Total Users',
      value: formatNumber(stats.totalUsers),
      description: 'All system users',
      icon: Users,
      color: 'text-blue-500',
      trend: '+12%',
    },
    {
      title: 'Active Loans',
      value: formatNumber(stats.activeLoans),
      description: 'Currently active loans',
      icon: CreditCard,
      color: 'text-green-500',
      trend: '+8%',
    },
    {
      title: 'Total Loan Amount',
      value: formatCurrency(stats.totalLoanAmount),
      description: 'LKR value of all loans',
      icon: TrendingUp,
      color: 'text-purple-500',
      trend: '+15%',
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats.monthlyRevenue),
      description: 'This month\'s revenue',
      icon: DollarSign,
      color: 'text-yellow-500',
      trend: '+22%',
    },
    {
      title: 'System Health',
      value: getHealthStatus(developerToolsStore.systemHealth).status.toUpperCase(),
      description: 'Overall system status',
      icon: Monitor,
      color: getHealthStatus(developerToolsStore.systemHealth).color,
      trend: '99.9%',
    },
    {
      title: 'Active Regions',
      value: formatNumber(stats.regionsActive),
      description: 'Operational regions',
      icon: MapPin,
      color: 'text-cyan-500',
      trend: '+2',
    },
  ];

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Super Admin Dashboard</h1>
            <p className="text-gray-400 mt-1">Complete system oversight and management</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="border-red-500 text-red-400 px-3 py-1">
              <Shield className="h-3 w-3 mr-1" />
              Super Admin Access
            </Badge>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-6 bg-gray-900/50 border border-gray-800 rounded-lg p-1">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400 font-medium"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="logs" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400 font-medium"
            >
              <FileText className="h-4 w-4 mr-2" />
              System Logs
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400 font-medium"
            >
              <Users className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger 
              value="roles" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400 font-medium"
            >
              <Shield className="h-4 w-4 mr-2" />
              Roles
            </TabsTrigger>
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400 font-medium"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger 
              value="developer" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-400 font-medium"
            >
              <Code className="h-4 w-4 mr-2" />
              Developer
            </TabsTrigger>
          </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {overviewCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card key={index} className="bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-colors">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-400">
                      {card.title}
                    </CardTitle>
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{card.value}</div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">{card.description}</p>
                      <Badge variant="outline" className="text-xs border-green-500 text-green-400">
                        {card.trend}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Health */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-green-500" />
                  System Health
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Real-time system performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {developerToolsStore.systemHealth && (
                  <>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-2">
                          <Cpu className="h-4 w-4" />
                          CPU Usage
                        </span>
                        <span className="text-white font-medium">
                          {developerToolsStore.systemHealth.cpuUsage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={developerToolsStore.systemHealth.cpuUsage} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-2">
                          <MemoryStick className="h-4 w-4" />
                          Memory Usage
                        </span>
                        <span className="text-white font-medium">
                          {developerToolsStore.systemHealth.memoryUsage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={developerToolsStore.systemHealth.memoryUsage} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-2">
                          <HardDrive className="h-4 w-4" />
                          Disk Usage
                        </span>
                        <span className="text-white font-medium">
                          {developerToolsStore.systemHealth.diskUsage.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={developerToolsStore.systemHealth.diskUsage} className="h-2" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400 flex items-center gap-2">
                          <Database className="h-4 w-4" />
                          Database Connections
                        </span>
                        <span className="text-white font-medium">
                          {developerToolsStore.systemHealth.databaseConnections}/50
                        </span>
                      </div>
                      <Progress value={(developerToolsStore.systemHealth.databaseConnections / 50) * 100} className="h-2" />
                    </div>

                    <Separator className="bg-gray-800" />
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Uptime</span>
                        <p className="text-white font-medium">
                          {Math.floor(developerToolsStore.systemHealth.uptime / 86400)}d{' '}
                          {Math.floor((developerToolsStore.systemHealth.uptime % 86400) / 3600)}h
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-400">Status</span>
                        <p className="text-green-400 font-medium capitalize">
                          {developerToolsStore.systemHealth.status}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Recent Activities */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-500" />
                  Recent Activities
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Latest system activities and user actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-3">
                    {getRecentActivities().map((activity) => (
                      <div key={activity.id} className="flex items-start justify-between p-3 rounded-lg bg-gray-800/50">
                        <div className="flex-1">
                          <p className="text-sm text-white font-medium">{activity.action}</p>
                          <p className="text-xs text-gray-400">{activity.user} • {activity.resource}</p>
                          <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`text-xs ml-2 ${
                            activity.severity === 'critical'
                              ? 'border-red-500 text-red-400'
                              : activity.severity === 'error'
                              ? 'border-orange-500 text-orange-400'
                              : activity.severity === 'warning'
                              ? 'border-yellow-500 text-yellow-400'
                              : 'border-green-500 text-green-400'
                          }`}
                        >
                          {activity.severity}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Service Status */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Server className="h-5 w-5 text-purple-500" />
                Service Status
              </CardTitle>
              <CardDescription className="text-gray-400">
                Status of all system services and dependencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {developerToolsStore.systemHealth?.services.map((service) => (
                  <div key={service.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        service.status === 'running' ? 'bg-green-500' : 
                        service.status === 'stopped' ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium text-white">{service.name}</p>
                        <p className="text-xs text-gray-400">{service.responseTime}ms response</p>
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        service.status === 'running'
                          ? 'border-green-500 text-green-400'
                          : service.status === 'stopped'
                          ? 'border-yellow-500 text-yellow-400'
                          : 'border-red-500 text-red-400'
                      }`}
                    >
                      {service.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          {/* Logs Filter Bar */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search logs..."
                      value={systemLogsStore.filters.searchTerm}
                      onChange={(e) => systemLogsStore.setFilters({ searchTerm: e.target.value })}
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
                
                <Select
                  value={systemLogsStore.filters.severity.join(',')}
                  onValueChange={(value) => 
                    systemLogsStore.setFilters({ severity: value ? value.split(',') : [] })
                  }
                >
                  <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warning">Warning</SelectItem>
                    <SelectItem value="error">Error</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-2">
                  <Button
                    onClick={() => systemLogsStore.exportLogs('system', 'csv')}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  
                  <Button
                    onClick={() => systemLogsStore.clearFilters()}
                    variant="outline"
                    size="sm"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs Tabs */}
          <Tabs defaultValue="system" className="space-y-4">
            <TabsList className="bg-gray-800 border border-gray-700">
              <TabsTrigger 
                value="system" 
                className="data-[state=active]:bg-gray-700 text-gray-300"
              >
                <FileText className="h-4 w-4 mr-2" />
                System Logs
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="data-[state=active]:bg-gray-700 text-gray-300"
              >
                <Activity className="h-4 w-4 mr-2" />
                User Activity
              </TabsTrigger>
              <TabsTrigger 
                value="audit" 
                className="data-[state=active]:bg-gray-700 text-gray-300"
              >
                <Shield className="h-4 w-4 mr-2" />
                Audit Logs
              </TabsTrigger>
            </TabsList>

            {/* System Logs */}
            <TabsContent value="system">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      System Logs ({systemLogsStore.logs.length})
                    </span>
                    <Button
                      onClick={() => systemLogsStore.fetchLogs()}
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      disabled={systemLogsStore.isLoading}
                    >
                      {systemLogsStore.isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    System events, errors, and security-related activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-gray-800 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-800 bg-gray-800/50">
                          <TableHead className="text-gray-300 font-medium">Timestamp</TableHead>
                          <TableHead className="text-gray-300 font-medium">User</TableHead>
                          <TableHead className="text-gray-300 font-medium">Action</TableHead>
                          <TableHead className="text-gray-300 font-medium">Resource</TableHead>
                          <TableHead className="text-gray-300 font-medium">Severity</TableHead>
                          <TableHead className="text-gray-300 font-medium">IP Address</TableHead>
                          <TableHead className="text-gray-300 font-medium">Details</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {systemLogsStore.logs.slice(0, 20).map((log) => (
                          <TableRow key={log.id} className="border-gray-800 hover:bg-gray-800/30">
                            <TableCell className="text-gray-300 font-mono text-xs">
                              {formatDate(log.timestamp)}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              <span className="text-blue-400">User_{log.userId.slice(-3)}</span>
                            </TableCell>
                            <TableCell className="text-gray-300 font-medium">{log.action}</TableCell>
                            <TableCell className="text-gray-300">
                              <Badge variant="outline" className="border-gray-600 text-gray-400">
                                {log.resource}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  log.severity === 'critical'
                                    ? 'border-red-500 text-red-400 bg-red-500/10'
                                    : log.severity === 'error'
                                    ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                                    : log.severity === 'warning'
                                    ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                                    : 'border-green-500 text-green-400 bg-green-500/10'
                                }
                              >
                                {log.severity}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-400 font-mono text-xs">
                              {log.ipAddress}
                            </TableCell>
                            <TableCell className="text-gray-300 max-w-xs">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span className="truncate block cursor-help">
                                    {log.details}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-md">
                                  <p>{log.details}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* User Activity */}
            <TabsContent value="activity">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    User Activity Logs ({systemLogsStore.userActivities.length})
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    User interactions, page views, and application usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-gray-800 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-800 bg-gray-800/50">
                          <TableHead className="text-gray-300 font-medium">User</TableHead>
                          <TableHead className="text-gray-300 font-medium">Action</TableHead>
                          <TableHead className="text-gray-300 font-medium">Resource</TableHead>
                          <TableHead className="text-gray-300 font-medium">Duration</TableHead>
                          <TableHead className="text-gray-300 font-medium">Status</TableHead>
                          <TableHead className="text-gray-300 font-medium">Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {systemLogsStore.userActivities.slice(0, 20).map((activity) => (
                          <TableRow key={activity.id} className="border-gray-800 hover:bg-gray-800/30">
                            <TableCell className="text-gray-300">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center">
                                  <span className="text-xs text-blue-400 font-medium">
                                    {activity.userName.charAt(0)}
                                  </span>
                                </div>
                                <span className="text-blue-400">{activity.userName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300 font-medium">{activity.action}</TableCell>
                            <TableCell className="text-gray-300">
                              <Badge variant="outline" className="border-gray-600 text-gray-400">
                                {activity.resource}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-400 font-mono text-xs">
                              {activity.duration ? `${activity.duration}ms` : '-'}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  activity.status === 'success'
                                    ? 'border-green-500 text-green-400 bg-green-500/10'
                                    : activity.status === 'failed'
                                    ? 'border-red-500 text-red-400 bg-red-500/10'
                                    : 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                                }
                              >
                                {activity.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-400 font-mono text-xs">
                              {formatDate(activity.timestamp)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Audit Logs */}
            <TabsContent value="audit">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Audit Logs ({systemLogsStore.auditLogs.length})
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Data changes, security events, and compliance tracking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg border border-gray-800 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-800 bg-gray-800/50">
                          <TableHead className="text-gray-300 font-medium">User</TableHead>
                          <TableHead className="text-gray-300 font-medium">Action</TableHead>
                          <TableHead className="text-gray-300 font-medium">Resource</TableHead>
                          <TableHead className="text-gray-300 font-medium">Changes</TableHead>
                          <TableHead className="text-gray-300 font-medium">Severity</TableHead>
                          <TableHead className="text-gray-300 font-medium">Timestamp</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {systemLogsStore.auditLogs.slice(0, 20).map((audit) => (
                          <TableRow key={audit.id} className="border-gray-800 hover:bg-gray-800/30">
                            <TableCell className="text-gray-300">
                              <span className="text-blue-400">{audit.userName}</span>
                            </TableCell>
                            <TableCell className="text-gray-300 font-medium">{audit.action}</TableCell>
                            <TableCell className="text-gray-300">
                              <Badge variant="outline" className="border-gray-600 text-gray-400">
                                {audit.resource}#{audit.resourceId.slice(-4)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {audit.oldValues && audit.newValues ? (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                                      <Eye className="h-3 w-3 mr-1" />
                                      View Changes
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-md">
                                    <div className="space-y-2">
                                      <div>
                                        <p className="text-xs font-medium text-red-400">Before:</p>
                                        <pre className="text-xs">{JSON.stringify(audit.oldValues, null, 2)}</pre>
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-green-400">After:</p>
                                        <pre className="text-xs">{JSON.stringify(audit.newValues, null, 2)}</pre>
                                      </div>
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              ) : (
                                <span className="text-gray-500 text-xs">No changes</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  audit.severity === 'critical'
                                    ? 'border-red-500 text-red-400 bg-red-500/10'
                                    : audit.severity === 'high'
                                    ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                                    : audit.severity === 'medium'
                                    ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                                    : 'border-green-500 text-green-400 bg-green-500/10'
                                }
                              >
                                {audit.severity}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-gray-400 font-mono text-xs">
                              {formatDate(audit.timestamp)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* User Management Header */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">User Management</h3>
                  <p className="text-gray-400 text-sm">
                    Total Users: {userManagementStore.users.length} | 
                    Active: {userManagementStore.users.filter(u => u.isActive).length} | 
                    Inactive: {userManagementStore.users.filter(u => !u.isActive).length}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  {userManagementStore.bulkSelection.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-400">
                        {userManagementStore.bulkSelection.length} selected
                      </span>
                      <Button
                        onClick={() => userManagementStore.bulkToggleStatus(true)}
                        variant="outline"
                        size="sm"
                        className="border-green-600 text-green-400 hover:bg-green-600/20"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Activate
                      </Button>
                      <Button
                        onClick={() => userManagementStore.bulkToggleStatus(false)}
                        variant="outline"
                        size="sm"
                        className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Deactivate
                      </Button>
                      <Button
                        onClick={() => userManagementStore.bulkDelete()}
                        variant="outline"
                        size="sm"
                        className="border-red-600 text-red-400 hover:bg-red-600/20"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  )}
                  
                  <Button
                    onClick={() => userManagementStore.openModal('create')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search users by name, email, or role..."
                      value={userManagementStore.filters.searchTerm}
                      onChange={(e) => userManagementStore.setFilters({ searchTerm: e.target.value })}
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
                
                <Select
                  value={userManagementStore.filters.role.join(',')}
                  onValueChange={(value) => 
                    userManagementStore.setFilters({ role: value ? value.split(',') as UserRole[] : [] })
                  }
                >
                  <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="super_admin">Super Admin</SelectItem>
                    <SelectItem value="moderate_admin">Moderate Admin</SelectItem>
                    <SelectItem value="ceo">CEO</SelectItem>
                    <SelectItem value="regional_admin">Regional Admin</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={userManagementStore.filters.status.join(',')}
                  onValueChange={(value) => 
                    userManagementStore.setFilters({ status: value ? value.split(',') as ('active' | 'inactive')[] : [] })
                  }
                >
                  <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => userManagementStore.clearFilters()}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Users Table */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-0">
              <div className="rounded-lg border border-gray-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 bg-gray-800/50">
                      <TableHead className="w-12">
                        <Checkbox
                          checked={userManagementStore.bulkSelection.length === userManagementStore.users.length}
                          onCheckedChange={(checked) => 
                            checked ? userManagementStore.selectAllUsers() : userManagementStore.clearBulkSelection()
                          }
                        />
                      </TableHead>
                      <TableHead className="text-gray-300 font-medium">User</TableHead>
                      <TableHead className="text-gray-300 font-medium">Role</TableHead>
                      <TableHead className="text-gray-300 font-medium">Region</TableHead>
                      <TableHead className="text-gray-300 font-medium">Status</TableHead>
                      <TableHead className="text-gray-300 font-medium">Last Login</TableHead>
                      <TableHead className="text-gray-300 font-medium">Created</TableHead>
                      <TableHead className="text-gray-300 font-medium w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userManagementStore.users.slice(0, 50).map((user) => (
                      <TableRow key={user.id} className="border-gray-800 hover:bg-gray-800/30">
                        <TableCell>
                          <Checkbox
                            checked={userManagementStore.bulkSelection.includes(user.id)}
                            onCheckedChange={() => userManagementStore.toggleBulkSelection(user.id)}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                              <span className="text-sm text-blue-400 font-medium">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="text-white font-medium">{user.name}</p>
                              <p className="text-gray-400 text-sm">{user.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${
                              user.role === 'super_admin'
                                ? 'border-red-500 text-red-400 bg-red-500/10'
                                : user.role === 'moderate_admin'
                                ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                                : user.role === 'ceo'
                                ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                                : user.role === 'regional_admin'
                                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                                : 'border-green-500 text-green-400 bg-green-500/10'
                            }`}
                          >
                            {user.role.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {user.region ? (
                            <Badge variant="outline" className="border-gray-600 text-gray-400">
                              {user.region}
                            </Badge>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              user.isActive
                                ? 'border-green-500 text-green-400 bg-green-500/10'
                                : 'border-red-500 text-red-400 bg-red-500/10'
                            }
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          {formatDate(user.createdAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-gray-800 border-gray-700">
                              <DropdownMenuItem
                                onClick={() => userManagementStore.openModal('view', user)}
                                className="text-gray-300 hover:bg-gray-700"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => userManagementStore.openModal('edit', user)}
                                className="text-gray-300 hover:bg-gray-700"
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => userManagementStore.toggleUserStatus(user.id)}
                                className="text-gray-300 hover:bg-gray-700"
                              >
                                {user.isActive ? (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-700" />
                              <DropdownMenuItem
                                onClick={() => userManagementStore.resetPassword(user.id)}
                                className="text-yellow-400 hover:bg-gray-700"
                              >
                                <Lock className="h-4 w-4 mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => userManagementStore.deleteUser(user.id)}
                                className="text-red-400 hover:bg-gray-700"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* User Modal Dialog */}
          {userManagementStore.isModalOpen && (
            <Dialog 
              open={userManagementStore.isModalOpen} 
              onOpenChange={() => userManagementStore.closeModal()}
            >
              <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {userManagementStore.modalMode === 'create' && 'Add New User'}
                    {userManagementStore.modalMode === 'edit' && 'Edit User'}
                    {userManagementStore.modalMode === 'view' && 'User Details'}
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    {userManagementStore.modalMode === 'create' && 'Create a new user account with appropriate permissions.'}
                    {userManagementStore.modalMode === 'edit' && 'Update user information and settings.'}
                    {userManagementStore.modalMode === 'view' && 'View detailed user information and activity.'}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {userManagementStore.modalMode === 'view' ? (
                    // View Mode
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center">
                          <span className="text-2xl text-blue-400 font-medium">
                            {userManagementStore.selectedUser?.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {userManagementStore.selectedUser?.name}
                          </h3>
                          <p className="text-gray-400">{userManagementStore.selectedUser?.email}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm text-gray-400">Role</label>
                          <p className="text-white font-medium mt-1">
                            {userManagementStore.selectedUser?.role.replace('_', ' ')}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Region</label>
                          <p className="text-white font-medium mt-1">
                            {userManagementStore.selectedUser?.region || 'N/A'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Status</label>
                          <p className="text-white font-medium mt-1">
                            {userManagementStore.selectedUser?.isActive ? 'Active' : 'Inactive'}
                          </p>
                        </div>
                        <div>
                          <label className="text-sm text-gray-400">Last Login</label>
                          <p className="text-white font-medium mt-1">
                            {userManagementStore.selectedUser?.lastLogin 
                              ? formatDate(userManagementStore.selectedUser.lastLogin) 
                              : 'Never'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Create/Edit Mode
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            placeholder="Enter full name"
                            defaultValue={userManagementStore.selectedUser?.name}
                            className="bg-gray-800 border-gray-700 text-white mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Enter email address"
                            defaultValue={userManagementStore.selectedUser?.email}
                            className="bg-gray-800 border-gray-700 text-white mt-1"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="role">Role</Label>
                          <Select defaultValue={userManagementStore.selectedUser?.role}>
                            <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="super_admin">Super Admin</SelectItem>
                              <SelectItem value="moderate_admin">Moderate Admin</SelectItem>
                              <SelectItem value="ceo">CEO</SelectItem>
                              <SelectItem value="regional_admin">Regional Admin</SelectItem>
                              <SelectItem value="agent">Agent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="region">Region (Optional)</Label>
                          <Select defaultValue={userManagementStore.selectedUser?.region}>
                            <SelectTrigger className="bg-gray-800 border-gray-700 text-white mt-1">
                              <SelectValue placeholder="Select region" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700">
                              <SelectItem value="Colombo">Colombo</SelectItem>
                              <SelectItem value="Kandy">Kandy</SelectItem>
                              <SelectItem value="Galle">Galle</SelectItem>
                              <SelectItem value="Jaffna">Jaffna</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      {userManagementStore.modalMode === 'create' && (
                        <div>
                          <Label htmlFor="password">Password</Label>
                          <Input
                            id="password"
                            type="password"
                            placeholder="Enter password"
                            className="bg-gray-800 border-gray-700 text-white mt-1"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isActive"
                          defaultChecked={userManagementStore.selectedUser?.isActive ?? true}
                        />
                        <Label htmlFor="isActive" className="text-sm">
                          Active User Account
                        </Label>
                      </div>
                    </div>
                  )}
                </div>
                
                <DialogFooter>
                  <Button
                    onClick={() => userManagementStore.closeModal()}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    {userManagementStore.modalMode === 'view' ? 'Close' : 'Cancel'}
                  </Button>
                  {userManagementStore.modalMode !== 'view' && (
                    <Button
                      onClick={() => {
                        // Handle save logic here
                        userManagementStore.closeModal();
                      }}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={userManagementStore.isLoading}
                    >
                      {userManagementStore.isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {userManagementStore.modalMode === 'create' ? 'Create User' : 'Save Changes'}
                    </Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </TabsContent>

        {/* Role Management Tab */}
        <TabsContent value="roles">
          <RoleManagement />
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="settings">
          <SystemSettings />
        </TabsContent>

        {/* Developer Tools Tab */}
        <TabsContent value="developer">
          <DeveloperTools />
        </TabsContent>
      </Tabs>
    </div>
    </TooltipProvider>
  );
};

export default SuperAdminDashboard;
