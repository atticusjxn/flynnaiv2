#!/usr/bin/env node

const https = require('https');
const http = require('http');

/**
 * Deployment health check script
 * Verifies that the deployed application is working correctly
 */
async function healthCheck() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  console.log(`🏥 Flynn.ai v2 Health Check - ${baseUrl}\n`);

  const checks = [
    {
      name: 'Application Health',
      url: `${baseUrl}/api/performance/health`,
      timeout: 10000,
      critical: true,
    },
    {
      name: 'Landing Page',
      url: `${baseUrl}/`,
      timeout: 5000,
      critical: true,
    },
    {
      name: 'Dashboard Route',
      url: `${baseUrl}/dashboard`,
      timeout: 5000,
      critical: false,
      expectedStatus: [200, 302, 401], // May redirect to login
    },
    {
      name: 'API Analytics',
      url: `${baseUrl}/api/performance/analytics`,
      timeout: 5000,
      critical: false,
    },
    {
      name: 'Twilio Webhook',
      url: `${baseUrl}/api/webhooks/twilio/voice`,
      timeout: 5000,
      critical: true,
      method: 'POST',
      expectedStatus: [400, 405], // Should reject invalid requests
    },
  ];

  let totalChecks = 0;
  let passedChecks = 0;
  let criticalFailures = 0;

  console.log('Running health checks...\n');

  for (const check of checks) {
    totalChecks++;
    console.log(`🔍 ${check.name}`);

    try {
      const result = await makeRequest(check);
      const isSuccess = check.expectedStatus
        ? check.expectedStatus.includes(result.statusCode)
        : result.statusCode >= 200 && result.statusCode < 400;

      if (isSuccess) {
        console.log(
          `  ✅ Status: ${result.statusCode} (${result.responseTime}ms)`
        );
        passedChecks++;

        // Additional checks for specific endpoints
        if (check.name === 'Application Health' && result.data) {
          const health = JSON.parse(result.data);
          console.log(`  📊 System Status: ${health.status}`);
          console.log(
            `  ⏱️  Response Time: ${health.metrics.responseTime.toFixed(2)}ms`
          );
          console.log(
            `  📈 Error Rate: ${health.metrics.errorRate.toFixed(2)}%`
          );
          console.log(`  ⏰ Uptime: ${Math.round(health.metrics.uptime)}s`);

          if (health.status !== 'healthy' && check.critical) {
            criticalFailures++;
            console.log(`  ⚠️  System is ${health.status}`);
          }
        }
      } else {
        console.log(
          `  ❌ Status: ${result.statusCode} (${result.responseTime}ms)`
        );
        if (check.critical) criticalFailures++;
      }
    } catch (error) {
      console.log(`  ❌ Failed: ${error.message}`);
      if (check.critical) criticalFailures++;
    }

    console.log('');
  }

  // Summary
  console.log('='.repeat(50));
  console.log(`📊 Health Check Summary`);
  console.log(`  Total Checks: ${totalChecks}`);
  console.log(`  Passed: ${passedChecks}`);
  console.log(`  Failed: ${totalChecks - passedChecks}`);
  console.log(`  Critical Failures: ${criticalFailures}`);

  const successRate = (passedChecks / totalChecks) * 100;
  console.log(`  Success Rate: ${successRate.toFixed(1)}%`);

  if (criticalFailures === 0 && successRate >= 80) {
    console.log('\n🎉 Deployment is healthy and ready for traffic!');
    process.exit(0);
  } else if (criticalFailures === 0) {
    console.log('\n⚠️  Deployment has minor issues but is functional');
    process.exit(0);
  } else {
    console.log(
      '\n🚨 Deployment has critical issues - investigate before routing traffic'
    );
    process.exit(1);
  }
}

function makeRequest(check) {
  return new Promise((resolve, reject) => {
    const url = new URL(check.url);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;

    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: check.method || 'GET',
      timeout: check.timeout || 5000,
      headers: {
        'User-Agent': 'Flynn-Health-Check/1.0',
        Accept: 'application/json,text/html,*/*',
      },
    };

    const startTime = Date.now();

    const req = lib.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          responseTime,
          data,
          headers: res.headers,
        });
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`Request timeout (${check.timeout}ms)`));
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    if (check.method === 'POST') {
      // Send minimal test data for POST requests
      req.write('{"test": true}');
    }

    req.end();
  });
}

// Performance test
async function performanceTest() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  console.log('\n🚀 Running Performance Test...\n');

  const testUrl = `${baseUrl}/api/performance/health`;
  const concurrency = 10;
  const requests = 50;

  console.log(
    `Testing ${testUrl} with ${concurrency} concurrent users, ${requests} total requests`
  );

  const promises = [];
  const results = [];

  for (let i = 0; i < requests; i++) {
    const promise = makeRequest({
      url: testUrl,
      timeout: 10000,
    })
      .then((result) => {
        results.push(result.responseTime);
        return result;
      })
      .catch((error) => {
        console.log(`Request ${i + 1} failed: ${error.message}`);
        return null;
      });

    promises.push(promise);

    // Stagger requests to simulate realistic load
    if (i % concurrency === 0 && i > 0) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  await Promise.all(promises);

  if (results.length > 0) {
    const avg = results.reduce((a, b) => a + b, 0) / results.length;
    const min = Math.min(...results);
    const max = Math.max(...results);
    const p95 = results.sort((a, b) => a - b)[
      Math.floor(results.length * 0.95)
    ];

    console.log('\n📈 Performance Results:');
    console.log(`  Successful Requests: ${results.length}/${requests}`);
    console.log(`  Average Response Time: ${avg.toFixed(2)}ms`);
    console.log(`  Min Response Time: ${min}ms`);
    console.log(`  Max Response Time: ${max}ms`);
    console.log(`  95th Percentile: ${p95}ms`);

    if (avg < 500) {
      console.log('  ✅ Performance is excellent (< 500ms average)');
    } else if (avg < 1000) {
      console.log('  ⚠️  Performance is acceptable (< 1s average)');
    } else {
      console.log('  ❌ Performance needs improvement (> 1s average)');
    }
  }
}

// Main execution
async function main() {
  try {
    await healthCheck();

    // Run performance test if requested
    if (process.argv.includes('--performance')) {
      await performanceTest();
    }
  } catch (error) {
    console.error('Health check failed:', error);
    process.exit(1);
  }
}

main();
