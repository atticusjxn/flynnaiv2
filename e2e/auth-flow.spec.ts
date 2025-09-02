import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should allow user to login and access dashboard', async ({ page }) => {
    // Navigate to login page
    await page.goto('/login')

    // Fill in login form
    await page.fill('[data-testid="email"]', 'test.plumber@example.com')
    await page.fill('[data-testid="password"]', 'testpassword123')
    await page.click('[data-testid="login-button"]')

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/)
    
    // Verify dashboard elements are present
    await expect(page.locator('h1')).toContainText('Dashboard')
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.fill('[data-testid="email"]', 'invalid@example.com')
    await page.fill('[data-testid="password"]', 'wrongpassword')
    await page.click('[data-testid="login-button"]')

    // Should show error message
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Invalid credentials')
  })

  test('should allow user to register new account', async ({ page }) => {
    await page.goto('/register')

    // Fill registration form
    await page.fill('[data-testid="full-name"]', 'Test User')
    await page.fill('[data-testid="email"]', 'newuser@example.com')
    await page.fill('[data-testid="password"]', 'password123')
    await page.fill('[data-testid="company-name"]', 'Test Company')
    await page.selectOption('[data-testid="industry-select"]', 'plumbing')
    
    await page.click('[data-testid="register-button"]')

    // Should redirect to onboarding or dashboard
    await expect(page).toHaveURL(/.*(?:onboarding|dashboard)/)
  })

  test('should handle logout correctly', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[data-testid="email"]', 'test.plumber@example.com')
    await page.fill('[data-testid="password"]', 'testpassword123')
    await page.click('[data-testid="login-button"]')

    // Wait for dashboard
    await expect(page).toHaveURL(/.*dashboard/)

    // Click logout
    await page.click('[data-testid="user-menu"]')
    await page.click('[data-testid="logout-button"]')

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/)
  })
})