export type DeliveryZone = {
  id: string
  name: { en: string; ar: string }
  /** Mock address coverage: exact city names/aliases, in either language. */
  cities: string[]
  fee: number
  minimumOrder: number
  freeDeliveryAbove?: number
  estimatedMinutes: [number, number]
}
export type Branch = {
  id: string
  name: { en: string; ar: string }
  address: { en: string; ar: string }
  phone: string
  coordinates: { lat: number; lng: number }
  openingHours: { en: string; ar: string }
  /** Schema.org day/time syntax, separate from localized display copy. */
  openingHoursSchema?: string[]
  postalAddress?: { addressLocality: string; addressCountry: string }
  deliveryZones: DeliveryZone[]
  /** Omit to offer the entire catalog. An empty array offers no dishes. */
  menuIds?: number[]
  minimumOrder: number
}

// Example branches: replace with your real locations and service rules.
export const branches: Branch[] = [
  {
    id: "jumeirah",
    name: { en: "Jumeirah", ar: "جميرا" },
    address: {
      en: "12 Al Wasl Road, Jumeirah, Dubai",
      ar: "١٢ شارع الوصل، جميرا، دبي",
    },
    phone: "+971 4 123 4567",
    coordinates: { lat: 25.207, lng: 55.253 },
    openingHours: {
      en: "Every day · 8:00 AM – 11:00 PM",
      ar: "يومياً · ٨ صباحاً – ١١ مساءً",
    },
    openingHoursSchema: ["Mo-Su 08:00-23:00"],
    postalAddress: { addressLocality: "Dubai", addressCountry: "AE" },
    deliveryZones: [
      {
        id: "jumeirah", name: { en: "Jumeirah", ar: "جميرا" },
        cities: ["Dubai", "دبي"], fee: 3.5, minimumOrder: 15,
        freeDeliveryAbove: 50, estimatedMinutes: [25, 35],
      },
      {
        id: "al-wasl", name: { en: "Al Wasl", ar: "الوصل" },
        cities: ["Dubai", "دبي"], fee: 5, minimumOrder: 20,
        freeDeliveryAbove: 65, estimatedMinutes: [35, 50],
      },
    ],
    minimumOrder: 15,
  },
  {
    id: "marina",
    name: { en: "Dubai Marina", ar: "دبي مارينا" },
    address: {
      en: "Marina Walk, Dubai Marina, Dubai",
      ar: "ممشى المارينا، دبي مارينا، دبي",
    },
    phone: "+971 4 123 4568",
    coordinates: { lat: 25.0805, lng: 55.1403 },
    openingHours: {
      en: "Every day · 9:00 AM – midnight",
      ar: "يومياً · ٩ صباحاً – منتصف الليل",
    },
    openingHoursSchema: ["Mo-Su 09:00-00:00"],
    postalAddress: { addressLocality: "Dubai", addressCountry: "AE" },
    deliveryZones: [
      {
        id: "marina", name: { en: "Dubai Marina", ar: "دبي مارينا" },
        cities: ["Dubai", "Dubai Marina", "دبي", "دبي مارينا"],
        fee: 4.5, minimumOrder: 20, freeDeliveryAbove: 60, estimatedMinutes: [30, 45],
      },
      {
        id: "jbr",
        name: { en: "Jumeirah Beach Residence", ar: "جميرا بيتش ريزيدنس" },
        cities: ["Dubai", "دبي"], fee: 6, minimumOrder: 25,
        freeDeliveryAbove: 75, estimatedMinutes: [40, 55],
      },
    ],
    menuIds: [1, 2, 3, 4, 7, 8],
    minimumOrder: 20,
  },
]
