import { test } from "node:test"
import assert from "node:assert/strict"
import { branches } from "../config/branches"
import { deliveryQuote, roundMoney } from "../lib/delivery"

const branch = branches[0]
const getQuote = (overrides: Partial<Parameters<typeof deliveryQuote>[0]> = {}) =>
  deliveryQuote({ branch, zoneId: "jumeirah", city: "Dubai", orderValue: 30, ...overrides })

test("delivery fees, minimums, and estimates come from the selected zone", () => {
  assert.equal(getQuote().fee, 3.5)
  assert.equal(getQuote().minimumOrder, 15)
  assert.deepEqual(getQuote().zone?.estimatedMinutes, [25, 35])
  assert.equal(getQuote({ zoneId: "al-wasl" }).fee, 5)
  assert.equal(getQuote({ zoneId: "al-wasl" }).minimumOrder, 20)
  assert.deepEqual(getQuote({ zoneId: "al-wasl" }).zone?.estimatedMinutes, [35, 50])
})

test("unsupported cities, unknown zones, and zones from other branches are blocked", () => {
  for (const city of ["Sharjah", "Abu Dhabi", "Dubai remote town"]) {
    const quote = getQuote({ city })
    assert.equal(quote.eligible, false)
    assert.equal(quote.reason, "outsideDeliveryArea")
    assert.equal(quote.fee, null)
  }
  assert.equal(getQuote({ zoneId: "__outside__" }).reason, "outsideDeliveryArea")
  assert.equal(getQuote({ branch: branches[1], zoneId: "jumeirah" }).reason, "outsideDeliveryArea")
  assert.equal(getQuote({ branch: { ...branch, deliveryZones: [] } }).eligible, false)
})

test("coverage handles bilingual aliases, whitespace and diacritics, not partial matches", () => {
  for (const city of ["dubai", " DUBAI ", "دبي", "دُبي"]) {
    assert.equal(getQuote({ city }).eligible, true)
  }
  assert.equal(getQuote({ city: " " }).reason, "enterDeliveryCity")
  assert.equal(getQuote({ zoneId: "" }).reason, "chooseZone")
})

test("zone minimums and free-delivery thresholds use discounted merchandise value", () => {
  assert.equal(getQuote({ zoneId: "al-wasl", orderValue: 19.999 }).reason, "minimumOrder")
  assert.equal(getQuote({ zoneId: "al-wasl", orderValue: 20 }).eligible, true)
  assert.equal(getQuote({ orderValue: 49.999 }).fee, 3.5)
  assert.equal(getQuote({ orderValue: 50 }).fee, 0)
  assert.equal(getQuote({ orderValue: 50 }).freeDeliveryApplied, true)
  const discounted = getQuote({ orderValue: roundMoney(50 * 0.85) })
  assert.equal(discounted.freeDeliveryApplied, false)
  assert.equal(discounted.fee, 3.5)
  const minimumAfterDiscount = getQuote({ orderValue: roundMoney(15 * 0.85) })
  assert.equal(minimumAfterDiscount.reason, "minimumOrder")
})

test("free delivery can be disabled and zero thresholds are respected", () => {
  const zone = { ...branch.deliveryZones[0], freeDeliveryAbove: undefined }
  const configured = { ...branch, deliveryZones: [zone] }
  assert.equal(getQuote({ branch: configured, orderValue: 1000 }).fee, zone.fee)
  assert.equal(getQuote({ branch: { ...branch, deliveryZones: [{ ...zone, freeDeliveryAbove: 0 }] } }).fee, 0)
})

test("pickup bypasses coverage and delivery charges but keeps the pickup minimum", () => {
  const pickup = getQuote({ pickup: true, zoneId: "__outside__", city: "Sharjah" })
  assert.equal(pickup.eligible, true)
  assert.equal(pickup.fee, 0)
  assert.equal(pickup.zone, undefined)
  assert.equal(pickup.freeDeliveryApplied, false)
  assert.equal(getQuote({ pickup: true, orderValue: 14.999 }).reason, "minimumOrder")
})
