'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/components/AuthProvider';

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
  
  return industryNames[industryType] || industryType.replace('_', ' ').toUpperCase();
};

export default function DashboardPage() {
  const { user, profile, loading, signOut } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-primary-foreground rounded-full"></div>
                </div>
                <h1 className="text-xl font-bold text-card-foreground">Flynn.ai v2</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {profile?.full_name || user.email}
              </span>
              <button
                onClick={handleLogout}
                className="bg-secondary hover:bg-secondary/90 px-3 py-1 rounded-lg text-sm font-medium text-secondary-foreground transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-border rounded-lg p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-foreground mb-4">
                Welcome to Flynn.ai Dashboard!
              </h2>
              <p className="text-muted-foreground mb-6">
                Your AI-powered call-to-calendar automation platform is ready to go.
              </p>

              {/* User Profile Card */}
              <div className="bg-card border border-border rounded-lg shadow-sm p-6 mb-6 text-left max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-card-foreground mb-4">Your Profile</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-card-foreground">Name:</span>{' '}
                    <span className="text-muted-foreground">{profile?.full_name || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-card-foreground">Email:</span>{' '}
                    <span className="text-muted-foreground">{user.email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-card-foreground">Company:</span>{' '}
                    <span className="text-muted-foreground">{profile?.company_name || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-card-foreground">Industry:</span>{' '}
                    <span className="text-muted-foreground">
                      {profile?.industry_type ? formatIndustryName(profile.industry_type) : 'Not set'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-card-foreground">Subscription:</span>{' '}
                    <span className="text-muted-foreground capitalize">
                      {profile?.subscription_tier || 'Basic'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="bg-card border border-border rounded-lg shadow-sm p-4">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mb-2">
                    <div className="w-4 h-4 bg-primary rounded-full"></div>
                  </div>
                  <h4 className="font-semibold text-card-foreground">Calls</h4>
                  <p className="text-sm text-muted-foreground">View and manage your call history</p>
                </div>
                <div className="bg-card border border-border rounded-lg shadow-sm p-4">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mb-2">
                    <div className="w-4 h-4 bg-primary rounded-full"></div>
                  </div>
                  <h4 className="font-semibold text-card-foreground">Events</h4>
                  <p className="text-sm text-muted-foreground">Manage extracted calendar events</p>
                </div>
                <div className="bg-card border border-border rounded-lg shadow-sm p-4">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mb-2">
                    <div className="w-4 h-4 bg-primary rounded-full"></div>
                  </div>
                  <h4 className="font-semibold text-card-foreground">Settings</h4>
                  <p className="text-sm text-muted-foreground">Configure your preferences</p>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-sm text-muted-foreground">
                  Authentication system is working! Next: Set up Twilio integration.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}