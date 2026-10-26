import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://images.unsplash.com/**', route => route.abort());
});

test('checkout rejects browser-saved prices that differ from the catalog', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('manara-cart', JSON.stringify([
    { key: 'altered-price', id: 2, qty: 1, price: 0.01, size: 'Regular', extras: [], notes: '' },
  ])));
  await page.goto('/checkout');
  await page.locator('.checkout-form').getByRole('button', { name: 'Pickup', exact: true }).click();
  await expect(page.locator('.checkout-form')).toContainText('cart prices or extras have changed');
  await expect(page.getByRole('button', { name: /^Place order/ })).toBeDisabled();
});

test('missing pages and private routes have correct metadata without product schema', async ({ page }) => {
  await page.goto('/food/1');
  await expect.poll(() => page.locator('#manara-schema').textContent()).toContain('Product');
  await page.goto('/food/999');
  await expect(page).toHaveTitle('Page not found | Manara');
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.locator('#manara-schema')).toHaveCount(0);
  await page.goto('/login');
  await expect(page.locator('#manara-schema')).toHaveCount(0);
});

test('local photos load on home, menu, gallery, team, and food pages', async ({ page }) => {
  for (const path of ['/', '/menu', '/gallery', '/about', '/food/1']) {
    await page.goto(path);
    await page.locator('img').evaluateAll(images => images.forEach(image => image.loading = 'eager'));
    await expect.poll(() => page.locator('img').evaluateAll(images => images.filter(image => !image.complete || image.naturalWidth === 0).map(image => image.currentSrc || image.src))).toEqual([]);
  }
});

test('Arabic direct links restore preferences and tolerate corrupted cart storage', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('manara-branch', JSON.stringify('marina'));
    localStorage.setItem('manara-cart', '{broken');
  });
  await page.goto('/ar/menu');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('.header select')).toHaveValue('marina');
  await expect(page.locator('.dish-card').first()).toBeVisible();
  await page.reload();
  await expect(page.locator('.header select')).toHaveValue('marina');
});

test('menu filters, required options, cart persistence, and pickup checkout', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/menu');
  await page.locator('.search-field input').fill('burger');
  await expect(page.locator('.dish-card')).toHaveCount(1);
  await page.goto('/food/1');
  const add = page.locator('.add-detail .btn-primary');
  await expect(add).toBeDisabled();
  await page.getByRole('button', { name: /^Large/ }).click();
  await page.getByRole('button', { name: 'Increase quantity' }).click();
  await add.click();
  await page.goto('/cart');
  await expect(page.locator('.cart-item')).toHaveCount(1);
  await expect(page.locator('.cart-description')).toContainText('Large');
  await page.getByRole('link', { name: 'Proceed to checkout' }).click();
  const form = page.locator('.checkout-form');
  await form.getByLabel('Full name').fill('Angular Guest');
  await form.getByLabel('Email address').fill('angular@example.com');
  await form.getByLabel('Phone number').fill('0790000000');
  await form.getByRole('button', { name: 'Pickup', exact: true }).click();
  await form.locator('input[name="agree"]').check();
  await form.getByRole('button', { name: /^Place order/ }).click();
  await expect(page.locator('.success')).toBeVisible();
  const order = await page.evaluate(() => JSON.parse(localStorage.getItem('manara-orders')!)[0]);
  expect(order.items[0].qty).toBe(2);
  expect(order.items[0].price).toBe(20.5);
  expect(order.fulfillment).toBe('pickup');
  expect(errors).toEqual([]);
});

test('signup, profile, address dialog, and password login', async ({ page }) => {
  await page.goto('/signup');
  const form = page.locator('.auth-form');
  await form.getByLabel('Full name').fill('Angular Tester');
  await form.getByLabel('Phone number').fill('0790000000');
  await form.getByLabel('Email address').fill('test@example.com');
  await form.getByLabel('Password', { exact: true }).fill('demo-angular-123');
  await form.getByLabel('Confirm password').fill('demo-angular-123');
  await form.locator('input[name="agree"]').check();
  await form.getByRole('button', { name: 'Create account', exact: true }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.locator('.profile-sidebar').getByRole('button', { name: 'Saved addresses' }).click();
  await page.getByLabel('Add an address').fill('First address');
  await page.getByRole('button', { name: 'Save address', exact: true }).click();
  await page.getByRole('button', { name: 'Edit address', exact: true }).click();
  await page.getByRole('dialog').getByLabel('Delivery address').fill('Updated address');
  await page.getByRole('dialog').getByRole('button', { name: 'Save address' }).click();
  await expect(page.locator('.address-card')).toContainText('Updated address');
  await page.getByRole('button', { name: 'Log out' }).click();
  await page.locator('.auth-form').getByLabel('Email address').fill('test@example.com');
  await page.getByLabel('Password', { exact: true }).fill('demo-angular-123');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/profile$/);
  await page.goto('/forgot-password');
  await page.locator('.auth-form').getByLabel('Email address').fill('test@example.com');
  await page.getByRole('button', { name: 'Send reset link' }).click();
  await page.getByRole('link', { name: 'Open demo reset link' }).click();
  await page.getByLabel('Password', { exact: true }).fill('reset-angular-123');
  await page.getByLabel('Confirm password').fill('reset-angular-123');
  await page.getByRole('button', { name: 'Choose a new password' }).click();
  await expect(page).toHaveURL(/\/login$/);
  await page.locator('.auth-form').getByLabel('Email address').fill('test@example.com');
  await page.getByLabel('Password', { exact: true }).fill('reset-angular-123');
  await page.getByRole('button', { name: 'Log in', exact: true }).click();
  await expect(page).toHaveURL(/\/profile$/);
});

test('delivery rejects unsupported cities and records a valid area quote', async ({ page }) => {
  await page.goto('/food/1');
  await page.getByRole('button', { name: /^Large/ }).click();
  await page.locator('.add-detail .btn-primary').click();
  await page.goto('/checkout');
  const form = page.locator('.checkout-form');
  await form.getByLabel('Full name').fill('Delivery Guest');
  await form.getByLabel('Email address').fill('delivery@example.com');
  await form.getByLabel('Phone number').fill('0790000000');
  await form.getByLabel('Delivery area').selectOption('jumeirah');
  await form.getByLabel('City', { exact: true }).fill('Unsupported city');
  await form.getByLabel('Delivery address').fill('Demo street 12');
  await expect(form.getByRole('button', { name: /^Place order/ })).toBeDisabled();
  await form.getByLabel('City', { exact: true }).fill('Dubai');
  await form.locator('input[name="agree"]').check();
  await form.getByRole('button', { name: /^Place order/ }).click();
  await expect(page.locator('.success')).toBeVisible();
  const order = await page.evaluate(() => JSON.parse(localStorage.getItem('manara-orders')!)[0]);
  expect(order.deliveryFee).toBe(3.5);
  expect(order.deliveryCity).toBe('Dubai');
  expect(order.total).toBe(24);
});

test('contact, reservation, and gallery modal work', async ({ page }) => {
  await page.goto('/contact');
  const contact = page.locator('.form-grid');
  await contact.getByLabel('Full name').fill('Contact Guest');
  await contact.getByLabel('Phone number').fill('0790000000');
  await contact.getByLabel('Email address').fill('contact@example.com');
  await contact.getByLabel('Subject').fill('Hello');
  await contact.getByLabel('Your message').fill('Demo contact message');
  await contact.getByRole('button', { name: 'Send message' }).click();
  await expect(page.locator('.success')).toBeVisible();
  await page.goto('/reservation');
  const reservation = page.locator('.form-grid');
  await reservation.getByLabel('Full name').fill('Reservation Guest');
  await reservation.getByLabel('Phone number').fill('0790000000');
  await reservation.getByLabel('Email address').fill('reservation@example.com');
  await reservation.getByLabel('Date', { exact: true }).fill('2027-01-10');
  await reservation.getByLabel('Time', { exact: true }).selectOption('18:00');
  await reservation.getByRole('button', { name: 'Confirm reservation' }).click();
  await expect(page.locator('.success')).toBeVisible();
  await page.goto('/gallery');
  await page.locator('.masonry button').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

test('all public pages render and mobile navigation remains usable', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const path of ['/', '/about', '/privacy', '/terms', '/food/999', '/missing-page']) {
    await page.goto(path);
    await expect(page.locator('main h1').first()).toBeVisible();
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('dialog').getByRole('link', { name: 'Menu', exact: false }).click();
  await expect(page).toHaveURL(/\/menu$/);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  expect(errors).toEqual([]);
});
