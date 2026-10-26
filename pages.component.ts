import { Component, ElementRef, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { RouterLink, NavigationEnd } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from './store';
import { ImageComponent, HeroComponent, CardComponent, FoodInformationComponent, KitchenNoticeComponent, MapComponent } from './shared';
import { categories, categoryImages } from '../data/categories';
import { images, ImageAsset } from '../config/images';
import { galleryPhotos, galleryPreview } from '../data/gallery';
import { reviews, reviewSummary } from '../data/reviews';
import { team } from '../data/team';
import { legal } from '../data/legal';
import { welcomeOffer } from '../data/offers';
import { Dish, OptionGroup } from '../data/menu';
import { validOptionSelections, optionPrice } from '../data/options';
import { dateInZone } from '../lib/form-validation';

@Component({
  selector: 'manara-pages', standalone: true,
  imports: [FormsModule, DatePipe, NgTemplateOutlet, RouterLink, ImageComponent, HeroComponent, CardComponent, FoodInformationComponent, KitchenNoticeComponent, MapComponent],
  templateUrl: './pages.component.html',
})
export class PagesComponent {
  readonly s = inject(Store);
  readonly categories = categories;
  readonly categoryImages = categoryImages;
  readonly images = images;
  readonly galleryPreview = galleryPreview;
  readonly galleryPhotos = galleryPhotos;
  readonly reviews = reviews;
  readonly reviewSummary = reviewSummary;
  readonly team = team;
  readonly legal = legal;
  readonly offer = welcomeOffer;
  get today(): string { return dateInZone(this.s.now(), this.s.site.timeZone); }
  search = ''; category = new URLSearchParams(location.search).get('category') || 'All'; diet = ''; sort = 'recommended'; galleryFilter = 'All';
  qty = 1; size = 'Regular'; selected: string[] = []; notes = ''; choices: number[][] = [];
  promo = ''; passwordVisible = false; profileTab = 'overview'; newAddress = ''; addressIndex = -1; addressValue = '';
  lightbox: ImageAsset | null = null;
  @ViewChild('photoDialog') photoDialog?: ElementRef<HTMLDialogElement>;
  @ViewChild('addressDialog') addressDialog?: ElementRef<HTMLDialogElement>;
  constructor() {
    this.s.router.events.pipe(takeUntilDestroyed()).subscribe(event => {
      if (event instanceof NavigationEnd) { this.qty = 1; this.size = 'Regular'; this.selected = []; this.notes = ''; this.choices = []; }
    });
  }
  get dish(): Dish | undefined { return this.s.dishes.find(d => d.id === Number(this.s.path().split('/')[2])); }
  get filtered(): Dish[] {
    const result = this.s.dishes.filter(d => this.s.status(d.id) !== 'unavailable' && (this.category === 'All' || d.category === this.category) && `${d.name} ${d.ar} ${d.description}`.toLowerCase().includes(this.search.toLowerCase()) && (!this.diet || d.label === this.diet));
    return this.sort === 'recommended' ? result : result.sort((a, b) => this.sort === 'low' ? a.price - b.price : b.price - a.price);
  }
  get featured(): Dish[] { return this.s.dishes.filter(d => this.s.status(d.id) !== 'unavailable').slice(0, 4); }
  get saved(): Dish[] { return this.s.dishes.filter(d => this.s.favorites().includes(d.id)); }
  get authMode(): string { return this.s.path().slice(1); }
  get authTitle(): string { return this.s.t(({ 'forgot-password': 'forgot', 'reset-password': 'resetPassword' } as Record<string, string>)[this.authMode] ?? this.authMode); }
  get authAction(): string { return this.s.t(({ login: 'loginAction', signup: 'signupAction', 'forgot-password': 'resetAction', 'reset-password': 'resetPassword' } as Record<string, string>)[this.authMode]); }
  get legalContent(): { title: string; paragraphs: string[] } { return legal[this.s.path() === '/terms' ? 'terms' : 'privacy'][this.s.lang()]; }
  get detailPrice(): number {
    const d = this.dish; if (!d) return 0;
    return d.price + (d.optionGroups ? optionPrice(d.optionGroups, this.choices) : (this.s.sizes.find(s => s.name === this.size)?.price ?? 0) + this.selected.reduce((n, x) => n + (this.s.extras.find(e => e.name === x)?.price ?? 0), 0));
  }
  get validChoices(): boolean { return !this.dish?.optionGroups || validOptionSelections(this.dish.optionGroups, this.choices); }
  choose(group: OptionGroup, groupIndex: number, option: number): void {
    const current = this.choices[groupIndex] ?? [];
    this.choices = [...this.choices];
    this.choices[groupIndex] = current.includes(option) ? current.filter(x => x !== option) : group.max === 1 ? [option] : current.length < group.max ? [...current, option] : current;
  }
  toggleExtra(name: string): void { this.selected = this.selected.includes(name) ? this.selected.filter(x => x !== name) : [...this.selected, name]; }
  fields(event: Event): Record<string, string> {
    event.preventDefault();
    return Object.fromEntries(new FormData(event.target as HTMLFormElement)) as Record<string, string>;
  }
  submit(event: Event, kind: string): void { this.s.submit(kind, this.fields(event)); }
  checkout(event: Event): void {
    const fields = this.fields(event);
    if (!this.s.pickup()) this.s.city.set(fields['city'] ?? '');
    this.s.placeOrder(fields);
  }
  auth(event: Event): void { void this.s.authenticate(this.authMode, this.fields(event)); }
  profile(event: Event): void { void this.s.updateProfile(this.fields(event)); }
  async password(event: Event): Promise<void> {
    const fields = this.fields(event), user = this.s.user();
    if (!user || !this.s.accounts().some(a => a.email === user.email)) { this.s.notify(this.s.t('demoGuestPassword')); return; }
    if (fields['password'] !== fields['confirm-password']) { this.s.notify(this.s.t('passwordMismatch')); return; }
    try { await this.s.changePassword(user.email, fields['password']); this.s.notify(this.s.t('passwordChanged')); (event.target as HTMLFormElement).reset(); }
    catch { this.s.notify(this.s.t('errorDescription')); }
  }
  photo(asset: ImageAsset): void { this.lightbox = asset; this.photoDialog?.nativeElement.showModal(); }
  editAddress(index: number, value: string): void { this.addressIndex = index; this.addressValue = value; this.addressDialog?.nativeElement.showModal(); }
  saveAddress(event: Event): void { event.preventDefault(); if (this.addressValue.trim()) { this.s.saveAddress(this.addressValue, this.addressIndex); this.addressDialog?.nativeElement.close(); } }
  addAddress(event: Event): void { event.preventDefault(); this.s.saveAddress(this.newAddress); this.newAddress = ''; }
  dishImage(id: number): ImageAsset { return this.s.dishes.find(d => d.id === id)?.image ?? images.hero; }
}
