// Flynn.ai v2 - User Journey Load Test
// K6 script for realistic user behavior testing

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('error_rate');

// Test configuration
export const options = {
  stages: [
    // Warm-up
    { duration: '2m', target: 10 },
    // Ramp-up to normal load
    { duration: '5m', target: 50 },
    // Stay at normal load
    { duration: '10m', target: 50 },
    // Ramp-up to high load
    { duration: '3m', target: 100 },
    // Stay at high load
    { duration: '5m', target: 100 },
    // Scale down
    { duration: '2m', target: 0 },
  ],

  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95th percentile under 2s
    http_req_failed: ['rate<0.05'], // Error rate under 5%
    error_rate: ['rate<0.05'], // Custom error rate under 5%
  },

  ext: {
    loadimpact: {
      name: 'Flynn.ai v2 User Journey Test',
      distribution: {
        'amazon:us:ashburn': { loadZone: 'amazon:us:ashburn', percent: 50 },
        'amazon:us:palo-alto': { loadZone: 'amazon:us:palo-alto', percent: 30 },
        'amazon:eu:dublin': { loadZone: 'amazon:eu:dublin', percent: 20 },
      },
    },
  },
};

const BASE_URL = __ENV.LOAD_TEST_URL || 'https://flynn.ai';

// Test data
const testUsers = [
  { email: 'test1@flynn.ai', phone: '+15551234567' },
  { email: 'test2@flynn.ai', phone: '+15551234568' },
  { email: 'test3@flynn.ai', phone: '+15551234569' },
];

// Utility functions
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomUser() {
  return testUsers[randomInt(0, testUsers.length - 1)];
}

function logResponse(response, name) {
  console.log(`${name}: ${response.status} (${response.timings.duration}ms)`);
}

// User journey scenarios
export default function userJourney() {
  const scenarios = [
    newVisitorJourney,
    returningUserJourney,
    apiUserJourney,
    webhookStressTest,
  ];

  // Randomly select a scenario
  const scenario = scenarios[randomInt(0, scenarios.length - 1)];
  scenario();
}

// Scenario 1: New visitor exploring the site
function newVisitorJourney() {
  const user = randomUser();

  // 1. Visit landing page
  let response = http.get(`${BASE_URL}/`);
  check(response, {
    'landing page loads': (r) => r.status === 200,
    'landing page loads quickly': (r) => r.timings.duration < 3000,
  }) || errorRate.add(1);

  sleep(randomInt(2, 5)); // Read landing page content

  // 2. Check pricing information (if exists)
  response = http.get(`${BASE_URL}/pricing`);
  check(response, {
    'pricing page accessible': (r) => r.status === 200 || r.status === 404, // 404 is ok if not implemented
  });

  sleep(randomInt(1, 3));

  // 3. Visit registration page
  response = http.get(`${BASE_URL}/register`);
  check(response, {
    'register page loads': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(randomInt(3, 7)); // Fill out form

  // 4. Attempt registration (expect validation errors for test data)
  response = http.post(
    `${BASE_URL}/api/auth/register`,
    {
      email: user.email,
      password: 'testpassword123',
      confirmPassword: 'testpassword123',
      industry: 'plumbing',
      companyName: 'Test Company',
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  check(response, {
    'registration handles request': (r) => r.status >= 200 && r.status < 500,
  });

  sleep(1);
}

// Scenario 2: Returning user dashboard usage
function returningUserJourney() {
  // 1. Visit login page
  let response = http.get(`${BASE_URL}/login`);
  check(response, {
    'login page loads': (r) => r.status === 200,
  }) || errorRate.add(1);

  sleep(randomInt(2, 4));

  // 2. Attempt login (expect authentication required)
  response = http.post(
    `${BASE_URL}/api/auth/login`,
    {
      email: 'testuser@flynn.ai',
      password: 'testpassword',
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  check(response, {
    'login handles request': (r) => r.status >= 200 && r.status < 500,
  });

  sleep(1);

  // 3. Try to access dashboard (should redirect to login)
  response = http.get(`${BASE_URL}/dashboard`);
  check(response, {
    'dashboard redirects unauthenticated user': (r) =>
      r.status === 302 || r.status === 401 || r.status === 200,
  });

  sleep(randomInt(1, 3));

  // 4. Check events page
  response = http.get(`${BASE_URL}/events`);
  check(response, {
    'events page accessible': (r) => r.status >= 200 && r.status < 500,
  });

  sleep(2);
}

// Scenario 3: API endpoint testing
function apiUserJourney() {
  // 1. Health check
  let response = http.get(`${BASE_URL}/api/performance/health`);
  check(response, {
    'health check responds': (r) => r.status === 200,
    'health check is fast': (r) => r.timings.duration < 1000,
    'health check returns JSON': (r) =>
      r.headers['Content-Type'].includes('json'),
  }) || errorRate.add(1);

  sleep(0.5);

  // 2. Database connectivity check
  response = http.get(`${BASE_URL}/api/performance/database`);
  check(response, {
    'database check responds': (r) => r.status === 200,
    'database check is reasonably fast': (r) => r.timings.duration < 3000,
  }) || errorRate.add(1);

  sleep(0.5);

  // 3. Analytics endpoint (should require auth)
  response = http.get(`${BASE_URL}/api/performance/analytics`);
  check(response, {
    'analytics endpoint responds': (r) => r.status === 200 || r.status === 401,
  });

  sleep(1);

  // 4. Test invalid API call
  response = http.get(`${BASE_URL}/api/nonexistent`);
  check(response, {
    'nonexistent endpoint returns 404': (r) => r.status === 404,
  });

  sleep(0.5);
}

// Scenario 4: Webhook stress testing
function webhookStressTest() {
  // Simulate Twilio webhook calls
  const webhookData = {
    CallSid: `CA${Math.random().toString(36).substr(2, 32)}`,
    From: `+1555${randomInt(1000000, 9999999)}`,
    To: `+1555${randomInt(1000000, 9999999)}`,
    CallStatus: ['ringing', 'in-progress', 'completed'][randomInt(0, 2)],
    Direction: 'inbound',
    ApiVersion: '2010-04-01',
  };

  // 1. Voice webhook
  let response = http.post(
    `${BASE_URL}/api/webhooks/twilio/voice`,
    webhookData,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  check(response, {
    'voice webhook responds': (r) => r.status >= 200 && r.status < 500,
    'voice webhook responds quickly': (r) => r.timings.duration < 5000,
  }) || errorRate.add(1);

  sleep(0.2);

  // 2. DTMF webhook (keypad press simulation)
  const dtmfData = {
    ...webhookData,
    Digits: '*7',
    CallStatus: 'in-progress',
  };

  response = http.post(`${BASE_URL}/api/webhooks/twilio/dtmf`, dtmfData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });

  check(response, {
    'dtmf webhook responds': (r) => r.status >= 200 && r.status < 500,
  }) || errorRate.add(1);

  sleep(0.2);

  // 3. Recording status webhook
  const recordingData = {
    ...webhookData,
    RecordingStatus: 'completed',
    RecordingUrl: `https://api.twilio.com/recordings/${Math.random().toString(36).substr(2, 32)}`,
    RecordingDuration: randomInt(30, 600),
  };

  response = http.post(
    `${BASE_URL}/api/webhooks/twilio/recording`,
    recordingData,
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }
  );

  check(response, {
    'recording webhook responds': (r) => r.status >= 200 && r.status < 500,
  }) || errorRate.add(1);

  sleep(0.1);
}

// Setup function
export function setup() {
  console.log('Starting Flynn.ai v2 User Journey Load Test');
  console.log(`Target URL: ${BASE_URL}`);

  // Verify the target is responsive
  const response = http.get(`${BASE_URL}/api/performance/health`);
  if (response.status !== 200) {
    console.error(`Setup failed: Health check returned ${response.status}`);
    return null;
  }

  console.log('Setup successful - target is responsive');
  return { baseUrl: BASE_URL };
}

// Teardown function
export function teardown(data) {
  console.log('Load test completed');

  // Optional: Clean up test data if needed
  // This would require authentication and proper cleanup endpoints
}

// Handle summary
export function handleSummary(data) {
  console.log('Load Test Summary:');
  console.log(`- Total requests: ${data.metrics.http_reqs.count}`);
  console.log(
    `- Request rate: ${data.metrics.http_req_rate.rate.toFixed(2)} req/s`
  );
  console.log(
    `- Average response time: ${data.metrics.http_req_duration.avg.toFixed(2)}ms`
  );
  console.log(
    `- 95th percentile: ${data.metrics.http_req_duration['p(95)'].toFixed(2)}ms`
  );
  console.log(
    `- Success rate: ${((1 - data.metrics.http_req_failed.rate) * 100).toFixed(2)}%`
  );

  return {
    'summary.json': JSON.stringify(data, null, 2),
  };
}
