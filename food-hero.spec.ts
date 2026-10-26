import { test, expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.route("https://images.unsplash.com/**", (route) => route.abort())
})

test("a menu dish opens its hero, photo and ordering options", async ({ page }) => {
  await page.goto("/menu")
  await page.locator(".dish-card").first().getByRole("heading").click()
  await expect(page).toHaveURL(/\/food\/1$/)
  await expect(page.locator(".food-details h1")).toHaveText("Mediterranean bowl")
  await expect(page.locator(".detail-image")).toBeVisible()
  await expect(page.locator(".detail-price")).toContainText("JOD")
  await page.getByRole("button", { name: "View food photo", exact: true }).click()
  await expect(page.getByRole("dialog")).toBeVisible()
  await page.keyboard.press("Escape")
  const add = page.locator(".add-detail").getByRole("button", { name: /^Add/ })
  await expect(add).toBeDisabled()
  await page.getByRole("button", { name: /Large/ }).click()
  await expect(add).toBeEnabled()
  await add.click()
  await expect.poll(() => page.evaluate(() =>
    JSON.parse(localStorage.getItem("manara-cart") ?? "[]").length,
  )).toBe(1)
})

test("food heroes fit narrow English and Arabic screens", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 })
  for (const path of ["/food/1", "/ar/food/1"]) {
    await page.goto(path)
    await expect(page.locator(".food-details h1")).toHaveCount(1)
    await expect(page.locator(".food-details h1")).toBeVisible()
    await expect(page.locator(".add-detail")).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
  }
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl")
  await expect(page.locator(".food-details h1")).toHaveText("طبق البحر المتوسط")
})
