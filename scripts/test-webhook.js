#!/usr/bin/env node

// Flynn.ai v2 - Webhook Testing Utility
const https = require('https');
const crypto = require('crypto');

const BASE_URL = 'http://localhost:3000';
const WEBHOOK_SECRET = 'flynn_ai_v2_webhook_secret_2024';

// Test webhook payloads
const TEST_CALLS = {
  plumbing_emergency: {
    From: '+15551234567',
    To: '+61748032046',
    CallSid: 'test_call_' + Date.now(),
    RecordingUrl: 'https://api.twilio.com/test/recording.mp3',
    RecordingDuration: '120',
    Transcript: "Hi, I need emergency plumbing help. My basement is flooding from a burst pipe at 123 Main Street. Can you come out today around 2 PM? My name is John Smith, my phone number is 555-123-4567.",
    TranscriptionConfidence: 0.95
  },
  real_estate_showing: {
    From: '+15559876543',
    To: '+61748032046',
    CallSid: 'test_call_' + Date.now(),
    RecordingUrl: 'https://api.twilio.com/test/recording2.mp3',
    RecordingDuration: '180',
    Transcript: "Hello, I'd like to schedule a showing for the property at 456 Oak Avenue. I'm available this Saturday morning around 10 AM. My name is Sarah Johnson, you can reach me at 555-987-6543.",
    TranscriptionConfidence: 0.92
  }
};

function createTwilioSignature(url, payload, secret) {
  const data = Object.keys(payload)
    .sort()
    .map(key => `${key}=${payload[key]}`)
    .join('&');
  
  const hmac = crypto.createHmac('sha1', secret);
  hmac.update(url + data);
  return 'sha1=' + hmac.digest('hex');
}

async function testWebhook(testName, payload) {
  const url = `${BASE_URL}/api/webhooks/twilio/recording`;
  const signature = createTwilioSignature(url, payload, WEBHOOK_SECRET);
  
  const postData = new URLSearchParams(payload).toString();
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/webhooks/twilio/recording',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(postData),
      'X-Twilio-Signature': signature,
      'User-Agent': 'TwilioProxy/1.1'
    }
  };

  return new Promise((resolve, reject) => {
    console.log(`\n🧪 Testing ${testName}...`);
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`✅ Status: ${res.statusCode}`);
        console.log(`📝 Response: ${data.substring(0, 200)}${data.length > 200 ? '...' : ''}`);
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (err) => {
      console.log(`❌ Error: ${err.message}`);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Flynn.ai v2 Webhook Testing Utility');
  console.log('=====================================');
  console.log(`🎯 Target: ${BASE_URL}`);
  
  try {
    // Test plumbing emergency call
    await testWebhook('Plumbing Emergency', TEST_CALLS.plumbing_emergency);
    
    // Wait a bit between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Test real estate showing
    await testWebhook('Real Estate Showing', TEST_CALLS.real_estate_showing);
    
    console.log('\n🎉 All tests completed!');
    console.log('📊 Check your terminal and dashboard for results');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  runTests();
}

module.exports = { testWebhook, TEST_CALLS };