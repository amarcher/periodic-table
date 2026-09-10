import type { Element } from '../types/element';
import { VIDEO_DATA } from '../data/videoData';

export const SITE_ORIGIN = 'https://periodictable.tech';
export const SITE_TITLE = 'Periodic Table — Interactive Element Explorer for Kids';
export const SITE_DESCRIPTION = 'Explore all 118 elements with an AI voice guide. Discover properties, categories, and fun facts in an interactive periodic table built for curious kids.';
export const DEFAULT_VIDEO_CDN = 'https://pub-31265833619c4b07a0d5cae75480e369.r2.dev';

export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function pageMetadata(element?: Element | null, cdn = DEFAULT_VIDEO_CDN) {
  const video = element ? VIDEO_DATA[element.atomicNumber] : undefined;
  // Relative development media paths are never used in public metadata.
  const base = /^https:\/\//.test(cdn) ? cdn.replace(/\/$/, '') : DEFAULT_VIDEO_CDN;
  return {
    title: element ? `${element.name} (${element.symbol}) — Periodic Table` : SITE_TITLE,
    description: element ? element.summary : SITE_DESCRIPTION,
    url: `${SITE_ORIGIN}${element ? `/element/${element.symbol}` : '/'}`,
    image: video ? `${base}/${video.filename.replace(/\.mp4$/i, '.jpg')}` : `${SITE_ORIGIN}/og-image.png`,
    video: video ? `${base}/${video.filename}` : null,
    structuredData: element ? {
      '@context': 'https://schema.org', '@type': 'LearningResource',
      name: `${element.name} (${element.symbol})`, description: element.summary,
      url: `${SITE_ORIGIN}/element/${element.symbol}`, inLanguage: 'en',
      isAccessibleForFree: true, learningResourceType: 'Interactive element explorer',
      about: { '@type': 'Thing', name: element.name },
    } : {
      '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Periodic Table',
      url: `${SITE_ORIGIN}/`, description: SITE_DESCRIPTION,
      applicationCategory: 'EducationalApplication', operatingSystem: 'Any',
      isAccessibleForFree: true, inLanguage: 'en',
    },
  };
}
