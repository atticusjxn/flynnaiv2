// Flynn.ai v2 - Simplified Communication Dashboard
// Working demonstration of the communication system interface

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardBody, 
  CardHeader,
  Button,
  Chip,
  Tabs,
  Tab,
  Divider
} from '@nextui-org/react';
import { 
  MessageSquare,
  Mail,
  Phone,
  RefreshCw,
  Send,
  CheckCircle2,
  Clock,
  XCircle,
  Activity,
  BarChart3,
  Calendar,
  FileText
} from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.23, 1, 0.32, 1],
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
  }
};

// Mock data for demonstration
const mockMetrics = {
  overview: {
    total_communications: 247,
    email_count: 156,
    sms_count: 78,
    call_count: 13,
    success_rate: 94.5,
    failed_count: 2
  },
  response_rates: {
    email_open_rate: 78.5,
    sms_response_rate: 45.2,
    call_pickup_rate: 67.8
  }
};

const mockRecentActivity = [
  {
    id: '1',
    communication_type: 'email',
    recipient: 'john@example.com',
    status: 'delivered',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 mins ago
  },
  {
    id: '2', 
    communication_type: 'sms',
    recipient: '+1234567890',
    status: 'sent',
    created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() // 1 hour ago
  },
  {
    id: '3',
    communication_type: 'email',
    recipient: 'mary@company.com',
    status: 'pending',
    created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString() // 1.5 hours ago
  }
];

export default function SimpleCommunicationsPage() {
  const [selectedTab, setSelectedTab] = useState<string>('overview');
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
      <motion.div
        className="container mx-auto px-6 py-8 max-w-7xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div 
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8"
          variants={itemVariants}
        >
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Communication Center
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Manage customer communications and track engagement
            </p>
          </div>

          <Button
            color="primary"
            size="sm"
            isLoading={loading}
            startContent={!loading && <RefreshCw className="h-4 w-4" />}
            onPress={handleRefresh}
            className="bg-gradient-to-r from-blue-600 to-purple-600 font-semibold"
          >
            Refresh
          </Button>
        </motion.div>

        {/* Metrics Overview */}
        <motion.div variants={itemVariants} className="mb-8">
          <MetricsOverview metrics={mockMetrics} />
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs
            selectedKey={selectedTab}
            onSelectionChange={(key) => setSelectedTab(key as string)}
            variant="bordered"
            color="primary"
            className="w-full"
            classNames={{
              tabList: "bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700",
              tab: "data-[selected=true]:bg-primary data-[selected=true]:text-white",
              tabContent: "font-semibold",
              panel: "mt-6"
            }}
          >
            <Tab
              key="overview"
              title={
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Overview
                </div>
              }
            >
              <OverviewPanel activity={mockRecentActivity} />
            </Tab>
            
            <Tab
              key="history"
              title={
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  History
                </div>
              }
            >
              <HistoryPanel activity={mockRecentActivity} />
            </Tab>
            
            <Tab
              key="compose"
              title={
                <div className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Compose
                </div>
              }
            >
              <ComposePanel />
            </Tab>

            <Tab
              key="templates"
              title={
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Templates
                </div>
              }
            >
              <TemplatesPanel />
            </Tab>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Metrics Overview Component
function MetricsOverview({ metrics }: { metrics: any }) {
  const metricCards = [
    {
      title: 'Total Communications',
      value: metrics.overview.total_communications.toLocaleString(),
      icon: MessageSquare,
      color: 'primary' as const,
      trend: '+12.5%',
      subtitle: 'This period'
    },
    {
      title: 'Success Rate',
      value: `${metrics.overview.success_rate.toFixed(1)}%`,
      icon: CheckCircle2,
      color: 'success' as const,
      trend: '+3.2%',
      subtitle: 'Delivery success'
    },
    {
      title: 'Failed Communications',
      value: metrics.overview.failed_count.toString(),
      icon: XCircle,
      color: metrics.overview.failed_count > 0 ? 'danger' : 'default' as const,
      trend: metrics.overview.failed_count > 0 ? 'Need attention' : 'All clear',
      subtitle: 'Last 24 hours'
    },
    {
      title: 'Email Performance',
      value: `${metrics.response_rates.email_open_rate.toFixed(1)}%`,
      icon: Mail,
      color: 'secondary' as const,
      trend: '+5.7%',
      subtitle: 'Open rate'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric, index) => (
        <motion.div
          key={metric.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300">
            <CardBody className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">{metric.title}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{metric.value}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Chip
                      size="sm"
                      variant="flat"
                      color={metric.color}
                      className="text-xs font-medium"
                    >
                      {metric.trend}
                    </Chip>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{metric.subtitle}</span>
                  </div>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-br ${
                  metric.color === 'primary' ? 'from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40' :
                  metric.color === 'success' ? 'from-green-100 to-green-200 dark:from-green-900/40 dark:to-green-800/40' :
                  metric.color === 'danger' ? 'from-red-100 to-red-200 dark:from-red-900/40 dark:to-red-800/40' :
                  metric.color === 'secondary' ? 'from-purple-100 to-purple-200 dark:from-purple-900/40 dark:to-purple-800/40' :
                  'from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600'
                }`}>
                  <metric.icon className={`h-6 w-6 ${
                    metric.color === 'primary' ? 'text-blue-600 dark:text-blue-400' :
                    metric.color === 'success' ? 'text-green-600 dark:text-green-400' :
                    metric.color === 'danger' ? 'text-red-600 dark:text-red-400' :
                    metric.color === 'secondary' ? 'text-purple-600 dark:text-purple-400' :
                    'text-slate-600 dark:text-slate-400'
                  }`} />
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

// Overview Panel Component
function OverviewPanel({ activity }: { activity: any[] }) {
  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/40 dark:to-red-900/40">
            <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
          </div>
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
      </CardHeader>
      <CardBody>
        <RecentActivityList activities={activity} />
      </CardBody>
    </Card>
  );
}

// History Panel Component  
function HistoryPanel({ activity }: { activity: any[] }) {
  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
      <CardBody>
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">Communication History</h3>
          <p className="text-slate-500 dark:text-slate-400">
            Full history functionality would be displayed here with filtering and search capabilities.
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

// Compose Panel Component
function ComposePanel() {
  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
      <CardBody>
        <div className="text-center py-8">
          <Send className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">Compose Communication</h3>
          <p className="text-slate-500 dark:text-slate-400">
            Rich compose interface with templates, scheduling, and preview would be available here.
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

// Templates Panel Component
function TemplatesPanel() {
  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-slate-200 dark:border-slate-700">
      <CardBody>
        <div className="text-center py-8">
          <FileText className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold mb-2">Template Manager</h3>
          <p className="text-slate-500 dark:text-slate-400">
            Template management interface for creating and editing communication templates.
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

// Recent Activity List Component
function RecentActivityList({ activities }: { activities: any[] }) {
  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageSquare className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
        <p className="text-slate-500 dark:text-slate-400">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${getActivityIconBg(activity.communication_type)}`}>
              {getActivityIcon(activity.communication_type)}
            </div>
            <div>
              <p className="text-sm font-medium">
                {activity.communication_type.charAt(0).toUpperCase() + activity.communication_type.slice(1)} to {activity.recipient}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatRelativeTime(activity.created_at)}
              </p>
            </div>
          </div>
          <Chip
            size="sm"
            variant="flat"
            color={getStatusColor(activity.status)}
            className="capitalize"
          >
            {activity.status}
          </Chip>
        </motion.div>
      ))}
    </div>
  );
}

// Helper functions
function getActivityIcon(type: string) {
  switch (type) {
    case 'email':
      return <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
    case 'sms':
      return <MessageSquare className="h-4 w-4 text-green-600 dark:text-green-400" />;
    case 'call':
      return <Phone className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    default:
      return <MessageSquare className="h-4 w-4 text-slate-600 dark:text-slate-400" />;
  }
}

function getActivityIconBg(type: string) {
  switch (type) {
    case 'email':
      return 'bg-blue-100 dark:bg-blue-900/40';
    case 'sms':
      return 'bg-green-100 dark:bg-green-900/40';
    case 'call':
      return 'bg-purple-100 dark:bg-purple-900/40';
    default:
      return 'bg-slate-100 dark:bg-slate-700';
  }
}

function getStatusColor(status: string): 'success' | 'warning' | 'danger' | 'primary' | 'default' {
  switch (status) {
    case 'delivered':
    case 'sent':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
    case 'bounced':
      return 'danger';
    default:
      return 'default';
  }
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  }
}