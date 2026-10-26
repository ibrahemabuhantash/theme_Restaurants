import type { OptionGroup } from "./menu"

export const minimumSelections = (group: OptionGroup) =>
  Math.max(group.required ? 1 : 0, group.min)

export function validOptionSelections(groups: OptionGroup[], selections: number[][]): boolean {
  return selections.length <= groups.length && groups.every((group, index) => {
    const chosen = selections[index] ?? []
    return Number.isInteger(group.min) && Number.isInteger(group.max) &&
      group.min >= 0 && group.max >= minimumSelections(group) &&
      chosen.length >= minimumSelections(group) && chosen.length <= group.max &&
      new Set(chosen).size === chosen.length &&
      chosen.every((option) => Number.isInteger(option) && !!group.options[option] &&
        Number.isFinite(group.options[option].price))
  })
}

export function optionPrice(groups: OptionGroup[], selections: number[][]): number {
  return groups.reduce((total, group, index) => total + (selections[index] ?? [])
    .reduce((sum, option) => sum + (group.options[option]?.price ?? 0), 0), 0)
}

export function optionLabels(groups: OptionGroup[], selections: number[][]) {
  return groups.flatMap((group, index) => (selections[index] ?? []).map((option) => ({
    en: `${group.name}: ${group.options[option].name}`,
    ar: `${group.ar ?? group.name}: ${group.options[option].ar ?? group.options[option].name}`,
  })))
}
