'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Check initial connection status
    setIsOnline(navigator.onLine);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    if (isOnline) {
      window.location.href = '/dashboard';
    } else {
      window.location.reload();
    }
  };

  const handleGoToDashboard = () => {
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center text-white">
        {/* Flynn.ai Logo */}
        <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center mx-auto mb-8">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full" />
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {isOnline ? (
            <>
              <h1 className="text-3xl font-bold mb-2">Connection Restored!</h1>
              <p className="text-blue-100 text-lg mb-6">
                Your internet connection is back. You can now access all
                Flynn.ai features.
              </p>
              <Button
                onClick={handleGoToDashboard}
                className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-xl shadow-lg transition-all duration-200 hover:scale-105"
              >
                Go to Dashboard
              </Button>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold mb-2">You're Offline</h1>
              <p className="text-blue-100 text-lg mb-6">
                Check your internet connection to access Flynn.ai's full
                features.
              </p>
              <Button
                onClick={handleRetry}
                className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold py-3 px-6 rounded-xl backdrop-blur-sm border border-white border-opacity-30 transition-all duration-200 hover:scale-105"
              >
                Try Again
              </Button>
            </>
          )}

          {/* Connection Status Indicator */}
          <div className="flex items-center justify-center space-x-2 text-sm">
            <div
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-green-400' : 'bg-red-400'
              }`}
            />
            <span className="text-blue-100">
              {isOnline ? 'Connected' : 'No internet connection'}
            </span>
          </div>

          {/* Offline Features */}
          {!isOnline && (
            <div className="mt-8 p-4 bg-white bg-opacity-10 rounded-xl backdrop-blur-sm border border-white border-opacity-20">
              <h3 className="text-lg font-semibold mb-3">Available Offline:</h3>
              <ul className="text-sm text-blue-100 space-y-2 text-left">
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-blue-300 rounded-full" />
                  <span>View cached call history</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-blue-300 rounded-full" />
                  <span>Browse previously loaded events</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-blue-300 rounded-full" />
                  <span>Access settings and preferences</span>
                </li>
              </ul>
            </div>
          )}

          {/* Refresh Instructions */}
          <p className="text-xs text-blue-200 opacity-80 mt-6">
            Flynn.ai works best with an active internet connection for AI
            processing and real-time updates.
          </p>
        </div>
      </div>
    </div>
  );
}
