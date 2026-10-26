import { record, text } from "./models"

export type Account = {
  name: string
  email: string
  phone: string
  salt: string
  hash: string
}
export type ResetRequest = { email: string; token: string; expires: number } | null
export const accountsList = (value: unknown): value is Account[] =>
  Array.isArray(value) && value.every((item) => record(item) &&
    ["name", "email", "phone", "salt", "hash"].every((key) => text(item[key])))
export const resetRequest = (value: unknown): value is ResetRequest =>
  value === null || (record(value) && text(value.email) && text(value.token) &&
    typeof value.expires === "number")
export async function passwordHash(password: string, salt: string) {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"],
  )
  const result = await crypto.subtle.deriveBits({
    name: "PBKDF2", salt: new TextEncoder().encode(salt), iterations: 100000, hash: "SHA-256",
  }, key, 256)
  return Array.from(new Uint8Array(result), (byte) => byte.toString(16).padStart(2, "0")).join("")
}
