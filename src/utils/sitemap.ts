import { elements } from '../data/elements';
import { getClips } from '../data/clips';
import { clipPath, elementPath } from './seo';

/** Every indexable path: homepage, 118 element pages, and each published clip's watch page. */
export function sitemapPaths(): string[] {
  return ['/', ...elements.flatMap(element => [
    elementPath(element),
    ...getClips(element).map(clip => clipPath(element, clip)),
  ])];
}
