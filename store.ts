import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { SeoService } from './seo.service';
import { currentCartPrices } from '../lib/cart-pricing';
import { cleanFields, validContact, validEmail, validName, validPassword, validReservation } from '../lib/form-validation';
import { site } from '../config/site';
import { dishes, sizes, extras, Dish } from '../data/menu';
import { availabilityStatus } from '../data/availability';
import { minimumSelections, validOptionSelections, optionPrice, optionLabels } from '../data/options';
import { welcomeOffer } from '../data/offers';
import { CartItem, User, Order, Submission, cartItems, ids, nullableUser, strings, ordersList, submissionsList, text } from '../lib/models';
import { Account, ResetRequest, accountsList, resetRequest, passwordHash } from '../lib/mock-auth';
import { deliveryQuote, roundMoney } from '../lib/delivery';
import { Locale, localizedPath, localeFromPath, unlocalizedPath } from '../lib/localized-url';
import { restore, persist } from './storage';
import en from '../locales/en.json';
import ar from '../locales/ar.json';


@Injectable({ providedIn: 'root' })
export class Store {
  readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly destroyRef = inject(DestroyRef);
  readonly site = site;
  readonly dishes = dishes;
  readonly sizes = sizes;
  readonly extras = extras;
  readonly minimumSelections = minimumSelections;
  readonly lang = signal<Locale>(localeFromPath(location.pathname));
  readonly path = signal(unlocalizedPath(location.pathname));
  readonly cart = signal(restore<CartItem[]>('manara-cart', [], cartItems));
  readonly favorites = signal(restore<number[]>('manara-favorites', [], ids));
  readonly user = signal(restore<User | null>('manara-user', null, nullableUser));
  readonly addresses = signal(restore<string[]>('manara-addresses', [], strings));
  readonly orders = signal(restore<Order[]>('manara-orders', [], ordersList));
  readonly submissions = signal(restore<Submission[]>('manara-submissions', [], submissionsList));
  readonly accounts = signal(restore<Account[]>('manara-accounts', [], accountsList));
  readonly reset = signal(restore<ResetRequest>('manara-reset', null, resetRequest));
  readonly branchId = signal(restore('manara-branch', site.branches[0].id, text));
  readonly branch = computed(() => site.branches.find(b => b.id === this.branchId()) ?? site.branches[0]);
  readonly count = computed(() => this.cart().reduce((n, i) => n + i.qty, 0));
  readonly subtotal = computed(() => roundMoney(this.cart().reduce((n, i) => n + i.qty * i.price, 0)));
  readonly discount = signal(false);
  readonly discountedSubtotal = computed(() => roundMoney(this.subtotal() * (this.discount() ? 1 - welcomeOffer.discount : 1)));
  readonly pickup = signal(false);
  readonly zoneId = signal('');
  readonly city = signal('');
  readonly now = signal(new Date());
  readonly quote = computed(() => deliveryQuote({ branch: this.branch(), zoneId: this.zoneId(), city: this.city(), orderValue: this.discountedSubtotal(), pickup: this.pickup() }));
  readonly total = computed(() => roundMoney(this.discountedSubtotal() + (this.quote().fee ?? 0)));
  readonly toast = signal('');
  readonly busy = signal(false);
  readonly success = signal('');
  readonly lastOrder = signal<Order | null>(null);
  private toastTimer?: ReturnType<typeof setTimeout>;

  constructor() {
    this.updateRoute(this.router.url === '/' ? location.pathname : this.router.url);
    this.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.success.set('');
        this.updateRoute(event.urlAfterRedirects);
        requestAnimationFrame(() => document.querySelector<HTMLElement>('#main')?.focus());
      }
    });
    const timer = window.setInterval(() => this.now.set(new Date()), 15000);
    const refresh = () => this.now.set(new Date());
    window.addEventListener('focus', refresh);
    const storage = (event: StorageEvent) => {
      if (event.key === 'manara-cart') this.cart.set(restore('manara-cart', [], cartItems));
      if (event.key === 'manara-favorites') this.favorites.set(restore('manara-favorites', [], ids));
      if (event.key === 'manara-user') this.user.set(restore('manara-user', null, nullableUser));
      if (event.key === 'manara-branch') this.changeBranch(restore('manara-branch', site.branches[0].id, text));
    };
    window.addEventListener('storage', storage);
    this.destroyRef.onDestroy(() => {
      clearInterval(timer); clearTimeout(this.toastTimer);
      window.removeEventListener('focus', refresh); window.removeEventListener('storage', storage);
    });
  }

  t(key: string): string { return ((this.lang() === 'ar' ? ar : en) as Record<string, string>)[key] ?? key; }
  name(d: Pick<Dish, 'name' | 'ar'>): string { return this.lang() === 'ar' ? d.ar : d.name; }
  money(n: number): string { return new Intl.NumberFormat(this.lang() === 'ar' ? 'ar-JO' : 'en-JO', { style: 'currency', currency: site.currency, minimumFractionDigits: 3, maximumFractionDigits: 3 }).format(n); }
  link(path: string): string { return localizedPath(path, this.lang()); }
  go(path: string): void { void this.router.navigateByUrl(this.link(path)); }
  switchLanguage(): void { void this.router.navigateByUrl(localizedPath(this.path() + location.search, this.lang() === 'en' ? 'ar' : 'en')); }
  notify(message: string): void {
    this.toast.set(message);
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => this.toast.set(''), 5000);
  }
  changeBranch(id: string): void { this.branchId.set(id); this.zoneId.set(''); persist('manara-branch', id); }
  status(id: number): string { return availabilityStatus(dishes.find(d => d.id === id), this.branch(), this.now(), site.timeZone); }
  available(id: number): boolean { return this.status(id) === 'available'; }
  availabilityLabel(id: number): string { const status = this.status(id); return this.t(status === 'sold-out' ? 'soldOut' : status === 'scheduled' ? 'scheduled' : 'unavailable'); }
  favorite(id: number): void {
    this.favorites.update(items => items.includes(id) ? items.filter(i => i !== id) : [...items, id]);
    persist('manara-favorites', this.favorites());
  }
  itemName(item: CartItem): string { const dish = item.dish ?? dishes.find(d => d.id === item.id); return dish ? this.name(dish) : this.t('removedDish'); }
  cartOptions(item: CartItem): string { return item.optionLabels ? item.optionLabels.map(label => label[this.lang()]).join(' · ') : [item.size, ...item.extras].filter(Boolean).join(' · '); }
  add(dish: Dish, qty = 1, size = 'Regular', selected: string[] = [], notes = '', choices: number[][] = []): void {
    this.now.set(new Date());
    if (!this.available(dish.id)) { this.notify(this.t('branchUnavailable')); return; }
    if (dish.optionGroups && !validOptionSelections(dish.optionGroups, choices)) { this.notify(this.t('chooseOptions')); this.go(`/food/${dish.id}`); return; }
    const normalized = choices.map(group => [...group].sort((a, b) => a - b));
    const price = dish.price + (dish.optionGroups ? optionPrice(dish.optionGroups, normalized) : (sizes.find(s => s.name === size)?.price ?? 0) + selected.reduce((sum, name) => sum + (extras.find(e => e.name === name)?.price ?? 0), 0));
    const key = dish.optionGroups ? JSON.stringify([dish.id, normalized, notes]) : `${dish.id}-${size}-${[...selected].sort().join(',')}-${notes}`;
    const item: CartItem = { key, id: dish.id, qty: Math.max(1, Math.min(99, Math.floor(qty))), price, size: dish.optionGroups ? '' : size, extras: dish.optionGroups ? [] : selected, notes, dish,
      ...(dish.optionGroups ? { optionSelections: normalized, optionLabels: optionLabels(dish.optionGroups, normalized) } : {}) };
    this.cart.update(items => items.some(i => i.key === key) ? items.map(i => i.key === key ? { ...i, qty: Math.min(99, i.qty + item.qty) } : i) : [...items, item]);
    persist('manara-cart', this.cart());
    this.notify(this.lang() === 'ar' ? 'تمت الإضافة إلى السلة' : `${dish.name} added to your cart`);
  }
  quantity(key: string, change: number): void {
    this.cart.update(items => items.map(i => i.key === key ? { ...i, qty: Math.max(1, Math.min(99, i.qty + change)) } : i));
    persist('manara-cart', this.cart());
  }
  remove(key: string): void { this.cart.update(items => items.filter(i => i.key !== key)); persist('manara-cart', this.cart()); }
  applyPromo(code: string): void {
    if (code.trim().toUpperCase() === welcomeOffer.code) { this.discount.set(true); this.notify(this.t('discountApplied').replace('{percent}', String(welcomeOffer.discount * 100))); }
    else { this.discount.set(false); this.notify(this.t('invalidPromo').replace('{code}', welcomeOffer.code)); }
  }
  checkoutError(): string {
    if (this.cart().some(i => !this.available(i.id))) return this.t('branchUnavailable');
    if (this.cart().some(i => { const groups = dishes.find(d => d.id === i.id)?.optionGroups; return groups && !validOptionSelections(groups, i.optionSelections ?? []); })) return this.t('cartOptionsInvalid');
    if (!currentCartPrices(this.cart())) return this.t('cartPriceChanged');
    const quote = this.quote();
    return quote.reason === 'minimumOrder' ? `${this.t('minimumOrder')}: ${this.money(quote.minimumOrder)}` : quote.reason ? this.t(quote.reason) : '';
  }
  placeOrder(fields: Record<string, string>): void {
    fields = cleanFields(fields);
    if (!validContact(fields) || !fields['agree'] || !['cash', 'card'].includes(fields['payment']) || (!this.pickup() && !fields['address'])) {
      this.notify(this.t('invalidForm')); return;
    }
    this.now.set(new Date());
    const error = this.checkoutError();
    if (error || !this.cart().length) { this.notify(error || this.t('emptySub')); return; }
    const branch = this.branch(), quote = this.quote();
    const order: Order = { id: crypto.randomUUID().slice(0, 8).toUpperCase(), date: new Date().toISOString(), items: this.cart().map(i => ({ ...i })), total: this.total(), status: 'Confirmed',
      branchId: branch.id, branchName: branch.name, branchAddress: branch.address, fulfillment: this.pickup() ? 'pickup' : 'delivery', deliveryFee: quote.fee ?? 0,
      estimatedDeliveryMinutes: this.pickup() ? undefined : quote.zone?.estimatedMinutes, deliveryMinimum: quote.minimumOrder, freeDeliveryApplied: quote.freeDeliveryApplied,
      deliveryZone: quote.zone ? { id: quote.zone.id, name: quote.zone.name } : null, deliveryCity: this.city(),
      contact: { name: fields['name'], email: fields['email'], phone: fields['phone'] }, address: this.pickup() ? '' : fields['address'], payment: fields['payment'], notes: fields['notes'] };
    this.orders.update(orders => [order, ...orders]); persist('manara-orders', this.orders());
    if (fields['save-address'] && fields['address']) this.saveAddress(fields['address']);
    this.lastOrder.set(order); this.cart.set([]); persist('manara-cart', []); this.discount.set(false); this.success.set('order');
  }
  submit(kind: string, fields: Record<string, string>): void {
    fields = cleanFields(fields);
    if (kind === 'reservation' && !validReservation(fields, new Date(), site.timeZone)) { this.notify(this.t('invalidReservation')); return; }
    if ((kind === 'contact' && (!validContact(fields) || !fields['subject'] || !fields['message'])) || (kind === 'newsletter' && !validEmail(fields['email']))) {
      this.notify(this.t('invalidForm')); return;
    }
    this.submissions.update(entries => [{ id: crypto.randomUUID(), kind, fields, branchId: this.branch().id, date: new Date().toISOString() }, ...entries]);
    persist('manara-submissions', this.submissions());
    if (kind === 'newsletter') this.notify(this.t('subscriptionSaved')); else this.success.set(kind);
  }
  saveAddress(value: string, index = -1): void {
    if (!value.trim()) return;
    this.addresses.update(items => index < 0 ? [...items, value.trim()] : items.map((item, i) => i === index ? value.trim() : item));
    persist('manara-addresses', this.addresses());
  }
  deleteAddress(index: number): void { this.addresses.update(items => items.filter((_, i) => i !== index)); persist('manara-addresses', this.addresses()); }
  private setUser(user: User | null): void { this.user.set(user); persist('manara-user', user); }
  guest(): void { this.setUser({ name: this.t('demoGuestName'), email: 'guest@example.com' }); this.go('/profile'); }
  logout(): void { this.setUser(null); try { sessionStorage.removeItem('manara-session'); } catch {} this.go('/login'); }
  async authenticate(mode: string, fields: Record<string, string>): Promise<void> {
    if (this.busy()) return;
    fields = cleanFields(fields);
    if (mode !== 'reset-password' && !validEmail(fields['email'])) { this.notify(this.t('invalidForm')); return; }
    if (mode === 'signup' && (!validContact(fields) || !fields['agree'])) { this.notify(this.t('invalidForm')); return; }
    if (['signup', 'reset-password'].includes(mode) && !validPassword(fields['password'])) { this.notify(this.t('passwordLength')); return; }
    this.busy.set(true);
    try {
      const email = (fields['email'] ?? '').trim().toLowerCase();
      const account = this.accounts().find(a => a.email === email);
      if (mode === 'signup') {
        if (account) { this.notify(this.t('accountExists')); return; }
        if (fields['password'] !== fields['confirm-password']) { this.notify(this.t('passwordMismatch')); return; }
        const salt = crypto.randomUUID();
        const created = { name: fields['name'], email, phone: fields['phone'], salt, hash: await passwordHash(fields['password'], salt) };
        this.accounts.update(items => [...items, created]); persist('manara-accounts', this.accounts());
        this.setUser({ name: created.name, email, phone: created.phone }); this.go('/profile');
      } else if (mode === 'login') {
        if (!account || await passwordHash(fields['password'], account.salt) !== account.hash) { this.notify(this.t('invalidLogin')); return; }
        const sessionOnly = !fields['remember'];
        if (sessionOnly) try { sessionStorage.setItem('manara-session', 'active'); } catch {}
        this.setUser({ name: account.name, email, phone: account.phone, sessionOnly }); this.go('/profile');
      } else if (mode === 'forgot-password') {
        if (!account) { this.notify(this.t('invalidLogin')); return; }
        this.reset.set({ email, token: crypto.randomUUID(), expires: Date.now() + 30 * 60 * 1000 });
        persist('manara-reset', this.reset()); this.success.set('reset'); this.notify(this.t('resetReady'));
      } else {
        const reset = this.reset(), token = new URLSearchParams(location.search).get('token');
        if (!reset || reset.token !== token || reset.expires < Date.now()) { this.notify(this.t('invalidReset')); return; }
        if (fields['password'] !== fields['confirm-password']) { this.notify(this.t('passwordMismatch')); return; }
        await this.changePassword(reset.email, fields['password']); this.reset.set(null); persist('manara-reset', null);
        this.notify(this.t('passwordChanged')); this.go('/login');
      }
    } catch { this.notify(this.t('errorDescription')); } finally { this.busy.set(false); }
  }
  async changePassword(email: string, password: string): Promise<void> {
    if (!validPassword(password)) throw new Error('Invalid password length');
    const salt = crypto.randomUUID(), hash = await passwordHash(password, salt);
    this.accounts.update(items => items.map(a => a.email === email ? { ...a, salt, hash } : a)); persist('manara-accounts', this.accounts());
  }
  async updateProfile(fields: Record<string, string>): Promise<void> {
    fields = cleanFields(fields);
    if (!validName(fields['name']) || !validEmail(fields['email'])) { this.notify(this.t('invalidForm')); return; }
    const current = this.user(); if (!current) return;
    const email = fields['email'].trim().toLowerCase();
    if (this.accounts().some(a => a.email === email && a.email !== current.email)) { this.notify(this.t('emailUpdated')); return; }
    this.accounts.update(items => items.map(a => a.email === current.email ? { ...a, name: fields['name'], email, phone: fields['phone'] } : a));
    persist('manara-accounts', this.accounts()); this.setUser({ ...current, name: fields['name'], email, phone: fields['phone'] }); this.notify(this.t('phoneSaved'));
  }
  private updateRoute(url: string): void {
    const clean = url.split(/[?#]/)[0], lang = localeFromPath(clean), path = unlocalizedPath(clean);
    this.lang.set(lang); this.path.set(path); persist('manara-language', lang);
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    this.seo.update(path, lang);
  }
}
