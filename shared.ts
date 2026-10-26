import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ImageAsset, imageSizes, responsiveSources } from '../config/images';
import { Dish, FoodInformation } from '../data/menu';
import { visibleFoodInformation } from '../lib/food-information';
import { Store } from './store';

@Component({
  selector: 'img[manaraImage]',
  standalone: true,
  template: '',
  host: {
    '[src]': 'asset.src', '[alt]': 'decorative ? "" : asset.alt[s.lang()]',
    '[attr.width]': 'asset.width', '[attr.height]': 'asset.height',
    '[attr.srcset]': 'sources', '[attr.sizes]': 'sizes',
    '[attr.loading]': 'eager ? "eager" : "lazy"', '[attr.decoding]': '"async"',
    '[attr.fetchpriority]': 'eager ? "high" : "auto"',
  },
})
export class ImageComponent {
  readonly s = inject(Store);
  @Input({ required: true }) asset!: ImageAsset;
  @Input() size: keyof typeof imageSizes = 'card';
  @Input() eager = false;
  @Input() decorative = false;
  get sources(): string | undefined { return responsiveSources(this.asset); }
  get sizes(): string { return imageSizes[this.size]; }
}

@Component({ selector: 'manara-hero', standalone: true, imports: [ImageComponent], template: `
  <section class="page-hero"><img manaraImage [asset]="image || s.site.hero" size="full" [eager]="true" />
    <div class="container"><span class="eyebrow">{{ s.t('pageEyebrow') }}</span><h1>{{ title }}</h1><p>{{ sub }}</p></div>
  </section>`,
})
export class HeroComponent {
  readonly s = inject(Store);
  @Input({ required: true }) title = '';
  @Input() sub = '';
  @Input() image?: ImageAsset;
}

@Component({ selector: 'manara-food-information', standalone: true, template: `
  @if (info; as value) {
    <section class="food-information" [class.panel]="!compact" [attr.aria-label]="s.t('foodInformationTitle')">
      @if (!compact) { <h3>{{ s.t('foodInformationTitle') }}</h3> }
      <div class="food-tags">
        @if (value.calories !== undefined) { <span>{{ value.calories }} {{ s.t('foodCaloriesUnit') }}</span> }
        @for (tag of value.dietary; track tag) { <span>{{ s.t('foodDiet_' + tag) }}</span> }
      </div>
      @if (value.allergens?.length) { <div><b>{{ s.t('foodContains') }}</b> @for (allergen of value.allergens; track allergen; let last = $last) { {{ s.t('foodAllergen_' + allergen) }}{{ last ? '' : ' · ' }} }</div> }
      @if (!compact) { <p>{{ s.t('foodServingNote') }}</p> }
      @if (value.demo) { <small>{{ s.t('foodDemoNote') }}</small> }
    </section>
  }`,
})
export class FoodInformationComponent {
  readonly s = inject(Store);
  @Input() information?: FoodInformation;
  @Input() compact = false;
  get info(): FoodInformation | null { return visibleFoodInformation(this.information, this.s.site.foodInformation.enabled); }
}

@Component({ selector: 'manara-kitchen-notice', standalone: true, template: `
  @if (s.site.foodInformation.enabled && s.site.foodInformation.showKitchenNotice) {
    <aside class="kitchen-notice panel"><h3>{{ s.t('foodKitchenTitle') }}</h3><p>{{ s.t('foodKitchenNotice') }}</p></aside>
  }`,
})
export class KitchenNoticeComponent { readonly s = inject(Store); }

@Component({ selector: 'manara-card', standalone: true, imports: [RouterLink, ImageComponent, FoodInformationComponent], template: `
  <article class="dish-card">
    <div class="dish-image">
      <a [routerLink]="s.link('/food/' + dish.id)"><img manaraImage [asset]="dish.image" size="card" /></a>
      @if (dish.label) { <span class="food-label" [class.blue-label]="dish.label === 'Bestseller'">{{ dish.label }}</span> }
      <button class="btn btn-ghost favorite" [class.is-favorite]="s.favorites().includes(dish.id)" [attr.aria-label]="'Save ' + s.name(dish)" [attr.aria-pressed]="s.favorites().includes(dish.id)" (click)="s.favorite(dish.id)">♡</button>
    </div>
    <div class="dish-body">
      <a [routerLink]="s.link('/food/' + dish.id)"><h3>{{ s.name(dish) }}</h3></a>
      <p>{{ s.lang() === 'ar' ? dish.descriptionAr : dish.description }}</p>
      <manara-food-information [information]="dish.foodInfo" [compact]="true" />
      <div class="dish-bottom"><b>{{ s.money(dish.price) }}</b><button class="btn btn-outline" [disabled]="!s.available(dish.id)" (click)="dish.optionGroups?.length ? s.go('/food/' + dish.id) : s.add(dish)">＋ {{ s.available(dish.id) ? s.t(dish.optionGroups?.length ? 'customize' : 'add') : s.availabilityLabel(dish.id) }}</button></div>
    </div>
  </article>`,
})
export class CardComponent { readonly s = inject(Store); @Input({ required: true }) dish!: Dish; }

@Component({ selector: 'manara-map', standalone: true, imports: [ImageComponent], template: `
  <div class="map-preview" [attr.aria-label]="s.branch().address[s.lang()]">
    <div class="map-water"></div><div class="map-road road-1"></div><div class="map-road road-2"></div><div class="map-road road-3"></div>
    <span class="map-label label-1">{{ s.branch().name[s.lang()] }}</span><span class="map-label label-2">{{ s.branch().address[s.lang()] }}</span>
    <span class="map-pin"><img manaraImage [asset]="s.site.logo" size="logo" /></span>
    <a class="map-link" [href]="'https://maps.google.com/?q=' + s.branch().coordinates.lat + ',' + s.branch().coordinates.lng" target="_blank" rel="noreferrer">Open in Google Maps ↗</a>
  </div>`,
})
export class MapComponent { readonly s = inject(Store); }
