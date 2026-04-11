#!/usr/bin/env node
// Generates public/sitemap.xml from src/data/elements.ts.
// Pure Node, no dependencies. Run via `npm run prebuild` or manually.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const ORIGIN = 'https://www.periodictable.tech';

const source = readFileSync(resolve(REPO_ROOT, 'src/data/elements.ts'), 'utf8');

// Match every `symbol: '<sym>',` line. Element symbols are 1-3 characters.
const symbols = [...source.matchAll(/symbol:\s*'([A-Za-z]{1,3})'/g)].map((m) => m[1]);
const unique = [...new Set(symbols)];

if (unique.length !== 118) {
  console.warn(`[sitemap] expected 118 elements, found ${unique.length} — proceeding anyway`);
}

const today = new Date().toISOString().slice(0, 10);
const urls = [
  `  <url>
    <loc>${ORIGIN}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`,
  ...unique.map(
    (s) => `  <url>
    <loc>${ORIGIN}/element/${s}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`
  ),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>
`;

const outPath = resolve(REPO_ROOT, 'public/sitemap.xml');
writeFileSync(outPath, xml);
console.log(`[sitemap] wrote ${unique.length + 1} entries to ${outPath}`);
