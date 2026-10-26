# Manara Angular

The restaurant application has been migrated from Next.js/React to Angular 21 using standalone components, Angular Router, signals, and Angular forms. This directory is the Angular workspace root.

## Run

On this Windows workspace, run `start.cmd` (or `.\start.cmd` in PowerShell). It uses the portable Node.js runtime downloaded for verification when available, or your installed Node.js.

Install Node.js 22.12+ (22 LTS), then run from this directory:

```sh
npm install
npm start
```

Open http://localhost:4200. `npm run build` produces `dist/manara/browser` and generates the sitemap/robots files. `npm test` runs the data and business-rule tests. `npm run test:e2e` runs browser tests using installed Google Chrome (see `playwright.config.ts`).

## Structure

- `angular/app.component.*`: application shell, header, footer, mobile navigation.
- `angular/pages.component.*`: all page templates and form handlers.
- `angular/shared.ts`: reusable dish cards, responsive images, page headers, nutrition, and map preview.
- `angular/store.ts`: shared reactive state, browser persistence, accounts, ordering, delivery, and route metadata.
- `angular/seo.service.ts`: route titles, localized descriptions, social metadata, and structured data; missing and private pages are excluded from indexing.
- `angular/routes.ts`: English and `/ar` routes, including food detail and fallback pages.
- `config`, `data`, `locales`, `lib`: preserved catalog, design settings, translations, validators, and business rules.
- `public`: local images and robots policy.

The original React/Next source is backed up in `migration/react-source.zip`; it is not part of the Angular build.

## Features

Home, menu search/category/diet/price filters, dish options and extras, favorites, cart, delivery zones and minimums, promo codes, checkout, contact, reservations, gallery lightbox, story/team, legal pages, signup/login/password reset, profile/password management, saved addresses, and order/request history. Arabic routes set the document language and RTL direction. Existing `manara-*` storage keys remain compatible.

Accounts, payments, orders, subscriptions, and reservations remain browser-local demonstrations, matching the supplied project. No backend is configured. Photos are stored in `public/images`, with responsive sizes for mobile and desktop. Their original source is Unsplash; `scripts/download-images.ts` can restore missing files. Google Fonts requires network access.

## Hosting and SEO

Configure your host to serve `index.html` for application routes (including `/ar/*` and `/food/*`) so reloads and direct links work. This conversion uses client rendering: route titles, descriptions, canonical/language links, social metadata, and structured data update in the browser. Next.js server rendering is no longer present; add Angular SSR/prerendering if server-rendered SEO is required.

Indexing stays disabled for the sample `.example` domain. Before a real launch, configure `config/site.ts`, verify all sample content, and update `public/robots.txt` and the generated sitemap.

## Validation and maintenance

`npm run check` runs the production build, unit tests, and Chrome browser tests. Page code loads through Angular's lazy route loader. The store disposes its timers and subscriptions when destroyed.

Form checks live in `lib/form-validation.ts`: whitespace is normalized, contact details and password lengths are checked, and bookings use the restaurant timezone and reject invalid/past dates and times. `lib/cart-pricing.ts` compares saved item prices/options against the current catalog before checkout. These browser-side checks improve demo consistency; production validation and authoritative pricing must run on a backend.

Arabic translations cover profile, checkout, sorting, and validation messages. Existing browser storage keys are preserved. Real authentication, remote orders/reservations, payment processing, and server rendering still require separate integration.
