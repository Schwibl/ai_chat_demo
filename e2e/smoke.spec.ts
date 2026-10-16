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
  await expect(page.getByRole('main')).toBeVisible();
  await expect(page.getByRole('complementary', { name: 'Chat' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Open chat' })).toBeVisible();
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /chat widget/i);
  await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', '/favicon.svg');
});

test('opens the chat and shows the mock greeting', async ({ page }) => {
  const errors = trackConsoleErrors(page);

  await page.goto('/');
  await page.getByRole('button', { name: 'Open chat' }).click();
  await expect(page.locator('.chat-panel')).toHaveAttribute('data-state', 'open');
  await expect(page.getByRole('button', { name: 'Open chat' })).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-slot="message-input"]')).toBeFocused();
  await expect(page.getByText('replies come from a mock server')).toBeVisible();
  expect(errors).toEqual([]);
});

test('closed panel stays out of the tab order and Escape closes it', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.chat-panel')).toHaveJSProperty('inert', true);
  await expect(page.getByRole('button', { name: 'Expand panel' })).toHaveCount(0);

  await page.getByRole('button', { name: 'Open chat' }).click();
  await expect(page.getByRole('button', { name: 'Expand panel' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.chat-panel')).toHaveAttribute('data-state', 'closed');
  await expect(page.getByRole('button', { name: 'Open chat' })).toBeFocused();
  await expect(page.getByRole('button', { name: 'Expand panel' })).toHaveCount(0);
});

test('shows a typing indicator, then retry, when send fails', async ({ page }) => {
  let releaseSend: () => void = () => {};
  const sendGate = new Promise<void>((resolve) => {
    releaseSend = resolve;
  });

  await page.route('**/api/chat/**', async (route) => {
    const url = route.request().url();

    if (url.includes('/init')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ chatToken: 'demo-token' }),
      });
      return;
    }

    if (url.includes('/getMessages')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ messages: [] }),
      });
      return;
    }

    await sendGate;
    await route.fulfill({ status: 500, body: 'fail' });
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Open chat' }).click();
  await expect(page.getByText('Hi. Ask anything.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'What can you do?' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'How is this built?' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Show an example' })).toBeVisible();
  await page.locator('[data-slot="message-input"]').fill('ping');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText('Preparing')).toBeVisible();
  releaseSend();
  await expect(page.getByRole('alert')).toContainText("Couldn't get a reply.");
  await expect(page.getByRole('button', { name: 'Retry' })).toBeVisible();
});

test('uses 36px controls on desktop and 44px plus 16px text on a phone width', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open chat' }).click();
  // Panel scales from 0.96 to 1; measure after that transition or the box is short
  await expect(page.locator('.chat-panel')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  const desktopExpand = await page.getByRole('button', { name: 'Expand panel' }).boundingBox();
  expect(desktopExpand?.width).toBeGreaterThanOrEqual(36);
  expect(desktopExpand?.height).toBeGreaterThanOrEqual(36);

  await page.setViewportSize({ width: 390, height: 844 });
  const touchClose = await page.getByRole('button', { name: 'Close chat' }).boundingBox();
  expect(touchClose?.width).toBeGreaterThanOrEqual(44);
  expect(touchClose?.height).toBeGreaterThanOrEqual(44);
  const fontSize = await page.locator('[data-slot="message-input"]').evaluate((el) => {
    return Number.parseFloat(getComputedStyle(el).fontSize);
  });
  expect(fontSize).toBeGreaterThanOrEqual(16);
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
