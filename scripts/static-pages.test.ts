import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { elements } from '../src/data/elements';
import { pageMetadata, wikipediaUrl } from '../src/utils/seo';
import { propertyRows, renderStaticPage } from './static-pages';

const template = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const gold = elements.find(e => e.symbol === 'Au')!;
const jsonLd = (html: string) => JSON.parse(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)![1]);

describe('searchable pages', () => {
  it('gives all 118 elements unique self-canonicals, factual HTML, links, and the app entrypoint', () => {
    const titles = new Set();
    for (const element of elements) {
      const html = renderStaticPage(template, element);
      const metadata = pageMetadata(element);
      titles.add(metadata.title);
      expect(html).toContain(`<link rel="canonical" href="https://periodictable.tech/element/${element.symbol}"`);
      expect(html).not.toContain('rel="canonical" href="https://periodictable.tech/"');
      expect(html).toContain(`<h1>${element.name} (${element.symbol})</h1>`);
      expect(html).toContain('Electron configuration');
      expect(html).toContain('href="/element/Au"');
      expect(html).toContain('src="/src/main.tsx"');
      const [resource, breadcrumbs] = jsonLd(html)['@graph'];
      expect(resource.url).toBe(metadata.url);
      expect(resource.about.sameAs).toBe(wikipediaUrl(element));
      expect(breadcrumbs['@type']).toBe('BreadcrumbList');
      expect(breadcrumbs.itemListElement[1].item).toBe(metadata.url);
    }
    expect(titles.size).toBe(118);
  });

  it('keeps search titles and descriptions within snippet length and general-audience', () => {
    for (const element of elements) {
      const { title, description } = pageMetadata(element);
      expect(title.length).toBeLessThanOrEqual(60);
      expect(description.length).toBeLessThanOrEqual(160);
      expect(description.startsWith(element.summary)).toBe(true);
    }
    expect(renderStaticPage(template)).not.toMatch(/\bkids?\b/i);
    expect(renderStaticPage(template)).not.toContain('suggestedMinAge');
  });

  it('preserves authored video sharing and has a complete homepage without JavaScript', () => {
    expect(renderStaticPage(template, gold, 'https://cdn.example.test')).toContain('https://cdn.example.test/079-Au-veo31fast.mp4');
    const home = renderStaticPage(template);
    expect(home.match(/href="\/element\//g)).toHaveLength(118);
    expect(home).not.toContain('<div id="root"></div>');
    // Category vocabulary is visible text, with correct plurals.
    for (const heading of ['Alkali Metals', 'Noble Gases', 'Lanthanides', 'Halogens']) expect(home).toContain(`<h2>${heading}</h2>`);
    expect(home).not.toContain('Gass');
    // The template's dev-only schema and the prerendered homepage schema agree.
    const templateSchema = jsonLd(template);
    const homeSchema = jsonLd(home);
    expect(Object.keys(homeSchema).sort()).toEqual(Object.keys(templateSchema).sort());
    expect(homeSchema.about.sameAs).toBe(templateSchema.about.sameAs);
  });

  it('declares the dimensions of the image each page actually sends', () => {
    const home = renderStaticPage(template);
    expect(home).toContain('<meta property="og:image:width" content="1200" />');
    expect(home).toContain('<meta property="og:image:height" content="630" />');
    const au = renderStaticPage(template, gold);
    expect(au).toContain('<meta property="og:image:width" content="1200" />');
    expect(au).toContain('<meta property="og:image:height" content="676" />');
    expect(au).toMatch(/<img src="[^"]+079-Au-veo31fast\.jpg" width="1200" height="676" alt="[^"]+" \/>/);
    expect(au).toContain('<figcaption>Video: ');
  });

  it('renders physical properties as visible text and omits unknown values', () => {
    const rows = Object.fromEntries(propertyRows(gold));
    expect(rows['Melting point']).toBe('1337.33 K (1064.18 °C)');
    expect(rows['Density']).toBe('19.282 g/cm³');
    expect(rows['Category']).toBe('Transition Metal');
    expect(rows['Discovered by']).toBe('Ancient civilizations');
    const copernicium = elements.find(e => e.symbol === 'Cn')!;
    const cnRows = Object.fromEntries(propertyRows(copernicium));
    expect(cnRows['Melting point']).toBeUndefined();
    expect(cnRows['Discovered by']).toMatch(/\(1996\)$/);
    for (const element of elements) {
      for (const [, value] of propertyRows(element)) expect(value).not.toMatch(/null|undefined|NaN/);
    }
    expect(renderStaticPage(template, gold)).toContain('<dt>Melting point</dt><dd>1337.33 K (1064.18 °C)</dd>');
  });

  it('links every element to its Wikipedia article, not a disambiguation page', () => {
    const mercury = elements.find(e => e.symbol === 'Hg')!;
    expect(wikipediaUrl(mercury)).toBe('https://en.wikipedia.org/wiki/Mercury_(element)');
    expect(wikipediaUrl(gold)).toBe('https://en.wikipedia.org/wiki/Gold');
    expect(renderStaticPage(template, mercury)).toContain('href="https://en.wikipedia.org/wiki/Mercury_(element)"');
  });

  it('describes every video with a real publish date for video rich results', () => {
    for (const element of elements) {
      const video = jsonLd(renderStaticPage(template, element))['@graph'][0].video;
      expect(video['@type']).toBe('VideoObject');
      expect(video.uploadDate).toMatch(/^20\d\d-\d\d-\d\d$/);
      expect(video.thumbnailUrl).toMatch(/\.jpg$/);
      expect(video.contentUrl).toMatch(/\.mp4$/);
      expect(video.name).toContain(element.name);
    }
  });

  it('emits single-line media URLs even when the configured CDN has stray whitespace', () => {
    // Reproduces production: VITE_VIDEO_CDN_URL carried a trailing newline, and
    // seo.ts stripped only a trailing slash, so every og:image and og:video URL
    // was split across two lines and rejected by crawlers.
    const html = renderStaticPage(template, gold, 'https://cdn.example.test/\n');
    expect(html).toContain('content="https://cdn.example.test/079-Au-veo31fast.jpg"');
    expect(html).toContain('content="https://cdn.example.test/079-Au-veo31fast.mp4"');
    // No content attribute may run to end-of-line with its value unterminated.
    expect(html).not.toMatch(/content="[^"]*\n/);
    expect(pageMetadata(gold, 'https://cdn.example.test/\n').image).not.toMatch(/\s/);
  });
});
