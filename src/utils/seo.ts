import type { Element } from '../types/element';
import { CLIP_DURATION, clipSize, type Clip } from '../data/clips';
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
// Portrait shorts are 720×1280; the same scale gives a 1200×2134 poster.
export const PORTRAIT_POSTER_SIZE = { width: 1200, height: 2134 } as const;
const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const;

export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// Search result snippets are cut off around 160 characters, so optional clauses are only added while they fit.
const DESCRIPTION_LIMIT = 160;
const fitClauses = (lead: string, clauses: string[]) =>
  clauses.reduce((text, clause) => text.length + clause.length <= DESCRIPTION_LIMIT ? text + clause : text, lead);

export function elementTitle(element: Element): string {
  return `${element.name} (${element.symbol}): Facts & Properties of Element ${element.atomicNumber}`;
}

export function elementDescription(element: Element, hasVideo: boolean): string {
  const category = categoryLabels[element.category].toLowerCase();
  return fitClauses(element.summary, [
    ` Atomic number ${element.atomicNumber}, ${/^[aeiou]/.test(category) ? 'an' : 'a'} ${category}.`,
    hasVideo ? ' See it in a video and a 3D atom model.' : ' Explore its 3D atom model.',
  ]);
}

export function clipTitle(element: Element, clip: Clip): string {
  return `${clip.title} | ${element.name} Video`;
}

// Research captions can run past a snippet. Keep the first sentence or clause, and if that is
// still too long cut at a word boundary with an ellipsis, before appending the optional clauses.
function snippetLead(fact: string): string {
  if (fact.length <= DESCRIPTION_LIMIT) return fact;
  const sentence = fact.split(/(?<=[.!?])\s/)[0];
  if (sentence.length <= DESCRIPTION_LIMIT) return sentence;
  return `${sentence.slice(0, DESCRIPTION_LIMIT - 1).replace(/[\s,;:—-]+\S*$/, '')}…`;
}

export function clipDescription(element: Element, clip: Clip): string {
  return fitClauses(snippetLead(clip.fact), [
    ` A short silent video about ${element.name}, element ${element.atomicNumber}.`,
    ` More ${element.name} facts, properties and a 3D atom on Periodic Table.`,
  ]);
}

// Every element name is also its English Wikipedia article title, except Mercury,
// whose bare title is a disambiguation page (verified against all 118 on 2026-10-25).
export function wikipediaUrl(element: Element): string {
  const title = element.name === 'Mercury' ? 'Mercury_(element)' : element.name;
  return `https://en.wikipedia.org/wiki/${title}`;
}

export function elementPath(element: Element): string {
  return `/element/${element.symbol}`;
}

export function clipPath(element: Element, clip: Clip): string {
  return `${elementPath(element)}/video/${clip.slug}`;
}

// Relative development media paths are never used in public metadata.
// Trim first: the configured CDN value has carried a trailing newline, and
// stripping only a trailing slash left it in, so every og:image and og:video
// URL was emitted broken across two lines and rejected by crawlers.
export function mediaBase(cdn = DEFAULT_VIDEO_CDN): string {
  const configured = cdn.trim();
  return /^https:\/\//.test(configured) ? configured.replace(/\/+$/, '') : DEFAULT_VIDEO_CDN;
}

export const posterFilename = (filename: string) => filename.replace(/\.mp4$/i, '.jpg');

const siteNode = { '@type': 'WebSite', name: SITE_NAME, url: `${SITE_ORIGIN}/` };
const elementThing = (element: Element) => ({
  '@type': 'Thing', name: element.name, alternateName: element.symbol,
  description: `Chemical element with atomic number ${element.atomicNumber}`,
  sameAs: wikipediaUrl(element),
});
const breadcrumbs = (items: Array<[string, string]>) => ({
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, item], i) => ({ '@type': 'ListItem', position: i + 1, name, item })),
});

export interface PageMetadata {
  title: string;
  description: string;
  url: string;
  ogType: 'website' | 'video.other';
  image: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
  video: string | null;
  videoWidth: number;
  videoHeight: number;
  videoDescription: string | null;
  structuredData: Record<string, unknown>;
}

export function pageMetadata(element?: Element | null, cdn = DEFAULT_VIDEO_CDN): PageMetadata {
  const video = element ? VIDEO_DATA[element.atomicNumber] : undefined;
  const base = mediaBase(cdn);
  const url = `${SITE_ORIGIN}${element ? elementPath(element) : '/'}`;
  const image = video ? `${base}/${posterFilename(video.filename)}` : `${SITE_ORIGIN}/og-image.png`;
  const imageSize = video ? POSTER_SIZE : OG_IMAGE_SIZE;
  return {
    title: element ? elementTitle(element) : SITE_TITLE,
    description: element ? elementDescription(element, Boolean(video)) : SITE_DESCRIPTION,
    url,
    ogType: 'website',
    image,
    imageWidth: imageSize.width,
    imageHeight: imageSize.height,
    imageAlt: element ? `${element.name} — element ${element.atomicNumber}` : 'The periodic table',
    video: video ? `${base}/${video.filename}` : null,
    videoWidth: 1280,
    videoHeight: 720,
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
          // WebSite, not WebApplication: Google validates a nested WebApplication as a Software App
          // rich result and fails it for lacking offers/category, which this reference is not.
          isPartOf: siteNode,
          // Google's video rich results require name, thumbnailUrl and uploadDate; the date is
          // the real CDN publish date recorded in videoData.ts, never a placeholder.
          ...(video ? { video: {
            '@type': 'VideoObject', name: `${element.name}: ${video.description}`,
            description: `A short video showing ${element.name} (${element.symbol}), element ${element.atomicNumber}. ${video.description}.`,
            thumbnailUrl: image, contentUrl: `${base}/${video.filename}`, uploadDate: video.uploadDate,
            width: 1280, height: 720, inLanguage: 'en', isFamilyFriendly: true,
          } } : {}),
          about: elementThing(element),
        },
        breadcrumbs([[SITE_NAME, `${SITE_ORIGIN}/`], [`${element.name} (${element.symbol})`, url]]),
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

/**
 * A clip's watch page. The video is the page's main content, which is what
 * Google requires before it will index a video ("watch page"); the element
 * page itself is classified as a page about the element, not the video.
 */
export function clipPageMetadata(element: Element, clip: Clip, cdn = DEFAULT_VIDEO_CDN): PageMetadata {
  const base = mediaBase(cdn);
  const url = `${SITE_ORIGIN}${clipPath(element, clip)}`;
  const image = `${base}/${posterFilename(clip.filename)}`;
  const video = `${base}/${clip.filename}`;
  const size = clipSize(clip.aspect);
  const poster = clip.aspect === '9:16' ? PORTRAIT_POSTER_SIZE : POSTER_SIZE;
  return {
    title: clipTitle(element, clip),
    description: clipDescription(element, clip),
    url,
    ogType: 'video.other',
    image,
    imageWidth: poster.width,
    imageHeight: poster.height,
    imageAlt: clip.fact,
    video,
    videoWidth: size.width,
    videoHeight: size.height,
    videoDescription: clip.fact,
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'VideoObject', '@id': url, mainEntityOfPage: url,
          name: clip.title, description: clip.fact,
          thumbnailUrl: image, contentUrl: video, uploadDate: clip.uploadDate,
          duration: CLIP_DURATION, width: size.width, height: size.height,
          inLanguage: 'en', isFamilyFriendly: true, isAccessibleForFree: true,
          isPartOf: siteNode, about: elementThing(element),
        },
        breadcrumbs([
          [SITE_NAME, `${SITE_ORIGIN}/`],
          [`${element.name} (${element.symbol})`, `${SITE_ORIGIN}${elementPath(element)}`],
          [clip.title, url],
        ]),
      ],
    },
  };
}
