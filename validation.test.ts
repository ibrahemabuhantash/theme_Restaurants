import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cleanFields, dateInZone, validContact, validPassword, validReservation } from '../lib/form-validation';
import { catalogPrice, currentCartPrices } from '../lib/cart-pricing';
import type { CartItem } from '../lib/models';

test('contact validation rejects blank names and invalid email/phone', () => {
  const fields = { name: 'Demo Guest', email: 'demo@example.com', phone: '+971 50 123 4567' };
  assert.equal(validContact(fields), true);
  assert.equal(validContact({ ...fields, name: '  ' }), false);
  assert.equal(validContact({ ...fields, email: 'demo@' }), false);
  assert.equal(validContact({ ...fields, phone: 'letters1234567' }), false);
  assert.equal(validPassword('short'), false);
  assert.equal(validPassword('demo-password'), true);
  assert.deepEqual(cleanFields({ name: ' Demo ', password: '  secret  ' }), { name: 'Demo', password: '  secret  ' });
});

test('reservation dates use restaurant timezone and reject invalid dates, times and guest counts', () => {
  const now = new Date('2026-10-26T22:30:00Z');
  assert.equal(dateInZone(now, 'Asia/Dubai'), '2026-10-27');
  const fields = { name: 'Guest Name', email: 'test@example.com', phone: '0790000000', date: '2026-10-27', time: '18:00', guests: '2' };
  assert.equal(validReservation(fields, now, 'Asia/Dubai'), true);
  for (const change of [{ date: '2026-10-26' }, { date: '2026-02-30' }, { guests: '1.5' }, { guests: '21' }, { time: '25:00' }]) {
    assert.equal(validReservation({ ...fields, ...change }, now, 'Asia/Dubai'), false);
  }
  assert.equal(validReservation({ ...fields, time: '09:00' }, new Date('2026-10-27T10:00:00Z'), 'Asia/Dubai'), false);
});

test('checkout detects altered catalog prices and invalid extras', () => {
  const item: CartItem = { key: 'test', id: 1, qty: 1, price: 20.5, size: '', extras: [], notes: '', optionSelections: [[1]] };
  assert.equal(catalogPrice(item), 20.5);
  assert.equal(currentCartPrices([item]), true);
  assert.equal(currentCartPrices([{ ...item, price: 0.01 }]), false);
  assert.equal(catalogPrice({ ...item, optionSelections: [] }), null);
  const burger: CartItem = { key: 'burger', id: 2, qty: 1, price: 22, size: 'Regular', extras: [], notes: '' };
  assert.equal(catalogPrice(burger), 22);
  assert.equal(catalogPrice({ ...burger, extras: ['nonexistent'] }), null);
  assert.equal(catalogPrice({ ...burger, extras: ['Avocado', 'Avocado'] }), null);
});
