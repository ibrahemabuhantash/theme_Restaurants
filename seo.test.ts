import { test } from "node:test"
import assert from "node:assert/strict"
import { site } from "../config/site"
import { dishes } from "../data/menu"
import {
  pageMetadata, sitemapEntries, restaurantSchema, menuSchema, productSchema,
  breadcrumbSchema, reviewSchema, serializeJsonLd,
} from "../lib/seo"
import { localizedPath, localeFromPath, unlocalizedPath } from "../lib/localized-url"
import { robots } from "../lib/seo"

test("localized URLs preserve query strings and fragments without double prefixes", () => {
  assert.equal(localizedPath("/", "ar"), "/ar")
  assert.equal(localizedPath("/menu", "ar"), "/ar/menu")
  assert.equal(localizedPath("/ar/menu", "ar"), "/ar/menu")
  assert.equal(localizedPath("/ar/menu", "en"), "/menu")
  assert.equal(localizedPath("/reset-password?token=test#form", "ar"), "/ar/reset-password?token=test#form")
  assert.equal(localeFromPath("/ar/menu"), "ar")
  assert.equal(localeFromPath("/archive"), "en")
  assert.equal(unlocalizedPath("/ar"), "/")
})

test("localized metadata uses canonical URLs, language alternates, and product images", () => {
  const metadata = pageMetadata("/food/1", "menu", "ar", dishes[0])
  assert.deepEqual(metadata.title, { absolute: `${dishes[0].ar} | ${site.name}` })
  assert.equal(metadata.description, dishes[0].descriptionAr)
  assert.equal(metadata.alternates?.canonical, `${site.url}/ar/food/1`)
  assert.deepEqual(metadata.alternates?.languages, {
    en: `${site.url}/food/1`, ar: `${site.url}/ar/food/1`, "x-default": `${site.url}/food/1`,
  })
  assert.ok(JSON.stringify(metadata.openGraph).includes(dishes[0].image.src))
  assert.ok(JSON.stringify(metadata.twitter).includes("summary_large_image"))
})

test("private pages and placeholder domains are not indexed", () => {
  assert.deepEqual(pageMetadata("/checkout", "checkout", "en").robots, { index: false, follow: false })
  assert.deepEqual(robots().rules, { userAgent: "*", disallow: "/" })
})

test("sitemap contains both languages and excludes private and reset routes", () => {
  const entries = sitemapEntries()
  const urls = entries.map((entry) => entry.url)
  assert.ok(urls.includes(`${site.url}/menu`))
  assert.ok(urls.includes(`${site.url}/ar/menu`))
  assert.ok(urls.includes(`${site.url}/ar/food/1`))
  assert.equal(urls.length, new Set(urls).size)
  assert.ok(!urls.some((url) => /checkout|profile|password|signup|login/.test(url)))
})

test("restaurant, menu, product and breadcrumb graphs use configured facts", () => {
  const restaurants = restaurantSchema("ar")
  assert.equal(restaurants.length, site.branches.length)
  assert.deepEqual(restaurants[0]["@type"], ["Restaurant", "LocalBusiness"])
  assert.ok(JSON.stringify(restaurants).includes(site.branches[0].phone))
  assert.equal(menuSchema("en")["@type"], "Menu")
  const product = productSchema(dishes[0], "en")
  assert.equal(product["@type"], "Product")
  assert.ok(JSON.stringify(product).includes(`"price":"${dishes[0].price.toFixed(3)}"`))
  assert.ok(JSON.stringify(product).includes('"priceCurrency":"JOD"'))
  const soldOut = productSchema({ ...dishes[0], availability: { status: "sold-out" } }, "en")
  assert.ok(JSON.stringify(soldOut).includes("OutOfStock"))
  const crumbs = breadcrumbSchema("/food/1", "menu", "ar", dishes[0])
  assert.equal((crumbs.itemListElement as unknown[]).length, 3)
  assert.ok(JSON.stringify(crumbs).includes(dishes[0].ar))
})

test("demo testimonials do not generate review markup; verified reviews can opt in", () => {
  assert.deepEqual(reviewSchema("en"), [])
  site.seo.verifiedReviews = true
  try {
    assert.equal(reviewSchema("ar")[0]["@type"], "Review")
  } finally {
    site.seo.verifiedReviews = false
  }
})

test("JSON-LD serialization cannot terminate the script element", () => {
  const result = serializeJsonLd([{ name: "</script><script>alert(1)</script>" }])
  assert.ok(!result.includes("</script>"))
  assert.equal(JSON.parse(result)["@graph"][0].name, "</script><script>alert(1)</script>")
})
