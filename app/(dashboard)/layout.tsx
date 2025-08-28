'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/dashboard/Sidebar';
import { useAuthContext } from '@/components/AuthProvider';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, profile } = useAuthContext();
  const pathname = usePathname();
  
  const getPageInfo = () => {
    switch (pathname) {
      case '/dashboard':
        return { title: 'Dashboard', subtitle: 'AI-powered call-to-calendar automation' };
      case '/calls':
        return { title: 'Calls', subtitle: 'Manage your call history and recordings' };
      case '/events':
        return { title: 'Events', subtitle: 'Review and manage extracted calendar events' };
      case '/calendar':
        return { title: 'Calendar', subtitle: 'Connect and manage your calendar integrations' };
      case '/settings':
        return { title: 'Settings', subtitle: 'Configure your Flynn.ai integrations and preferences' };
      case '/billing':
        return { title: 'Billing', subtitle: 'Manage your subscription and billing preferences' };
      default:
        return { title: 'Dashboard', subtitle: 'AI-powered call-to-calendar automation' };
    }
  };
  
  const pageInfo = getPageInfo();

  return (
    <ProtectedRoute>
      <div className="flex h-screen w-full bg-background min-h-screen">
        {/* Sidebar */}
        <Sidebar className="flex-shrink-0" />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 relative w-full min-h-screen">
          {/* Top Navigation Bar */}
          <header className="bg-card border-b border-border shadow-sm relative z-10 w-full">
            <div className="px-6 py-4 w-full">
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center space-x-4">
                  <div>
                    <h1 className="text-xl font-bold text-foreground">
                      {pageInfo.title}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {pageInfo.subtitle}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {/* User Info */}
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {profile?.full_name || user?.email}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {profile?.subscription_tier || 'Basic'} Plan
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-white">
                        {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>
          
          {/* Page Content */}
          <main className="flex-1 overflow-auto w-full min-h-0">
            <div className="p-6 w-full min-h-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}