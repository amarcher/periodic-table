import type { Plugin } from 'vite';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { elements } from '../src/data/elements';
import type { Element } from '../src/types/element';
import { categoryLabels } from '../src/utils/colors';
import { escapeHtml as e, pageMetadata, SITE_ORIGIN, wikipediaUrl } from '../src/utils/seo';

const round = (n: number) => Number(n.toFixed(2)).toString();
const temperature = (kelvin: number | null) =>
  kelvin == null ? null : `${round(kelvin)} K (${round(kelvin - 273.15)} °C)`;
const discovery = (element: Element) =>
  typeof element.yearDiscovered === 'number'
    ? `${element.discoveredBy} (${element.yearDiscovered})` : element.discoveredBy;

// Physical properties are visible text, not just numbers in the app's visualizations,
// so "gold melting point" style queries and AI lookups find them without running JS.
export function propertyRows(element: Element): [string, string][] {
  const rows: [string, string | null][] = [
    ['Atomic number', String(element.atomicNumber)],
    ['Category', categoryLabels[element.category]],
    ['Atomic mass', `${element.atomicMass} u`],
    ['Electron configuration', element.electronConfiguration],
    ['Melting point', temperature(element.meltingPoint)],
    ['Boiling point', temperature(element.boilingPoint)],
    ['Density', element.density == null ? null : `${element.density} g/cm³`],
    ['Electronegativity (Pauling)', element.electronegativity == null ? null : String(element.electronegativity)],
    ['Appearance', element.appearance],
    ['Discovered by', discovery(element)],
  ];
  return rows.filter((row): row is [string, string] => row[1] != null);
}

// Grouping the 118 links under category headings gives every page the category
// vocabulary ("noble gases", "alkali metals") as real text, not just a colour.
function elementNav() {
  const groups = (Object.keys(categoryLabels) as Element['category'][]).map(category => {
    const label = categoryLabels[category];
    const links = elements.filter(el => el.category === category)
      .map(el => `<a href="/element/${el.symbol}">${e(el.name)} (${el.symbol})</a>`).join(' · ');
    return `<section><h2>${label.endsWith('s') ? `${label}es` : `${label}s`}</h2><p>${links}</p></section>`;
  });
  return `<nav aria-label="Explore the elements by category">${groups.join('')}</nav>`;
}

export function staticContent(element?: Element, cdn?: string) {
  const meta = pageMetadata(element, cdn);
  const figure = element && meta.video ? `<figure><img src="${e(meta.image)}" width="${meta.imageWidth}" height="${meta.imageHeight}" alt="${e(meta.videoDescription ?? meta.imageAlt)}" /><figcaption>Video: ${e(meta.videoDescription ?? '')}</figcaption></figure>` : '';
  const content = element ? `<article>
    <h1>${e(element.name)} (${element.symbol})</h1><p>${e(element.summary)}</p>${figure}
    <h2>Properties of ${e(element.name)}</h2>
    <dl>${propertyRows(element).map(([term, value]) => `<dt>${e(term)}</dt><dd>${e(value)}</dd>`).join('')}</dl>
    <h2>Facts about ${e(element.name)}</h2><ul>${element.funFacts.map(f => `<li>${e(f)}</li>`).join('')}</ul>
    <p><a href="/">Back to the periodic table</a> · <a href="${wikipediaUrl(element)}" rel="noopener">${e(element.name)} on Wikipedia</a></p></article>` :
    '<h1>The Periodic Table</h1><p>Explore the properties, electron configurations, and facts of all 118 elements. Enable JavaScript for interactive atoms, phase diagrams, and the optional voice guide.</p>';
  return `<main class="static-content">${content}${elementNav()}</main>`;
}


export function renderStaticPage(template: string, element?: Element, cdn?: string) {
  const meta = pageMetadata(element, cdn);
  let html = template.replace(/<title>[\s\S]*?<\/title>/, `<title>${e(meta.title)}</title>`)
    .replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${meta.url}" />`)
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/,
      `<script type="application/ld+json">${JSON.stringify(meta.structuredData).replace(/</g, '\\u003c')}</script>`)
    .replace('<div id="root"></div>', `<div id="root">${staticContent(element, cdn)}</div>`);
  for (const [attr, name, content] of [
    ['name', 'description', meta.description], ['property', 'og:title', meta.title],
    ['property', 'og:description', meta.description], ['property', 'og:url', meta.url],
    ['property', 'og:image', meta.image], ['name', 'twitter:title', meta.title],
    ['name', 'twitter:description', meta.description], ['name', 'twitter:image', meta.image],
    ['property', 'og:image:alt', meta.imageAlt],
    ['property', 'og:image:width', String(meta.imageWidth)], ['property', 'og:image:height', String(meta.imageHeight)],
  ]) {
    html = html.replace(new RegExp(`<meta ${attr}="${name}"[^>]*>`), `<meta ${attr}="${name}" content="${e(content)}" />`);
  }
  if (meta.video) html = html.replace('</head>', `<meta property="og:video" content="${e(meta.video)}" />
    <meta property="og:video:secure_url" content="${e(meta.video)}" />
    <meta property="og:video:type" content="video/mp4" />
    <meta property="og:video:width" content="1280" /><meta property="og:video:height" content="720" /></head>`);
  return html;
}

export function staticPages(cdn?: string): Plugin {
  let outDir: string;
  return {
    name: 'static-element-pages', apply: 'build',
    configResolved(config) { outDir = resolve(config.root, config.build.outDir); },
    async closeBundle() {
      const template = await readFile(resolve(outDir, 'index.html'), 'utf8');
      await mkdir(resolve(outDir, 'element'), { recursive: true });
      await writeFile(resolve(outDir, 'index.html'), renderStaticPage(template, undefined, cdn));
      for (const element of elements) {
        const html = renderStaticPage(template, element, cdn);
        await writeFile(resolve(outDir, 'element', `${element.symbol}.html`), html);
        // Retain the previously supported lowercase links; canonical points to the proper symbol.
        const alias = resolve(outDir, 'element', element.symbol.toLowerCase());
        await mkdir(alias, { recursive: true });
        await writeFile(resolve(alias, 'index.html'), html);
      }
      const sitemap = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/', ...elements.map(el => `/element/${el.symbol}`)].map(path => `<url><loc>${SITE_ORIGIN}${path}</loc></url>`).join('')}</urlset>`;
      await writeFile(resolve(outDir, 'sitemap.xml'), sitemap);
      await writeFile(resolve(outDir, '404.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><title>Page not found — Periodic Table</title></head><body><h1>Page not found</h1><a href="/">Explore the periodic table</a></body></html>');
    },
  };
}
