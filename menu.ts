import { images, type ImageAsset } from "../config/images"

export type Availability = {
  status: "available" | "sold-out" | "scheduled"
  branches?: string[]
  days?: string[]
  startTime?: string
  endTime?: string
}
export type OptionGroup = {
  name: string
  ar?: string
  required: boolean
  min: number
  max: number
  options: { name: string; ar?: string; price: number }[]
}
export type Allergen = "nuts" | "milk" | "gluten" | "eggs" | "fish" | "shellfish" | "sesame" | "soy"
export type DietaryTag = "spicy" | "vegetarian" | "vegan" | "halal"
export type FoodInformation = {
  enabled?: boolean
  allergens?: Allergen[]
  /** Kilocalories per standard serving, before size changes or extras. */
  calories?: number
  dietary?: DietaryTag[]
  /** Display an explicit verification warning for template example data. */
  demo?: boolean
}
export type Dish = {
  id: number
  name: string
  ar: string
  description: string
  descriptionAr: string
  price: number
  category: string
  image: ImageAsset
  label?: string
  ingredients: string[]
  availability?: Availability
  optionGroups?: OptionGroup[]
  foodInfo?: FoodInformation
}
export const dishes: Dish[] = [
  {
    id: 1,
    name: "Mediterranean bowl",
    ar: "طبق البحر المتوسط",
    description:
      "Roasted vegetables, creamy hummus, quinoa & a little sunshine.",
    descriptionAr: "خضروات مشوية وحمص كريمي وكينوا طازجة.",
    price: 18,
    category: "Mains",
    image: images.bowl,
    label: "Plant-based",
    foodInfo: {
      allergens: ["sesame"],
      calories: 520,
      dietary: ["vegetarian", "vegan"],
      demo: true,
    },
    optionGroups: [
      {
        name: "Choose your size",
        ar: "اختر الحجم",
        required: true,
        min: 1,
        max: 1,
        options: [
          { name: "Regular", ar: "عادي", price: 0 },
          { name: "Large", ar: "كبير", price: 2.5 },
        ],
      },
    ],
    ingredients: [
      "Quinoa",
      "Chickpeas",
      "Avocado",
      "Seasonal vegetables",
      "Tahini",
    ],
  },
  {
    id: 2,
    name: "The Manara burger",
    ar: "برجر المنارة",
    description:
      "Flame-grilled beef, aged cheddar & our signature house sauce.",
    descriptionAr: "لحم مشوي وجبن شيدر وصلصة المنارة الخاصة.",
    price: 22,
    category: "Mains",
    image: images.burger,
    label: "Bestseller",
    ingredients: ["Beef", "Brioche", "Cheddar", "Lettuce", "House sauce"],
  },
  {
    id: 3,
    name: "Burrata & heirloom",
    ar: "بوراتا وطماطم",
    description:
      "Fresh burrata, sun-ripened tomatoes, basil & extra virgin olive oil.",
    descriptionAr: "جبن بوراتا وطماطم طازجة وريحان وزيت زيتون.",
    price: 16,
    category: "Starters",
    image: images.burrata,
    label: "Vegetarian",
    ingredients: ["Burrata", "Tomatoes", "Basil", "Olive oil"],
  },
  {
    id: 4,
    name: "Pistachio cheesecake",
    ar: "تشيز كيك الفستق",
    description: "Silky cheesecake, buttery biscuit base & roasted pistachios.",
    descriptionAr: "تشيز كيك ناعم وبسكويت زبدة وفستق محمص.",
    price: 12,
    category: "Desserts",
    image: images.cheesecake,
    label: "House favorite",
    foodInfo: {
      allergens: ["nuts", "milk", "gluten", "eggs"],
      calories: 420,
      dietary: ["vegetarian"],
      demo: true,
    },
    ingredients: ["Cream cheese", "Pistachios", "Butter", "Biscuit"],
  },
  {
    id: 5,
    name: "Wild mushroom pasta",
    ar: "باستا الفطر",
    description: "Fresh tagliatelle, woodland mushrooms & parmesan cream.",
    descriptionAr: "باستا طازجة وفطر وكريمة بارميزان.",
    price: 24,
    category: "Mains",
    image: images.pasta,
    label: "Vegetarian",
    ingredients: ["Pasta", "Mushrooms", "Parmesan", "Cream"],
  },
  {
    id: 6,
    name: "Honey butter croissant",
    ar: "كرواسون بالعسل",
    description: "Baked every morning. Flaky, golden, and beautifully buttery.",
    descriptionAr: "مخبوز كل صباح بالزبدة والعسل.",
    price: 7,
    category: "Bakery",
    image: images.croissant,
    ingredients: ["Flour", "Butter", "Honey"],
  },
  {
    id: 7,
    name: "Signature iced latte",
    ar: "لاتيه مثلج",
    description:
      "Specialty espresso, silky milk & a hint of Madagascar vanilla.",
    descriptionAr: "إسبريسو مميز وحليب وفانيليا.",
    price: 6,
    category: "Coffee",
    image: images.latte,
    ingredients: ["Espresso", "Milk", "Vanilla"],
  },
  {
    id: 8,
    name: "Berry fresh cooler",
    ar: "عصير التوت",
    description: "Fresh berries, sparkling water & fragrant garden mint.",
    descriptionAr: "توت طازج ومياه غازية ونعناع.",
    price: 8,
    category: "Drinks",
    image: images.cooler,
    label: "Plant-based",
    ingredients: ["Berries", "Mint", "Sparkling water"],
  },
]
export const sizes = [
  { name: "Regular", price: 0 },
  { name: "Large", price: 5 },
]
export const extras = [
  { name: "Extra cheese", price: 2 },
  { name: "Avocado", price: 3 },
  { name: "Side salad", price: 4 },
]
