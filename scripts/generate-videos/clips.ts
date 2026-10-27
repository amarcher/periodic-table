/**
 * Generate fact clips (src/data/clips.ts) with Gemini Omni 1.1 Flash.
 *
 *   node scripts/run-with-env.mjs npx tsx scripts/generate-videos/clips.ts [--dry-run] [--element Au] [--concurrency 5]
 *
 * Generates every clip whose MP4 is missing from public/element-videos/, strips
 * the audio track, and writes the silent file there. Then run the usual ship
 * path (thumbnails --all, upload --sync) and set each clip's uploadDate.
 *
 * Veo 3.1 (api-client.ts) was retired by Google in October 2026; the Omni model
 * is reached through the Interactions API instead. Video output is billed at
 * about $0.10 per second at 720p, so an 8s clip is about $0.80. `duration` is a
 * string such as "8s" — a number is rejected as invalid input.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CLIP_PROMPTS, CLIP_STYLE_ANCHOR } from './clip-prompts.ts';
import { FACT_CLIPS } from '../../src/data/clips.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIDEOS_DIR = path.resolve(__dirname, '../../public/element-videos');
const STAGING_DIR = path.resolve(__dirname, 'output/staging/clips');
const API = 'https://generativelanguage.googleapis.com/v1beta';
const MODEL = 'gemini-omni-1.1-flash';
const DURATION_SECONDS = 8;
const COST_PER_SECOND = 0.10;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const onlyElement = args[args.indexOf('--element') + 1];
const concurrency = Number(args[args.indexOf('--concurrency') + 1]) || 5;

const jobs = Object.entries(FACT_CLIPS).flatMap(([symbol, clips]) =>
  (clips ?? []).filter(() => !args.includes('--element') || symbol === onlyElement).map(clip => {
    const prompt = CLIP_PROMPTS[`${symbol}/${clip.slug}`];
    if (!prompt) throw new Error(`No prompt for ${symbol}/${clip.slug}`);
    return { key: `${symbol}/${clip.slug}`, filename: clip.filename, aspect: clip.aspect, prompt: `${prompt} ${CLIP_STYLE_ANCHOR}` };
  }),
).filter(job => !fs.existsSync(path.join(VIDEOS_DIR, job.filename)));

console.log(`${jobs.length} clip(s) to generate (~$${(jobs.length * DURATION_SECONDS * COST_PER_SECOND).toFixed(2)})`);
if (dryRun) {
  for (const job of jobs) console.log(`\n[${job.key}] → ${job.filename}\n  ${job.prompt}`);
  process.exit(0);
}

const key = process.env.GOOGLE_AI_API_KEY;
if (!key) throw new Error('Missing GOOGLE_AI_API_KEY');
// Google echoes the request URL (key included) in some error bodies; never let that reach a log.
const mask = (text: string) => text.replaceAll(key, '***');
// Generated files survive 48h in the File API, so the id is recorded before download
// and a failed download can be retried without paying for the generation again.
const LEDGER = path.join(STAGING_DIR, 'file-ids.json');
const ledger: Record<string, string> = fs.existsSync(LEDGER) ? JSON.parse(fs.readFileSync(LEDGER, 'utf8')) : {};
fs.mkdirSync(STAGING_DIR, { recursive: true });
let total = 0;

type Content = { type: string; uri?: string; data?: string; mime_type?: string };
interface InteractionResponse {
  id?: string; status?: string; error?: { message: string };
  output_video?: { uri?: string; data?: string };
  steps?: Array<{ type: string; content?: Content[] }>;
}

function findVideo(res: InteractionResponse): Content | undefined {
  if (res.output_video) return { type: 'video', ...res.output_video };
  return res.steps?.flatMap(step => step.content ?? []).find(c => c.type === 'video');
}

async function generate(prompt: string, aspect: '16:9' | '9:16') {
  const response = await fetch(`${API}/interactions?key=${key}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Server-Timeout': '600' },
    body: JSON.stringify({
      model: MODEL, input: prompt,
      response_format: { type: 'video', aspect_ratio: aspect, resolution: '720p', duration: `${DURATION_SECONDS}s`, delivery: 'uri' },
    }),
  });
  const body = (await response.json()) as InteractionResponse;
  if (!response.ok || body.error) throw new Error(mask(`${response.status} ${body.error?.message ?? JSON.stringify(body).slice(0, 300)}`));
  const video = findVideo(body);
  if (!video?.uri && !video?.data) throw new Error(mask(`no video in response: ${JSON.stringify(body).slice(0, 300)}`));
  return video;
}

async function downloadFile(uri: string, outputPath: string) {
  // The response URI may already be the ':download?alt=media' form; keep only the id.
  const id = /files\/([A-Za-z0-9_-]+)/.exec(uri)?.[1];
  if (!id) throw new Error(mask(`unrecognised file uri ${uri}`));
  for (;;) {
    const info = (await (await fetch(`${API}/files/${id}?key=${key}`)).json()) as { state?: string; error?: { message: string } };
    if (info.error) throw new Error(mask(info.error.message));
    if (info.state === 'ACTIVE') break;
    if (info.state === 'FAILED') throw new Error('file processing failed');
    await new Promise(r => setTimeout(r, 5_000));
  }
  const media = await fetch(`${API}/files/${id}:download?alt=media&key=${key}`);
  if (!media.ok) throw new Error(mask(`download ${media.status} ${(await media.text()).slice(0, 200)}`));
  fs.writeFileSync(outputPath, Buffer.from(await media.arrayBuffer()));
}

async function run(job: (typeof jobs)[number]) {
  const started = Date.now();
  const video = await generate(job.prompt, job.aspect);
  const staged = path.join(STAGING_DIR, job.filename);
  if (video.uri) { ledger[job.key] = video.uri; fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 2)); }
  if (video.uri) await downloadFile(video.uri, staged);
  else fs.writeFileSync(staged, Buffer.from(video.data!, 'base64'));
  // The model returns video with audio; the clips are silent and captioned in HTML.
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', staged, '-c:v', 'copy', '-an', path.join(VIDEOS_DIR, job.filename)]);
  const cost = DURATION_SECONDS * COST_PER_SECOND;
  total += cost;
  console.log(`[${job.key}] done in ${Math.round((Date.now() - started) / 1000)}s, ~$${cost.toFixed(2)} → ${job.filename}`);
}

const queue = [...jobs];
await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
  for (let job = queue.shift(); job; job = queue.shift()) {
    try { await run(job); } catch (err) { console.error(mask(`[${job.key}] ERROR ${err instanceof Error ? err.message : err}`)); }
  }
}));
console.log(`\nEstimated total cost: $${total.toFixed(2)}`);
