import { useState } from 'react';
import {
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  Download,
  Upload,
  Search,
  Filter,
  ToggleLeft,
  ToggleRight,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye,
  EyeOff,
  RefreshCw,
  FileText,
  Database,
  Shield,
  Mail,
  Bell,
  Globe,
  Zap,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Textarea } from '../ui/textarea';
import { Slider } from '../ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { ScrollArea } from '../ui/scroll-area';

import { useSystemSettingsStore } from '../../store/systemSettingsStore';
import { formatDate } from '../../lib/utils';

export default function SystemSettings() {
  const settingsStore = useSystemSettingsStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [editingSettingId, setEditingSettingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<any>('');

  const categories = ['all', ...new Set(settingsStore.settings.map(s => s.category))];
  
  const filteredSettings = settingsStore.settings.filter(setting => {
    const matchesSearch = setting.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         setting.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || setting.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'application': return Globe;
      case 'security': return Shield;
      case 'loans': return FileText;
      case 'commission': return Database;
      case 'notifications': return Bell;
      case 'files': return Upload;
      default: return Settings;
    }
  };

  const getFeatureFlagIcon = (flag: any) => {
    if (flag.isEnabled) return CheckCircle;
    return AlertTriangle;
  };

  const handleEditSetting = (setting: any) => {
    setEditingSettingId(setting.id);
    setEditingValue(setting.value);
  };

  const handleSaveSetting = (settingId: string) => {
    settingsStore.updateSetting(settingId, editingValue);
    setEditingSettingId(null);
    setEditingValue('');
  };

  const handleCancelEdit = () => {
    setEditingSettingId(null);
    setEditingValue('');
  };

  const renderSettingValue = (setting: any) => {
    if (editingSettingId === setting.id) {
      switch (setting.type) {
        case 'boolean':
          return (
            <Switch
              checked={editingValue}
              onCheckedChange={setEditingValue}
              disabled={!setting.isEditable}
            />
          );
        case 'select':
          return (
            <Select value={editingValue} onValueChange={setEditingValue}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {setting.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        case 'number':
          return (
            <Input
              type="number"
              value={editingValue}
              onChange={(e) => setEditingValue(Number(e.target.value))}
              className="w-48 bg-gray-800 border-gray-700 text-white"
            />
          );
        case 'json':
          return (
            <Textarea
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              className="w-64 bg-gray-800 border-gray-700 text-white"
              rows={3}
            />
          );
        default:
          return (
            <Input
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              className="w-48 bg-gray-800 border-gray-700 text-white"
            />
          );
      }
    }

    // Display mode
    switch (setting.type) {
      case 'boolean':
        return (
          <Switch
            checked={setting.value}
            onCheckedChange={(checked) => settingsStore.updateSetting(setting.id, checked)}
            disabled={!setting.isEditable}
          />
        );
      case 'json':
        try {
          const parsed = typeof setting.value === 'string' ? JSON.parse(setting.value) : setting.value;
          return (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="border-blue-500 text-blue-400 cursor-help">
                  JSON ({Array.isArray(parsed) ? parsed.length : Object.keys(parsed).length} items)
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <pre className="text-xs">{JSON.stringify(parsed, null, 2)}</pre>
              </TooltipContent>
            </Tooltip>
          );
        } catch {
          return <span className="text-red-400 text-sm">Invalid JSON</span>;
        }
      default:
        return <span className="text-white font-mono">{String(setting.value)}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* System Settings Header */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                System Settings & Configuration
              </h3>
              <p className="text-gray-400 text-sm">
                Configure application settings, feature flags, and system parameters
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => settingsStore.exportSettings()}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              
              <Button
                onClick={() => document.getElementById('import-file')?.click()}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
              
              <input
                id="import-file"
                type="file"
                accept=".json"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    settingsStore.importSettings(file).catch(console.error);
                  }
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger 
            value="settings" 
            className="data-[state=active]:bg-gray-700 text-gray-300"
          >
            <Settings className="h-4 w-4 mr-2" />
            System Settings ({settingsStore.settings.length})
          </TabsTrigger>
          <TabsTrigger 
            value="features" 
            className="data-[state=active]:bg-gray-700 text-gray-300"
          >
            <Zap className="h-4 w-4 mr-2" />
            Feature Flags ({settingsStore.featureFlags.length})
          </TabsTrigger>
        </TabsList>

        {/* System Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          {/* Filters */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search settings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
                
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                >
                  <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
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

          {/* Settings by Category */}
          {categories
            .filter(cat => cat !== 'all')
            .filter(cat => selectedCategory === 'all' || selectedCategory === cat)
            .map((category) => {
              const categorySettings = filteredSettings.filter(s => s.category === category);
              if (categorySettings.length === 0) return null;
              
              const IconComponent = getCategoryIcon(category);
              
              return (
                <Card key={category} className="bg-gray-900/50 border-gray-800">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <IconComponent className="h-5 w-5 text-blue-500" />
                      {category} Settings
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Configure {category.toLowerCase()} related parameters
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {categorySettings.map((setting) => (
                        <div
                          key={setting.id}
                          className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-white font-medium">{setting.key}</h4>
                              {!setting.isEditable && (
                                <Badge variant="outline" className="border-red-500 text-red-400 text-xs">
                                  Read Only
                                </Badge>
                              )}
                            </div>
                            <p className="text-gray-400 text-sm">{setting.description}</p>
                            <p className="text-gray-500 text-xs mt-1">
                              Updated by {setting.updatedBy} on {formatDate(setting.updatedAt)}
                            </p>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <div className="min-w-48">
                              {renderSettingValue(setting)}
                            </div>
                            
                            {setting.isEditable && (
                              <div className="flex gap-1">
                                {editingSettingId === setting.id ? (
                                  <>
                                    <Button
                                      onClick={() => handleSaveSetting(setting.id)}
                                      size="sm"
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Save className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      onClick={handleCancelEdit}
                                      variant="outline"
                                      size="sm"
                                      className="border-gray-600 text-gray-300 hover:bg-gray-800"
                                    >
                                      ×
                                    </Button>
                                  </>
                                ) : (
                                  <Button
                                    onClick={() => handleEditSetting(setting)}
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-white"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
        </TabsContent>

        {/* Feature Flags Tab */}
        <TabsContent value="features" className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Feature Flags
                </span>
                <Button
                  onClick={() => settingsStore.fetchFeatureFlags()}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  disabled={settingsStore.isLoading}
                >
                  {settingsStore.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </Button>
              </CardTitle>
              <CardDescription className="text-gray-400">
                Manage feature rollouts and experimental functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settingsStore.featureFlags.map((flag) => {
                  const IconComponent = getFeatureFlagIcon(flag);
                  
                  return (
                    <div
                      key={flag.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <IconComponent
                            className={`h-5 w-5 ${
                              flag.isEnabled ? 'text-green-500' : 'text-gray-500'
                            }`}
                          />
                          <h4 className="text-white font-medium">{flag.name}</h4>
                          <Badge
                            variant="outline"
                            className={`${
                              flag.environment === 'production'
                                ? 'border-green-500 text-green-400 bg-green-500/10'
                                : flag.environment === 'staging'
                                ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10'
                                : flag.environment === 'development'
                                ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                                : 'border-purple-500 text-purple-400 bg-purple-500/10'
                            }`}
                          >
                            {flag.environment}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{flag.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Rollout: {flag.rolloutPercentage}%</span>
                          <span>Roles: {flag.targetRoles.join(', ')}</span>
                          <span>Updated: {formatDate(flag.updatedAt)}</span>
                        </div>
                        
                        {flag.rolloutPercentage < 100 && flag.rolloutPercentage > 0 && (
                          <div className="mt-2">
                            <div className="flex justify-between text-xs text-gray-400 mb-1">
                              <span>Rollout Progress</span>
                              <span>{flag.rolloutPercentage}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all"
                                style={{ width: `${flag.rolloutPercentage}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right mr-4">
                          <div className="text-white font-medium">
                            {flag.isEnabled ? 'Enabled' : 'Disabled'}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {flag.rolloutPercentage}% rollout
                          </div>
                        </div>
                        
                        <Switch
                          checked={flag.isEnabled}
                          onCheckedChange={(checked) => 
                            settingsStore.updateFeatureFlag(flag.id, { isEnabled: checked })
                          }
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
