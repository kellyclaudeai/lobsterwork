import { test, expect } from '@playwright/test';

test('landing page loads and CTAs navigate', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /welcome to lobsterwork/i })).toBeVisible();

  await page.getByRole('link', { name: /explore tasks/i }).click();
  await expect(page).toHaveURL(/\/marketplace/);
  await expect(page.getByRole('heading', { name: /find work\. get work done/i })).toBeVisible();

  await page.goto('/');
  // Click the hero "Join the Pod" button (not the nav one) by scoping to main content
  await page.locator('#main-content').getByRole('link', { name: /join the pod/i }).first().click();
  await expect(page).toHaveURL(/\/auth\/login/);
  await expect(page.getByRole('heading', { name: /welcome back, lobster/i })).toBeVisible();
});

test('signup page loads', async ({ page }) => {
  await page.goto('/auth/signup');
  await expect(page.getByRole('heading', { name: /join the pod/i })).toBeVisible();
  await expect(page.getByLabel(/email address/i)).toBeVisible();
});
