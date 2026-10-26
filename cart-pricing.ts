import { dishes, sizes, extras } from '../data/menu';
import { optionPrice, validOptionSelections } from '../data/options';
import { roundMoney } from './delivery';
import type { CartItem } from './models';

/** Reconcile browser-saved prices against the current catalog before checkout. */
export function catalogPrice(item: CartItem): number | null {
  const dish = dishes.find(entry => entry.id === item.id);
  if (!dish) return null;
  if (dish.optionGroups) {
    if (!validOptionSelections(dish.optionGroups, item.optionSelections ?? [])) return null;
    return roundMoney(dish.price + optionPrice(dish.optionGroups, item.optionSelections ?? []));
  }
  const size = sizes.find(entry => entry.name === item.size);
  if (!size || new Set(item.extras).size !== item.extras.length) return null;
  const selected = item.extras.map(name => extras.find(entry => entry.name === name));
  if (selected.some(entry => !entry)) return null;
  return roundMoney(dish.price + size.price + selected.reduce((sum, entry) => sum + entry!.price, 0));
}

export function currentCartPrices(items: CartItem[]): boolean {
  return items.every(item => catalogPrice(item) === item.price);
}
