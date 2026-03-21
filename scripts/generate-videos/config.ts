import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export type ToolName = 'veo2' | 'veo3' | 'veo3fast' | 'veo31' | 'veo31fast' | 'runway' | 'kling' | 'luma' | 'pika';

export const SUPPORTED_TOOLS: ToolName[] = ['veo2', 'veo3', 'veo3fast', 'veo31', 'veo31fast', 'runway', 'kling', 'luma', 'pika'];

export const API_KEY_ENV_VARS: Record<ToolName, string> = {
  veo2: 'GOOGLE_AI_API_KEY',
  veo3: 'GOOGLE_AI_API_KEY',
  veo3fast: 'GOOGLE_AI_API_KEY',
  veo31: 'GOOGLE_AI_API_KEY',
  veo31fast: 'GOOGLE_AI_API_KEY',
  runway: 'RUNWAY_API_KEY',
  kling: 'KLING_API_KEY',
  luma: 'LUMA_API_KEY',
  pika: 'PIKA_API_KEY',
};

// Per-second cost for Google Veo models (720p)
export const VEO_COST_PER_SECOND: Record<string, number> = {
  'veo-2.0-generate-001': 0.35,
  'veo-3.0-generate-001': 0.40,
  'veo-3.0-fast-generate-001': 0.15,
  'veo-3.1-generate-preview': 0.40,
  'veo-3.1-fast-generate-preview': 0.15,
};

export const OUTPUT_PATHS = {
  staging: path.resolve(__dirname, 'output/staging'),
  final: path.resolve(__dirname, 'output/final'),
  manifest: path.resolve(__dirname, 'output/manifest.json'),
  reviewHtml: path.resolve(__dirname, 'output/review.html'),
  costSummary: path.resolve(__dirname, 'output/cost-summary.json'),
} as const;

export const DEFAULT_CONCURRENCY = 10;

export const STYLE_ANCHOR =
  'Photorealistic cinematic video, shallow depth of field, dramatic and vivid scientific visualization, ' +
  'professional laboratory aesthetic, dark background with soft volumetric lighting, smooth slow-motion, ' +
  'seamless looping video that returns to its starting state, ' +
  'all substances remain fully contained within their vessels — nothing escapes, leaks, or spills unless an explosion is depicted, ' +
  'absolutely no text, no watermarks, no logos, no letters, no symbols overlaid on the video, no human faces.';

export const NEGATIVE_PROMPT =
  'text, watermark, logo, Chinese characters, Japanese characters, Korean characters, any written language, ' +
  'letters, numbers overlaid, title card, captions, subtitles, credits, ' +
  'human face, hands, person, cartoon, anime, illustration, 2D, flat, ' +
  'low quality, blurry, pixelated, oversaturated, cheesy, stock footage look, CGI plastic, ' +
  'artificial looking, cheap effects, static image, still frame, ' +
  'gas or liquid escaping or leaking from containers, substances spilling outside their vessel, ' +
  'vapor condensing on the outside of a sealed container.';
