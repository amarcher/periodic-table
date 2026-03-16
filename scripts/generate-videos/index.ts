import path from 'node:path';
import fs from 'node:fs';
import { buildAllPrompts, buildPrompt } from './prompt-builder.ts';
import { createClient } from './api-client.ts';
import { QueueManager } from './queue-manager.ts';
import { CostTracker } from './cost-tracker.ts';
import { loadManifest, saveManifest, generateReviewHtml } from './review-manifest.ts';
import type { ManifestEntry } from './review-manifest.ts';
import { OUTPUT_PATHS, DEFAULT_CONCURRENCY, SUPPORTED_TOOLS } from './config.ts';
import type { ToolName } from './config.ts';
import { elements } from '../../src/data/elements.ts';

// ── CLI argument parsing ──────────────────────────────────────────────────────

interface CliArgs {
  tool: ToolName;
  concurrency: number;
  elementFilter: number[] | null; // null = all
  retryFailed: boolean;
  review: boolean;
  dryRun: boolean;
  compare: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const args = argv.slice(2); // strip 'node' and script path
  const result: CliArgs = {
    tool: 'veo2',
    concurrency: DEFAULT_CONCURRENCY,
    elementFilter: null,
    retryFailed: false,
    review: false,
    dryRun: false,
    compare: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case '--tool': {
        const value = args[++i];
        if (!value || !SUPPORTED_TOOLS.includes(value as ToolName)) {
          console.error(`Invalid --tool value: ${value}. Supported: ${SUPPORTED_TOOLS.join(', ')}`);
          process.exit(1);
        }
        result.tool = value as ToolName;
        break;
      }
      case '--concurrency': {
        const value = parseInt(args[++i] ?? '', 10);
        if (isNaN(value) || value < 1) {
          console.error('--concurrency must be a positive integer');
          process.exit(1);
        }
        result.concurrency = value;
        break;
      }
      case '--elements': {
        const value = args[++i] ?? '';
        result.elementFilter = parseElementRange(value);
        break;
      }
      case '--retry-failed':
        result.retryFailed = true;
        break;
      case '--review':
        result.review = true;
        break;
      case '--dry-run':
        result.dryRun = true;
        break;
      case '--compare':
        result.compare = true;
        break;
      default:
        console.warn(`Unknown argument: ${arg}`);
    }
  }

  return result;
}

/**
 * Parses "1-10" or "11,26,79" into an array of atomic numbers.
 */
function parseElementRange(value: string): number[] {
  if (value.includes('-')) {
    const [start, end] = value.split('-').map((s) => parseInt(s.trim(), 10));
    if (start == null || end == null || isNaN(start) || isNaN(end)) {
      console.error(`Invalid range: ${value}`);
      process.exit(1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }
  return value.split(',').map((s) => {
    const n = parseInt(s.trim(), 10);
    if (isNaN(n)) {
      console.error(`Invalid atomic number: ${s}`);
      process.exit(1);
    }
    return n;
  });
}

// ── Compare mode: pick 5 representative elements ─────────────────────────────
const COMPARE_ELEMENTS = [1, 11, 26, 79, 92]; // H, Na, Fe, Au, U

// ── Main ──────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = parseArgs(process.argv);

  // ── Review-only mode ────────────────────────────────────────────────────────
  if (args.review) {
    console.log('Generating review HTML from existing manifest...');
    const manifest = loadManifest(OUTPUT_PATHS.manifest);
    if (manifest.length === 0) {
      console.error('No manifest found. Run generation first.');
      process.exit(1);
    }
    generateReviewHtml(manifest, OUTPUT_PATHS.reviewHtml);
    return;
  }

  // ── Build prompts ────────────────────────────────────────────────────────────
  let allPrompts = buildAllPrompts();

  // Apply --compare filter (uses all tools, overrides --tool)
  if (args.compare) {
    allPrompts = allPrompts.filter((p) => COMPARE_ELEMENTS.includes(p.atomicNumber));
    console.log(`Compare mode: generating ${allPrompts.length} elements × all tools`);
  } else if (args.elementFilter) {
    const filterSet = new Set(args.elementFilter);
    allPrompts = allPrompts.filter((p) => filterSet.has(p.atomicNumber));
    console.log(`Filtered to ${allPrompts.length} elements`);
  }

  // ── Dry-run mode ─────────────────────────────────────────────────────────────
  if (args.dryRun) {
    console.log('\n── Dry run — prompts only ──────────────────────────────────────\n');
    for (const p of allPrompts) {
      console.log(`[${p.atomicNumber}] ${p.name} (${p.symbol})`);
      console.log(`  ${p.prompt}`);
      console.log(`  NEG: ${p.negativePrompt}`);
      console.log();
    }
    console.log(`Total: ${allPrompts.length} prompts`);
    return;
  }

  // ── Load or init manifest ────────────────────────────────────────────────────
  let manifest = loadManifest(OUTPUT_PATHS.manifest);

  // ── Retry-failed mode ────────────────────────────────────────────────────────
  if (args.retryFailed) {
    const failedNums = new Set(
      manifest.filter((e) => e.status === 'failed' || e.status === 'rejected').map((e) => e.atomicNumber),
    );
    allPrompts = allPrompts.filter((p) => failedNums.has(p.atomicNumber));
    console.log(`Retry mode: re-queuing ${allPrompts.length} failed/rejected elements`);
  }

  if (allPrompts.length === 0) {
    console.log('Nothing to generate.');
    return;
  }

  // ── Compare: iterate over all tools ─────────────────────────────────────────
  const toolsToRun: ToolName[] = args.compare ? SUPPORTED_TOOLS : [args.tool];

  const costTracker = new CostTracker();

  for (const toolName of toolsToRun) {
    console.log(`\n═══ Tool: ${toolName} ═══════════════════════════════════════════`);

    const client = createClient(toolName);
    const queueManager = new QueueManager(client, args.concurrency, 3);

    for (const p of allPrompts) {
      queueManager.addJob(p);
    }

    for await (const { atomicNumber, result } of queueManager.run()) {
      const elementData = elements.find((e) => e.atomicNumber === atomicNumber);
      if (!elementData) continue;

      const promptData = allPrompts.find((p) => p.atomicNumber === atomicNumber);
      if (!promptData) continue;

      let videoPath: string | undefined;

      if (result.status === 'completed' && result.videoUrl) {
        const filename = `${String(atomicNumber).padStart(3, '0')}-${elementData.symbol}-${toolName}.mp4`;
        const stagingPath = path.join(OUTPUT_PATHS.staging, filename);
        try {
          await client.download(result.videoUrl, stagingPath);
          videoPath = stagingPath;
          console.log(`  Downloaded → ${filename}`);
        } catch (err) {
          console.error(`  Download failed for ${elementData.symbol}: ${err}`);
        }
      }

      if (result.cost != null) {
        costTracker.record(atomicNumber, toolName, result.cost);
      }

      // Upsert manifest entry
      const existingIndex = manifest.findIndex(
        (e) => e.atomicNumber === atomicNumber && e.tool === toolName,
      );
      const entry: ManifestEntry = {
        atomicNumber,
        symbol: elementData.symbol,
        name: elementData.name,
        status: result.status === 'completed' ? 'completed' : result.status === 'failed' ? 'failed' : 'pending',
        videoPath,
        tool: toolName,
        prompt: promptData.prompt,
        cost: result.cost,
        generationId: result.id,
      };

      if (existingIndex >= 0) {
        manifest[existingIndex] = entry;
      } else {
        manifest.push(entry);
      }

      // Save manifest after each result so progress is preserved on crash
      saveManifest(OUTPUT_PATHS.manifest, manifest);
    }
  }

  // ── Post-run ─────────────────────────────────────────────────────────────────
  costTracker.printSummary();
  costTracker.save(OUTPUT_PATHS.costSummary);

  // Save final manifest and regenerate review page
  saveManifest(OUTPUT_PATHS.manifest, manifest);
  generateReviewHtml(manifest, OUTPUT_PATHS.reviewHtml);

  console.log(`\nManifest: ${OUTPUT_PATHS.manifest}`);
  console.log(`Review:   ${OUTPUT_PATHS.reviewHtml}`);
  console.log(`Staging:  ${OUTPUT_PATHS.staging}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
