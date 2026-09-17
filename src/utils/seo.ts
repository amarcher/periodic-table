import type { Element } from '../types/element';
import { VIDEO_DATA } from '../data/videoData';
import { categoryLabels } from './colors';

export const SITE_ORIGIN = 'https://periodictable.tech';
export const SITE_TITLE = 'Interactive Periodic Table: Element Facts, Videos & 3D Atoms';
export const SITE_DESCRIPTION = 'Explore all 118 elements with facts, properties, electron configurations, videos, and 3D atom models, plus an optional AI voice guide. Free, no sign-up.';
export const DEFAULT_VIDEO_CDN = 'https://pub-31265833619c4b07a0d5cae75480e369.r2.dev';

export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Search result snippets are cut off around 160 characters, so optional clauses are only added while they fit.
const DESCRIPTION_LIMIT = 160;

export function elementTitle(element: Element): string {
  return `${element.name} (${element.symbol}): Facts & Properties of Element ${element.atomicNumber}`;
}

export function elementDescription(element: Element, hasVideo: boolean): string {
  const category = categoryLabels[element.category].toLowerCase();
  const clauses = [
    ` Atomic number ${element.atomicNumber}, ${/^[aeiou]/.test(category) ? 'an' : 'a'} ${category}.`,
    hasVideo ? ' See it in a video and a 3D atom model.' : ' Explore its 3D atom model.',
  ];
  return clauses.reduce((text, clause) =>
    text.length + clause.length <= DESCRIPTION_LIMIT ? text + clause : text, element.summary);
}

export function pageMetadata(element?: Element | null, cdn = DEFAULT_VIDEO_CDN) {
  const video = element ? VIDEO_DATA[element.atomicNumber] : undefined;
  // Relative development media paths are never used in public metadata.
  // Trim first: the configured CDN value has carried a trailing newline, and
  // stripping only a trailing slash left it in, so every og:image and og:video
  // URL was emitted broken across two lines and rejected by crawlers.
  const configured = cdn.trim();
  const base = /^https:\/\//.test(configured)
    ? configured.replace(/\/+$/, '')
    : DEFAULT_VIDEO_CDN;
  return {
    title: element ? elementTitle(element) : SITE_TITLE,
    description: element ? elementDescription(element, Boolean(video)) : SITE_DESCRIPTION,
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
