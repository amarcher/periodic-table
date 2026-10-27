import type { Element } from '../types/element';
import type { Clip } from '../data/clips';
import { clipPageMetadata, pageMetadata, type PageMetadata } from './seo';

/** Writes page metadata into the live <head> on client-side route changes. */
export function applyPageMetadata(meta: PageMetadata) {
  document.title = meta.title;
  const set = (selector: string, content: string) => {
    document.querySelector(selector)?.setAttribute('content', content);
  };
  document.querySelector('link[rel="canonical"]')?.setAttribute('href', meta.url);
  set('meta[name="description"]', meta.description);
  set('meta[property="og:type"]', meta.ogType);
  set('meta[property="og:title"]', meta.title);
  set('meta[property="og:description"]', meta.description);
  set('meta[property="og:url"]', meta.url);
  set('meta[property="og:image"]', meta.image);
  set('meta[property="og:image:width"]', String(meta.imageWidth));
  set('meta[property="og:image:height"]', String(meta.imageHeight));
  set('meta[property="og:image:alt"]', meta.imageAlt);
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

export function updatePageMetadata(element?: Element | null) {
  applyPageMetadata(pageMetadata(element, import.meta.env.VITE_VIDEO_CDN_URL));
}

export function updateClipMetadata(element: Element, clip: Clip) {
  applyPageMetadata(clipPageMetadata(element, clip, import.meta.env.VITE_VIDEO_CDN_URL));
}
