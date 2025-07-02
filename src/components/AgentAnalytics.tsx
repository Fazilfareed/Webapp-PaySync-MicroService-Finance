import { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  FileText,
  Calendar,
  Target,
  Award,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { formatCurrency, formatNumber, formatPercentage } from '../lib/utils';

interface PerformanceMetric {
  id: string;
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
  target?: number;
  achieved?: number;
  icon: any;
  color: string;
}

interface MonthlyTarget {
  month: string;
  borrowersTarget: number;
  borrowersAchieved: number;
  loansTarget: number;
  loansAchieved: number;
  commissionTarget: number;
  commissionAchieved: number;
}

export const AgentAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');

  const performanceMetrics: PerformanceMetric[] = [
    {
      id: 'borrowers',
      title: 'Borrowers Registered',
      value: '24',
      change: 12.5,
      trend: 'up',
      target: 30,
      achieved: 24,
      icon: Users,
      color: 'text-blue-500',
    },
    {
      id: 'loans',
      title: 'Loans Processed',
      value: '18',
      change: 8.3,
      trend: 'up',
      target: 20,
      achieved: 18,
      icon: FileText,
      color: 'text-green-500',
    },
    {
      id: 'commission',
      title: 'Commission Earned',
      value: formatCurrency(45000),
      change: -5.2,
      trend: 'down',
      target: 50000,
      achieved: 45000,
      icon: DollarSign,
      color: 'text-purple-500',
    },
    {
      id: 'conversion',
      title: 'Conversion Rate',
      value: '75%',
      change: 3.1,
      trend: 'up',
      target: 80,
      achieved: 75,
      icon: Target,
      color: 'text-orange-500',
    },
  ];

  const monthlyTargets: MonthlyTarget[] = [
    {
      month: 'January',
      borrowersTarget: 30,
      borrowersAchieved: 24,
      loansTarget: 20,
      loansAchieved: 18,
      commissionTarget: 50000,
      commissionAchieved: 45000,
    },
    {
      month: 'December',
      borrowersTarget: 25,
      borrowersAchieved: 28,
      loansTarget: 18,
      loansAchieved: 22,
      commissionTarget: 45000,
      commissionAchieved: 52000,
    },
    {
      month: 'November',
      borrowersTarget: 25,
      borrowersAchieved: 23,
      loansTarget: 18,
      loansAchieved: 16,
      commissionTarget: 45000,
      commissionAchieved: 38000,
    },
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getAchievementBadge = (achieved: number, target: number) => {
    const percentage = (achieved / target) * 100;
    if (percentage >= 100) return <Badge className="bg-green-500">Exceeded</Badge>;
    if (percentage >= 90) return <Badge className="bg-yellow-500">On Track</Badge>;
    return <Badge variant="destructive">Behind</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Overview
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Track your key performance indicators and targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceMetrics.map((metric) => {
              const Icon = metric.icon;
              const progressPercentage = metric.target && metric.achieved 
                ? (metric.achieved / metric.target) * 100 
                : 0;

              return (
                <Card key={metric.id} className="bg-accent border-border">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {metric.title}
                    </CardTitle>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-1">
                        {getTrendIcon(metric.trend)}
                        <span className={`text-xs ${
                          metric.trend === 'up' ? 'text-green-500' : 
                          metric.trend === 'down' ? 'text-red-500' : 'text-yellow-500'
                        }`}>
                          {Math.abs(metric.change)}%
                        </span>
                      </div>
                      {metric.target && metric.achieved && (
                        <span className="text-xs text-muted-foreground">
                          {metric.achieved}/{metric.target}
                        </span>
                      )}
                    </div>
                    {metric.target && metric.achieved && (
                      <div className="mt-3">
                        <Progress 
                          value={progressPercentage} 
                          className="h-2"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Target Progress</span>
                          <span>{Math.round(progressPercentage)}%</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analytics */}
      <Tabs defaultValue="targets" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 bg-card border-border">
          <TabsTrigger value="targets" className="data-[state=active]:bg-accent">
            Monthly Targets
          </TabsTrigger>
          <TabsTrigger value="ranking" className="data-[state=active]:bg-accent">
            Ranking & Rewards
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-accent">
            Performance Insights
          </TabsTrigger>
        </TabsList>

        {/* Monthly Targets */}
        <TabsContent value="targets">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Target className="h-5 w-5" />
                Monthly Targets & Achievements
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Track your monthly targets and actual achievements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-muted-foreground">Month</TableHead>
                    <TableHead className="text-muted-foreground">Borrowers</TableHead>
                    <TableHead className="text-muted-foreground">Loans</TableHead>
                    <TableHead className="text-muted-foreground">Commission</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyTargets.map((target, index) => (
                    <TableRow key={index} className="border-border">
                      <TableCell className="text-foreground font-medium">
                        {target.month}
                      </TableCell>
                      <TableCell className="text-foreground">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{target.borrowersAchieved}/{target.borrowersTarget}</span>
                            <span>{Math.round((target.borrowersAchieved / target.borrowersTarget) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(target.borrowersAchieved / target.borrowersTarget) * 100} 
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{target.loansAchieved}/{target.loansTarget}</span>
                            <span>{Math.round((target.loansAchieved / target.loansTarget) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(target.loansAchieved / target.loansTarget) * 100} 
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{formatCurrency(target.commissionAchieved)}</span>
                            <span>{Math.round((target.commissionAchieved / target.commissionTarget) * 100)}%</span>
                          </div>
                          <Progress 
                            value={(target.commissionAchieved / target.commissionTarget) * 100} 
                            className="h-2"
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        {getAchievementBadge(
                          (target.borrowersAchieved + target.loansAchieved + (target.commissionAchieved / 1000)) / 3,
                          (target.borrowersTarget + target.loansTarget + (target.commissionTarget / 1000)) / 3
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ranking & Rewards */}
        <TabsContent value="ranking">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Award className="h-5 w-5" />
                Agent Ranking & Rewards
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Your performance ranking and earned rewards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground">#3</div>
                    <div className="text-sm text-muted-foreground">Regional Ranking</div>
                    <Badge className="mt-2 bg-orange-500">Top Performer</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Points Earned:</span>
                      <span className="text-foreground font-medium">2,450</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Next Milestone:</span>
                      <span className="text-foreground font-medium">2,800</span>
                    </div>
                    <Progress value={87.5} className="h-2" />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Achievements</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-500">✓</Badge>
                      <span className="text-sm text-foreground">25+ Borrowers Registered</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className="bg-green-500">✓</Badge>
                      <span className="text-sm text-foreground">90% Approval Rate</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">○</Badge>
                      <span className="text-sm text-muted-foreground">Monthly Target Met</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-foreground">Rewards Earned</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Performance Bonus:</span>
                      <span className="text-sm text-foreground">{formatCurrency(5000)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Referral Bonus:</span>
                      <span className="text-sm text-foreground">{formatCurrency(2500)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Quality Bonus:</span>
                      <span className="text-sm text-foreground">{formatCurrency(1500)}</span>
                    </div>
                    <div className="border-t border-border pt-2 mt-2">
                      <div className="flex justify-between font-medium">
                        <span className="text-foreground">Total Rewards:</span>
                        <span className="text-foreground">{formatCurrency(9000)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Insights */}
        <TabsContent value="insights">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Performance Insights & Recommendations
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                AI-powered insights to improve your performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Key Insights</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-accent rounded-lg">
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              Strong Borrower Engagement
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Your approval rate increased by 12% this month
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-accent rounded-lg">
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              Document Processing Delay
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Average processing time: 3.2 days vs target 2 days
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="p-3 bg-accent rounded-lg">
                        <div className="flex items-start space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                          <div>
                            <p className="text-sm font-medium text-foreground">
                              Commission Below Target
                            </p>
                            <p className="text-xs text-muted-foreground">
                              10% below monthly target - focus on higher value loans
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-foreground">Recommendations</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-accent rounded-lg">
                        <p className="text-sm font-medium text-foreground mb-1">
                          Improve Document Processing
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Schedule dedicated time slots for document review to reduce processing delays
                        </p>
                      </div>
                      <div className="p-3 bg-accent rounded-lg">
                        <p className="text-sm font-medium text-foreground mb-1">
                          Focus on High-Value Loans
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Target borrowers seeking loans above LKR 500,000 to increase commission
                        </p>
                      </div>
                      <div className="p-3 bg-accent rounded-lg">
                        <p className="text-sm font-medium text-foreground mb-1">
                          Leverage Peak Hours
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Most successful registrations occur between 10 AM - 2 PM
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <h4 className="font-medium text-foreground mb-3">Next Steps</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
                      <span className="text-sm text-foreground">Complete 6 more loan applications to meet monthly target</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
                      <span className="text-sm text-foreground">Upload pending documents for 3 borrowers</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-500 rounded"></div>
                      <span className="text-sm text-foreground">Follow up with 8 potential borrowers from last week</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
