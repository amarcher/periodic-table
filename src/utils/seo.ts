import type { Element } from '../types/element';
import { VIDEO_DATA } from '../data/videoData';
import { categoryLabels } from './colors';

export const SITE_ORIGIN = 'https://periodictable.tech';
export const SITE_NAME = 'Periodic Table';
export const SITE_TITLE = 'Interactive Periodic Table: Element Facts, Videos & 3D Atoms';
export const SITE_DESCRIPTION = 'Explore all 118 elements with facts, properties, electron configurations, videos, and 3D atom models, plus an optional AI voice guide. Free, no sign-up.';
export const DEFAULT_VIDEO_CDN = 'https://pub-31265833619c4b07a0d5cae75480e369.r2.dev';

// Poster JPGs come from scripts/r2-upload/thumbnails.ts, which runs ffmpeg with
// `scale=1200:-2` on 16:9 video, so every poster is 1200×676 (675 rounded up to
// an even height). og:image:width/height must describe the image actually sent,
// not the homepage PNG, or social cards are cropped on first share.
export const POSTER_SIZE = { width: 1200, height: 676 } as const;
const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

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

// Every element name is also its English Wikipedia article title, except Mercury,
// whose bare title is a disambiguation page (verified against all 118 on 2026-10-25).
export function wikipediaUrl(element: Element): string {
  const title = element.name === 'Mercury' ? 'Mercury_(element)' : element.name;
  return `https://en.wikipedia.org/wiki/${title}`;
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
  const url = `${SITE_ORIGIN}${element ? `/element/${element.symbol}` : '/'}`;
  const image = video ? `${base}/${video.filename.replace(/\.mp4$/i, '.jpg')}` : `${SITE_ORIGIN}/og-image.png`;
  const imageSize = video ? POSTER_SIZE : OG_IMAGE_SIZE;
  return {
    title: element ? elementTitle(element) : SITE_TITLE,
    description: element ? elementDescription(element, Boolean(video)) : SITE_DESCRIPTION,
    url,
    image,
    imageWidth: imageSize.width,
    imageHeight: imageSize.height,
    imageAlt: element ? `${element.name} — element ${element.atomicNumber}` : 'The periodic table',
    video: video ? `${base}/${video.filename}` : null,
    videoDescription: video?.description ?? null,
    // One <script type="application/ld+json"> per page. Element pages carry two
    // nodes in an @graph: the learning resource itself (with a Wikipedia sameAs
    // so engines and assistants resolve the entity) and a BreadcrumbList.
    structuredData: element ? {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'LearningResource', '@id': url,
          name: `${element.name} (${element.symbol})`, description: element.summary,
          url, image, inLanguage: 'en',
          isAccessibleForFree: true, learningResourceType: 'Interactive element explorer',
          isPartOf: { '@type': 'WebApplication', name: SITE_NAME, url: `${SITE_ORIGIN}/` },
          // Google's video rich results require name, thumbnailUrl and uploadDate; the date is
          // the real CDN publish date recorded in videoData.ts, never a placeholder.
          ...(video ? { video: {
            '@type': 'VideoObject', name: `${element.name}: ${video.description}`,
            description: `A short video showing ${element.name} (${element.symbol}), element ${element.atomicNumber}. ${video.description}.`,
            thumbnailUrl: image, contentUrl: `${base}/${video.filename}`, uploadDate: video.uploadDate,
            width: 1280, height: 720, inLanguage: 'en', isFamilyFriendly: true,
          } } : {}),
          about: {
            '@type': 'Thing', name: element.name, alternateName: element.symbol,
            description: `Chemical element with atomic number ${element.atomicNumber}`,
            sameAs: wikipediaUrl(element),
          },
        },
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: SITE_NAME, item: `${SITE_ORIGIN}/` },
            { '@type': 'ListItem', position: 2, name: `${element.name} (${element.symbol})`, item: url },
          ],
        },
      ],
    } : {
      '@context': 'https://schema.org', '@type': 'WebApplication', name: SITE_NAME,
      url: `${SITE_ORIGIN}/`, description: SITE_DESCRIPTION,
      applicationCategory: 'EducationalApplication', operatingSystem: 'Any',
      isAccessibleForFree: true, inLanguage: 'en', image,
      about: {
        '@type': 'Thing', name: 'Periodic table', sameAs: 'https://en.wikipedia.org/wiki/Periodic_table',
        description: 'A tabular display of the chemical elements organized by atomic number and electron configuration',
      },
    },
  };
}
