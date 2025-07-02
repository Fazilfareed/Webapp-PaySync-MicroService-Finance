import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Users,
  MapPin,
  UserCheck,
  BarChart3,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Shield,
  X,
  Save,
  Mail,
  Phone,
  Calendar,
  Eye,
  AlertCircle,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { toast } from '../../hooks/use-toast';
import { useDashboardStore } from '../../store/dashboardStore';
import { formatCurrency, formatDate, formatNumber } from '../../lib/utils';
import { SRI_LANKAN_DISTRICTS } from '../../types';

const ModerateAdminDashboard = () => {
  const location = useLocation();
  const { stats, regions, fetchDashboardStats, fetchRegions, isLoading } = useDashboardStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userFormData, setUserFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    region: '',
    status: 'active'
  });

  useEffect(() => {
    fetchDashboardStats();
    fetchRegions();
  }, [fetchDashboardStats, fetchRegions]);

  // Set active tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/users')) setActiveTab('users');
    else if (path.includes('/regions')) setActiveTab('regions');
    else if (path.includes('/assignments')) setActiveTab('assignments');
    else if (path.includes('/reports')) setActiveTab('reports');
    else setActiveTab('overview');
  }, [location.pathname]);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const overviewCards = [
    {
      title: 'Total Users',
      value: formatNumber(stats.totalUsers),
      description: 'System-wide users',
      icon: Users,
      color: 'text-blue-500',
    },
    {
      title: 'Active Regions',
      value: formatNumber(stats.regionsActive),
      description: 'Managed regions',
      icon: MapPin,
      color: 'text-green-500',
    },
    {
      title: 'Active Agents',
      value: formatNumber(stats.agentsActive),
      description: 'Working agents',
      icon: UserCheck,
      color: 'text-purple-500',
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats.monthlyRevenue),
      description: 'This month\'s revenue',
      icon: BarChart3,
      color: 'text-yellow-500',
    },
  ];

  // Mock user data
  const mockUsers = [
    { id: '1', name: 'John Doe', email: 'john@paysync.com', role: 'CEO', status: 'Active', region: 'N/A', lastLogin: '2024-01-15T10:30:00Z' },
    { id: '2', name: 'Jane Smith', email: 'jane@paysync.com', role: 'Regional Admin', status: 'Active', region: 'Colombo', lastLogin: '2024-01-15T09:15:00Z' },
    { id: '3', name: 'Mike Johnson', email: 'mike@paysync.com', role: 'Agent', status: 'Active', region: 'Gampaha', lastLogin: '2024-01-15T08:45:00Z' },
    { id: '4', name: 'Sarah Wilson', email: 'sarah@paysync.com', role: 'Regional Admin', status: 'Inactive', region: 'Kandy', lastLogin: '2024-01-10T14:20:00Z' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Moderate Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">User and region management operations</p>
        </div>
        <Badge variant="outline" className="border-amber-500 text-amber-400">
          Moderate Admin Access
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-card border-border">
          <TabsTrigger value="overview" className="data-[state=active]:bg-accent">
            Overview
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-accent">
            User Management
          </TabsTrigger>
          <TabsTrigger value="regions" className="data-[state=active]:bg-accent">
            Region Management
          </TabsTrigger>
          <TabsTrigger value="assignments" className="data-[state=active]:bg-accent">
            Admin Assignments
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-accent">
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <Card key={index} className="paysync-card glass-card hover-lift">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{card.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Quick Actions */}
          <Card className="paysync-card glass-card">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
              <CardDescription className="text-muted-foreground">
                Common administrative tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  onClick={() => setActiveTab('users')}
                  className="h-24 flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 glass-button"
                >
                  <Plus className="h-6 w-6 mb-2" />
                  Create User
                </Button>
                <Button 
                  onClick={() => setActiveTab('regions')}
                  className="h-24 flex flex-col items-center justify-center bg-green-600 hover:bg-green-700 glass-button"
                >
                  <MapPin className="h-6 w-6 mb-2" />
                  Assign Region
                </Button>
                <Button 
                  onClick={() => setActiveTab('assignments')}
                  className="h-24 flex flex-col items-center justify-center bg-purple-600 hover:bg-purple-700 glass-button"
                >
                  <UserCheck className="h-6 w-6 mb-2" />
                  Manage Roles
                </Button>
                <Button 
                  onClick={() => setActiveTab('reports')}
                  className="h-24 flex flex-col items-center justify-center bg-yellow-600 hover:bg-yellow-700 glass-button"
                >
                  <BarChart3 className="h-6 w-6 mb-2" />
                  View Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card className="paysync-card glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    User Management
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Create, edit, and manage user accounts
                  </CardDescription>
                </div>
                <Button 
                  onClick={() => setShowAddUserModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 glass-button"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex space-x-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-background border-border text-foreground glass-input"
                  />
                </div>
                <Select>
                  <SelectTrigger className="w-48 bg-background border-border">
                    <SelectValue placeholder="Filter by role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="ceo">CEO</SelectItem>
                    <SelectItem value="regional_admin">Regional Admin</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-48 bg-background border-border">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Users Table */}
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Name</TableHead>
                    <TableHead className="text-muted-foreground">Email</TableHead>
                    <TableHead className="text-muted-foreground">Role</TableHead>
                    <TableHead className="text-muted-foreground">Region</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Last Login</TableHead>
                    <TableHead className="text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id} className="border-border hover:bg-accent/50">
                      <TableCell className="text-foreground">{user.name}</TableCell>
                      <TableCell className="text-foreground">{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-blue-500 text-blue-400">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground">{user.region}</TableCell>
                      <TableCell>
                        <Badge
                          variant={user.status === 'Active' ? 'default' : 'secondary'}
                          className={
                            user.status === 'Active'
                              ? 'bg-green-600 text-white'
                              : 'bg-muted text-muted-foreground'
                          }
                        >
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {formatDate(user.lastLogin)}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                            onClick={() => {
                              setSelectedUser(user);
                              setUserFormData({
                                name: user.name,
                                email: user.email,
                                phone: '0771234567', // mock phone
                                role: user.role,
                                region: user.region,
                                status: user.status.toLowerCase()
                              });
                              setShowEditUserModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this user?')) {
                                toast({
                                  title: "User Deleted",
                                  description: `${user.name} has been removed from the system.`,
                                });
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Region Management Tab */}
        <TabsContent value="regions" className="space-y-4">
          <Card className="paysync-card glass-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Region Management
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Manage Sri Lankan districts and regional assignments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regions.slice(0, 9).map((region) => (
                  <Card key={region.id} className="paysync-card glass-card hover-lift">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-foreground text-sm">{region.name}</CardTitle>
                        <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                          {region.province}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Agents:</span>
                          <span className="text-foreground">{region.agentCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Borrowers:</span>
                          <span className="text-foreground">{region.borrowerCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Active Loans:</span>
                          <span className="text-foreground">{region.activeLoans}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Amount:</span>
                          <span className="text-foreground">{formatCurrency(region.totalLoanAmount)}</span>
                        </div>
                        <div className="pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full border-border text-foreground hover:bg-accent glass-button"
                            onClick={() => {
                              toast({
                                title: "Admin Assignment",
                                description: `Regional admin assignment for ${region.name} is now available.`,
                              });
                            }}
                          >
                            Assign Admin
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Admin Assignments Tab */}
        <TabsContent value="assignments" className="space-y-4">
          <Card className="paysync-card glass-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Regional Admin Assignments
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Assign regional administrators to districts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <Label className="text-foreground">Available Regional Admins</Label>
                  <div className="space-y-2">
                    {['John Smith', 'Sarah Wilson', 'Mike Johnson'].map((admin, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs">
                              {admin.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-foreground">{admin}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {index === 0 ? 'Assigned: Colombo' : 'Available'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <Label className="text-foreground">Assignment Actions</Label>
                  <div className="space-y-3">
                    <Button className="w-full glass-button" variant="outline">
                      <UserCheck className="h-4 w-4 mr-2" />
                      Assign to Region
                    </Button>
                    <Button className="w-full glass-button" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Modify Assignment
                    </Button>
                    <Button className="w-full glass-button" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Assignment History
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card className="paysync-card glass-card">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Administrative Reports
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Generate and export administrative reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="paysync-card glass-card hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue-500/20">
                        <Users className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">User Activity Report</h3>
                        <p className="text-sm text-muted-foreground">View user login and activity</p>
                      </div>
                    </div>
                    <Button className="w-full mt-4 glass-button" variant="outline">
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card className="paysync-card glass-card hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-500/20">
                        <MapPin className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Regional Performance</h3>
                        <p className="text-sm text-muted-foreground">Analyze regional metrics</p>
                      </div>
                    </div>
                    <Button className="w-full mt-4 glass-button" variant="outline">
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>

                <Card className="paysync-card glass-card hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20">
                        <Shield className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Security Audit</h3>
                        <p className="text-sm text-muted-foreground">System security overview</p>
                      </div>
                    </div>
                    <Button className="w-full mt-4 glass-button" variant="outline">
                      Generate Report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add User Modal */}
      <Dialog open={showAddUserModal} onOpenChange={setShowAddUserModal}>
        <DialogContent className="glass-modal max-w-2xl border-border bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20">
                <Plus className="h-5 w-5 text-blue-400" />
              </div>
              Add New User
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Create a new user account with appropriate role and permissions
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            // Handle form submission
            toast({
              title: "User Created",
              description: `${userFormData.name} has been successfully added to the system.`,
            });
            setShowAddUserModal(false);
            setUserFormData({ name: '', email: '', phone: '', role: '', region: '', status: 'active' });
          }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-foreground">Full Name *</Label>
                <Input
                  id="name"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
                  className="glass-input bg-background border-border text-foreground"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-foreground">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                  className="glass-input bg-background border-border text-foreground"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-foreground">Phone Number</Label>
                <Input
                  id="phone"
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({...userFormData, phone: e.target.value})}
                  className="glass-input bg-background border-border text-foreground"
                  placeholder="0771234567"
                />
              </div>
              <div>
                <Label htmlFor="role" className="text-foreground">Role *</Label>
                <Select value={userFormData.role} onValueChange={(value) => setUserFormData({...userFormData, role: value})}>
                  <SelectTrigger className="glass-input bg-background border-border">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ceo">CEO</SelectItem>
                    <SelectItem value="regional_admin">Regional Admin</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="region" className="text-foreground">Region</Label>
                <Select value={userFormData.region} onValueChange={(value) => setUserFormData({...userFormData, region: value})}>
                  <SelectTrigger className="glass-input bg-background border-border">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.slice(0, 10).map((region) => (
                      <SelectItem key={region.id} value={region.name}>{region.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status" className="text-foreground">Status</Label>
                <Select value={userFormData.status} onValueChange={(value) => setUserFormData({...userFormData, status: value})}>
                  <SelectTrigger className="glass-input bg-background border-border">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddUserModal(false)}
                className="glass-button"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 glass-button"
                disabled={!userFormData.name || !userFormData.email || !userFormData.role}
              >
                <Save className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditUserModal} onOpenChange={setShowEditUserModal}>
        <DialogContent className="glass-modal max-w-2xl border-border bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20">
                <Edit className="h-5 w-5 text-emerald-400" />
              </div>
              Edit User Details
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Update user information and permissions
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            toast({
              title: "User Updated",
              description: `${userFormData.name}'s information has been successfully updated.`,
            });
            setShowEditUserModal(false);
          }} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name" className="text-foreground">Full Name *</Label>
                <Input
                  id="edit-name"
                  value={userFormData.name}
                  onChange={(e) => setUserFormData({...userFormData, name: e.target.value})}
                  className="glass-input bg-background border-border text-foreground"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-email" className="text-foreground">Email Address *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={userFormData.email}
                  onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                  className="glass-input bg-background border-border text-foreground"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-phone" className="text-foreground">Phone Number</Label>
                <Input
                  id="edit-phone"
                  value={userFormData.phone}
                  onChange={(e) => setUserFormData({...userFormData, phone: e.target.value})}
                  className="glass-input bg-background border-border text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="edit-role" className="text-foreground">Role *</Label>
                <Select value={userFormData.role} onValueChange={(value) => setUserFormData({...userFormData, role: value})}>
                  <SelectTrigger className="glass-input bg-background border-border">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ceo">CEO</SelectItem>
                    <SelectItem value="regional_admin">Regional Admin</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-region" className="text-foreground">Region</Label>
                <Select value={userFormData.region} onValueChange={(value) => setUserFormData({...userFormData, region: value})}>
                  <SelectTrigger className="glass-input bg-background border-border">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regions.slice(0, 10).map((region) => (
                      <SelectItem key={region.id} value={region.name}>{region.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status" className="text-foreground">Status</Label>
                <Select value={userFormData.status} onValueChange={(value) => setUserFormData({...userFormData, status: value})}>
                  <SelectTrigger className="glass-input bg-background border-border">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowEditUserModal(false)}
                className="glass-button"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-emerald-600 hover:bg-emerald-700 glass-button"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModerateAdminDashboard;
