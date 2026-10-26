import { dishes, type Dish } from "../data/menu"

export type CartItem = {
  key: string
  id: number
  qty: number
  price: number
  size: string
  extras: string[]
  notes: string
  dish?: Pick<Dish, "id" | "name" | "ar">
  optionSelections?: number[][]
  optionLabels?: { en: string; ar: string }[]
}
export type User = { name: string; email: string; phone?: string; sessionOnly?: boolean }
export type Order = {
  id: string
  date: string
  items: CartItem[]
  total: number
  status: string
  branchId?: string
  branchName?: { en: string; ar: string }
  branchAddress?: { en: string; ar: string }
  fulfillment?: "pickup" | "delivery"
  deliveryFee?: number
  estimatedDeliveryMinutes?: [number, number]
  deliveryCity?: string
  deliveryMinimum?: number
  freeDeliveryApplied?: boolean
  deliveryZone?: { id: string; name: { en: string; ar: string } } | null
  contact?: User
  address?: string
  payment?: string
  notes?: string
}
export type Submission = {
  id: string
  kind: string
  branchId: string
  date: string
  fields: Record<string, string>
}

export const record = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === "object" && !Array.isArray(value)
export const strings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string")
export const ids = (value: unknown): value is number[] =>
  Array.isArray(value) && value.every((item) => Number.isInteger(item))
export const language = (value: unknown): value is "en" | "ar" =>
  value === "en" || value === "ar"
export const text = (value: unknown): value is string => typeof value === "string"
export const isUser = (value: unknown): value is User =>
  record(value) && typeof value.name === "string" && typeof value.email === "string" &&
  (value.phone === undefined || text(value.phone)) &&
  (value.sessionOnly === undefined || typeof value.sessionOnly === "boolean")
export const nullableUser = (value: unknown): value is User | null => {
  if (value === null) return true
  if (!isUser(value)) return false
  if (!value.sessionOnly) return true
  try { return sessionStorage.getItem("manara-session") === "active" } catch { return false }
}
const bilingual = (value: unknown): value is { en: string; ar: string } =>
  record(value) && text(value.en) && text(value.ar)
const dishSnapshot = (value: unknown) =>
  record(value) && Number.isInteger(value.id) && text(value.name) && text(value.ar)
export const isCartItem = (value: unknown): value is CartItem =>
  record(value) && text(value.key) && Number.isInteger(value.id) &&
  Number.isInteger(value.qty) && Number(value.qty) > 0 && Number(value.qty) <= 99 &&
  typeof value.price === "number" && Number.isFinite(value.price) && value.price >= 0 &&
  text(value.size) && strings(value.extras) && text(value.notes) &&
  (value.dish === undefined || dishSnapshot(value.dish)) &&
  (value.optionSelections === undefined ||
    (Array.isArray(value.optionSelections) && value.optionSelections.every(ids))) &&
  (value.optionLabels === undefined ||
    (Array.isArray(value.optionLabels) && value.optionLabels.every(bilingual)))
export const cartItems = (value: unknown): value is CartItem[] =>
  Array.isArray(value) && value.every((item) =>
    isCartItem(item) && dishes.some((dish) => dish.id === item.id))
export const ordersList = (value: unknown): value is Order[] =>
  Array.isArray(value) && value.every((order) => record(order) &&
    text(order.id) && text(order.date) && text(order.status) &&
    typeof order.total === "number" && Number.isFinite(order.total) &&
    Array.isArray(order.items) && order.items.every(isCartItem) &&
    (order.branchName === undefined || bilingual(order.branchName)) &&
    (order.branchAddress === undefined || bilingual(order.branchAddress)) &&
    (order.contact === undefined || isUser(order.contact)) &&
    (order.address === undefined || text(order.address)) &&
    (order.payment === undefined || text(order.payment)) &&
    (order.deliveryCity === undefined || text(order.deliveryCity)) &&
    (order.deliveryMinimum === undefined || (typeof order.deliveryMinimum === "number" && Number.isFinite(order.deliveryMinimum))) &&
    (order.freeDeliveryApplied === undefined || typeof order.freeDeliveryApplied === "boolean") &&
    (order.estimatedDeliveryMinutes === undefined ||
      (Array.isArray(order.estimatedDeliveryMinutes) && order.estimatedDeliveryMinutes.length === 2 &&
        order.estimatedDeliveryMinutes.every((value) => typeof value === "number" && Number.isFinite(value) && value >= 0))) &&
    (order.notes === undefined || text(order.notes)))
export const submissionsList = (value: unknown): value is Submission[] =>
  Array.isArray(value) && value.every((entry) => record(entry) &&
    text(entry.id) && text(entry.kind) && text(entry.branchId) && text(entry.date) &&
    record(entry.fields) && Object.values(entry.fields).every(text))

export const formFields = (form: HTMLFormElement) =>
  Object.fromEntries(Array.from(new FormData(form), ([key, value]) => [key, String(value)]))
