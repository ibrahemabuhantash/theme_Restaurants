import type { Branch, DeliveryZone } from "../config/branches"

export type DeliveryQuote = {
  eligible: boolean
  reason: "chooseZone" | "enterDeliveryCity" | "outsideDeliveryArea" | "minimumOrder" | null
  fee: number | null
  minimumOrder: number
  zone?: DeliveryZone
  freeDeliveryApplied: boolean
}

export const roundMoney = (amount: number) => Math.round(amount * 1000) / 1000
const normalizeCity = (city: string) => city.normalize("NFKD")
  .replace(/\p{M}/gu, "").trim().toLocaleLowerCase("en").replace(/\s+/g, " ")

/** Prototype coverage only: no geocoding or verification of the street address. */
export function deliveryQuote({
  branch, zoneId, city, orderValue, pickup = false,
}: {
  branch: Branch
  zoneId: string
  city: string
  /** Discounted merchandise value, excluding delivery fees. */
  orderValue: number
  pickup?: boolean
}): DeliveryQuote {
  const amount = roundMoney(orderValue)
  if (pickup) return {
    eligible: amount >= branch.minimumOrder,
    reason: amount < branch.minimumOrder ? "minimumOrder" : null,
    fee: 0, minimumOrder: branch.minimumOrder, freeDeliveryApplied: false,
  }
  const zone = branch.deliveryZones.find((entry) => entry.id === zoneId)
  if (!zone) return {
    eligible: false, reason: zoneId ? "outsideDeliveryArea" : "chooseZone",
    fee: null, minimumOrder: branch.minimumOrder, freeDeliveryApplied: false,
  }
  const freeDeliveryApplied = zone.freeDeliveryAbove !== undefined &&
    amount >= roundMoney(zone.freeDeliveryAbove)
  const quote = {
    fee: freeDeliveryApplied ? 0 : zone.fee,
    minimumOrder: zone.minimumOrder, zone, freeDeliveryApplied,
  }
  const normalized = normalizeCity(city)
  if (normalized && !zone.cities.some((alias) => normalizeCity(alias) === normalized)) {
    return { ...quote, eligible: false, reason: "outsideDeliveryArea", fee: null, freeDeliveryApplied: false }
  }
  if (!normalized) return { ...quote, eligible: false, reason: "enterDeliveryCity" }
  if (amount < zone.minimumOrder) return { ...quote, eligible: false, reason: "minimumOrder" }
  return { ...quote, eligible: true, reason: null }
}
