'use client';

import KPICards from '@/components/dashboard/KPICards';
import RecentActivity from '@/components/dashboard/RecentActivity';
import QuickActions from '@/components/dashboard/QuickActions';
import AIProcessingToggle from '@/components/dashboard/AIProcessingToggle';
import { AUSTRALIAN_INDUSTRY_CONFIG } from '@/utils/constants';

interface DashboardContentProps {
  user: any;
  profile: any;
}

const formatIndustryName = (industryType: string) => {
  // Use Australian industry configuration first
  if (industryType in AUSTRALIAN_INDUSTRY_CONFIG) {
    return AUSTRALIAN_INDUSTRY_CONFIG[
      industryType as keyof typeof AUSTRALIAN_INDUSTRY_CONFIG
    ].displayName;
  }

  // Fallback to generic names
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

  return (
    industryNames[industryType] ||
    industryType.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  );
};

const getIndustryContext = (industryType: string) => {
  if (industryType in AUSTRALIAN_INDUSTRY_CONFIG) {
    const config =
      AUSTRALIAN_INDUSTRY_CONFIG[
        industryType as keyof typeof AUSTRALIAN_INDUSTRY_CONFIG
      ];
    return {
      businessHours: config.businessHours,
      averageRate:
        (config.australianContext as any).averageRate ||
        (config.australianContext as any).averageCommission,
      peakSeason: (config.australianContext as any).peakSeason,
      regulations: config.australianContext.regulations,
    };
  }
  return null;
};

export default function DashboardContent({ user, profile }: DashboardContentProps) {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 min-h-full">
      {/* Premium Welcome Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-indigo-50/20 to-purple-50/30 rounded-3xl" />
        <div className="relative p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              <h1 className="text-4xl font-bold text-foreground mb-3 leading-tight">
                Welcome back
                {profile?.full_name
                  ? `, ${profile.full_name.split(' ')[0]}`
                  : ''}
                !
              </h1>
              <p className="text-muted-foreground text-xl leading-relaxed max-w-2xl">
                Here's what's happening with your AI call automation today.
              </p>

              {/* Premium underline accent */}
              <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mt-4 animate-in fade-in duration-700 delay-200" />
            </div>

            {profile?.industry_type && (
              <div className="mt-6 lg:mt-0 animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
                <div className="group relative">
                  <div className="inline-flex items-center px-5 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/60 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-help">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
                    <span className="text-sm font-bold text-blue-800 tracking-wide">
                      {formatIndustryName(profile.industry_type)}
                    </span>
                    <span className="ml-2 text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-medium">
                      AUS
                    </span>
                  </div>

                  {/* Australian Industry Context Tooltip */}
                  {getIndustryContext(profile.industry_type) && (
                    <div className="absolute top-full left-0 mt-2 p-4 bg-white border border-gray-200 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20 min-w-80">
                      {(() => {
                        const context = getIndustryContext(
                          profile.industry_type
                        );
                        return context ? (
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Business Hours:
                              </span>
                              <span className="font-medium text-gray-800">
                                {context.businessHours}
                              </span>
                            </div>
                            {context.averageRate && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Average Rate:
                                </span>
                                <span className="font-medium text-gray-800">
                                  {context.averageRate}
                                </span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Peak Season:
                              </span>
                              <span className="font-medium text-gray-800">
                                {context.peakSeason}
                              </span>
                            </div>
                            <div className="pt-1 border-t border-gray-100">
                              <span className="text-gray-600">
                                Regulations:
                              </span>
                              <p className="font-medium text-gray-800 mt-1">
                                {context.regulations}
                              </p>
                            </div>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* AI Processing Control - Hero Section */}
      <section className="mb-8">
        <AIProcessingToggle />
      </section>

      {/* Performance Metrics Section */}
      <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Performance Overview
          </h2>
          <div className="w-16 h-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
        </div>
        <KPICards />
      </section>

      {/* Main Content Grid with Enhanced Visual Hierarchy */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-400">
        {/* Recent Activity - Primary Content Area */}
        <div className="xl:col-span-2">
          <div className="bg-gradient-to-br from-white to-gray-50/50 border border-border/60 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 p-1">
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <RecentActivity />
            </div>
          </div>
        </div>

        {/* Sidebar - Secondary Content */}
        <div className="space-y-6">
          {/* Enhanced Profile Overview Card */}
          <div className="bg-gradient-to-br from-white via-blue-50/20 to-indigo-50/30 border border-border/60 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 p-6 relative overflow-hidden">
            {/* Premium background pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100/40 to-indigo-100/40 rounded-full -translate-y-16 translate-x-16" />

            <div className="relative z-10">
              <div className="flex items-start space-x-4 mb-6">
                <div className="relative">
                  <div className="w-18 h-18 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-xl">
                    <span className="text-2xl font-bold text-white">
                      {(profile?.full_name || user?.email || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {profile?.full_name || 'User'}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {profile?.company_name || user?.email}
                  </p>

                  <div className="flex items-center space-x-2">
                    <div className="inline-flex items-center px-3 py-1.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-bold shadow-sm">
                      <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full mr-2 animate-pulse"></div>
                      {profile?.subscription_tier?.toUpperCase() || 'BASIC'}{' '}
                      PLAN
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Setup Progress */}
              <div className="pt-6 border-t border-border/50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-foreground">
                    Setup Progress
                  </span>
                  <span className="text-sm font-bold text-primary">
                    3/5 Complete
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-700 ease-out shadow-sm"
                    style={{ width: '60%' }}
                  >
                    <div className="h-full bg-gradient-to-r from-white/20 to-transparent rounded-full"></div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
                  Complete your Twilio and calendar integration to unlock full
                  automation potential.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Section with Enhanced Spacing */}
      <section className="mt-12">
        <QuickActions />
      </section>
    </div>
  );
}