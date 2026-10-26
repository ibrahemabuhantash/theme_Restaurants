import type { Dish } from "./menu"

const weekdays = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"]
const minutes = (value: string | undefined) => {
  if (!value || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null
  const [hour, minute] = value.split(":").map(Number)
  return hour * 60 + minute
}

export function availabilityStatus(
  dish: Dish | undefined,
  branch: { id: string; menuIds?: number[] },
  now: Date,
  timeZone: string,
): "available" | "sold-out" | "scheduled" | "unavailable" {
  if (!dish || (branch.menuIds && !branch.menuIds.includes(dish.id)))
    return "unavailable"
  const rule = dish.availability
  if (!rule) return "available"
  if (rule.branches && !rule.branches.includes(branch.id)) return "unavailable"
  if (rule.status === "sold-out") return "sold-out"
  if (rule.status === "available") return "available"

  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(now)
  const part = (type: string) => parts.find((p) => p.type === type)?.value || ""
  const today = weekdays.indexOf(part("weekday").toLowerCase())
  const current = Number(part("hour")) * 60 + Number(part("minute"))
  const start = minutes(rule.startTime)
  const end = minutes(rule.endTime)
  // Invalid or zero-length windows fail closed; omitted bounds mean all day.
  if ((rule.startTime !== undefined && start === null) ||
      (rule.endTime !== undefined && end === null) ||
      (start !== null && end !== null && start === end)) return "scheduled"
  const overnight = start !== null && end !== null && start > end
  const serviceDay = overnight && current < end ? (today + 6) % 7 : today
  const matchesDay = !rule.days || rule.days.some(
    (day) => day.toLowerCase() === weekdays[serviceDay],
  )
  const matchesTime = overnight
    ? current >= start || current < end
    : current >= (start ?? 0) && current < (end ?? 1440)
  return matchesDay && matchesTime ? "available" : "scheduled"
}
