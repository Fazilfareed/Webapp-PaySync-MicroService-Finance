import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  TrendingUp,
  DollarSign,
  Users,
  CreditCard,
  Target,
  MapPin,
  BarChart3,
  PieChart,
  Download,
  Calendar,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { useDashboardStore } from '../../store/dashboardStore';
import { formatCurrency, formatDate, formatNumber, formatPercentage } from '../../lib/utils';

const CEODashboard = () => {
  const location = useLocation();
  const { stats, regions, fetchDashboardStats, fetchRegions, isLoading } = useDashboardStore();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchDashboardStats();
    fetchRegions();
  }, [fetchDashboardStats, fetchRegions]);

  // Set active tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/analytics')) setActiveTab('analytics');
    else if (path.includes('/reports')) setActiveTab('reports');
    else if (path.includes('/regions')) setActiveTab('regions');
    else if (path.includes('/kpis')) setActiveTab('kpis');
    else setActiveTab('overview');
  }, [location.pathname]);

  if (isLoading || !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalLoanAmount),
      description: 'Lifetime revenue',
      icon: DollarSign,
      color: 'text-green-500',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Monthly Revenue',
      value: formatCurrency(stats.monthlyRevenue),
      description: 'This month',
      icon: TrendingUp,
      color: 'text-blue-500',
      trend: '+8.2%',
      trendUp: true,
    },
    {
      title: 'Active Customers',
      value: formatNumber(stats.totalBorrowers),
      description: 'Total borrowers',
      icon: Users,
      color: 'text-purple-500',
      trend: '+15.7%',
      trendUp: true,
    },
    {
      title: 'Loan Portfolio',
      value: formatNumber(stats.activeLoans),
      description: 'Active loans',
      icon: CreditCard,
      color: 'text-yellow-500',
      trend: '+6.3%',
      trendUp: true,
    },
    {
      title: 'Default Rate',
      value: formatPercentage((stats.defaultedLoans / stats.totalLoans) * 100),
      description: 'Current period',
      icon: Target,
      color: 'text-red-500',
      trend: '-2.1%',
      trendUp: false,
    },
    {
      title: 'Active Regions',
      value: formatNumber(stats.regionsActive),
      description: 'Operational regions',
      icon: MapPin,
      color: 'text-cyan-500',
      trend: '+4 new',
      trendUp: true,
    },
  ];

  // Mock chart data
  const monthlyRevenueData = [
    { month: 'Jan', revenue: 8500000, loans: 145 },
    { month: 'Feb', revenue: 9200000, loans: 162 },
    { month: 'Mar', revenue: 11800000, loans: 198 },
    { month: 'Apr', revenue: 13200000, loans: 224 },
    { month: 'May', revenue: 12900000, loans: 216 },
    { month: 'Jun', revenue: 15600000, loans: 267 },
  ];

  const topRegionsByRevenue = regions
    .sort((a, b) => b.totalLoanAmount - a.totalLoanAmount)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">CEO Dashboard</h1>
          <p className="text-gray-400 mt-1">Business intelligence and performance overview</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="border-violet-500 text-violet-400">
            CEO Access
          </Badge>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Reports
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-gray-900 border-gray-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-gray-800">
            Business Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-gray-800">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="data-[state=active]:bg-gray-800">
            Performance Reports
          </TabsTrigger>
          <TabsTrigger value="regions" className="data-[state=active]:bg-gray-800">
            Regional Overview
          </TabsTrigger>
          <TabsTrigger value="kpis" className="data-[state=active]:bg-gray-800">
            KPI Monitoring
          </TabsTrigger>
        </TabsList>

        {/* Business Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpiCards.map((card, index) => {
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
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">{card.description}</p>
                      <Badge
                        variant="outline"
                        className={
                          card.trendUp
                            ? 'border-green-500 text-green-400'
                            : 'border-red-500 text-red-400'
                        }
                      >
                        {card.trend}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Executive Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Monthly Growth Trend</CardTitle>
                <CardDescription className="text-gray-400">
                  Revenue and loan disbursement over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyRevenueData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-gray-400 w-8">{item.month}</span>
                        <div className="flex-1">
                          <Progress
                            value={(item.revenue / 16000000) * 100}
                            className="h-2"
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-sm">
                          {formatCurrency(item.revenue)}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {item.loans} loans
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">Top Performing Regions</CardTitle>
                <CardDescription className="text-gray-400">
                  By total loan portfolio value
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topRegionsByRevenue.map((region, index) => (
                    <div key={region.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className="w-6 h-6 rounded-full text-xs">
                          {index + 1}
                        </Badge>
                        <div>
                          <div className="text-white text-sm">{region.district}</div>
                          <div className="text-gray-500 text-xs">
                            {region.activeLoans} active loans
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-sm">
                          {formatCurrency(region.totalLoanAmount)}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {region.agentCount} agents
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Business Intelligence Dashboard
              </CardTitle>
              <CardDescription className="text-gray-400">
                Advanced analytics and data insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">
                    {formatPercentage(94.2)}
                  </div>
                  <div className="text-sm text-gray-400">Approval Rate</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-blue-400">
                    {formatNumber(23)}
                  </div>
                  <div className="text-sm text-gray-400">Avg. Processing Days</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-purple-400">
                    {formatCurrency(847000)}
                  </div>
                  <div className="text-sm text-gray-400">Avg. Loan Amount</div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-400">
                    {formatPercentage(96.8)}
                  </div>
                  <div className="text-sm text-gray-400">Collection Rate</div>
                </div>
              </div>

              <div className="text-center py-8 text-gray-500">
                Advanced analytics charts and visualizations would be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Performance Reports
              </CardTitle>
              <CardDescription className="text-gray-400">
                Comprehensive business performance analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                <Button className="h-24 flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700">
                  <BarChart3 className="h-6 w-6 mb-2" />
                  Monthly Report
                </Button>
                <Button className="h-24 flex flex-col items-center justify-center bg-green-600 hover:bg-green-700">
                  <TrendingUp className="h-6 w-6 mb-2" />
                  Growth Analysis
                </Button>
                <Button className="h-24 flex flex-col items-center justify-center bg-purple-600 hover:bg-purple-700">
                  <Target className="h-6 w-6 mb-2" />
                  KPI Dashboard
                </Button>
                <Button className="h-24 flex flex-col items-center justify-center bg-yellow-600 hover:bg-yellow-700">
                  <MapPin className="h-6 w-6 mb-2" />
                  Regional Analysis
                </Button>
                <Button className="h-24 flex flex-col items-center justify-center bg-red-600 hover:bg-red-700">
                  <Users className="h-6 w-6 mb-2" />
                  Customer Insights
                </Button>
                <Button className="h-24 flex flex-col items-center justify-center bg-cyan-600 hover:bg-cyan-700">
                  <Calendar className="h-6 w-6 mb-2" />
                  Quarterly Review
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regional Overview Tab */}
        <TabsContent value="regions" className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Regional Performance Overview
              </CardTitle>
              <CardDescription className="text-gray-400">
                Geographic performance analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regions.slice(0, 9).map((region) => (
                  <Card key={region.id} className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-sm">{region.district}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {region.province}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Portfolio Value:</span>
                          <span className="text-white">
                            {formatCurrency(region.totalLoanAmount)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Active Loans:</span>
                          <span className="text-white">{region.activeLoans}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Customers:</span>
                          <span className="text-white">{region.borrowerCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Agents:</span>
                          <span className="text-white">{region.agentCount}</span>
                        </div>
                        <div className="pt-2">
                          <Progress
                            value={(region.activeLoans / region.borrowerCount) * 100}
                            className="h-2"
                          />
                          <div className="text-xs text-gray-500 mt-1">
                            Loan Conversion Rate
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KPI Monitoring Tab */}
        <TabsContent value="kpis" className="space-y-4">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Target className="h-5 w-5" />
                Key Performance Indicators
              </CardTitle>
              <CardDescription className="text-gray-400">
                Real-time business metrics monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                KPI monitoring dashboard would be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CEODashboard;
