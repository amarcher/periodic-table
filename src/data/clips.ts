import type { Element } from '../types/element';
import { VIDEO_DATA } from './videoData';

/**
 * A short silent video about one element fact, with its own watch page at
 * /element/<Symbol>/video/<slug>. The fact is shown as a caption over the
 * video and is the page's main text, so keep it one sentence.
 */
export interface Clip {
  slug: string;
  /** Search-shaped page title, ideally under 60 characters. */
  title: string;
  /** The caption. For fact clips this is the element's fun fact verbatim. */
  fact: string;
  /** MP4 on the video CDN. The poster is the same name with .jpg. */
  filename: string;
  /** ISO 8601 publish timestamp from R2. A clip without one is not published. */
  uploadDate?: string;
}

/**
 * Fact clips per element symbol. Prompts live in
 * scripts/generate-videos/clip-prompts.ts keyed "<Symbol>/<slug>", and
 * scripts/generate-videos/clips.ts generates any clip whose file is missing.
 */
export const FACT_CLIPS: Partial<Record<string, Clip[]>> = {
  Au: [
    { slug: 'three-olympic-pools', title: 'All the Gold Ever Mined Fits in Three Swimming Pools',
      fact: 'All the gold ever mined would fit into about three Olympic swimming pools!', filename: '079-Au-three-olympic-pools.mp4', uploadDate: '2026-10-27T18:44:10Z' },
    { slug: 'soft-enough-to-shape', title: 'Gold Is Soft Enough to Shape by Hand',
      fact: 'Gold is so soft you could shape it with your hands!', filename: '079-Au-soft-enough-to-shape.mp4', uploadDate: '2026-10-27T18:44:09Z' },
    { slug: 'never-tarnishes', title: 'Why Gold Never Rusts or Tarnishes',
      fact: 'Gold never rusts or tarnishes — that\'s why ancient gold artifacts still shine!', filename: '079-Au-never-tarnishes.mp4', uploadDate: '2026-10-27T18:44:08Z' },
    { slug: 'gold-in-the-ocean', title: 'There Is Gold Dissolved in the Ocean',
      fact: 'There is enough gold dissolved in the oceans to give every person on Earth 9 pounds of it!', filename: '079-Au-gold-in-the-ocean.mp4', uploadDate: '2026-10-27T18:44:07Z' },
  ],
  H: [
    { slug: 'fuel-of-the-sun', title: 'Hydrogen: The Fuel of the Sun',
      fact: 'Hydrogen is the fuel that powers the Sun and all other stars!', filename: '001-H-fuel-of-the-sun.mp4', uploadDate: '2026-10-27T18:44:01Z' },
    { slug: 'two-thirds-of-water', title: 'Water Is Two Hydrogens and One Oxygen',
      fact: 'Water is made of two hydrogen atoms and one oxygen atom — that\'s why it\'s called H₂O!', filename: '001-H-two-thirds-of-water.mp4', uploadDate: '2026-10-27T18:44:04Z' },
    { slug: 'lightest-element', title: 'Hydrogen Is the Lightest Element',
      fact: 'Hydrogen is the lightest element — it weighs almost nothing!', filename: '001-H-lightest-element.mp4', uploadDate: '2026-10-27T18:44:02Z' },
    { slug: 'rocket-fuel', title: 'Liquid Hydrogen Rocket Fuel',
      fact: 'NASA uses liquid hydrogen as rocket fuel to launch spacecraft into space!', filename: '001-H-rocket-fuel.mp4', uploadDate: '2026-10-27T18:44:03Z' },
  ],
  Hg: [
    { slug: 'liquid-at-room-temperature', title: 'Mercury: The Only Metal Liquid at Room Temperature',
      fact: 'Mercury is the only metal that is liquid at room temperature!', filename: '080-Hg-liquid-at-room-temperature.mp4', uploadDate: '2026-10-27T18:44:11Z' },
    { slug: 'quicksilver', title: 'Why Mercury Is Called Quicksilver',
      fact: 'Mercury was named after the fast Roman messenger god because it flows so quickly!', filename: '080-Hg-quicksilver.mp4', uploadDate: '2026-10-27T18:44:12Z' },
    { slug: 'inside-old-thermometers', title: 'The Mercury Inside Old Thermometers',
      fact: 'Old thermometers used mercury — the silver liquid inside!', filename: '080-Hg-inside-old-thermometers.mp4', uploadDate: '2026-10-27T18:44:11Z' },
    { slug: 'water-silver', title: 'Hydrargyrum: Mercury\'s Water-Silver Name',
      fact: 'Mercury\'s symbol Hg comes from "hydrargyrum," meaning "water silver" in Greek!', filename: '080-Hg-water-silver.mp4', uploadDate: '2026-10-27T18:44:13Z' },
  ],
  Na: [
    { slug: 'table-salt', title: 'Table Salt Is Sodium Chloride',
      fact: 'Table salt is made of sodium and chlorine — NaCl!', filename: '011-Na-table-salt.mp4', uploadDate: '2026-10-27T18:44:06Z' },
    { slug: 'streetlight-glow', title: 'The Yellow-Orange Glow of Sodium Streetlights',
      fact: 'Sodium streetlights give off that familiar yellow-orange glow!', filename: '011-Na-streetlight-glow.mp4', uploadDate: '2026-10-27T18:44:05Z' },
    { slug: 'nerve-signals', title: 'Sodium Powers Your Nerve Signals',
      fact: 'Your body needs sodium to send nerve signals and flex muscles!', filename: '011-Na-nerve-signals.mp4', uploadDate: '2026-10-27T18:44:05Z' },
  ],
};

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-').slice(0, 5).join('-');

/** The element's main video as the first clip of its channel. */
export function heroClip(element: Element): Clip | undefined {
  const video = VIDEO_DATA[element.atomicNumber];
  if (!video) return undefined;
  return { slug: slugify(video.description), title: video.description, fact: video.description,
    filename: video.filename, uploadDate: video.uploadDate };
}

/** Published clips for an element, hero first. Unpublished fact clips (no uploadDate) are left out. */
export function getClips(element: Element): Clip[] {
  const hero = heroClip(element);
  const facts = (FACT_CLIPS[element.symbol] ?? []).filter(clip => clip.uploadDate);
  return hero ? [hero, ...facts] : facts;
}

export function getClip(element: Element, slug: string): Clip | undefined {
  return getClips(element).find(clip => clip.slug === slug);
}
