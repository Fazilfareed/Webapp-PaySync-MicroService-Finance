import { useState } from 'react';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Copy,
  Users,
  Eye,
  Save,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Lock,
  Unlock,
  Settings,
  Search,
  Filter,
  Loader2,
  AlertTriangle,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

import { useRoleManagementStore } from '../../store/roleManagementStore';
import { formatDate } from '../../lib/utils';

export default function RoleManagement() {
  const roleStore = useRoleManagementStore();
  const [permissionSearch, setPermissionSearch] = useState('');

  const filteredPermissions = roleStore.permissions.filter(permission =>
    permission.name.toLowerCase().includes(permissionSearch.toLowerCase()) ||
    permission.description.toLowerCase().includes(permissionSearch.toLowerCase())
  );

  const getPermissionsByResource = () => {
    const grouped = filteredPermissions.reduce((acc, permission) => {
      if (!acc[permission.resource]) {
        acc[permission.resource] = [];
      }
      acc[permission.resource].push(permission);
      return acc;
    }, {} as Record<string, typeof filteredPermissions>);
    
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  };

  return (
    <div className="space-y-6">
      {/* Role Management Header */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-500" />
                Role & Permission Management
              </h3>
              <p className="text-gray-400 text-sm">
                Configure roles and manage granular permissions across the system
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => roleStore.openModal('create')}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger 
            value="roles" 
            className="data-[state=active]:bg-gray-700 text-gray-300"
          >
            <Shield className="h-4 w-4 mr-2" />
            Roles ({roleStore.roles.length})
          </TabsTrigger>
          <TabsTrigger 
            value="permissions" 
            className="data-[state=active]:bg-gray-700 text-gray-300"
          >
            <Settings className="h-4 w-4 mr-2" />
            Permissions ({roleStore.permissions.length})
          </TabsTrigger>
        </TabsList>

        {/* Roles Tab */}
        <TabsContent value="roles">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span>System Roles</span>
                <Button
                  onClick={() => roleStore.fetchRoles()}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  disabled={roleStore.isLoading}
                >
                  {roleStore.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Settings className="h-4 w-4" />
                  )}
                </Button>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage user roles and their associated permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-gray-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 bg-gray-800/50">
                      <TableHead className="text-gray-300 font-medium">Role</TableHead>
                      <TableHead className="text-gray-300 font-medium">Level</TableHead>
                      <TableHead className="text-gray-300 font-medium">Users</TableHead>
                      <TableHead className="text-gray-300 font-medium">Permissions</TableHead>
                      <TableHead className="text-gray-300 font-medium">Type</TableHead>
                      <TableHead className="text-gray-300 font-medium">Updated</TableHead>
                      <TableHead className="text-gray-300 font-medium w-24">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roleStore.roles.map((role) => (
                      <TableRow key={role.id} className="border-gray-800 hover:bg-gray-800/30">
                        <TableCell>
                          <div>
                            <p className="text-white font-medium">{role.displayName}</p>
                            <p className="text-gray-400 text-sm">{role.description}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${
                              role.level === 1
                                ? 'border-red-500 text-red-400 bg-red-500/10'
                                : role.level === 2
                                ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                                : role.level === 3
                                ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                                : 'border-green-500 text-green-400 bg-green-500/10'
                            }`}
                          >
                            Level {role.level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="text-white font-medium">{role.userCount}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="border-blue-500 text-blue-400 bg-blue-500/10">
                                {role.permissions.length} permissions
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-md">
                              <ScrollArea className="h-32">
                                <div className="space-y-1">
                                  {role.permissions.slice(0, 10).map((permission) => (
                                    <p key={permission} className="text-xs">{permission}</p>
                                  ))}
                                  {role.permissions.length > 10 && (
                                    <p className="text-xs text-gray-400">
                                      +{role.permissions.length - 10} more...
                                    </p>
                                  )}
                                </div>
                              </ScrollArea>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={
                              role.isSystemRole
                                ? 'border-purple-500 text-purple-400 bg-purple-500/10'
                                : 'border-gray-500 text-gray-400 bg-gray-500/10'
                            }
                          >
                            {role.isSystemRole ? 'System' : 'Custom'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          {formatDate(role.updatedAt)}
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
                                onClick={() => roleStore.openModal('view', role)}
                                className="text-gray-300 hover:bg-gray-700"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => roleStore.openModal('edit', role)}
                                className="text-gray-300 hover:bg-gray-700"
                                disabled={role.isSystemRole}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit Role
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => roleStore.duplicateRole(role.id)}
                                className="text-gray-300 hover:bg-gray-700"
                              >
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-gray-700" />
                              <DropdownMenuItem
                                onClick={() => roleStore.deleteRole(role.id)}
                                className="text-red-400 hover:bg-gray-700"
                                disabled={role.isSystemRole || role.userCount > 0}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Role
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
        </TabsContent>

        {/* Permissions Tab */}
        <TabsContent value="permissions">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Permission Matrix</CardTitle>
              <CardDescription className="text-gray-400">
                View and understand all available system permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search permissions..."
                      value={permissionSearch}
                      onChange={(e) => setPermissionSearch(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {getPermissionsByResource().map(([resource, permissions]) => (
                  <div key={resource} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h4 className="text-lg font-semibold text-white capitalize">{resource}</h4>
                      <Badge variant="outline" className="border-gray-600 text-gray-400">
                        {permissions.length} permissions
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {permissions.map((permission) => (
                        <div
                          key={permission.id}
                          className={`p-3 rounded-lg border ${
                            permission.isSystemLevel
                              ? 'border-red-500/30 bg-red-500/5'
                              : 'border-gray-700 bg-gray-800/50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-white font-medium text-sm">{permission.name}</p>
                              <p className="text-gray-400 text-xs mt-1">{permission.description}</p>
                            </div>
                            {permission.isSystemLevel && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <AlertTriangle className="h-4 w-4 text-red-400 ml-2 flex-shrink-0" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>System-level permission - use with caution</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Role Modal Dialog */}
      {roleStore.isModalOpen && (
        <Dialog 
          open={roleStore.isModalOpen} 
          onOpenChange={() => roleStore.closeModal()}
        >
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {roleStore.modalMode === 'create' && 'Create New Role'}
                {roleStore.modalMode === 'edit' && 'Edit Role'}
                {roleStore.modalMode === 'view' && 'Role Details'}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                {roleStore.modalMode === 'create' && 'Define a new role with specific permissions for your organization.'}
                {roleStore.modalMode === 'edit' && 'Modify role settings and permissions.'}
                {roleStore.modalMode === 'view' && 'View detailed role information and assigned permissions.'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {roleStore.modalMode === 'view' ? (
                // View Mode
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-gray-400">Role Name</label>
                      <p className="text-white font-medium mt-1">
                        {roleStore.selectedRole?.displayName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Level</label>
                      <Badge
                        variant="outline"
                        className="mt-1 border-blue-500 text-blue-400 bg-blue-500/10"
                      >
                        Level {roleStore.selectedRole?.level}
                      </Badge>
                    </div>
                    <div className="col-span-2">
                      <label className="text-sm text-gray-400">Description</label>
                      <p className="text-white mt-1">{roleStore.selectedRole?.description}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Type</label>
                      <p className="text-white font-medium mt-1">
                        {roleStore.selectedRole?.isSystemRole ? 'System Role' : 'Custom Role'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Users Assigned</label>
                      <p className="text-white font-medium mt-1">
                        {roleStore.selectedRole?.userCount} users
                      </p>
                    </div>
                  </div>
                  
                  <Separator className="bg-gray-800" />
                  
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Assigned Permissions</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto">
                      {roleStore.selectedRole?.permissions.map((permission) => (
                        <div key={permission} className="flex items-center gap-2 p-2 rounded bg-gray-800/50">
                          <CheckCircle className="h-4 w-4 text-green-400" />
                          <span className="text-gray-300 text-sm">{permission}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                // Create/Edit Mode
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="displayName">Display Name</Label>
                      <Input
                        id="displayName"
                        placeholder="e.g., Regional Manager"
                        defaultValue={roleStore.selectedRole?.displayName}
                        className="bg-gray-800 border-gray-700 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="roleName">Role Key</Label>
                      <Input
                        id="roleName"
                        placeholder="e.g., regional_manager"
                        defaultValue={roleStore.selectedRole?.roleName}
                        className="bg-gray-800 border-gray-700 text-white mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe the role and its responsibilities..."
                      defaultValue={roleStore.selectedRole?.description}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="level">Access Level (1-5)</Label>
                    <Input
                      id="level"
                      type="number"
                      min="1"
                      max="5"
                      defaultValue={roleStore.selectedRole?.level || 5}
                      className="bg-gray-800 border-gray-700 text-white mt-1"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Lower numbers = higher access (1 = highest, 5 = lowest)
                    </p>
                  </div>
                  
                  <Separator className="bg-gray-800" />
                  
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Permissions</h4>
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {getPermissionsByResource().map(([resource, permissions]) => (
                        <div key={resource} className="space-y-2">
                          <h5 className="font-medium text-white capitalize flex items-center gap-2">
                            {resource}
                            <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                              {permissions.length}
                            </Badge>
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                            {permissions.map((permission) => (
                              <div key={permission.id} className="flex items-center space-x-2">
                                <Checkbox
                                  id={permission.id}
                                  defaultChecked={roleStore.selectedRole?.permissions.includes(permission.name)}
                                  className="border-gray-600 data-[state=checked]:bg-blue-600"
                                />
                                <Label
                                  htmlFor={permission.id}
                                  className="text-sm text-gray-300 cursor-pointer"
                                >
                                  {permission.description}
                                </Label>
                                {permission.isSystemLevel && (
                                  <AlertTriangle className="h-3 w-3 text-red-400" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button
                onClick={() => roleStore.closeModal()}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                {roleStore.modalMode === 'view' ? 'Close' : 'Cancel'}
              </Button>
              {roleStore.modalMode !== 'view' && (
                <Button
                  onClick={() => {
                    // Handle save logic here
                    roleStore.closeModal();
                  }}
                  className="bg-purple-600 hover:bg-purple-700"
                  disabled={roleStore.isLoading}
                >
                  {roleStore.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {roleStore.modalMode === 'create' ? 'Create Role' : 'Save Changes'}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
