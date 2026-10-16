import { expect, test, type Page } from '@playwright/test';

// Keep browser errors so a red smoke points at the message
function trackConsoleErrors(page: Page): string[] {
  const errors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    errors.push(error.message);
  });

  return errors;
}

test('loads with no console errors', async ({ page }) => {
  const errors = trackConsoleErrors(page);

  await page.goto('/');
  await expect(page).toHaveTitle('AI chat widget demo');
  expect(errors).toEqual([]);
});

test('renders the host page and chat trigger', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Example site page' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open chat' })).toBeVisible();
});

test('opens the chat and shows the mock greeting', async ({ page }) => {
  const errors = trackConsoleErrors(page);

  await page.goto('/');
  await page.getByRole('button', { name: 'Open chat' }).click();
  await expect(page.locator('.chat-panel')).toHaveAttribute('data-state', 'open');
  await expect(page.getByText('Hi. Ask anything')).toBeVisible();
  expect(errors).toEqual([]);
});

test('shows a clear message when the chat API is missing', async ({ page }) => {
  await page.route('**/api/chat/**', (route) => {
    void route.fulfill({ status: 404, body: 'missing' });
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Open chat' }).click();
  await expect(page.getByText('Chat API is not available')).toBeVisible();
  await expect(page.getByText('No API key is required')).toBeVisible();
});
