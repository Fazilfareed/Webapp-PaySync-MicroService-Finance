import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import {
  Bell,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
  Settings,
} from 'lucide-react';
import { getIcon } from '../lib/iconMap';

import { ThemeToggle } from '../components/ThemeToggle';

import { useAuthStore } from '../store/authStore';
import { useNotificationStore } from '../store/notificationStore';
import { ROLE_NAVIGATION, ROLE_DASHBOARD_ROUTES } from '../constants/permissions';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Badge } from '../components/ui/badge';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { unreadCount } = useNotificationStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect to appropriate dashboard if user is on base dashboard route
  useEffect(() => {
    if (user && window.location.pathname === '/dashboard') {
      const dashboardRoute = ROLE_DASHBOARD_ROUTES[user.role];
      navigate(dashboardRoute, { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const navigationItems = ROLE_NAVIGATION[user.role] || [];

  const handleLogout = () => {
    logout();
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-200">
                <span className="text-sm font-bold text-white">PS</span>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold text-foreground">PaySync</span>
                <span className="text-xs text-muted-foreground">Loan Management</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-border bg-gradient-to-r from-muted/20 to-accent/20">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12 ring-2 ring-primary/20">
                <AvatarImage src={user.profileImage} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-sm font-semibold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
                <Badge 
                  variant="secondary" 
                  className="text-xs capitalize mt-1 bg-primary/10 text-primary hover:bg-primary/20"
                >
                  {user.role.replace('_', ' ')}
                </Badge>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 p-4 space-y-1">
            {navigationItems.map((item) => {
              const IconComponent = getIcon(item.icon);
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-3 py-2.5 text-left rounded-lg transition-all duration-200 group
                    ${isActive 
                      ? 'bg-primary text-primary-foreground shadow-md' 
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground hover:shadow-sm'
                    }
                  `}
                  title={item.description || item.title}
                >
                  <IconComponent className={`h-5 w-5 transition-transform duration-200 ${!isActive && 'group-hover:scale-110'}`} />
                  <span className="text-sm font-medium">{item.title}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-current rounded-full animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-border bg-gradient-to-r from-muted/10 to-accent/10">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200 group"
            >
              <LogOut className="h-4 w-4 mr-3 group-hover:scale-110 transition-transform duration-200" />
              <span className="font-medium">Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Top Header */}
        <header className="bg-card/50 backdrop-blur-lg border-b border-border px-4 py-3 sticky top-0 z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleSidebar}
                className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex flex-col">
                <h1 className="text-xl font-bold text-foreground">
                  Dashboard
                </h1>
                <p className="text-xs text-muted-foreground">
                  Welcome back, {user.name.split(' ')[0]}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Notifications */}
              <Button 
                variant="ghost" 
                size="sm" 
                className="relative text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs bg-red-500 hover:bg-red-500 animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200">
                    <Avatar className="h-8 w-8 ring-2 ring-primary/20">
                      <AvatarImage src={user.profileImage} alt={user.name} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-xs font-semibold">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-card border-border shadow-lg">
                  <DropdownMenuLabel className="text-foreground">
                    <div className="flex items-center space-x-3 p-2">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.profileImage} alt={user.name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-sm">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <Badge variant="outline" className="text-xs capitalize mt-1 w-fit">
                          {user.role.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer">
                    <User className="h-4 w-4 mr-2" />
                    <span>My Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer">
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Account Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-foreground hover:bg-accent focus:bg-accent cursor-pointer">
                    <Bell className="h-4 w-4 mr-2" />
                    <span>Notification Preferences</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem 
                    onClick={handleLogout}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 focus:bg-red-50 dark:focus:bg-red-950/20 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
