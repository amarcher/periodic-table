import type { Element } from '../types/element';
import { VIDEO_DATA } from './videoData';

export type ClipAspect = '16:9' | '9:16';

/**
 * A short silent video about one element, captioned by the fact it shows.
 * Landscape (16:9) clips play in the carousel on the element page beside the
 * hero video. Portrait (9:16) "shorts" are the reel at
 * /element/<Symbol>/video/<slug>, one full-viewport slide per clip.
 * Every published clip has a watch page; the reel letterboxes landscape ones.
 */
export interface Clip {
  slug: string;
  /** Search-shaped page title, ideally under 60 characters. */
  title: string;
  /** The caption: one or two sentences, shown over the video and as the page's main text. */
  fact: string;
  /** MP4 on the video CDN. The poster is the same name with .jpg. */
  filename: string;
  aspect: ClipAspect;
  /** ISO 8601 publish timestamp from R2. A clip without one is not published. */
  uploadDate?: string;
}

const CLIP_SECONDS = 8;
export const CLIP_DURATION = `PT${CLIP_SECONDS}S`;
export const clipSize = (aspect: ClipAspect) => aspect === '9:16' ? { width: 720, height: 1280 } : { width: 1280, height: 720 };

/**
 * Authored clips per element symbol. Prompts live in
 * scripts/generate-videos/clip-prompts.ts keyed "<Symbol>/<slug>", and
 * scripts/generate-videos/clips.ts generates any clip whose file is missing.
 * Shorts take their captions from scripts/generate-videos/research/<n>-<Sym>.md
 * ("Kid-Friendly Factoids" and the alternative concepts), which are richer
 * than the fun facts on the element card.
 */
export const FACT_CLIPS: Partial<Record<string, Clip[]>> = {
  Au: [
    { slug: 'made-of-stardust', aspect: '9:16', title: 'Every Gold Ring Is Made of Stardust',
      fact: 'Every atom of gold on Earth was created in the explosion of dying stars or the violent collision of neutron stars billions of years ago — so every gold ring is literally made of stardust.',
      filename: '079-Au-short-made-of-stardust.mp4', uploadDate: '2026-10-27T19:35:55Z' },
    { slug: 'thinner-than-light', aspect: '9:16', title: 'An Ounce of Gold Can Cover a Football Field',
      fact: 'Gold is so malleable that a single ounce — about the weight of a slice of bread — can be hammered into a sheet larger than a football field, thin enough to see light through it!',
      filename: '079-Au-short-thinner-than-light.mp4', uploadDate: '2026-10-27T19:35:57Z' },
    { slug: 'egyptian-gold', aspect: '9:16', title: 'Why 3,000-Year-Old Egyptian Gold Still Shines',
      fact: 'Gold never rusts or tarnishes, which is why ancient Egyptian gold artifacts look exactly as shiny today as they did over 3,000 years ago when they were first made.',
      filename: '079-Au-short-egyptian-gold.mp4', uploadDate: '2026-10-27T19:35:54Z' },
    { slug: 'ocean-of-gold', aspect: '9:16', title: 'There Is Gold Dissolved in the Ocean',
      fact: 'There is enough gold dissolved in the oceans to give every person on Earth 9 pounds of it!',
      filename: '079-Au-short-ocean-of-gold.mp4', uploadDate: '2026-10-27T19:35:56Z' },
    { slug: 'three-olympic-pools', aspect: '16:9', title: 'All the Gold Ever Mined Fits in Three Swimming Pools',
      fact: 'All the gold ever mined would fit into about three Olympic swimming pools!', filename: '079-Au-three-olympic-pools.mp4', uploadDate: '2026-10-27T18:44:10Z' },
    { slug: 'soft-enough-to-shape', aspect: '16:9', title: 'Gold Is Soft Enough to Shape by Hand',
      fact: 'Gold is so soft you could shape it with your hands!', filename: '079-Au-soft-enough-to-shape.mp4', uploadDate: '2026-10-27T18:44:09Z' },
    { slug: 'never-tarnishes', aspect: '16:9', title: 'Why Gold Never Rusts or Tarnishes',
      fact: 'Gold never rusts or tarnishes — that\'s why ancient gold artifacts still shine!', filename: '079-Au-never-tarnishes.mp4', uploadDate: '2026-10-27T18:44:08Z' },
    { slug: 'gold-in-the-ocean', aspect: '16:9', title: 'There Is Gold Dissolved in the Ocean',
      fact: 'There is enough gold dissolved in the oceans to give every person on Earth 9 pounds of it!', filename: '079-Au-gold-in-the-ocean.mp4', uploadDate: '2026-10-27T18:44:07Z' },
  ],
  H: [
    { slug: 'fuel-of-the-stars', aspect: '9:16', title: 'Stars Are Made Mostly of Hydrogen',
      fact: 'Hydrogen is the most abundant element in the entire universe — stars like our Sun are mostly hydrogen.',
      filename: '001-H-short-fuel-of-the-stars.mp4', uploadDate: '2026-10-27T19:35:46Z' },
    { slug: 'water-maker', aspect: '9:16', title: 'Hydrogen Means "Water Maker"',
      fact: 'The word "hydrogen" means "water maker" because when it burns, it literally creates water.',
      filename: '001-H-short-water-maker.mp4', uploadDate: '2026-10-27T19:35:50Z' },
    { slug: 'invisible-flame', aspect: '9:16', title: 'The Invisible Hydrogen Flame',
      fact: 'A pure hydrogen flame is almost completely invisible to the naked eye — firefighters sometimes have to use brooms to detect hydrogen fires by seeing if the bristles catch fire.',
      filename: '001-H-short-invisible-flame.mp4', uploadDate: '2026-10-27T19:35:47Z' },
    { slug: 'rocket-fuel-short', aspect: '9:16', title: 'Liquid Hydrogen Rocket Fuel',
      fact: 'NASA uses liquid hydrogen as rocket fuel to launch spacecraft into space!',
      filename: '001-H-short-rocket-fuel.mp4', uploadDate: '2026-10-27T19:35:48Z' },
    { slug: 'fuel-of-the-sun', aspect: '16:9', title: 'Hydrogen: The Fuel of the Sun',
      fact: 'Hydrogen is the fuel that powers the Sun and all other stars!', filename: '001-H-fuel-of-the-sun.mp4', uploadDate: '2026-10-27T18:44:01Z' },
    { slug: 'two-thirds-of-water', aspect: '16:9', title: 'Water Is Two Hydrogens and One Oxygen',
      fact: 'Water is made of two hydrogen atoms and one oxygen atom — that\'s why it\'s called H₂O!', filename: '001-H-two-thirds-of-water.mp4', uploadDate: '2026-10-27T18:44:04Z' },
    { slug: 'lightest-element', aspect: '16:9', title: 'Hydrogen Is the Lightest Element',
      fact: 'Hydrogen is the lightest element — it weighs almost nothing!', filename: '001-H-lightest-element.mp4', uploadDate: '2026-10-27T18:44:02Z' },
    { slug: 'rocket-fuel', aspect: '16:9', title: 'Liquid Hydrogen Rocket Fuel',
      fact: 'NASA uses liquid hydrogen as rocket fuel to launch spacecraft into space!', filename: '001-H-rocket-fuel.mp4', uploadDate: '2026-10-27T18:44:03Z' },
  ],
  Hg: [
    { slug: 'cannonball-floats', aspect: '9:16', title: 'A Cannonball Floats on Mercury',
      fact: 'Mercury is so incredibly dense that if you dropped an iron cannonball into a pool of it, the cannonball would float on top.',
      filename: '080-Hg-short-cannonball-floats.mp4', uploadDate: '2026-10-27T19:35:59Z' },
    { slug: 'quicksilver-alive', aspect: '9:16', title: 'Why Mercury Is Called Quicksilver',
      fact: 'Its nickname "quicksilver" comes from how it moves — tiny droplets race around like they are alive, breaking apart and snapping back together.',
      filename: '080-Hg-short-quicksilver-alive.mp4', uploadDate: '2026-10-27T19:36:01Z' },
    { slug: 'liquid-metal-mirror', aspect: '9:16', title: 'The Only Metal That Flows at Room Temperature',
      fact: 'Mercury is the only metal that is a liquid at room temperature — it flows like water but is shiny like a mirror.',
      filename: '080-Hg-short-liquid-metal-mirror.mp4', uploadDate: '2026-10-27T19:36:00Z' },
    { slug: 'liquid-at-room-temperature', aspect: '16:9', title: 'Mercury: The Only Metal Liquid at Room Temperature',
      fact: 'Mercury is the only metal that is liquid at room temperature!', filename: '080-Hg-liquid-at-room-temperature.mp4', uploadDate: '2026-10-27T18:44:11Z' },
    { slug: 'quicksilver', aspect: '16:9', title: 'Why Mercury Is Called Quicksilver',
      fact: 'Mercury was named after the fast Roman messenger god because it flows so quickly!', filename: '080-Hg-quicksilver.mp4', uploadDate: '2026-10-27T18:44:12Z' },
    { slug: 'inside-old-thermometers', aspect: '16:9', title: 'The Mercury Inside Old Thermometers',
      fact: 'Old thermometers used mercury — the silver liquid inside!', filename: '080-Hg-inside-old-thermometers.mp4', uploadDate: '2026-10-27T18:44:11Z' },
    { slug: 'water-silver', aspect: '16:9', title: 'Hydrargyrum: Mercury\'s Water-Silver Name',
      fact: 'Mercury\'s symbol Hg comes from "hydrargyrum," meaning "water silver" in Greek!', filename: '080-Hg-water-silver.mp4', uploadDate: '2026-10-27T18:44:13Z' },
  ],
  Na: [
    { slug: 'soft-then-explosive', aspect: '9:16', title: 'Sodium: Soft as Cheese, Explosive in Water',
      fact: 'Sodium is so soft you can slice it with a butter knife like cold cheese — but don\'t let that fool you, because the moment it touches water, it explodes into flames!',
      filename: '011-Na-short-soft-then-explosive.mp4', uploadDate: '2026-10-27T19:35:52Z' },
    { slug: 'ocean-of-salt', aspect: '9:16', title: 'All the Salt in the Ocean, 500 Feet Deep',
      fact: 'If you could extract all the salt (sodium chloride) dissolved in Earth\'s oceans, it would cover every continent in a layer nearly 500 feet deep — that\'s a 50-story building made of salt.',
      filename: '011-Na-short-ocean-of-salt.mp4', uploadDate: '2026-10-27T19:35:51Z' },
    { slug: 'streetlight-glow-short', aspect: '9:16', title: 'The Yellow Glow of Sodium Streetlights',
      fact: 'Sodium burns with a brilliant yellow-orange flame, and that\'s the exact same color you see in old-fashioned orange street lights — they\'re literally powered by glowing sodium vapor.',
      filename: '011-Na-short-streetlight-glow.mp4', uploadDate: '2026-10-27T19:35:53Z' },
    { slug: 'table-salt', aspect: '16:9', title: 'Table Salt Is Sodium Chloride',
      fact: 'Table salt is made of sodium and chlorine — NaCl!', filename: '011-Na-table-salt.mp4', uploadDate: '2026-10-27T18:44:06Z' },
    { slug: 'streetlight-glow', aspect: '16:9', title: 'The Yellow-Orange Glow of Sodium Streetlights',
      fact: 'Sodium streetlights give off that familiar yellow-orange glow!', filename: '011-Na-streetlight-glow.mp4', uploadDate: '2026-10-27T18:44:05Z' },
    { slug: 'nerve-signals', aspect: '16:9', title: 'Sodium Powers Your Nerve Signals',
      fact: 'Your body needs sodium to send nerve signals and flex muscles!', filename: '011-Na-nerve-signals.mp4', uploadDate: '2026-10-27T18:44:05Z' },
  ],
};

const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').split('-').slice(0, 5).join('-');

/** The element's main video as a landscape clip. */
export function heroClip(element: Element): Clip | undefined {
  const video = VIDEO_DATA[element.atomicNumber];
  if (!video) return undefined;
  return { slug: slugify(video.description), title: video.description, fact: video.description,
    filename: video.filename, aspect: '16:9', uploadDate: video.uploadDate };
}

const published = (element: Element) => (FACT_CLIPS[element.symbol] ?? []).filter(clip => clip.uploadDate);

/** Portrait shorts for the reel, in authored order. */
export function getShorts(element: Element): Clip[] {
  return published(element).filter(clip => clip.aspect === '9:16');
}

/** Landscape clips for the element page carousel: the hero first, then authored ones. */
export function getLandscapeClips(element: Element): Clip[] {
  const hero = heroClip(element);
  const facts = published(element).filter(clip => clip.aspect === '16:9');
  return hero ? [hero, ...facts] : facts;
}

/** Every published clip, in reel order: shorts first, then the landscape clips. */
export function getClips(element: Element): Clip[] {
  return [...getShorts(element), ...getLandscapeClips(element)];
}

export function getClip(element: Element, slug: string): Clip | undefined {
  return getClips(element).find(clip => clip.slug === slug);
}
