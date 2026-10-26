import { test } from "node:test"
import assert from "node:assert/strict"
import { visibleFoodInformation } from "../lib/food-information"
import type { FoodInformation as Information } from "../data/menu"

test("food information is optional and supports per-dish or global opt-out", () => {
  assert.equal(visibleFoodInformation(undefined, true), null)
  assert.equal(visibleFoodInformation({}, true), null)
  assert.equal(visibleFoodInformation({ allergens: [], dietary: [] }, true), null)
  assert.equal(visibleFoodInformation({ calories: 500 }, false), null)
  assert.equal(visibleFoodInformation({ enabled: false, calories: 500 }, true), null)
  assert.equal(visibleFoodInformation({ calories: 0 }, true)?.calories, 0)
})

test("invalid calories are omitted and dietary claims are not inferred", () => {
  for (const calories of [-1, NaN, Infinity]) {
    assert.equal(visibleFoodInformation({ calories }, true), null)
  }
  const info = visibleFoodInformation({ allergens: ["nuts"] }, true)
  assert.equal(info?.dietary, undefined)
  assert.equal(info?.calories, undefined)
})

