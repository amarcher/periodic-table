import type { Element } from '../types/element';
import { pageMetadata } from './seo';

export function updatePageMetadata(element?: Element | null) {
  const meta = pageMetadata(element, import.meta.env.VITE_VIDEO_CDN_URL);
  document.title = meta.title;
  const set = (selector: string, content: string) => {
    document.querySelector(selector)?.setAttribute('content', content);
  };
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', meta.url);
  set('meta[name="description"]', meta.description);
  set('meta[property="og:title"]', meta.title);
  set('meta[property="og:description"]', meta.description);
  set('meta[property="og:url"]', meta.url);
  set('meta[property="og:image"]', meta.image);
  set('meta[property="og:image:alt"]', element ? `${element.name} — element ${element.atomicNumber}` : 'The periodic table');
  set('meta[name="twitter:title"]', meta.title);
  set('meta[name="twitter:description"]', meta.description);
  set('meta[name="twitter:image"]', meta.image);
  document.querySelectorAll('meta[property^="og:video"]').forEach(tag => tag.remove());
  if (meta.video) {
    for (const [property, content] of Object.entries({
      'og:video': meta.video, 'og:video:secure_url': meta.video,
      'og:video:type': 'video/mp4', 'og:video:width': '1280', 'og:video:height': '720',
    })) {
      const tag = document.createElement('meta');
      tag.setAttribute('property', property);
      tag.content = content;
      document.head.append(tag);
    }
  }
  const json = document.querySelector('script[type="application/ld+json"]');
  if (json) json.textContent = JSON.stringify(meta.structuredData);
}
