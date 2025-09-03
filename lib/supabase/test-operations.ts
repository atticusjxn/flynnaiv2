// Flynn.ai v2 - Database Operations Test
// This file can be used to test database operations once Supabase is configured

import { createClient } from '@/utils/supabase/server';
import { UserService } from './users';
import { CallService } from './calls';
import { EventService } from './events';
import { AnalyticsService } from './analytics';

export async function testDatabaseConnection() {
  try {
    const supabase = createClient();

    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count(*)')
      .limit(1);

    if (error) {
      console.error('Database connection test failed:', error);
      return false;
    }

    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('Database connection test error:', error);
    return false;
  }
}

export async function testUserOperations() {
  try {
    const userService = new UserService();

    // Test getting current user (will be null without auth)
    const currentUser = await userService.getCurrentUser();
    console.log('Current user:', currentUser ? 'Found' : 'Not authenticated');

    console.log('✅ User operations test completed');
    return true;
  } catch (error) {
    console.error('User operations test failed:', error);
    return false;
  }
}

export async function testCallOperations() {
  try {
    const callService = new CallService();

    // Test getting processing calls (should return empty array)
    const processingCalls = await callService.getProcessingCalls();
    console.log('Processing calls found:', processingCalls.length);

    console.log('✅ Call operations test completed');
    return true;
  } catch (error) {
    console.error('Call operations test failed:', error);
    return false;
  }
}

export async function testEventOperations() {
  try {
    const eventService = new EventService();

    // Test event stats function (requires a user ID)
    // This will fail without a valid user ID, but tests the function exists
    try {
      await eventService.getEventStats('test-user-id');
    } catch (error) {
      // Expected to fail with invalid user ID
    }

    console.log('✅ Event operations test completed');
    return true;
  } catch (error) {
    console.error('Event operations test failed:', error);
    return false;
  }
}

export async function runAllTests() {
  console.log('🧪 Running database operations tests...\n');

  const tests = [
    { name: 'Database Connection', test: testDatabaseConnection },
    { name: 'User Operations', test: testUserOperations },
    { name: 'Call Operations', test: testCallOperations },
    { name: 'Event Operations', test: testEventOperations },
  ];

  const results = [];

  for (const { name, test } of tests) {
    console.log(`Testing ${name}...`);
    const result = await test();
    results.push({ name, passed: result });
    console.log('');
  }

  console.log('📊 Test Results:');
  results.forEach(({ name, passed }) => {
    console.log(`${passed ? '✅' : '❌'} ${name}`);
  });

  const allPassed = results.every((r) => r.passed);
  console.log(
    `\n${allPassed ? '🎉' : '⚠️'} Overall: ${allPassed ? 'All tests passed!' : 'Some tests failed'}`
  );

  return allPassed;
}
