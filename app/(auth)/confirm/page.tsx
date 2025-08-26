'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

function ConfirmContent() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const supabase = createClient();
      
      try {
        console.log('Starting email confirmation...');
        console.log('Current URL:', window.location.href);
        console.log('Search params:', Object.fromEntries(searchParams.entries()));
        console.log('URL hash:', window.location.hash);
        
        // Get all possible parameters from both search params and hash
        const code = searchParams.get('code') || new URLSearchParams(window.location.hash.substring(1)).get('access_token');
        const tokenHash = searchParams.get('token_hash');
        const token = searchParams.get('token');
        const type = searchParams.get('type');
        
        console.log('Parameters:', { code, tokenHash, token, type });

        if (code) {
          console.log('Using code exchange method...');
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          
          if (error) {
            console.error('Code exchange error:', error);
            setStatus('error');
            setMessage(error.message || 'Failed to confirm email. The link may have expired.');
            return;
          }

          console.log('Code exchange successful:', data);
          setStatus('success');
          setMessage('Your email has been confirmed successfully! Redirecting to dashboard...');
          
          // Redirect to dashboard since user is now logged in
          setTimeout(() => {
            router.push('/dashboard');
          }, 2000);
        } else if (tokenHash && token) {
          console.log('Using OTP verification method...');
          const { data, error } = await supabase.auth.verifyOtp({
            type: 'email',
            token_hash: tokenHash,
            token: token,
          });

          if (error) {
            console.error('OTP verification error:', error);
            setStatus('error');
            setMessage('Invalid or expired confirmation link. Please try registering again.');
            return;
          }

          console.log('OTP verification successful:', data);
          setStatus('success');
          setMessage('Your email has been confirmed successfully! You can now sign in.');
          
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else {
          console.log('No valid parameters found');
          setStatus('error');
          setMessage('Invalid confirmation link. Please check your email and try again.');
        }
      } catch (error) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setMessage('An error occurred while confirming your email. Please try again.');
      }
    };

    // Add a small delay to ensure searchParams are ready
    const timer = setTimeout(handleEmailConfirmation, 100);
    
    return () => clearTimeout(timer);
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className={`mx-auto h-12 w-12 flex items-center justify-center rounded-full ${
            status === 'loading' ? 'bg-accent' :
            status === 'success' ? 'bg-primary/10' : 'bg-destructive/10'
          }`}>
            {status === 'loading' && (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            )}
            {status === 'success' && (
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            {status === 'error' && (
              <div className="w-6 h-6 bg-destructive rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-destructive-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
          <h2 className="mt-6 text-3xl font-bold text-foreground">
            {status === 'loading' && 'Confirming your email...'}
            {status === 'success' && 'Email confirmed!'}
            {status === 'error' && 'Confirmation failed'}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {message}
          </p>
        </div>

        {status === 'success' && (
          <div className="bg-primary/10 border border-primary/20 text-primary px-4 py-3 rounded-lg text-sm">
            <p className="mb-2 font-medium">Welcome to Flynn.ai!</p>
            <p>You'll be redirected automatically, or you can click below to continue now.</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg text-sm">
            <p className="font-medium">If you continue to have problems, please try:</p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-xs">
              <li>Checking if the link has expired</li>
              <li>Registering with a new account</li>
              <li>Contacting support if the issue persists</li>
            </ul>
          </div>
        )}

        <div className="text-center space-y-4">
          {status === 'success' && (
            <Link
              href="/dashboard"
              className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Go to Dashboard
            </Link>
          )}
          
          {status === 'error' && (
            <div className="flex justify-center space-x-4">
              <Link
                href="/register"
                className="inline-block bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Try registering again
              </Link>
              <Link
                href="/"
                className="inline-block bg-secondary hover:bg-secondary/90 text-secondary-foreground font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Go home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    }>
      <ConfirmContent />
    </Suspense>
  );
}