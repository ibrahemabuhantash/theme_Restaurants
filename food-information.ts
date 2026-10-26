import type { FoodInformation } from "../data/menu"

/** Missing information is unknown, never an allergen-free or dietary claim. */
export function visibleFoodInformation(
  information: FoodInformation | undefined,
  enabled: boolean,
): FoodInformation | null {
  if (!enabled || !information || information.enabled === false) return null
  const calories = typeof information.calories === "number" &&
    Number.isFinite(information.calories) && information.calories >= 0
    ? information.calories : undefined
  const allergens = information.allergens?.length ? information.allergens : undefined
  const dietary = information.dietary?.length ? information.dietary : undefined
  if (calories === undefined && !allergens && !dietary) return null
  return { ...information, calories, allergens, dietary }
}
