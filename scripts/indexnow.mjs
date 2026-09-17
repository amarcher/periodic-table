// Tells Bing, Yandex, Seznam, Naver, and other IndexNow engines which URLs changed so they recrawl
// within days instead of weeks. Google does not participate; use Search Console for Google.
// Run after a production deploy: `npm run indexnow` (every sitemap URL) or `npm run indexnow -- /element/Au /`.
import { readdirSync, readFileSync } from 'node:fs';

const ORIGIN = 'https://periodictable.tech';
const keyFile = readdirSync(new URL('../public/', import.meta.url)).find(f => /^[0-9a-f]{32}\.txt$/.test(f));
if (!keyFile) throw new Error('No IndexNow key file (32 hex chars + .txt) in public/');
const key = readFileSync(new URL(`../public/${keyFile}`, import.meta.url), 'utf8').trim();

const live = await fetch(`${ORIGIN}/${keyFile}`);
if (!live.ok || (await live.text()).trim() !== key) {
  throw new Error(`${ORIGIN}/${keyFile} does not serve the key yet. Deploy first.`);
}

const paths = process.argv.slice(2);
const urlList = paths.length
  ? paths.map(p => new URL(p, ORIGIN).href)
  : [...(await (await fetch(`${ORIGIN}/sitemap.xml`)).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: new URL(ORIGIN).host, key, keyLocation: `${ORIGIN}/${keyFile}`, urlList }),
});
// 200 = accepted, 202 = accepted pending key validation; 403/422 mean the key file or URLs don't match the host.
console.log(`IndexNow: ${res.status} ${res.statusText} for ${urlList.length} URLs`, await res.text());
if (res.status >= 300) process.exit(1);
