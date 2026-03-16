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
 * Human-readable short descriptions for the current set of videos.
 * These override anything parsed from the generation manifest so the user-
 * facing strings are concise and accurate.
 */
const HARDCODED_DESCRIPTIONS: Record<number, string> = {
  10: 'Neon gas discharge tube erupting with brilliant red-orange light',
  11: 'Sodium metal reacting violently with water, producing bright yellow-orange flames',
  35: 'Bromine liquid releasing dense reddish-brown vapor',
  79: 'Gold being melted and poured as glowing molten liquid',
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

  const files = fs
    .readdirSync(VIDEOS_DIR)
    .filter((f) => f.endsWith('.mp4'))
    .sort();

  const entries: ManifestEntry[] = [];

  for (const filename of files) {
    const atomicNumber = parseAtomicNumber(filename);
    const symbol = parseSymbol(filename);

    if (atomicNumber === null || symbol === null) {
      console.warn(`  Skipping "${filename}" — could not parse atomic number / symbol`);
      continue;
    }

    const description =
      HARDCODED_DESCRIPTIONS[atomicNumber] ??
      generationDescriptions.get(atomicNumber) ??
      `${symbol} element visualization`;

    entries.push({
      atomicNumber,
      symbol,
      filename,
      url: `${publicUrl}/${filename}`,
      description,
    });
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
