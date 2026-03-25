/**
 * generate-manifest.ts
 *
 * Generates src/data/videoManifest.ts from the contents of
 * public/element-videos/ (or a provided list of filenames).
 *
 * It reads descriptions from scripts/generate-videos/output/manifest.json
 * when available, falling back to a placeholder.
 *
 * Called by upload.ts --update-manifest, but can also be run directly:
 *   npx tsx scripts/r2-upload/generate-manifest.ts
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseAtomicNumber, parseSymbol } from './upload.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const VIDEOS_DIR = path.join(PROJECT_ROOT, 'public', 'element-videos');
const GENERATION_MANIFEST = path.join(
  PROJECT_ROOT,
  'scripts',
  'generate-videos',
  'output',
  'manifest.json'
);
const OUTPUT_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'videoManifest.ts');

// ---------------------------------------------------------------------------
// Types matching the generation manifest shape
// ---------------------------------------------------------------------------

interface GenerationEntry {
  atomicNumber: number;
  symbol: string;
  name: string;
  status: string;
  prompt?: string;
  description?: string;
}

// ---------------------------------------------------------------------------
// Description lookup
// ---------------------------------------------------------------------------

/**
 * Human-readable short descriptions for all element videos.
 * These are the canonical source for user-facing alt text / captions.
 * When adding new videos, add a description here.
 */
const DESCRIPTIONS: Record<number, string> = {
  1: 'Hydrogen-filled soap bubbles igniting in chain-reaction fireballs',
  2: 'Superfluid liquid helium creeping up and over the walls of a glass beaker',
  3: 'Lithium metal reacting with water, producing a deep crimson-red flame',
  4: 'Beryllium producing an intense white flame in a Bunsen burner',
  5: 'Boron powder igniting into spectacular brilliant green flames',
  6: 'A diamond burning white-hot in liquid oxygen, consumed by combustion',
  7: 'Liquid nitrogen flash-boiling in warm water, producing cascading white fog',
  8: 'Blue liquid oxygen suspended between magnet poles by magnetic force',
  9: 'Steel wool erupting into white-hot sparks when exposed to fluorine gas',
  10: 'Neon gas discharge tube erupting with brilliant red-orange light',
  11: 'Sodium metal reacting violently with water, producing bright yellow-orange flames',
  12: 'Magnesium ribbon burning with a blindingly bright white flame',
  13: 'Molten aluminum being poured as a shimmering silvery liquid glowing orange',
  14: 'A pure silicon crystal being pulled from glowing molten silicon in the Czochralski process',
  15: 'White phosphorus glowing with an eerie green-blue light before self-igniting into fierce white flames',
  16: 'Sulfur crystals melting from golden liquid to blood-red syrup, then igniting with an electric blue flame',
  17: 'Pale yellow-green chlorine gas swirling in a glass flask, reacting with metals',
  18: 'Argon gas discharge tube glowing with a soft lavender-purple light',
  19: 'Potassium metal dropped into water, exploding with a bright violet-pink flame',
  20: 'Calcium metal reacting with water, producing hydrogen bubbles and milky white calcium hydroxide clouds',
  21: 'Silvery-white scandium metal surface gleaming under soft light',
  22: 'Titanium rod pressed against a spinning grinding wheel, throwing bright white sparks',
  23: 'Four flasks of vanadium solutions in different brilliant colors showing its oxidation states',
  24: 'A perfectly polished block of chromium with a flawless mirror finish',
  25: 'Purple potassium permanganate crystals dissolving into water, creating swirling violet clouds',
  26: 'Steel wool burning brilliantly in a jar of pure oxygen, showering orange-white sparks',
  27: 'Molten cobalt-blue glass on a glassblowing rod, glowing with intense deep blue color',
  28: 'A highly polished nickel sphere with a warm silvery-gold luster',
  29: 'Copper wire held in a Bunsen burner flame, producing a vivid green-blue flame',
  30: 'Zinc metal reacting with hydrochloric acid, releasing rapid streams of hydrogen bubbles',
  31: 'Solid gallium melting into a mirror-like liquid puddle from body heat alone',
  32: 'A polished germanium crystal with a dark mirror-like metallic luster',
  33: 'Crystalline arsenic sublimating into yellowish vapor and re-depositing inside a sealed glass tube',
  34: 'Vivid red selenium powder heated through dramatic color changes to metallic gray',
  35: 'Bromine liquid releasing dense reddish-brown vapor',
  36: 'Krypton gas discharge tube glowing with a haunting greenish-white light',
  37: 'Rubidium metal exploding violently in water with reddish-purple flames',
  38: 'Strontium metal burning with an intensely brilliant crimson-red flame',
  39: 'Yttrium metal turnings igniting into a blinding white-hot fire',
  40: 'Zirconium powder igniting into a dazzling white-hot spark fountain',
  41: 'Niobium disc anodizing through a rainbow of colors as voltage is applied',
  42: 'Molybdenum rod glowing white-hot in a vacuum chamber, remaining solid at extreme temperature',
  43: 'Technetium metal tarnishing in time-lapse inside a sealed ampoule with a faint Cherenkov-blue shimmer',
  44: 'Polished ruthenium metal oxidizing from mirror-bright silver to deep matte black at high temperature',
  45: 'Molten rhodium cooling from white-hot liquid to a flawless mirror-finish solid',
  46: 'Palladium foil absorbing and releasing hydrogen gas, visibly swelling and contracting',
  47: 'Molten silver poured in a glowing stream, cooling to a brilliant mirror finish',
  48: 'Cadmium metal melting and releasing thick, vivid yellow vapor',
  49: 'Soft indium metal bending like putty, then melting into a shimmering liquid pool',
  50: 'Polished tin disintegrating into grey powder as tin pest spreads across its surface',
  51: 'Antimony metal shattering like glass under a hammer, revealing crystalline layers',
  52: 'Crystalline tellurium burning with a vivid blue-green flame and billowing white smoke',
  53: 'Iodine crystals sublimating into rich purple-violet vapor that fills a glass flask',
  54: 'Xenon gas discharge tube erupting with an intense blue-lavender plasma glow',
  55: 'Cesium metal exploding violently on contact with water in a brilliant white-hot flash',
  56: 'Barium chloride producing a vivid emerald green flame in a Bunsen burner',
  57: 'Pyrophoric lanthanum filings self-igniting into a shower of white-hot sparks mid-air',
  58: 'Ferrocerium rod struck by steel, erupting in a cascade of brilliant white-hot sparks',
  59: 'Freshly cut praseodymium rapidly developing a vivid green oxide layer in time-lapse',
  60: 'Two powerful neodymium magnets crushing an apple between them with explosive force',
  61: 'Promethium salt crystals glowing with an eerie pale blue-green radioactive luminescence',
  62: 'Samarium-cobalt magnet still powerfully attracting iron filings while heated white-hot',
  63: 'Europium oxide erupting with brilliant red phosphorescence under UV light, then fading to blue-green afterglow',
  64: 'Gadolinium dropping from a magnet as it warms past its Curie temperature, losing all magnetism',
  65: 'Terbium-doped material erupting with intense electric green fluorescence under UV light',
  66: 'A Terfenol-D rod stretching and contracting with magnetic pulses like a heartbeat',
  67: 'Holmium compounds displaying dramatic color shifts: brownish-pink solution, yellow oxide, and champagne-pink crystal',
  68: 'Erbium-doped rose-pink glass with a green laser triggering vivid pink fluorescence',
  69: 'Thulium emitting pure ice-blue luminescence alongside europium red and terbium green for a rare-earth RGB display',
  70: 'Ytterbium disc in a hydraulic press, with a voltmeter showing resistance change under pressure',
  71: 'Polished lutetium with a brilliant mirror-like sheen, tested for hardness with a Vickers diamond indenter',
  72: 'Pyrophoric hafnium powder self-igniting in mid-air, producing brilliant white-hot sparks',
  73: 'A polished tantalum bar sitting completely untouched in fuming hydrochloric acid',
  74: 'A tungsten filament glowing white-hot inside a glass bulb, refusing to melt at extreme temperature',
  75: 'A dense silvery-white rhenium pellet gleaming under dramatic laboratory lighting',
  76: 'A tiny osmium bead outweighing steel ball bearings three times its size on a precision balance',
  77: 'A polished iridium pellet sitting completely untouched in fuming aqua regia',
  78: 'Platinum melted and poured as a blindingly bright white-silver liquid stream',
  79: 'Gold being melted and poured as glowing molten liquid',
  80: 'Liquid mercury pooling in a dish with an iron bolt floating on its mirror-like surface',
  81: 'Freshly cut silvery-white thallium metal tarnishing rapidly under dramatic lighting',
  82: 'Fresh-cut lead revealing bright silvery-blue metal as dark oxide creeps across the surface',
  83: 'Molten bismuth cooling into iridescent rainbow hopper crystals with vivid oxide layers',
  84: 'A speck of polonium-210 emitting an ethereal blue glow from ionizing the surrounding air',
  86: 'Radon gas condensing on cold glass walls, revealing a radioluminescent orange-red glow',
  89: 'A tiny actinium pellet emitting an ethereal pale blue glow from ionizing the surrounding air',
  90: 'Thorium metal turnings igniting into a blazing, brilliant white incandescence',
  92: 'Uranium glass glowing with intense green fluorescence under UV light',
};

function loadGenerationDescriptions(): Map<number, string> {
  const map = new Map<number, string>();
  if (!fs.existsSync(GENERATION_MANIFEST)) return map;

  try {
    const raw = fs.readFileSync(GENERATION_MANIFEST, 'utf-8');
    const entries = JSON.parse(raw) as GenerationEntry[];
    for (const entry of entries) {
      if (entry.description) {
        map.set(entry.atomicNumber, entry.description);
      }
    }
  } catch {
    // Non-fatal: fall back to placeholders
  }
  return map;
}

/**
 * Reads the existing videoManifest.ts to preserve descriptions that were
 * hand-edited or set in a previous run, preventing --update-manifest from
 * clobbering them with generic placeholders.
 */
function loadExistingDescriptions(): Map<number, string> {
  const map = new Map<number, string>();
  if (!fs.existsSync(OUTPUT_FILE)) return map;

  try {
    const raw = fs.readFileSync(OUTPUT_FILE, 'utf-8');
    // Match entries like:  42: { ... description: "some text", ... }
    const entryPattern = /^\s+(\d+):\s*\{[^}]*description:\s*"([^"]+)"/gm;
    // Also handle single-quoted descriptions
    const entryPatternSQ = /^\s+(\d+):\s*\{[^}]*description:\s*'([^']+)'/gm;

    for (const match of raw.matchAll(entryPattern)) {
      const num = parseInt(match[1], 10);
      const desc = match[2];
      if (!Number.isNaN(num) && desc) map.set(num, desc);
    }
    for (const match of raw.matchAll(entryPatternSQ)) {
      const num = parseInt(match[1], 10);
      const desc = match[2];
      if (!Number.isNaN(num) && desc) map.set(num, desc);
    }
  } catch {
    // Non-fatal
  }
  return map;
}

const GENERIC_PLACEHOLDER_RE = /^[A-Z][a-z]?$|element visualization$/;

// ---------------------------------------------------------------------------
// Core generator
// ---------------------------------------------------------------------------

export interface ManifestEntry {
  atomicNumber: number;
  symbol: string;
  filename: string;
  url: string;
  description: string;
}

function collectEntries(publicUrl: string): ManifestEntry[] {
  const generationDescriptions = loadGenerationDescriptions();
  const existingDescriptions = loadExistingDescriptions();

  const files = fs
    .readdirSync(VIDEOS_DIR)
    .filter((f) => f.endsWith('.mp4'))
    .sort();

  const entries: ManifestEntry[] = [];
  const missingDescriptions: string[] = [];

  for (const filename of files) {
    const atomicNumber = parseAtomicNumber(filename);
    const symbol = parseSymbol(filename);

    if (atomicNumber === null || symbol === null) {
      console.warn(`  Skipping "${filename}" — could not parse atomic number / symbol`);
      continue;
    }

    // Priority: DESCRIPTIONS map > existing videoManifest.ts > generation manifest > placeholder
    const existingDesc = existingDescriptions.get(atomicNumber);
    const nonGenericExisting = existingDesc && !GENERIC_PLACEHOLDER_RE.test(existingDesc)
      ? existingDesc
      : undefined;

    const description =
      DESCRIPTIONS[atomicNumber] ??
      nonGenericExisting ??
      generationDescriptions.get(atomicNumber) ??
      `${symbol} element visualization`;

    if (GENERIC_PLACEHOLDER_RE.test(description)) {
      missingDescriptions.push(`  ⚠ ${atomicNumber} (${symbol}) — needs a real description`);
    }

    entries.push({
      atomicNumber,
      symbol,
      filename,
      url: `${publicUrl}/${filename}`,
      description,
    });
  }

  if (missingDescriptions.length > 0) {
    console.warn(`\n⚠ ${missingDescriptions.length} element(s) have placeholder descriptions:`);
    for (const msg of missingDescriptions) console.warn(msg);
    console.warn('  Add descriptions to DESCRIPTIONS in scripts/r2-upload/generate-manifest.ts\n');
  }

  return entries;
}

// ---------------------------------------------------------------------------
// TypeScript file generator
// ---------------------------------------------------------------------------

function renderManifestTs(entries: ManifestEntry[]): string {
  const entriesTs = entries
    .map((e) => {
      const lines = [
        `  ${e.atomicNumber}: {`,
        `    url: \`\${BASE_URL}/${e.filename}\`,`,
        `    poster: '',`,
        `    description: ${JSON.stringify(e.description)},`,
        `  },`,
      ];
      return lines.join('\n');
    })
    .join('\n');

  return `export interface VideoEntry {
  url: string;
  poster: string;
  description: string;
}

// In dev, videos are served from public/element-videos/
// In production, they're served from Cloudflare R2.
// Set VITE_VIDEO_CDN_URL in your .env (or Vercel environment variables) to
// the R2 public URL, e.g. https://pub-abc123.r2.dev
const BASE_URL = import.meta.env.VITE_VIDEO_CDN_URL || '/element-videos';

export const videoManifest: Partial<Record<number, VideoEntry>> = {
${entriesTs}
};

export function getVideoEntry(atomicNumber: number): VideoEntry | undefined {
  return videoManifest[atomicNumber];
}
`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function generateManifest(publicUrl: string): Promise<void> {
  console.log(`\nGenerating ${OUTPUT_FILE}...\n`);

  const trimmedUrl = publicUrl.replace(/\/$/, '');
  const entries = collectEntries(trimmedUrl);

  if (entries.length === 0) {
    console.log(`No .mp4 files found in ${VIDEOS_DIR} — nothing written.`);
    return;
  }

  const ts = renderManifestTs(entries);
  fs.writeFileSync(OUTPUT_FILE, ts, 'utf-8');

  console.log(`Wrote ${entries.length} entries to ${OUTPUT_FILE}`);
  for (const e of entries) {
    console.log(`  [${String(e.atomicNumber).padStart(3)}] ${e.symbol.padEnd(3)} → ${e.url}`);
  }
}

// ---------------------------------------------------------------------------
// Direct CLI entry point
// ---------------------------------------------------------------------------

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  const publicUrl =
    process.env['R2_PUBLIC_URL']?.replace(/\/$/, '') ?? '/element-videos';
  generateManifest(publicUrl).catch((err: unknown) => {
    console.error('Fatal error:', err instanceof Error ? err.message : err);
    process.exit(1);
  });
}
