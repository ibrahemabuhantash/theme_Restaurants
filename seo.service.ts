import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { dishes } from '../data/menu';
import { Locale } from '../lib/localized-url';
import { breadcrumbSchema, dictionary, menuSchema, pageMetadata, privatePaths, publicPages, productSchema, restaurantSchema, serializeJsonLd } from '../lib/seo';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  update(path: string, locale: Locale): void {
    const dish = /^\/food\/\d+$/.test(path) ? dishes.find(item => `/food/${item.id}` === path) : undefined;
    const page = publicPages.find(item => item.path === path);
    const privateKey = ({ '/forgot-password': 'forgot', '/reset-password': 'resetPassword' } as const);
    const known = !!page || !!dish || privatePaths.includes(path);
    const copy = dictionary(locale);
    const key = !known ? 'notFound' : dish ? 'menu' : page?.key ?? privateKey[path as keyof typeof privateKey] ?? (path.slice(1) in copy ? path.slice(1) : 'notFound');
    const metadata = pageMetadata(path, key as keyof typeof copy, locale, dish);
    this.title.setTitle(metadata.title.absolute);
    this.meta.updateTag({ name: 'description', content: known ? metadata.description : copy.notFoundDescription });
    this.meta.updateTag({ name: 'robots', content: `${known && metadata.robots.index ? 'index' : 'noindex'}, ${known && metadata.robots.follow ? 'follow' : 'nofollow'}` });
    for (const [property, content] of Object.entries({
      'og:title': metadata.openGraph.title, 'og:description': metadata.description,
      'og:image': metadata.openGraph.images[0].url, 'og:url': metadata.openGraph.url,
      'og:type': metadata.openGraph.type, 'og:locale': metadata.openGraph.locale,
      'og:site_name': metadata.openGraph.siteName,
    })) this.meta.updateTag({ property, content });
    for (const [name, content] of Object.entries({
      'twitter:card': metadata.twitter.card, 'twitter:title': metadata.twitter.title,
      'twitter:description': metadata.twitter.description, 'twitter:image': metadata.twitter.images[0],
    })) this.meta.updateTag({ name, content });
    this.link('canonical', metadata.alternates.canonical);
    for (const [language, href] of Object.entries(metadata.alternates.languages)) this.link('alternate', href, language);
    this.document.querySelector('#manara-schema')?.remove();
    if (!known || privatePaths.includes(path)) return;
    const script = this.document.createElement('script');
    script.id = 'manara-schema'; script.type = 'application/ld+json';
    script.textContent = serializeJsonLd([
      ...restaurantSchema(locale), ...(path === '/menu' ? [menuSchema(locale)] : []),
      ...(dish ? [productSchema(dish, locale)] : []),
      breadcrumbSchema(path, key as keyof typeof copy, locale, dish),
    ]);
    this.document.head.appendChild(script);
  }

  private link(rel: string, href: string, language?: string): void {
    const selector = `link[rel="${rel}"]${language ? `[hreflang="${language}"]` : ''}`;
    const link = this.document.head.querySelector<HTMLLinkElement>(selector) ?? this.document.createElement('link');
    link.rel = rel; link.href = href;
    if (language) link.hreflang = language;
    this.document.head.appendChild(link);
  }
}
