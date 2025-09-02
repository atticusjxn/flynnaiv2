import { test, expect } from '@playwright/test'

test.describe('Events Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'test.plumber@example.com')
    await page.fill('[data-testid="password"]', 'testpassword123')
    await page.click('[data-testid="login-button"]')
    await expect(page).toHaveURL(/.*dashboard/)
  })

  test('should display events list with proper filtering', async ({ page }) => {
    await page.goto('/dashboard/events')

    // Verify events are displayed
    await expect(page.locator('[data-testid="event-card"]')).toHaveCount(1, { timeout: 5000 })

    // Test status filter
    await page.selectOption('[data-testid="status-filter"]', 'pending')
    await expect(page.locator('[data-testid="event-card"]')).toBeVisible()

    // Test urgency filter
    await page.selectOption('[data-testid="urgency-filter"]', 'emergency')
    
    // Test event type filter
    await page.selectOption('[data-testid="type-filter"]', 'service_call')
  })

  test('should allow editing event details', async ({ page }) => {
    await page.goto('/dashboard/events')
    
    // Click on first event to edit
    await page.click('[data-testid="event-card"]')
    await page.click('[data-testid="edit-event-button"]')

    // Verify edit form appears
    await expect(page.locator('[data-testid="event-edit-form"]')).toBeVisible()

    // Edit event details
    await page.fill('[data-testid="event-title"]', 'Updated Kitchen Repair')
    await page.fill('[data-testid="event-location"]', '456 Updated Street')
    await page.selectOption('[data-testid="urgency-select"]', 'high')
    
    // Save changes
    await page.click('[data-testid="save-event-button"]')

    // Verify changes were saved
    await expect(page.locator('[data-testid="event-title"]')).toContainText('Updated Kitchen Repair')
    await expect(page.locator('[data-testid="urgency-badge"]')).toContainText('High')
  })

  test('should handle bulk actions on events', async ({ page }) => {
    await page.goto('/dashboard/events')
    
    // Select multiple events
    await page.click('[data-testid="select-all-checkbox"]')
    
    // Verify bulk actions menu appears
    await expect(page.locator('[data-testid="bulk-actions"]')).toBeVisible()

    // Perform bulk confirm action
    await page.click('[data-testid="bulk-confirm-button"]')
    
    // Verify confirmation dialog
    await expect(page.locator('[data-testid="confirm-dialog"]')).toBeVisible()
    await page.click('[data-testid="confirm-bulk-action"]')

    // Verify events status updated
    await expect(page.locator('[data-testid="event-status"]').first()).toContainText('Confirmed')
  })

  test('should sync events to calendar', async ({ page }) => {
    await page.goto('/dashboard/events')
    
    // Click on event
    await page.click('[data-testid="event-card"]')
    
    // Click sync to calendar
    await page.click('[data-testid="sync-calendar-button"]')
    
    // Verify calendar sync dialog
    await expect(page.locator('[data-testid="calendar-sync-dialog"]')).toBeVisible()
    
    // Select calendar provider
    await page.click('[data-testid="google-calendar-option"]')
    
    // Confirm sync
    await page.click('[data-testid="confirm-sync-button"]')
    
    // Verify sync success message
    await expect(page.locator('[data-testid="sync-success-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="calendar-status"]')).toContainText('Synced')
  })

  test('should handle event conflicts', async ({ page }) => {
    await page.goto('/dashboard/events')
    
    // Create conflicting event
    await page.click('[data-testid="add-event-button"]')
    await page.fill('[data-testid="event-title"]', 'Conflicting Meeting')
    await page.fill('[data-testid="event-datetime"]', '2025-01-16T14:00') // Same time as existing event
    await page.click('[data-testid="save-event-button"]')
    
    // Verify conflict warning
    await expect(page.locator('[data-testid="conflict-warning"]')).toBeVisible()
    await expect(page.locator('[data-testid="conflict-warning"]')).toContainText('Schedule conflict detected')
    
    // Resolve conflict
    await page.click('[data-testid="resolve-conflict-button"]')
    await page.click('[data-testid="suggest-alternative-time"]')
    
    // Accept suggested time
    await page.click('[data-testid="accept-suggestion-button"]')
    
    // Verify conflict resolved
    await expect(page.locator('[data-testid="conflict-warning"]')).not.toBeVisible()
  })

  test('should send customer notifications', async ({ page }) => {
    await page.goto('/dashboard/events')
    
    // Click on event
    await page.click('[data-testid="event-card"]')
    
    // Send customer notification
    await page.click('[data-testid="send-notification-button"]')
    
    // Verify notification options
    await expect(page.locator('[data-testid="notification-dialog"]')).toBeVisible()
    
    // Select SMS notification
    await page.click('[data-testid="sms-notification-option"]')
    
    // Customize message
    await page.fill('[data-testid="notification-message"]', 'Your appointment is confirmed for tomorrow at 2 PM.')
    
    // Send notification
    await page.click('[data-testid="send-notification-confirm"]')
    
    // Verify success message
    await expect(page.locator('[data-testid="notification-success"]')).toContainText('Notification sent successfully')
  })

  test('should show event analytics and metrics', async ({ page }) => {
    await page.goto('/dashboard/events')
    
    // Click analytics tab
    await page.click('[data-testid="analytics-tab"]')
    
    // Verify analytics charts
    await expect(page.locator('[data-testid="events-chart"]')).toBeVisible()
    await expect(page.locator('[data-testid="conversion-rate"]')).toBeVisible()
    await expect(page.locator('[data-testid="urgency-breakdown"]')).toBeVisible()
    
    // Check metrics values
    await expect(page.locator('[data-testid="total-events"]')).toContainText(/\d+/)
    await expect(page.locator('[data-testid="confirmed-events"]')).toContainText(/\d+/)
    await expect(page.locator('[data-testid="pending-events"]')).toContainText(/\d+/)
  })

  test('should export events data', async ({ page }) => {
    await page.goto('/dashboard/events')
    
    // Select date range for export
    await page.click('[data-testid="export-button"]')
    await page.selectOption('[data-testid="export-date-range"]', 'last-month')
    await page.selectOption('[data-testid="export-format"]', 'csv')
    
    // Trigger download
    const downloadPromise = page.waitForEvent('download')
    await page.click('[data-testid="download-export-button"]')
    
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('events')
    expect(download.suggestedFilename()).toContain('.csv')
  })
})