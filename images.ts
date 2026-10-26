export type ImageAsset = {
  src: string
  alt: { en: string; ar: string }
  width: number
  height: number
}

const photo = (
  id: string,
  en: string,
  ar: string,
  width = 1600,
  height = 1200,
): ImageAsset => ({
  src: `/images/${id}.jpg`,
  alt: { en, ar },
  width,
  height,
})

export const images = {
  logo: {
    src: "/manara-logo.jpg",
    alt: { en: "Manara lighthouse logo", ar: "شعار منارة" },
    width: 1254,
    height: 1254,
  },
  hero: photo("photo-1547592180-85f173990554", "Fresh salad with seasonal vegetables", "سلطة طازجة بالخضروات الموسمية"),
  interior: photo("photo-1414235077428-338989a2e8c0", "An inviting restaurant dining room", "قاعة طعام ترحيبية في المطعم"),
  gathering: photo("photo-1517248135467-4c7edcad34c4", "Restaurant tables in a warmly lit dining room", "طاولات مطعم في قاعة طعام بإضاءة دافئة"),
  kitchen: photo("photo-1555939594-58d7cb561ad1", "Freshly prepared food served at the table", "طعام طازج يقدم على الطاولة"),
  bowl: photo("photo-1512621776951-a57141f2eefd", "A colorful vegetable bowl", "طبق خضروات ملون"),
  burger: photo("photo-1568901346375-23c9450c58cd", "A beef burger with cheese and lettuce", "برجر لحم مع الجبن والخس"),
  burrata: photo("photo-1511690743698-d9d85f2fbf38", "A freshly prepared starter", "طبق مقبلات طازج"),
  cheesecake: photo("photo-1533134242443-d4fd215305ad", "A slice of cheesecake", "شريحة تشيز كيك"),
  pasta: photo("photo-1473093295043-cdd812d0e601", "A plate of freshly prepared pasta", "طبق باستا طازجة"),
  croissant: photo("photo-1555507036-ab1f4038808a", "Freshly baked croissants", "كرواسون مخبوز طازج"),
  latte: photo("photo-1461023058943-07fcbe16d735", "A glass of iced coffee", "كوب قهوة مثلجة"),
  cooler: photo("photo-1544145945-f90425340c7e", "A refreshing chilled drink", "مشروب بارد منعش"),
  guests: [
    photo("photo-1506794778202-cad84cf45f1d", "Guest portrait", "صورة ضيف", 160, 160),
    photo("photo-1580489944761-15a19d654956", "Guest portrait", "صورة ضيفة", 160, 160),
    photo("photo-1500648767791-00dcc994a43e", "Guest portrait", "صورة ضيف", 160, 160),
  ],
  portraits: {
    adam: photo("photo-1577219491135-ce391730fb2c", "Portrait of Adam Khalil", "صورة آدم خليل", 900, 1200),
    sofia: photo("photo-1551836022-d5d88e9218df", "Portrait of Sofia Haddad", "صورة صوفيا حداد", 900, 1200),
    daniel: photo("photo-1519085360753-af0119f7cbe7", "Portrait of Daniel Reed", "صورة دانيال ريد", 900, 1200),
  },
}

export const imageSizes = {
  logo: "42px",
  avatar: "34px",
  card: "(max-width: 680px) calc((100vw - 54px) / 2), (max-width: 900px) calc((100vw - 86px) / 2), (max-width: 1352px) calc((100vw - 178px) / 4), 294px",
  category: "(max-width: 680px) calc((100vw - 62px) / 3), (max-width: 900px) 30vw, 190px",
  half: "(max-width: 680px) calc(100vw - 40px), (max-width: 1352px) 50vw, 620px",
  full: "100vw",
  gallery: "(max-width: 680px) 50vw, (max-width: 1352px) 30vw, 400px",
  team: "(max-width: 680px) calc(100vw - 40px), (max-width: 1352px) 33vw, 400px",
  promo: "220px",
  thumbnail: "(max-width: 900px) 85px, 80px",
  summary: "42px",
  lightbox: "(max-width: 1111px) 90vw, 1000px",
} as const

export function responsiveSources(asset: ImageAsset) {
  if (asset.src.startsWith('/images/')) {
    return [...new Set([320, 640, asset.width])].filter(width => width <= asset.width)
      .sort((a, b) => a - b)
      .map(width => `${width === asset.width ? asset.src : asset.src.replace('.jpg', `-${width}.jpg`)} ${width}w`).join(', ')
  }
  const url = new URL(asset.src, "https://local.invalid")
  if (url.hostname !== "images.unsplash.com") return undefined
  const widths = [...new Set([64, 160, 320, 480, 640, 900, 1200, asset.width])]
    .filter((width) => width <= asset.width).sort((a, b) => a - b)
  return widths.map((width) => {
    const candidate = new URL(url)
    candidate.searchParams.set("w", String(width))
    candidate.searchParams.set("h", String(Math.round(width * asset.height / asset.width)))
    return `${candidate.href} ${width}w`
  }).join(", ")
}
