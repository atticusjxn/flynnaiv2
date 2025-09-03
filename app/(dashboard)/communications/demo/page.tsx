// Flynn.ai v2 - Communications Demo Page
// Clean demonstration of Task 25 Customer Communication System

'use client';

import { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Input,
  Textarea,
  Select,
  SelectItem,
} from '@nextui-org/react';
import {
  MessageSquare,
  Mail,
  Phone,
  Send,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export default function CommunicationsDemo() {
  const [activeTab, setActiveTab] = useState('overview');

  const mockData = {
    metrics: {
      totalCommunications: 247,
      successRate: 94.5,
      emailsSent: 156,
      smsSent: 78,
      failedCount: 2,
    },
    recentActivity: [
      {
        id: 1,
        type: 'email',
        recipient: 'john@company.com',
        status: 'delivered',
        time: '30m ago',
      },
      {
        id: 2,
        type: 'sms',
        recipient: '+1234567890',
        status: 'sent',
        time: '1h ago',
      },
      {
        id: 3,
        type: 'email',
        recipient: 'mary@client.com',
        status: 'pending',
        time: '2h ago',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Communication Center
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Task 25: Customer Communication System Demo
            </p>
          </div>
          <Button
            color="primary"
            startContent={<RefreshCw className="h-4 w-4" />}
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            Refresh
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Communications"
            value={mockData.metrics.totalCommunications.toString()}
            icon={MessageSquare}
            color="primary"
            trend="+12.5%"
          />
          <MetricCard
            title="Success Rate"
            value={`${mockData.metrics.successRate}%`}
            icon={CheckCircle2}
            color="success"
            trend="+3.2%"
          />
          <MetricCard
            title="Emails Sent"
            value={mockData.metrics.emailsSent.toString()}
            icon={Mail}
            color="secondary"
            trend="+8.1%"
          />
          <MetricCard
            title="Failed Communications"
            value={mockData.metrics.failedCount.toString()}
            icon={AlertTriangle}
            color={mockData.metrics.failedCount > 0 ? 'danger' : 'default'}
            trend={
              mockData.metrics.failedCount > 0 ? 'Needs attention' : 'All clear'
            }
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6 bg-white/70 dark:bg-slate-800/70 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
          {[
            { key: 'overview', label: 'Overview', icon: MessageSquare },
            { key: 'compose', label: 'Compose', icon: Send },
            { key: 'history', label: 'History', icon: Clock },
            { key: 'templates', label: 'Templates', icon: Mail },
          ].map((tab) => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'solid' : 'light'}
              color={activeTab === tab.key ? 'primary' : 'default'}
              startContent={<tab.icon className="h-4 w-4" />}
              onPress={() => setActiveTab(tab.key)}
              className={`flex-1 ${activeTab === tab.key ? 'shadow-md' : ''}`}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && <OverviewTab data={mockData} />}
        {activeTab === 'compose' && <ComposeTab />}
        {activeTab === 'history' && (
          <HistoryTab data={mockData.recentActivity} />
        )}
        {activeTab === 'templates' && <TemplatesTab />}
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, color, trend }: any) {
  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
      <CardBody className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {value}
            </p>
            <Chip size="sm" variant="flat" color={color} className="mt-2">
              {trend}
            </Chip>
          </div>
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40">
            <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function OverviewTab({ data }: any) {
  return (
    <div className="space-y-6">
      <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
        <CardHeader>
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {data.recentActivity.map((activity: any) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/40">
                    {activity.type === 'email' ? (
                      <Mail className="h-4 w-4 text-blue-600" />
                    ) : (
                      <MessageSquare className="h-4 w-4 text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">
                      {activity.type.toUpperCase()} to {activity.recipient}
                    </p>
                    <p className="text-sm text-slate-500">{activity.time}</p>
                  </div>
                </div>
                <Chip
                  size="sm"
                  color={
                    activity.status === 'delivered'
                      ? 'success'
                      : activity.status === 'pending'
                        ? 'warning'
                        : 'default'
                  }
                  variant="flat"
                >
                  {activity.status}
                </Chip>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function ComposeTab() {
  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
      <CardHeader>
        <h3 className="text-lg font-semibold">Compose New Communication</h3>
      </CardHeader>
      <CardBody className="space-y-4">
        <Select label="Communication Type" placeholder="Select type">
          <SelectItem key="email">Email</SelectItem>
          <SelectItem key="sms">SMS</SelectItem>
        </Select>
        <Input label="Recipient" placeholder="Enter recipient..." />
        <Input label="Subject" placeholder="Enter subject..." />
        <Textarea
          label="Message"
          placeholder="Enter your message..."
          minRows={6}
        />
        <div className="flex justify-end gap-3">
          <Button variant="flat">Save Draft</Button>
          <Button color="primary" startContent={<Send className="h-4 w-4" />}>
            Send Communication
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}

function HistoryTab({ data }: any) {
  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
      <CardHeader>
        <h3 className="text-lg font-semibold">Communication History</h3>
      </CardHeader>
      <CardBody>
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">
            Full history with advanced filtering would be displayed here
          </p>
        </div>
      </CardBody>
    </Card>
  );
}

function TemplatesTab() {
  return (
    <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
      <CardHeader>
        <h3 className="text-lg font-semibold">Communication Templates</h3>
      </CardHeader>
      <CardBody>
        <div className="text-center py-8">
          <Mail className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">
            Template management interface would be displayed here
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
