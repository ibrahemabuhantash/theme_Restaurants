import { test, expect } from "@playwright/test"

test.beforeEach(async ({ page }) => {
  await page.route("https://images.unsplash.com/**", (route) => route.abort())
})

test("localized metadata and Arabic navigation stay aligned without hydration errors", async ({ page }) => {
  const errors: string[] = []
  page.on("pageerror", (error) => errors.push(error.message))
  page.on("console", (message) => {
    if (/hydration|did not match/i.test(message.text())) errors.push(message.text())
  })
  await page.goto("/ar/menu")
  await expect(page.locator("html")).toHaveAttribute("lang", "ar")
  await expect(page.locator("html")).toHaveAttribute("dir", "rtl")
  await expect(page).toHaveTitle("القائمة | Manara")
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://manara.example/ar/menu")
  await expect(page.locator(".desktop-nav a[href='/ar/about']")).toHaveCount(1)
  await page.locator(".dish-image a").first().click()
  await expect(page).toHaveURL(/\/ar\/food\/\d+$/)
  await expect(page.locator(".food-details h1")).toContainText("البحر المتوسط")
  await expect(page).toHaveTitle("طبق البحر المتوسط | Manara")
  await page.getByRole("button", { name: "Switch language", exact: true }).click()
  await expect(page).toHaveURL(/\/food\/1$/)
  await expect(page.locator("html")).toHaveAttribute("dir", "ltr")
  await expect(page).toHaveTitle("Mediterranean bowl | Manara")
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://manara.example/food/1")
  expect(errors).toEqual([])
})

// Angular uses client rendering, so inspect route metadata after browser bootstrap.
test("public pages render metadata and JSON-LD and expose static discovery files", async ({ page, request }) => {
  for (const [path, type] of [["/", "Restaurant"], ["/ar/menu", "Menu"], ["/food/1", "Product"]]) {
    const response = await request.get(path)
    expect(response.ok()).toBeTruthy()
    await page.goto(path)
    await expect(page.locator('#manara-schema')).toHaveCount(1)
    const html = await page.content()
    expect(html).toContain('application/ld+json')
    expect(html).toContain(`"${type}"`)
    expect(html).toContain('property="og:image"')
    expect(html).toContain('rel="canonical"')
  }
  const sitemap = await request.get("/sitemap.xml")
  expect(await sitemap.text()).toContain("/ar/food/1")
  const robots = await request.get("/robots.txt")
  expect(await robots.text()).toContain("Disallow: /")
})
