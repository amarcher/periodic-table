import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { elements } from '../src/data/elements';
import { FACT_CLIPS, getClips, getLandscapeClips, getShorts, heroClip } from '../src/data/clips';
import { clipPageMetadata, pageMetadata, wikipediaUrl } from '../src/utils/seo';
import { sitemapPaths } from '../src/utils/sitemap';
import { CLIP_PROMPTS } from './generate-videos/clip-prompts';
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
      expect(resource.isPartOf['@type']).toBe('WebSite');
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
    expect(home.match(/href="\/element\/[A-Z][a-z]?"/g)).toHaveLength(118);
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
      expect(video.uploadDate).toMatch(/^20\d\d-\d\d-\d\dT\d\d:\d\d:\d\dZ$/); // Google requires a timezone
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

describe('watch pages', () => {
  it('gives every element a hero clip with a stable, URL-safe slug and a publish date', () => {
    for (const element of elements) {
      const hero = heroClip(element)!;
      expect(hero.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+){0,4}$/);
      expect(hero.uploadDate).toBeTruthy();
      expect(getLandscapeClips(element)[0]).toEqual(hero);
    }
  });

  it('publishes only fact clips that have been uploaded, and every fact clip has a prompt', () => {
    for (const [symbol, clips] of Object.entries(FACT_CLIPS)) {
      const element = elements.find(e => e.symbol === symbol)!;
      expect(element).toBeTruthy();
      const slugs = new Set<string>();
      for (const clip of clips ?? []) {
        expect(CLIP_PROMPTS[`${symbol}/${clip.slug}`]).toBeTruthy();
        expect(clip.filename).toMatch(new RegExp(`^${String(element.atomicNumber).padStart(3, '0')}-${symbol}-(short-)?[a-z0-9-]+\\.mp4$`));
        expect(clip.fact.length).toBeGreaterThan(20);
        expect(clip.fact.length).toBeLessThanOrEqual(260);
        expect(['16:9', '9:16']).toContain(clip.aspect);
        expect(slugs.has(clip.slug)).toBe(false);
        slugs.add(clip.slug);
      }
      expect(getClips(element).every(clip => clip.uploadDate)).toBe(true);
      expect(getShorts(element).every(clip => clip.aspect === '9:16')).toBe(true);
      expect(getLandscapeClips(element)[0]).toEqual(heroClip(element));
      expect(getLandscapeClips(element).every(clip => clip.aspect === '16:9')).toBe(true);
      expect(getClips(element)).toEqual([...getShorts(element), ...getLandscapeClips(element)]);
    }
  });

  it('prerenders each clip as a video page with schema, breadcrumbs and a channel', () => {
    let pages = 0;
    for (const element of elements) {
      for (const clip of getClips(element)) {
        const html = renderStaticPage(template, element, 'https://cdn.example.test', clip);
        const meta = clipPageMetadata(element, clip, 'https://cdn.example.test');
        pages++;
        // Authored fact-clip titles stay search-length; hero pages reuse the full video description.
        const authored = FACT_CLIPS[element.symbol]?.some(c => c.slug === clip.slug);
        expect(meta.title.length).toBeLessThanOrEqual(authored ? 70 : 180);
        expect(meta.description.length).toBeLessThanOrEqual(160);
        expect(html).toContain(`<link rel="canonical" href="https://periodictable.tech/element/${element.symbol}/video/${clip.slug}" />`);
        expect(html).toContain('<meta property="og:type" content="video.other" />');
        expect(html).toContain(`<h1>${clip.title.replace(/&/g, '&amp;').replace(/'/g, '&#39;').replace(/"/g, '&quot;')}</h1>`);
        expect(html).toContain(`<source src="https://cdn.example.test/${clip.filename}" type="video/mp4" />`);
        expect(html).toContain(`href="/element/${element.symbol}"`);
        const [video, breadcrumbs] = jsonLd(html)['@graph'];
        expect(video['@type']).toBe('VideoObject');
        expect(video.mainEntityOfPage).toBe(meta.url);
        expect(video.uploadDate).toMatch(/^20\d\d-\d\d-\d\dT\d\d:\d\d:\d\dZ$/);
        expect(video.duration).toBe('PT8S');
        const portrait = clip.aspect === '9:16';
        expect([video.width, video.height]).toEqual(portrait ? [720, 1280] : [1280, 720]);
        expect(html).toContain(`<meta property="og:video:width" content="${portrait ? 720 : 1280}" />`);
        expect(html).toContain(`<meta property="og:image:height" content="${portrait ? 2134 : 676}" />`);
        expect(breadcrumbs.itemListElement).toHaveLength(3);
        expect(breadcrumbs.itemListElement[2].item).toBe(meta.url);
      }
    }
    expect(pages).toBeGreaterThanOrEqual(118);
  });

  it('lists watch pages in the sitemap and links them from the element page', () => {
    const paths = sitemapPaths();
    const clipCount = elements.reduce((n, element) => n + getClips(element).length, 0);
    expect(paths).toHaveLength(1 + 118 + clipCount);
    expect(new Set(paths).size).toBe(paths.length);
    const hero = heroClip(gold)!;
    expect(paths).toContain(`/element/Au/video/${hero.slug}`);
    expect(renderStaticPage(template, gold)).toContain(`href="/element/Au/video/${hero.slug}"`);
  });
});
