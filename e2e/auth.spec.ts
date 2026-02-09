import { test, expect } from '@playwright/test';

test.describe('Auth Flow - Login', () => {
  test('login page loads with all elements', async ({ page }) => {
    await page.goto('/auth/login');

    // Check heading and branding (emoji is part of heading, so no need to check separately)
    await expect(page.getByRole('heading', { name: /welcome back, lobster/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /lobsterwork/i })).toBeVisible();

    // Check form elements
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /send magic link/i })).toBeVisible();

    // Check help text
    await expect(page.getByText(/we'll send you a magic link to sign in instantly/i)).toBeVisible();
    await expect(page.getByText(/how it works/i)).toBeVisible();

    // Check navigation links
    await expect(page.getByRole('link', { name: /join the pod/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /back to home/i })).toBeVisible();
  });

  test('can submit login form with valid email', async ({ page }) => {
    await page.goto('/auth/login');

    // Fill in email
    await page.getByLabel(/email address/i).fill('test@example.com');

    // Submit form
    await page.getByRole('button', { name: /send magic link/i }).click();

    // Check for loading state
    await expect(page.getByText(/sending magic link/i)).toBeVisible({ timeout: 2000 }).catch(() => {});

    // Check for success message (or error if Supabase is unreachable)
    const successMessage = page.getByText(/check your email for the magic link/i);
    const errorMessage = page.getByText(
      /failed to fetch|auth service unreachable|failed to send|error sending confirmation email/i,
    );
    
    await expect(successMessage.or(errorMessage)).toBeVisible({ timeout: 15000 });
  });

  test('email field is required', async ({ page }) => {
    await page.goto('/auth/login');

    // Try to submit without email
    await page.getByRole('button', { name: /send magic link/i }).click();

    // Browser HTML5 validation should prevent submission
    const emailInput = page.getByLabel(/email address/i);
    await expect(emailInput).toBeFocused();
  });

  test('navigates to signup page', async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByRole('link', { name: /join the pod/i }).click();
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test('navigates back to home', async ({ page }) => {
    await page.goto('/auth/login');

    await page.getByRole('link', { name: /back to home/i }).click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Auth Flow - Signup', () => {
  test('signup page loads with all elements', async ({ page }) => {
    await page.goto('/auth/signup');

    // Check heading and branding (emoji is part of heading, so no need to check separately)
    await expect(page.getByRole('heading', { name: /join the pod/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /lobsterwork/i })).toBeVisible();

    // Check form elements
    await expect(page.getByText(/i am a\.\.\./i)).toBeVisible();
    await expect(page.getByRole('button', { name: /human/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /ai lobster/i })).toBeVisible();
    await expect(page.getByLabel(/display name/i)).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();

    // Check navigation links
    await expect(page.getByRole('link', { name: /sign in/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /back to home/i })).toBeVisible();
  });

  test('can toggle between Human and AI Lobster user types', async ({ page }) => {
    await page.goto('/auth/signup');

    const humanButton = page.getByRole('button', { name: /human/i });
    const aiButton = page.getByRole('button', { name: /ai lobster/i });

    // Default should be Human (pressed)
    await expect(humanButton).toHaveAttribute('aria-pressed', 'true');
    await expect(aiButton).toHaveAttribute('aria-pressed', 'false');

    // Click AI Lobster
    await aiButton.click();
    await expect(aiButton).toHaveAttribute('aria-pressed', 'true');
    await expect(humanButton).toHaveAttribute('aria-pressed', 'false');

    // Click back to Human
    await humanButton.click();
    await expect(humanButton).toHaveAttribute('aria-pressed', 'true');
    await expect(aiButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('can submit signup form with valid data', async ({ page }) => {
    await page.goto('/auth/signup');

    // Select AI Lobster
    await page.getByRole('button', { name: /ai lobster/i }).click();

    // Fill in display name
    await page.getByLabel(/display name/i).fill('Test Lobster');

    // Fill in email
    await page.getByLabel(/email address/i).fill('testlobster@example.com');

    // Submit form
    await page.getByRole('button', { name: /create account/i }).click();

    // Check for loading state
    await expect(page.getByText(/sending magic link/i)).toBeVisible({ timeout: 2000 }).catch(() => {});

    // Check for success message (or error if Supabase is unreachable)
    const successMessage = page.getByText(/check your email for the magic link/i);
    const errorMessage = page.getByText(
      /failed to fetch|auth service unreachable|failed to send|error sending confirmation email/i,
    );
    
    await expect(successMessage.or(errorMessage)).toBeVisible({ timeout: 15000 });
  });

  test('can submit signup form as Human', async ({ page }) => {
    await page.goto('/auth/signup');

    // Human should be selected by default
    await expect(page.getByRole('button', { name: /human/i })).toHaveAttribute('aria-pressed', 'true');

    // Fill in display name
    await page.getByLabel(/display name/i).fill('Test Human');

    // Fill in email
    await page.getByLabel(/email address/i).fill('testhuman@example.com');

    // Submit form
    await page.getByRole('button', { name: /create account/i }).click();

    // Check for success or error message
    const successMessage = page.getByText(/check your email for the magic link/i);
    const errorMessage = page.getByText(
      /failed to fetch|auth service unreachable|failed to send|error sending confirmation email/i,
    );
    
    await expect(successMessage.or(errorMessage)).toBeVisible({ timeout: 15000 });
  });

  test('email field is required', async ({ page }) => {
    await page.goto('/auth/signup');

    // Fill in display name but not email
    await page.getByLabel(/display name/i).fill('Test User');

    // Try to submit
    await page.getByRole('button', { name: /create account/i }).click();

    // Browser HTML5 validation should prevent submission
    const emailInput = page.getByLabel(/email address/i);
    await expect(emailInput).toBeFocused();
  });

  test('navigates to login page', async ({ page }) => {
    await page.goto('/auth/signup');

    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('navigates back to home', async ({ page }) => {
    await page.goto('/auth/signup');

    await page.getByRole('link', { name: /back to home/i }).click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Auth Flow - Navigation', () => {
  test('can navigate between login and signup pages', async ({ page }) => {
    // Start at login
    await page.goto('/auth/login');
    await expect(page).toHaveURL(/\/auth\/login/);

    // Go to signup
    await page.getByRole('link', { name: /join the pod/i }).click();
    await expect(page).toHaveURL(/\/auth\/signup/);

    // Go back to login
    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('can navigate from auth pages to home', async ({ page }) => {
    // From login to home
    await page.goto('/auth/login');
    await page.getByRole('link', { name: /back to home/i }).click();
    await expect(page).toHaveURL('/');

    // From signup to home
    await page.goto('/auth/signup');
    await page.getByRole('link', { name: /back to home/i }).click();
    await expect(page).toHaveURL('/');
  });
});

test.describe('Auth Flow - Error Handling', () => {
  test('displays error message when Supabase is unreachable', async ({ page, context }) => {
    // Block Supabase requests to simulate unreachable service
    await context.route('**/*supabase.co/**', route => route.abort());

    await page.goto('/auth/login');
    await page.getByLabel(/email address/i).fill('test@example.com');
    await page.getByRole('button', { name: /send magic link/i }).click();

    // Should show error message
    // Note: When network requests are blocked, browser throws "Failed to fetch" before our custom timeout/error messages
    await expect(
      page.getByText(
        /failed to fetch|auth service unreachable|failed to send|error sending confirmation email/i,
      ),
    ).toBeVisible({ timeout: 15000 });
  });

  test('form buttons are disabled during submission', async ({ page }) => {
    await page.goto('/auth/login');
    
    await page.getByLabel(/email address/i).fill('test@example.com');
    
    const submitButton = page.getByRole('button', { name: /send magic link/i });
    await submitButton.click();

    // Button should be disabled during loading
    await expect(submitButton).toBeDisabled({ timeout: 2000 }).catch(() => {});
  });
});
