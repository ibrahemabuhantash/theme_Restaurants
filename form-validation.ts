export type Fields = Record<string, string>;
export const cleanFields = (fields: Fields): Fields => Object.fromEntries(
  Object.entries(fields).map(([key, value]) => [key, /password/.test(key) ? value : value.trim()]),
);
export const validEmail = (value = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;
export const validPhone = (value = '') => /^[+\d\s().-]+$/.test(value) && value.replace(/\D/g, '').length >= 7 && value.replace(/\D/g, '').length <= 15;
export const validName = (value = '') => value.trim().length >= 2 && value.trim().length <= 100;
export const validPassword = (value = '') => value.length >= 8 && value.length <= 128;
export const validContact = (fields: Fields) => validName(fields['name']) && validEmail(fields['email']) && validPhone(fields['phone']);

export function dateInZone(now: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
  const part = (type: string) => parts.find(item => item.type === type)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function validReservation(fields: Fields, now: Date, timeZone: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fields['date'] ?? '')) return false;
  const date = new Date(`${fields['date']}T12:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== fields['date']) return false;
  const today = dateInZone(now, timeZone);
  const currentTime = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(now);
  return validContact(fields) && fields['date'] >= today &&
    (fields['date'] !== today || fields['time'] > currentTime) &&
    ['09:00', '12:00', '13:00', '18:00', '19:00', '20:00', '21:00'].includes(fields['time']) &&
    Number.isInteger(Number(fields['guests'])) && Number(fields['guests']) >= 1 && Number(fields['guests']) <= 20;
}
