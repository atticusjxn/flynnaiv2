'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthContext } from '@/components/AuthProvider';

export default function HomePage() {
  const { user, loading } = useAuthContext();
  const router = useRouter();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-foreground mb-6">
          Flynn.ai v2
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Transform business phone calls into organized calendar events within 2 minutes.
          AI-powered automation for professionals across all industries.
        </p>
        
        {/* Authentication buttons */}
        <div className="mb-8 space-x-4">
          <Link
            href="/login"
            className="inline-block bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-block bg-secondary text-secondary-foreground hover:bg-secondary/90 font-medium py-3 px-6 rounded-lg border-2 border-border transition-colors"
          >
            Get Started
          </Link>
        </div>

        <div className="bg-card border border-border rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-semibold text-card-foreground mb-4">
            Core Features
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-accent rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <div className="w-6 h-6 bg-primary rounded-full"></div>
              </div>
              <h3 className="font-semibold text-card-foreground mb-2">Call Processing</h3>
              <p className="text-muted-foreground text-sm">
                Twilio integration with real-time transcription
              </p>
            </div>
            <div className="text-center">
              <div className="bg-accent rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <div className="w-6 h-6 bg-primary rounded-full"></div>
              </div>
              <h3 className="font-semibold text-card-foreground mb-2">AI Extraction</h3>
              <p className="text-muted-foreground text-sm">
                GPT-4 powered event detection and classification
              </p>
            </div>
            <div className="text-center">
              <div className="bg-accent rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <div className="w-6 h-6 bg-primary rounded-full"></div>
              </div>
              <h3 className="font-semibold text-card-foreground mb-2">Email Delivery</h3>
              <p className="text-muted-foreground text-sm">
                Professional emails with calendar integration
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-muted-foreground">
          <p>Authentication system ready! Sign up to get started.</p>
        </div>
      </div>
    </main>
  );
}