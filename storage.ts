export function restore<T>(key: string, fallback: T, validate: (value: unknown) => value is T): T {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? 'null');
    return validate(value) ? value : fallback;
  } catch { return fallback; }
}

export function persist(key: string, value: unknown): void {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* In-memory use remains available. */ }
}
