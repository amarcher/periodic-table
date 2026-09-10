import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { elements } from '../src/data/elements';
import { pageMetadata } from '../src/utils/seo';
import { renderStaticPage } from './static-pages';

const template = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
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
      const json = /<script type="application\/ld\+json">([\s\S]*?)<\/script>/.exec(html)![1];
      expect(JSON.parse(json).url).toBe(metadata.url);
    }
    expect(titles.size).toBe(118);
  });
  it('preserves authored video sharing and has a complete homepage without JavaScript', () => {
    const gold = elements.find(e => e.symbol === 'Au')!;
    expect(renderStaticPage(template, gold, 'https://cdn.example.test')).toContain('https://cdn.example.test/079-Au-veo31fast.mp4');
    const home = renderStaticPage(template);
    expect(home.match(/href="\/element\//g)).toHaveLength(118);
    expect(home).not.toContain('<div id="root"></div>');
  });
});
