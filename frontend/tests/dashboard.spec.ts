import { test, expect } from '@playwright/test';

test.describe('Ethereum Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load dashboard and display main elements', async ({ page }) => {
    // Check page title and header
    await expect(page).toHaveTitle(/Ethereum Block Explorer/);
    await expect(page.getByText('Ethereum Block Explorer')).toBeVisible();
    await expect(page.getByText('Ethereum Dashboard')).toBeVisible();
  });

  test('should display theme toggle controls', async ({ page }) => {
    // Check if theme toggle button exists
    await expect(page.locator('button[title*="Current theme"]')).toBeVisible();
    await expect(page.locator('button[title*="Dark mode"]')).toBeVisible();
  });

  test('should switch between themes', async ({ page }) => {
    // Test dark mode toggle
    const darkModeToggle = page.locator('button[title*="Dark mode"]');

    // Initially light mode (assuming)
    await expect(page.locator('html')).not.toHaveClass(/dark/);

    // Toggle dark mode
    await darkModeToggle.click();
    await expect(page.locator('html')).toHaveClass(/dark/);

    // Toggle back to light mode
    await darkModeToggle.click();
    await expect(page.locator('html')).not.toHaveClass(/dark/);
  });

  test('should cycle through color themes', async ({ page }) => {
    const themeToggle = page.locator('button[title*="Click to change"]');

    // Click through themes
    await themeToggle.click();
    await themeToggle.click();
    await themeToggle.click();

    // Verify the button still exists after theme changes
    await expect(themeToggle).toBeVisible();
  });

  test('should display dashboard controls', async ({ page }) => {
    // Check for refresh and auto-poll controls
    await expect(page.getByText('Refresh')).toBeVisible();
    await expect(page.getByText(/Auto-poll:/)).toBeVisible();

    // Auto-poll should be ON by default
    await expect(page.getByText('Auto-poll: ON')).toBeVisible();
  });

  test('should toggle auto-poll functionality', async ({ page }) => {
    const autoPollToggle = page.getByText(/Auto-poll:/);

    // Initially should be ON
    await expect(page.getByText('Auto-poll: ON')).toBeVisible();

    // Toggle to OFF
    await autoPollToggle.click();
    await expect(page.getByText('Auto-poll: OFF')).toBeVisible();

    // Toggle back to ON
    await autoPollToggle.click();
    await expect(page.getByText('Auto-poll: ON')).toBeVisible();
  });

  test('should show loading state on refresh', async ({ page }) => {
    const refreshButton = page.getByText('Refresh');

    // Click refresh and check for loading state
    await refreshButton.click();

    // Check for skeleton loading indicators or loading text
    // This will depend on your loading implementation
    const loadingElements = page.locator('[class*="skeleton"], [class*="loading"]');
    await expect(loadingElements.first()).toBeVisible({ timeout: 2000 });
  });

  test('should display dashboard sections', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(2000);

    // Check for main dashboard sections
    await expect(page.getByText('Latest Block')).toBeVisible();
    await expect(page.getByText('Transaction Count')).toBeVisible();
    await expect(page.getByText('Average Value')).toBeVisible();
    await expect(page.getByText('Average Gas Price')).toBeVisible();
  });

  test('should display data tables', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(3000);

    // Check for tables
    await expect(page.getByText('Top Senders')).toBeVisible();
    await expect(page.getByText('Top Receivers')).toBeVisible();
    await expect(page.getByText('Top Gas Spenders')).toBeVisible();

    // Check for table elements
    const tables = page.locator('table');
    await expect(tables.first()).toBeVisible();
  });

  test('should display charts section', async ({ page }) => {
    // Wait for charts to load
    await page.waitForTimeout(3000);

    // Check for chart titles
    await expect(page.getByText('Transaction Count Trend')).toBeVisible();
    await expect(page.getByText('Total Value per Block')).toBeVisible();
    await expect(page.getByText('Gas Usage Trend')).toBeVisible();

    // Check for chart containers
    const chartContainers = page.locator('[class*="recharts-wrapper"], svg');
    await expect(chartContainers.first()).toBeVisible({ timeout: 5000 });
  });

  test('should handle responsive layout', async ({ page }) => {
    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });

    // Elements should still be visible
    await expect(page.getByText('Ethereum Dashboard')).toBeVisible();
    await expect(page.getByText('Latest Block')).toBeVisible();

    // Test desktop layout
    await page.setViewportSize({ width: 1200, height: 800 });

    // Should still work on desktop
    await expect(page.getByText('Ethereum Dashboard')).toBeVisible();
    await expect(page.getByText('Transaction Count Trend')).toBeVisible();
  });

  test('should show error handling', async ({ page }) => {
    // Intercept API calls to simulate errors
    await page.route('/api/blocks/latest', route => route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Backend unavailable' })
    }));

    await page.reload();

    // Check for error state
    await expect(page.getByText(/Error:/)).toBeVisible({ timeout: 5000 });
  });

  test('should update last updated time', async ({ page }) => {
    // Get initial last updated text
    const initialText = await page.getByText('Last updated:').textContent();

    // Wait for auto-refresh (if enabled)
    await page.waitForTimeout(35000);

    // Check if last updated time has changed
    const updatedText = await page.getByText('Last updated:').textContent();
    expect(initialText).not.toBe(updatedText);
  });
});