import { useState } from 'react';
import {
  Code,
  Database,
  Monitor,
  Server,
  Play,
  Pause,
  RotateCcw,
  Download,
  Upload,
  Search,
  Terminal,
  Activity,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Globe,
  FileText,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  RefreshCw,
  Loader2,
  ExternalLink,
  Copy,
  Save,
  Trash2,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Progress } from '../ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

import { useDeveloperToolsStore } from '../../store/developerToolsStore';
import { formatDate, formatNumber } from '../../lib/utils';

export default function DeveloperTools() {
  const devToolsStore = useDeveloperToolsStore();
  const [apiTestEndpoint, setApiTestEndpoint] = useState('');
  const [apiTestMethod, setApiTestMethod] = useState('GET');
  const [apiTestHeaders, setApiTestHeaders] = useState('{}');
  const [apiTestBody, setApiTestBody] = useState('{}');
  const [dbQuery, setDbQuery] = useState('');
  const [selectedTable, setSelectedTable] = useState('');

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  const handleApiTest = async () => {
    try {
      const headers = JSON.parse(apiTestHeaders);
      const body = apiTestMethod !== 'GET' ? JSON.parse(apiTestBody) : undefined;
      
      await devToolsStore.testApiEndpoint({
        endpoint: apiTestEndpoint,
        method: apiTestMethod,
        headers,
        body,
      });
    } catch (error) {
      console.error('API test error:', error);
    }
  };

  const handleDbQuery = async () => {
    try {
      await devToolsStore.runDatabaseQuery(dbQuery);
    } catch (error) {
      console.error('Database query error:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Developer Tools Header */}
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Code className="h-5 w-5 text-green-500" />
                Developer Tools & Diagnostics
              </h3>
              <p className="text-gray-400 text-sm">
                Advanced system monitoring, API testing, and database management tools
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                onClick={() => devToolsStore.generateDiagnosticReport()}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                <Download className="h-4 w-4 mr-2" />
                Diagnostic Report
              </Button>
              
              <Button
                onClick={() => devToolsStore.clearCache()}
                variant="outline"
                size="sm"
                className="border-yellow-600 text-yellow-400 hover:bg-yellow-600/20"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cache
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="system" className="space-y-4">
        <TabsList className="bg-gray-800 border border-gray-700">
          <TabsTrigger 
            value="system" 
            className="data-[state=active]:bg-gray-700 text-gray-300"
          >
            <Monitor className="h-4 w-4 mr-2" />
            System Health
          </TabsTrigger>
          <TabsTrigger 
            value="api" 
            className="data-[state=active]:bg-gray-700 text-gray-300"
          >
            <Globe className="h-4 w-4 mr-2" />
            API Explorer
          </TabsTrigger>
          <TabsTrigger 
            value="database" 
            className="data-[state=active]:bg-gray-700 text-gray-300"
          >
            <Database className="h-4 w-4 mr-2" />
            Database
          </TabsTrigger>
          <TabsTrigger 
            value="performance" 
            className="data-[state=active]:bg-gray-700 text-gray-300"
          >
            <Activity className="h-4 w-4 mr-2" />
            Performance
          </TabsTrigger>
        </TabsList>

        {/* System Health Tab */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Overview */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Server className="h-5 w-5 text-blue-500" />
                    System Overview
                  </span>
                  <Button
                    onClick={() => devToolsStore.fetchSystemHealth()}
                    variant="ghost"
                    size="sm"
                    disabled={devToolsStore.isLoading}
                  >
                    {devToolsStore.isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {devToolsStore.systemHealth && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 rounded-lg bg-gray-800/50">
                        <div className={`text-2xl font-bold ${
                          devToolsStore.systemHealth.status === 'healthy' 
                            ? 'text-green-400' 
                            : devToolsStore.systemHealth.status === 'warning'
                            ? 'text-yellow-400'
                            : 'text-red-400'
                        }`}>
                          {devToolsStore.systemHealth.status.toUpperCase()}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">System Status</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-gray-800/50">
                        <div className="text-2xl font-bold text-blue-400">
                          {formatUptime(devToolsStore.systemHealth.uptime)}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Uptime</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400 flex items-center gap-2">
                            <Cpu className="h-4 w-4" />
                            CPU Usage
                          </span>
                          <span className="text-white">{devToolsStore.systemHealth.cpuUsage.toFixed(1)}%</span>
                        </div>
                        <Progress value={devToolsStore.systemHealth.cpuUsage} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400 flex items-center gap-2">
                            <MemoryStick className="h-4 w-4" />
                            Memory Usage
                          </span>
                          <span className="text-white">{devToolsStore.systemHealth.memoryUsage.toFixed(1)}%</span>
                        </div>
                        <Progress value={devToolsStore.systemHealth.memoryUsage} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400 flex items-center gap-2">
                            <HardDrive className="h-4 w-4" />
                            Disk Usage
                          </span>
                          <span className="text-white">{devToolsStore.systemHealth.diskUsage.toFixed(1)}%</span>
                        </div>
                        <Progress value={devToolsStore.systemHealth.diskUsage} className="h-2" />
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400 flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            DB Connections
                          </span>
                          <span className="text-white">{devToolsStore.systemHealth.databaseConnections}/50</span>
                        </div>
                        <Progress value={(devToolsStore.systemHealth.databaseConnections / 50) * 100} className="h-2" />
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Service Status */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  Service Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {devToolsStore.systemHealth?.services.map((service) => (
                    <div key={service.name} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          service.status === 'running' ? 'bg-green-500' : 
                          service.status === 'stopped' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <p className="text-sm font-medium text-white">{service.name}</p>
                          <p className="text-xs text-gray-400">{service.responseTime}ms</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
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
                        {service.status !== 'running' && (
                          <Button
                            onClick={() => devToolsStore.restartService(service.name)}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2"
                          >
                            <Play className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Explorer Tab */}
        <TabsContent value="api" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* API Tester */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-green-500" />
                  API Tester
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Test API endpoints and view responses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  <Select value={apiTestMethod} onValueChange={setApiTestMethod}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                      <SelectItem value="PATCH">PATCH</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="/api/v1/endpoint"
                    value={apiTestEndpoint}
                    onChange={(e) => setApiTestEndpoint(e.target.value)}
                    className="col-span-3 bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Headers (JSON)</label>
                  <Textarea
                    value={apiTestHeaders}
                    onChange={(e) => setApiTestHeaders(e.target.value)}
                    placeholder='{"Authorization": "Bearer token"}'
                    className="bg-gray-800 border-gray-700 text-white font-mono text-sm"
                    rows={3}
                  />
                </div>
                
                {apiTestMethod !== 'GET' && (
                  <div>
                    <label className="text-sm text-gray-400 mb-2 block">Body (JSON)</label>
                    <Textarea
                      value={apiTestBody}
                      onChange={(e) => setApiTestBody(e.target.value)}
                      placeholder='{"key": "value"}'
                      className="bg-gray-800 border-gray-700 text-white font-mono text-sm"
                      rows={4}
                    />
                  </div>
                )}
                
                <Button
                  onClick={handleApiTest}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Send Request
                </Button>
              </CardContent>
            </Card>

            {/* API Endpoints */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-500" />
                  Available Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {devToolsStore.apiEndpoints.map((endpoint) => (
                      <div
                        key={endpoint.id}
                        className="p-3 rounded-lg bg-gray-800/50 border border-gray-700 cursor-pointer hover:bg-gray-800"
                        onClick={() => setApiTestEndpoint(endpoint.path)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                endpoint.method === 'GET'
                                  ? 'border-green-500 text-green-400'
                                  : endpoint.method === 'POST'
                                  ? 'border-blue-500 text-blue-400'
                                  : endpoint.method === 'PUT'
                                  ? 'border-yellow-500 text-yellow-400'
                                  : 'border-red-500 text-red-400'
                              }`}
                            >
                              {endpoint.method}
                            </Badge>
                            <code className="text-white text-sm">{endpoint.path}</code>
                          </div>
                          <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                            {endpoint.category}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-xs">{endpoint.description}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* API Test History */}
          {devToolsStore.apiTestHistory.length > 0 && (
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-purple-500" />
                    Test History
                  </span>
                  <Button
                    onClick={() => devToolsStore.clearTestHistory()}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {devToolsStore.apiTestHistory.map((test, index) => (
                      <div key={index} className="p-3 rounded-lg bg-gray-800/50 border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                test.request.method === 'GET'
                                  ? 'border-green-500 text-green-400'
                                  : 'border-blue-500 text-blue-400'
                              }`}
                            >
                              {test.request.method}
                            </Badge>
                            <code className="text-white text-sm">{test.request.endpoint}</code>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                test.response.status >= 200 && test.response.status < 300
                                  ? 'border-green-500 text-green-400'
                                  : test.response.status >= 400
                                  ? 'border-red-500 text-red-400'
                                  : 'border-yellow-500 text-yellow-400'
                              }`}
                            >
                              {test.response.status}
                            </Badge>
                            <span className="text-gray-400 text-xs">{test.response.responseTime}ms</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(test.response.timestamp)}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Query Console */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-green-500" />
                  Query Console
                </CardTitle>
                <CardDescription className="text-gray-400">
                  Execute SQL queries against the database
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={dbQuery}
                  onChange={(e) => setDbQuery(e.target.value)}
                  placeholder="SELECT * FROM users LIMIT 10;"
                  className="bg-gray-800 border-gray-700 text-white font-mono"
                  rows={6}
                />
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleDbQuery}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Execute Query
                  </Button>
                  
                  <Button
                    onClick={() => setDbQuery('')}
                    variant="outline"
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Table Browser */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  Table Browser
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Select value={selectedTable} onValueChange={setSelectedTable}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select a table" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {devToolsStore.databaseTables.map((table) => (
                        <SelectItem key={table.name} value={table.name}>
                          {table.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedTable && (
                    <div className="space-y-3">
                      {(() => {
                        const table = devToolsStore.databaseTables.find(t => t.name === selectedTable);
                        return table ? (
                          <>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Records:</span>
                                <span className="text-white ml-2">{formatNumber(table.recordCount)}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Size:</span>
                                <span className="text-white ml-2">{formatBytes(table.sizeBytes)}</span>
                              </div>
                            </div>
                            
                            <Button
                              onClick={() => devToolsStore.exportTableData(selectedTable)}
                              variant="outline"
                              size="sm"
                              className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Export Data
                            </Button>
                          </>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Database Tables Overview */}
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white">Database Tables</CardTitle>
              <CardDescription className="text-gray-400">
                Overview of all database tables and their statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border border-gray-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-800 bg-gray-800/50">
                      <TableHead className="text-gray-300 font-medium">Table</TableHead>
                      <TableHead className="text-gray-300 font-medium">Records</TableHead>
                      <TableHead className="text-gray-300 font-medium">Size</TableHead>
                      <TableHead className="text-gray-300 font-medium">Columns</TableHead>
                      <TableHead className="text-gray-300 font-medium">Last Modified</TableHead>
                      <TableHead className="text-gray-300 font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {devToolsStore.databaseTables.map((table) => (
                      <TableRow key={table.name} className="border-gray-800 hover:bg-gray-800/30">
                        <TableCell>
                          <div>
                            <p className="text-white font-medium">{table.name}</p>
                            <p className="text-gray-400 text-sm">{table.description}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-white">
                          {formatNumber(table.recordCount)}
                        </TableCell>
                        <TableCell className="text-white">
                          {formatBytes(table.sizeBytes)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-blue-500 text-blue-400">
                            {table.columns.length} columns
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          {formatDate(table.lastModified)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              onClick={() => setDbQuery(`SELECT * FROM ${table.name} LIMIT 10;`)}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                            >
                              <Search className="h-4 w-4" />
                            </Button>
                            <Button
                              onClick={() => devToolsStore.exportTableData(table.name)}
                              variant="ghost"
                              size="sm"
                              className="h-8 px-2"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-4">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-500" />
                Performance Metrics
              </CardTitle>
              <CardDescription className="text-gray-400">
                Real-time performance monitoring and historical data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {devToolsStore.performanceMetrics.length > 0 && (() => {
                  const latest = devToolsStore.performanceMetrics[devToolsStore.performanceMetrics.length - 1];
                  return (
                    <>
                      <div className="text-center p-3 rounded-lg bg-gray-800/50">
                        <div className="text-2xl font-bold text-blue-400">
                          {latest.cpuUsage.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400 mt-1">CPU Usage</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-gray-800/50">
                        <div className="text-2xl font-bold text-green-400">
                          {latest.memoryUsage.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Memory Usage</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-gray-800/50">
                        <div className="text-2xl font-bold text-yellow-400">
                          {latest.activeUsers}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Active Users</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-gray-800/50">
                        <div className="text-2xl font-bold text-purple-400">
                          {latest.responseTime.toFixed(0)}ms
                        </div>
                        <div className="text-xs text-gray-400 mt-1">Response Time</div>
                      </div>
                    </>
                  );
                })()}
              </div>
              
              <div className="text-center py-8 text-gray-500">
                Performance charts would be rendered here with real-time data
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
