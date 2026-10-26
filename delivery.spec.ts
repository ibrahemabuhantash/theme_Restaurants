import { test, expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.route("https://images.unsplash.com/**", (route) => route.abort())
  await page.addInitScript(() => {
    localStorage.setItem("manara-cart", JSON.stringify([
      { key: "delivery-test", id: 2, qty: 3, price: 22, size: "Regular", extras: [], notes: "" },
    ]))
  })
})

test("zone fees, free delivery, estimates and coverage update live", async ({ page }) => {
  await page.goto("/checkout")
  const form = page.locator("main .checkout-form")
  await form.getByLabel("Delivery area", { exact: true }).selectOption("al-wasl")
  await form.getByLabel("City", { exact: true }).fill("Dubai")
  await expect(form.locator(".delivery-details")).toContainText("35–50")
  await expect(page.locator(".order-summary .summary-row").filter({ hasText: /^Delivery/ }).locator("b")).toContainText("0.000")
  await expect(form).toContainText("Free delivery threshold reached")
  await page.locator(".promo-field input").fill("MANARA15")
  await page.getByRole("button", { name: "Apply", exact: true }).click()
  await expect(page.locator(".order-summary .summary-row").filter({ hasText: /^Delivery/ }).locator("b")).toContainText("5.000")
  await expect(page.locator(".summary-total b").last()).toContainText("61.100")
  await expect(form.locator(".delivery-details")).toContainText("8.900")
  await form.getByLabel("City", { exact: true }).fill("Sharjah")
  await expect(form).toContainText("outside this branch")
  await expect(form.getByRole("button", { name: /^Place order/ })).toBeDisabled()
  await form.getByLabel("City", { exact: true }).fill("Dubai")
  await form.getByLabel("Delivery area", { exact: true }).selectOption("outside")
  await expect(form.getByRole("button", { name: /^Place order/ })).toBeDisabled()
  await form.getByRole("button", { name: "Pickup", exact: true }).click()
  await expect(page.locator(".order-summary .summary-row").filter({ hasText: /^Delivery/ }).locator("b")).toContainText("0.000")
  await expect(form.getByRole("button", { name: /^Place order/ })).toBeEnabled()
})

test("submission rechecks the actual city and snapshots the accepted delivery quote", async ({ page }) => {
  await page.goto("/checkout")
  const form = page.locator("main .checkout-form")
  await form.getByLabel("Full name").fill("Delivery Tester")
  await form.getByLabel("Email address").fill("delivery@example.invalid")
  await form.getByLabel("Phone number").fill("0790000000")
  await form.getByLabel("Delivery area", { exact: true }).selectOption("al-wasl")
  await form.getByLabel("Delivery address").fill("Example street 12")
  await form.getByLabel("City", { exact: true }).fill("Dubai")
  await form.locator('input[name="agree"]').check()
  await form.evaluate((element) => {
    const form = element as HTMLFormElement
    ;(form.elements.namedItem("city") as HTMLInputElement).value = "Sharjah"
    form.requestSubmit()
  })
  await expect(page.locator(".toast")).toContainText("outside this branch")
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("manara-orders") ?? "[]").length)).toBe(0)
  await form.getByLabel("City", { exact: true }).fill("Dubai")
  await form.getByRole("button", { name: /^Place order/ }).click()
  await expect(page.locator("main .success")).toBeVisible()
  await expect(page.locator("main .success")).toContainText("35–50")
  const order = await page.evaluate(() => JSON.parse(localStorage.getItem("manara-orders") ?? "[]")[0])
  expect(order.deliveryZone.id).toBe("al-wasl")
  expect(order.deliveryFee).toBe(0)
  expect(order.deliveryMinimum).toBe(20)
  expect(order.deliveryCity).toBe("Dubai")
  expect(order.freeDeliveryApplied).toBe(true)
  expect(order.estimatedDeliveryMinutes).toEqual([35, 50])
})

test("Arabic delivery controls work at mobile widths and reset on branch changes", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 })
  await page.goto("/ar/checkout")
  const form = page.locator("main .checkout-form")
  await form.getByLabel("منطقة التوصيل", { exact: true }).selectOption("jumeirah")
  await form.getByLabel("المدينة", { exact: true }).fill("دبي")
  await expect(form.locator(".delivery-details")).toContainText("25–35")
  expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
  await page.locator(".header select").selectOption("marina")
  await expect(form.getByLabel("منطقة التوصيل", { exact: true })).toHaveValue("")
  await expect(form.locator('button[type="submit"]')).toBeDisabled()
})
