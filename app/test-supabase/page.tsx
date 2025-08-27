'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/utils/supabase/client';

// Test page to isolate Supabase issues
export default function TestSupabase() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testSupabaseConnection = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('Testing Supabase connection...');
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        setResult('❌ Failed to create Supabase client');
        return;
      }

      console.log('Supabase client created, testing auth...');
      
      // Test 1: Simple signup without any options
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'testpass123';
      
      console.log('Attempting signup with:', testEmail);
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      });

      if (error) {
        console.error('Signup error:', error);
        setResult(`❌ Signup failed: ${error.message}`);
      } else {
        console.log('Signup successful:', data);
        setResult(`✅ Signup successful! User ID: ${data.user?.id || 'unknown'}`);
        
        // Clean up - try to delete the test user
        if (data.user) {
          console.log('Attempting to sign out test user...');
          await supabase.auth.signOut();
        }
      }
      
    } catch (error) {
      console.error('Test error:', error);
      setResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseConnection = async () => {
    setLoading(true);
    setResult('');
    
    try {
      console.log('Testing database connection...');
      const supabase = getSupabaseClient();
      
      if (!supabase) {
        setResult('❌ Failed to create Supabase client');
        return;
      }

      // Test database access - just count users table
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Database error:', error);
        setResult(`❌ Database test failed: ${error.message}`);
      } else {
        console.log('Database test successful, user count:', count);
        setResult(`✅ Database connection successful! Users table has ${count || 0} records`);
      }
      
    } catch (error) {
      console.error('Database test error:', error);
      setResult(`❌ Database test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12">
      <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-xl font-bold mb-6">Supabase Connection Test</h1>
        
        <div className="space-y-4">
          <button
            onClick={testSupabaseConnection}
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Auth Signup'}
          </button>

          <button
            onClick={testDatabaseConnection}
            disabled={loading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Database Access'}
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Test Result:</h3>
            <div className="text-sm font-mono whitespace-pre-wrap">
              {result}
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-yellow-50 rounded border border-yellow-200">
          <h3 className="font-semibold mb-2 text-yellow-800">Note:</h3>
          <p className="text-sm text-yellow-700">
            This page tests basic Supabase functionality to isolate authentication issues. 
            Check the browser console for detailed logs.
          </p>
        </div>
      </div>
    </div>
  );
}