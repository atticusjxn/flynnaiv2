'use client';

import { useAuthContext } from '@/components/AuthProvider';
import KPICards from '@/components/dashboard/KPICards';
import RecentActivity from '@/components/dashboard/RecentActivity';
import QuickActions from '@/components/dashboard/QuickActions';

const formatIndustryName = (industryType: string) => {
  const industryNames: Record<string, string> = {
    plumbing: 'Plumbing & HVAC',
    real_estate: 'Real Estate',
    legal: 'Legal Services',
    medical: 'Medical Practice',
    sales: 'Sales & Business Dev',
    consulting: 'Consulting',
    general_services: 'General Services',
    other: 'Other',
  };
  
  return industryNames[industryType] || industryType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function DashboardPage() {
  const { user, profile, loading } = useAuthContext();

  if (loading) {
    return (
      <div className="min-h-full flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
          <span className="text-muted-foreground font-medium">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700 min-h-full">
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-muted-foreground text-lg">
              Here's what's happening with your AI call automation today.
            </p>
          </div>
          
          {profile?.industry_type && (
            <div className="mt-4 lg:mt-0">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                <span className="text-sm font-semibold text-blue-700">
                  {formatIndustryName(profile.industry_type)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <section>
        <KPICards />
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Activity - Takes up 2/3 on large screens */}
        <div className="xl:col-span-2">
          <RecentActivity />
        </div>
        
        {/* Quick Actions - Takes up 1/3 on large screens */}
        <div className="space-y-8">
          {/* Profile Overview Card */}
          <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-xl font-bold text-white">
                  {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {profile?.full_name || 'User'}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {profile?.company_name || user?.email}
                </p>
                
                <div className="flex items-center space-x-2">
                  <div className="inline-flex items-center px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5"></div>
                    {profile?.subscription_tier?.toUpperCase() || 'BASIC'} PLAN
                  </div>
                </div>
              </div>
            </div>
            
            {/* Setup Progress */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Setup Progress</span>
                <span className="text-sm text-muted-foreground">3/5 Complete</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500" style={{ width: '60%' }}></div>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Complete your Twilio and calendar integration to unlock full automation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section */}
      <section>
        <QuickActions />
      </section>
    </div>
  );
}