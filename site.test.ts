import { test } from "node:test"
import assert from "node:assert/strict"
import { validOptionSelections, optionPrice } from "../data/options"
import { availabilityStatus } from "../data/availability"
import { cartItems, ordersList, nullableUser, language } from "../lib/models"
import { passwordHash } from "../lib/mock-auth"
import { dishes } from "../data/menu"
import { images, responsiveSources } from "../config/images"

test("required options, limits, duplicates, and pricing", () => {
  const groups = dishes[0].optionGroups!
  assert.equal(validOptionSelections(groups, []), false)
  assert.equal(validOptionSelections(groups, [[1]]), true)
  assert.equal(validOptionSelections(groups, [[0, 1]]), false)
  assert.equal(validOptionSelections(groups, [[1, 1]]), false)
  assert.equal(validOptionSelections(groups, [[99]]), false)
  assert.equal(optionPrice(groups, [[1]]), 2.5)
})
test("scheduled availability respects start, end, branch, and overnight service days", () => {
  const dish = { ...dishes[0], availability: {
    status: "scheduled" as const, days: ["mon"], startTime: "22:00", endTime: "02:00", branches: ["jumeirah"],
  } }
  const branch = { id: "jumeirah" }
  assert.equal(availabilityStatus(dish, branch, new Date("2026-01-05T22:00:00Z"), "UTC"), "available")
  assert.equal(availabilityStatus(dish, branch, new Date("2026-01-06T01:59:00Z"), "UTC"), "available")
  assert.equal(availabilityStatus(dish, branch, new Date("2026-01-06T02:00:00Z"), "UTC"), "scheduled")
  assert.equal(availabilityStatus(dish, { id: "marina" }, new Date(), "UTC"), "unavailable")
})
test("corrupt persisted data is rejected", () => {
  for (const value of [null, {}, [null], [{ qty: "broken" }]]) assert.equal(cartItems(value), false)
  assert.equal(ordersList([{ id: "1", items: [] }]), false)
  assert.equal(nullableUser({ name: 5, email: [] }), false)
  assert.equal(language("fr"), false)
})
test("password credentials use salted verification", async () => {
  const hash = await passwordHash("demo-test-only", "test-salt")
  assert.equal(hash, await passwordHash("demo-test-only", "test-salt"))
  assert.notEqual(hash, await passwordHash("wrong-password", "test-salt"))
  assert.notEqual(hash, await passwordHash("demo-test-only", "other-salt"))
})
test("image sources reserve dimensions and generate responsive candidates", () => {
  assert.ok(images.hero.width > 0 && images.hero.height > 0)
  assert.ok(images.hero.alt.en && images.hero.alt.ar)
  assert.ok(responsiveSources(images.hero)?.includes("320w"))
  assert.equal(responsiveSources(images.logo), undefined)
})
