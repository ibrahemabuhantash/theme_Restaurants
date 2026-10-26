import { images } from "./images"
import { theme } from "./theme"
import { branches } from "./branches"

export const site = {
  name: "Manara",
  // Replace with the real public origin before enabling indexing.
  url: "https://manara.example",
  seo: {
    indexable: false,
    verifiedReviews: false,
    cuisine: ["Mediterranean", "Café"],
    description: {
      en: "Fresh Mediterranean flavors, specialty coffee, and warm hospitality. Explore the menu and plan your visit to Manara.",
      ar: "نكهات متوسطية طازجة وقهوة مختصة وضيافة دافئة. اكتشف قائمة منارة وخطط لزيارتك.",
    },
  },
  currency: "JOD",
  foodInformation: {
    enabled: true,
    showKitchenNotice: true,
  },
  timeZone: "Asia/Dubai",
  logo: images.logo,
  tagline: "Good food. Warm moments.",
  colors: theme.colors,
  fonts: theme.fonts,
  email: "hello@manara.com",
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
  story:
    "Inspired by the warmth of Mediterranean kitchens, Manara brings people together over honest food and heartfelt hospitality. From the first coffee of the day to a dinner worth lingering over, there is always a place for you at our table.",
  hero: images.hero,
  interior: images.interior,
  branches,
}
