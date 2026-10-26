export type Locale = "en" | "ar"

export function localeFromPath(path: string): Locale {
  return /^\/ar(?:\/|$)/.test(path) ? "ar" : "en"
}

export function unlocalizedPath(path: string) {
  const stripped = path.replace(/^\/ar(?=\/|$)/, "")
  return stripped || "/"
}

export function localizedPath(path: string, locale: Locale) {
  const separator = path.search(/[?#]/)
  const pathname = separator === -1 ? path : path.slice(0, separator)
  const suffix = separator === -1 ? "" : path.slice(separator)
  const base = unlocalizedPath(pathname)
  return (locale === "ar" ? `/ar${base === "/" ? "" : base}` : base) + suffix
}
