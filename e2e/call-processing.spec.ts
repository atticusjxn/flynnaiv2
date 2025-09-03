import { test, expect } from '@playwright/test';

test.describe('Call Processing End-to-End', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'test.plumber@example.com');
    await page.fill('[data-testid="password"]', 'testpassword123');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL(/.*dashboard/);
  });

  test('should process plumbing call from start to finish', async ({
    page,
  }) => {
    // 1. Simulate incoming call via webhook
    const callData = {
      CallSid: 'CA_test_call_123',
      From: '+15551234567',
      To: '+15557654321',
      CallStatus: 'in-progress',
    };

    await page.request.post('/api/webhooks/twilio/voice', {
      form: callData,
    });

    // 2. Simulate call recording completion
    await page.request.post('/api/webhooks/twilio/recording-complete', {
      form: {
        CallSid: 'CA_test_call_123',
        RecordingSid: 'RE_test_recording_123',
        RecordingUrl: 'https://test-recording.wav',
        RecordingDuration: '120',
      },
    });

    // 3. Wait for AI processing to complete (with timeout)
    await page.waitForTimeout(5000);

    // 4. Navigate to calls page
    await page.goto('/dashboard/calls');

    // 5. Verify call appears in dashboard
    await expect(page.locator('[data-testid="call-item"]').first()).toBeVisible(
      { timeout: 10000 }
    );

    // 6. Click on call to view events
    await page.click('[data-testid="call-item"]');

    // 7. Verify event was extracted
    await expect(page.locator('[data-testid="event-card"]')).toBeVisible();

    // 8. Confirm the event
    await page.click('[data-testid="confirm-event-button"]');

    // 9. Verify status updated
    await expect(page.locator('[data-testid="event-status"]')).toContainText(
      'Confirmed'
    );
  });

  test('should handle emergency calls with high priority', async ({ page }) => {
    // Simulate emergency call
    const emergencyData = {
      CallSid: 'CA_emergency_456',
      From: '+15559876543',
      To: '+15557654321',
      CallStatus: 'completed',
    };

    await page.request.post('/api/webhooks/twilio/voice', {
      form: emergencyData,
    });

    // Simulate recording with emergency transcript
    await page.request.post('/api/webhooks/twilio/recording-complete', {
      form: {
        CallSid: 'CA_emergency_456',
        RecordingSid: 'RE_emergency_456',
        RecordingUrl: 'https://emergency-recording.wav',
        RecordingDuration: '90',
      },
    });

    await page.waitForTimeout(3000);

    // Navigate to events page
    await page.goto('/dashboard/events');

    // Verify emergency event appears with proper urgency
    await expect(
      page.locator('[data-testid="urgency-badge"]').first()
    ).toContainText('Emergency');
    await expect(
      page.locator('[data-testid="event-card"]').first()
    ).toHaveClass(/.*emergency.*/);
  });

  test('should show real-time call notifications', async ({ page }) => {
    // Start on dashboard
    await page.goto('/dashboard');

    // Simulate incoming call notification
    await page.request.post('/api/webhooks/twilio/voice', {
      form: {
        CallSid: 'CA_realtime_789',
        From: '+15555555555',
        To: '+15557654321',
        CallStatus: 'ringing',
      },
    });

    // Verify real-time notification appears
    await expect(page.locator('[data-testid="live-notification"]')).toBeVisible(
      { timeout: 5000 }
    );
    await expect(
      page.locator('[data-testid="live-notification"]')
    ).toContainText('Incoming call');
  });

  test('should handle call history and search', async ({ page }) => {
    // Navigate to calls page
    await page.goto('/dashboard/calls');

    // Use search functionality
    await page.fill('[data-testid="search-input"]', 'plumbing');
    await page.press('[data-testid="search-input"]', 'Enter');

    // Verify search results
    await expect(page.locator('[data-testid="call-item"]')).toBeVisible();

    // Test date filter
    await page.click('[data-testid="date-filter"]');
    await page.selectOption('[data-testid="date-range"]', 'last-week');

    // Verify filtered results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
  });

  test('should export call data', async ({ page }) => {
    await page.goto('/dashboard/calls');

    // Select calls for export
    await page.click('[data-testid="select-all-calls"]');

    // Trigger export
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="export-button"]');

    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.csv');
  });
});
