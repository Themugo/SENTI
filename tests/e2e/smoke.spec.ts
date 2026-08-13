import { test, expect } from '@playwright/test';

test('landing page loads and shows hero', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toContainText('Money without');
});

test('login page renders form', async ({ page }) => {
  await page.goto('/login');
  await expect(page.locator('input[type="email"]')).toBeVisible();
});

test('dashboard redirects to login when unauthenticated', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page).toHaveURL(/\/login/);
});
