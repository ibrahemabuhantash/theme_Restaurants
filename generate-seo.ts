import { writeFileSync } from 'node:fs';
import { robots, sitemapEntries } from '../lib/seo';

const escape = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const entries = sitemapEntries().map(entry => `<url><loc>${escape(entry.url)}</loc>${Object.entries(entry.alternates.languages).map(([lang, href]) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${escape(href)}"/>`).join('')}</url>`);
writeFileSync('public/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${entries.join('')}</urlset>\n`);
const policy = robots();
writeFileSync('public/robots.txt', `User-agent: *\n${'allow' in policy.rules ? 'Allow: /' : 'Disallow: /'}\nSitemap: ${policy.sitemap}\n`);
