'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from '@/components/dashboard/Sidebar';

interface DashboardClientProps {
  user: any;
  profile: any;
  children: React.ReactNode;
}

export default function DashboardClient({ user, profile, children }: DashboardClientProps) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Hamburger Menu Icon Component
  const HamburgerIcon = ({ className }: { className?: string }) => (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
      />
    </svg>
  );

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  const getPageInfo = () => {
    switch (pathname) {
      case '/dashboard':
        return {
          title: 'Dashboard',
          subtitle: 'AI-powered call-to-calendar automation',
        };
      case '/search':
        return {
          title: 'Advanced Search',
          subtitle: 'Search across calls, events, customers, and transcripts',
        };
      case '/calls':
        return {
          title: 'Calls',
          subtitle: 'Manage your call history and recordings',
        };
      case '/events':
        return {
          title: 'Events',
          subtitle: 'Review and manage extracted calendar events',
        };
      case '/calendar':
        return {
          title: 'Calendar',
          subtitle: 'Connect and manage your calendar integrations',
        };
      case '/settings':
        return {
          title: 'Settings',
          subtitle: 'Configure your Flynn.ai integrations and preferences',
        };
      case '/billing':
        return {
          title: 'Billing',
          subtitle: 'Manage your subscription and billing preferences',
        };
      default:
        return {
          title: 'Dashboard',
          subtitle: 'AI-powered call-to-calendar automation',
        };
    }
  };

  const pageInfo = getPageInfo();

  return (
    <div className="flex h-screen w-full bg-background min-h-screen">
      {/* Sidebar */}
      <Sidebar
        className="flex-shrink-0"
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative w-full min-h-screen">
        {/* Top Navigation Bar */}
        <header className="bg-card border-b border-border shadow-sm relative z-10 w-full">
          <div className="px-6 py-4 w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-4">
                {/* Mobile hamburger menu */}
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="lg:hidden p-2 -ml-2 rounded-lg transition-colors duration-200 hover:bg-muted text-foreground touch-target focus-ring"
                >
                  <HamburgerIcon className="w-5 h-5" />
                </button>

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
                  {/* User details - hidden on small mobile screens */}
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-medium text-foreground">
                      {profile?.full_name || user?.email}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {profile?.subscription_tier || 'Basic'} Plan
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center touch-target">
                    <span className="text-sm font-bold text-white">
                      {(profile?.full_name || user?.email || 'U')
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto w-full min-h-0">
          <div className="p-6 w-full min-h-full">{children}</div>
        </main>
      </div>
    </div>
  );
}