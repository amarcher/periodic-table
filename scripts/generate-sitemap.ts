// Writes public/sitemap.xml for the dev server. The production sitemap is written
// by the staticPages plugin at the end of `vite build` from the same list.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { SITE_ORIGIN } from '../src/utils/seo.ts';
import { sitemapPaths } from '../src/utils/sitemap.ts';

const paths = sitemapPaths();
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map(path => `  <url><loc>${SITE_ORIGIN}${path}</loc></url>`).join('\n')}
</urlset>
`;
const outPath = resolve(dirname(fileURLToPath(import.meta.url)), '../public/sitemap.xml');
writeFileSync(outPath, xml);
console.log(`[sitemap] wrote ${paths.length} entries to ${outPath}`);
