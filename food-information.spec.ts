import { test, expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.route("https://images.unsplash.com/**", (route) => route.abort())
})

test("optional nutrition and allergen details render on menus and dishes", async ({ page }) => {
  await page.goto("/menu")
  await expect(page.locator("main .kitchen-notice")).toContainText("Cross-contact")
  await expect(page.locator(".dish-card").first().locator(".food-information")).toContainText("520")
  await page.goto("/food/4")
  const information = page.locator("main .food-details .food-information")
  await expect(information).toContainText("Nuts")
  await expect(information).toContainText("Milk")
  await expect(information).toContainText("Gluten")
  await expect(information).toContainText("Eggs")
  await expect(information).toContainText("420")
  await expect(information).toContainText("Sample information")
  await expect(information).toContainText("Sizes, extras")
  await page.goto("/food/2")
  await expect(page.locator("main .food-details .food-information")).toHaveCount(0)
  await expect(page.locator("main .kitchen-notice")).toBeVisible()
})

test("Arabic food information remains readable at mobile widths", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 812 })
  for (const path of ["/ar/menu", "/ar/food/4"]) {
    await page.goto(path)
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl")
    await expect(page.locator("main .kitchen-notice")).toContainText("تلامس")
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1)
  }
  await expect(page.locator("main .food-details .food-information")).toContainText("المكسرات")
  await expect(page.locator("main .food-details .food-information")).toContainText("الحليب")
})
