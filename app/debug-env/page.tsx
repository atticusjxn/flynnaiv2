'use client';

// Debug page to check environment variables
export default function DebugEnv() {
  const envVars = {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? 'SET'
      : 'MISSING',
  };

  // Additional debug info
  const debugInfo = {
    'window.location.origin':
      typeof window !== 'undefined'
        ? window.location.origin
        : 'SSR - not available',
    'Current URL':
      typeof window !== 'undefined'
        ? window.location.href
        : 'SSR - not available',
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-xl font-bold mb-4">Environment Debug</h1>

        <div className="space-y-2">
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="font-mono text-sm">{key}:</span>
              <span
                className={`text-sm ${value ? 'text-green-600' : 'text-red-600'}`}
              >
                {value || 'MISSING'}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <h2 className="font-semibold mb-2">Runtime Debug Info:</h2>
          <div className="space-y-2">
            {Object.entries(debugInfo).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="font-mono">{key}:</span>
                <span
                  className="text-gray-600 truncate ml-2"
                  title={String(value)}
                >
                  {String(value)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded">
          <h2 className="font-semibold mb-2">Instructions:</h2>
          <p className="text-sm text-gray-600">
            If variables show as MISSING, add them in Vercel dashboard under
            Project Settings → Environment Variables.
            <br />
            <br />
            <strong>NEXT_PUBLIC_APP_URL</strong> should be your Vercel URL like:
            <br />
            <code className="text-xs">https://your-project.vercel.app</code>
          </p>
        </div>
      </div>
    </div>
  );
}
