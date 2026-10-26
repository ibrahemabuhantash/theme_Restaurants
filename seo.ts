import { site } from "../config/site"
import { dishes, type Dish } from "../data/menu"
import { categories } from "../data/categories"
import { reviews } from "../data/reviews"
import en from "../locales/en.json"
import ar from "../locales/ar.json"
import { localizedPath, type Locale } from "./localized-url"

export const publicPages = [
  { path: "/", key: "home" },
  { path: "/menu", key: "menu" },
  { path: "/about", key: "about" },
  { path: "/gallery", key: "gallery" },
  { path: "/contact", key: "contact" },
  { path: "/reservation", key: "reservation" },
  { path: "/privacy", key: "privacy" },
  { path: "/terms", key: "terms" },
] as const
export const privatePaths = ["/cart", "/checkout", "/login", "/signup", "/forgot-password", "/reset-password", "/profile"]
export const absoluteUrl = (path: string) => new URL(path, site.url).href
export const canIndex = () => site.seo.indexable && !new URL(site.url).hostname.endsWith(".example")
export function robots() {
  return {
    rules: canIndex() ? { userAgent: "*", allow: "/" } : { userAgent: "*", disallow: "/" },
    sitemap: absoluteUrl('/sitemap.xml'),
  }
}
export const dictionary = (locale: Locale) => locale === "ar" ? ar : en
const descriptionKeys: Record<string, keyof typeof en> = {
  "/about": "seoAboutDescription",
  "/gallery": "seoGalleryDescription",
  "/contact": "seoContactDescription",
  "/reservation": "seoReservationDescription",
  "/privacy": "seoPrivacyDescription",
  "/terms": "seoTermsDescription",
}

export function pageMetadata(path: string, key: keyof typeof en, locale: Locale, dish?: Dish) {
  const copy = dictionary(locale)
  const title = dish ? (locale === "ar" ? dish.ar : dish.name) : copy[key]
  const description = dish
    ? (locale === "ar" ? dish.descriptionAr : dish.description)
    : path === "/menu" ? copy.categoriesSub
    : descriptionKeys[path] ? copy[descriptionKeys[path]] : site.seo.description[locale]
  const image = dish?.image ?? site.hero
  const canonical = absoluteUrl(localizedPath(path, locale))
  return {
    title: { absolute: `${title} | ${site.name}` }, description,
    alternates: {
      canonical,
      languages: { en: absoluteUrl(path), ar: absoluteUrl(localizedPath(path, "ar")), "x-default": absoluteUrl(path) },
    },
    robots: { index: canIndex() && !privatePaths.includes(path), follow: !privatePaths.includes(path) },
    openGraph: {
      type: "website", title: `${title} | ${site.name}`, description, url: canonical,
      siteName: site.name, locale: locale === "ar" ? "ar_JO" : "en_JO",
      alternateLocale: locale === "ar" ? "en_JO" : "ar_JO",
      images: [{ url: absoluteUrl(image.src), width: image.width, height: image.height, alt: image.alt[locale] }],
    },
    twitter: { card: "summary_large_image", title: `${title} | ${site.name}`, description, images: [absoluteUrl(image.src)] },
  }
}

export function sitemapEntries() {
  return [...publicPages.map((page) => page.path), ...dishes.map((dish) => `/food/${dish.id}`)]
    .flatMap((path) => (["en", "ar"] as const).map((locale) => ({
      url: absoluteUrl(localizedPath(path, locale)),
      alternates: { languages: { en: absoluteUrl(path), ar: absoluteUrl(localizedPath(path, "ar")) } },
    })))
}

export type SchemaNode = Record<string, unknown>
const restaurantId = (id: string) => absoluteUrl(`/#branch-${id}`)
const productId = (id: number, locale: Locale) => `${absoluteUrl(localizedPath(`/food/${id}`, locale))}#product`

export function restaurantSchema(locale: Locale): SchemaNode[] {
  return site.branches.map((branch) => ({
    "@type": ["Restaurant", "LocalBusiness"],
    "@id": restaurantId(branch.id),
    name: `${site.name} — ${branch.name[locale]}`,
    url: absoluteUrl(localizedPath("/contact", locale)),
    image: absoluteUrl(site.interior.src),
    logo: absoluteUrl(site.logo.src),
    telephone: branch.phone,
    email: site.email,
    address: { "@type": "PostalAddress", streetAddress: branch.address[locale], ...branch.postalAddress },
    ...(branch.openingHoursSchema ? { openingHours: branch.openingHoursSchema } : {}),
    geo: { "@type": "GeoCoordinates", latitude: branch.coordinates.lat, longitude: branch.coordinates.lng },
    servesCuisine: site.seo.cuisine,
    hasMenu: absoluteUrl(localizedPath("/menu", locale)),
    currenciesAccepted: site.currency,
    sameAs: [site.instagram, site.facebook],
  }))
}

export function menuSchema(locale: Locale): SchemaNode {
  return {
    "@type": "Menu", "@id": `${absoluteUrl(localizedPath("/menu", locale))}#menu`,
    name: dictionary(locale).menu, inLanguage: locale,
    hasMenuSection: categories.filter((category) => category !== "All").map((category) => ({
      "@type": "MenuSection", name: dictionary(locale)[category as keyof typeof en] ?? category,
      hasMenuItem: dishes.filter((dish) => dish.category === category).map((dish) => ({
        "@type": "MenuItem", name: locale === "ar" ? dish.ar : dish.name,
        description: locale === "ar" ? dish.descriptionAr : dish.description,
        image: absoluteUrl(dish.image.src), url: absoluteUrl(localizedPath(`/food/${dish.id}`, locale)),
        offers: { "@type": "Offer", price: dish.price.toFixed(3), priceCurrency: site.currency },
      })),
    })),
  }
}

export function productSchema(dish: Dish, locale: Locale): SchemaNode {
  return {
    "@type": "Product", "@id": productId(dish.id, locale),
    name: locale === "ar" ? dish.ar : dish.name,
    description: locale === "ar" ? dish.descriptionAr : dish.description,
    image: absoluteUrl(dish.image.src), sku: String(dish.id),
    brand: { "@type": "Brand", name: site.name },
    offers: {
      "@type": "Offer", url: absoluteUrl(localizedPath(`/food/${dish.id}`, locale)),
      price: dish.price.toFixed(3), priceCurrency: site.currency,
      ...(dish.availability?.status === "sold-out" ? { availability: "https://schema.org/OutOfStock" } : {}),
    },
  }
}

export function breadcrumbSchema(path: string, key: keyof typeof en, locale: Locale, dish?: Dish): SchemaNode {
  const copy = dictionary(locale)
  const items = [{ name: copy.home, path: "/" }]
  if (dish) items.push({ name: copy.menu, path: "/menu" })
  if (path !== "/") items.push({ name: dish ? (locale === "ar" ? dish.ar : dish.name) : copy[key], path })
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem", position: index + 1, name: item.name,
      item: absoluteUrl(localizedPath(item.path, locale)),
    })),
  }
}

export function reviewSchema(locale: Locale): SchemaNode[] {
  // The supplied testimonials are demo content; never present them as verified reviews.
  if (!site.seo.verifiedReviews) return []
  return reviews.map((review, index) => ({
    "@type": "Review", "@id": absoluteUrl(`/#review-${index + 1}`),
    itemReviewed: { "@type": "Restaurant", name: site.name, "@id": restaurantId(site.branches[0].id) },
    author: { "@type": "Person", name: review.name },
    reviewBody: review.text[locale],
    reviewRating: { "@type": "Rating", ratingValue: review.rating, bestRating: 5, worstRating: 1 },
    inLanguage: locale,
  }))
}

export function serializeJsonLd(nodes: SchemaNode[]) {
  return JSON.stringify({ "@context": "https://schema.org", "@graph": nodes }).replace(/</g, "\\u003c")
}
