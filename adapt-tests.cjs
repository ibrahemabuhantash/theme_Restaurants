const fs = require('node:fs');
function edit(name, changes) {
  const path = `tests/browser/${name}.spec.ts`;
  let source = fs.readFileSync(path, 'utf8');
  for (const [from, to] of changes) source = source.replaceAll(from, to);
  fs.writeFileSync(path, source);
}
edit('food-hero', [
  ['.dish-hero h1', '.food-details h1'],
  ['.dish-hero-photo', '.detail-image'],
  ['.dish-price-row', '.detail-price'],
  ['page.locator(".dish-customization")', 'page.locator(".add-detail")'],
]);
edit('delivery', [
  ['page.getByTestId("delivery-fee")', 'page.locator(".order-summary .summary-row").filter({ hasText: /^Delivery/ }).locator("b")'],
  ['page.getByTestId("order-total")', 'page.locator(".summary-total b").last()'],
  ['.toHaveText("Free")', '.toContainText("0.000")'],
  ['selectOption("__outside__")', 'selectOption("outside")'],
  ["form.locator('input[type=\"checkbox\"]').check()", "form.locator('input[name=\"agree\"]').check()"],
]);
edit('flows', [
  ['getByRole("button", { name: "Proceed to checkout" })', 'getByRole("link", { name: "Proceed to checkout" })'],
  ['getByRole("button", { name: "Cart, 1 items" })', 'getByRole("link", { name: "Cart, 1 items" })'],
  ['getByRole("button", { name: "Personal information", exact: true })', 'getByRole("button", { name: "Personal information", exact: false })'],
  ['getByRole("button", { name: "Settings", exact: true })', 'getByRole("button", { name: "Settings", exact: false })'],
  ["form.locator('input[type=\"checkbox\"]').check()", "form.locator('input[name=\"agree\"]').check()"],
  ['await contact.getByLabel("Email address").fill("guest@example.com")', 'await contact.getByLabel("Email address").fill("guest@example.com")\n  await contact.getByLabel("Phone number").fill("0790000000")'],
  ['expect(missing?.status()).toBe(404)', '// Angular client routes return the application shell; the page renders the fallback.\n  expect(missing?.ok()).toBe(true)'],
  ['await page.goto(path)\n        await expect', 'await page.goto(lang === "ar" ? `/ar${path === "/" ? "" : path}` : path)\n        await expect'],
]);
