/**
 * Renders the published shorts as ready-to-upload social posts.
 *
 *   npx tsx scripts/social/export.ts            # every element with shorts
 *   npx tsx scripts/social/export.ts --element Na --force
 *
 * For each 9:16 short it writes, under output/social/<Symbol>/:
 *   <slug>.mp4   1080x1920, the fact burned in, a periodictable.tech mark, a silent audio track
 *   <slug>.txt   title, caption, hashtags and upload settings to paste into each platform
 * and per element a compilation, <Symbol>-shorts.mp4 (+ .txt): a title card,
 * every short, and an end card pointing at the site.
 *
 * The website keeps captions out of the pixels so the pages stay indexable and
 * translatable; short-form platforms show nothing but the video, so here the
 * same text from src/data/clips.ts is rendered into the frame. Text is set by
 * ImageMagick (this machine's ffmpeg has no drawtext) and composited by ffmpeg.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { elements } from '../../src/data/elements';
import { getShorts, type Clip } from '../../src/data/clips';
import { categoryColors, categoryLabels } from '../../src/utils/colors';
import { SITE_ORIGIN, clipPath, elementPath } from '../../src/utils/seo';
import type { Element } from '../../src/types/element';

const args = process.argv.slice(2);
const flag = (name: string) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };
const only = flag('--element');
const force = args.includes('--force');
const root = resolve(import.meta.dirname, '..', '..');
const sourceDir = join(root, 'public', 'element-videos');
const outRoot = resolve(root, flag('--out') ?? 'output/social');

const W = 1080, H = 1920, FPS = 24;
const CAPTION_BOTTOM = Math.round(H * 0.72); // above TikTok's caption/handle overlay
const MARK_TOP = 150;                         // below the For You / Following tabs
const HEADLINE_FONT = '/System/Library/Fonts/Avenir Next.ttc';   // first face is Bold
const BODY_FONT = '/System/Library/Fonts/HelveticaNeue.ttc';     // first face is Regular
const INK = '#0b1020';

const run = (cmd: string, cmdArgs: string[]) => {
  try { return execFileSync(cmd, cmdArgs, { stdio: ['ignore', 'pipe', 'pipe'] }).toString(); }
  catch (error) { throw new Error(`${cmd} ${cmdArgs.slice(0, 3).join(' ')}… failed:\n${(error as { stderr?: Buffer }).stderr?.toString().trim()}`); }
};
const magick = (magickArgs: string[]) => run('magick', magickArgs);
const size = (png: string) => magick([png, '-format', '%wx%h', 'info:']).trim().split('x').map(Number) as [number, number];

/** Puts `inner` on a rounded, padded box. */
function roundedBox(inner: string, out: string, fill: string, pad: [number, number], radius: number) {
  const [w, h] = size(inner);
  const [bw, bh] = [w + pad[0] * 2, h + pad[1] * 2];
  magick(['-size', `${bw}x${bh}`, 'xc:none', '-fill', fill, '-draw', `roundrectangle 0,0,${bw - 1},${bh - 1},${radius},${radius}`,
    inner, '-gravity', 'center', '-composite', out]);
}

/** Word-wrapped text block; ImageMagick's caption: wraps to the given width. */
function textBlock(text: string, out: string, font: string, points: number, fill: string, width: number) {
  magick(['-size', `${width}x`, '-background', 'none', '-fill', fill, '-font', font, '-pointsize', String(points),
    '-interline-spacing', String(Math.round(points * -0.08)), '-gravity', 'west', `caption:${text}`, '-trim', '+repage', out]);
}

function renderCaption(element: Element, clip: Clip, work: string, out: string) {
  const chip = join(work, 'chip.png'), head = join(work, 'head.png'), body = join(work, 'body.png');
  const chipText = join(work, 'chip-text.png'), stack = join(work, 'stack.png');
  magick(['-background', 'none', '-fill', INK, '-font', HEADLINE_FONT, '-pointsize', '30', `label:${element.symbol}  ·  ${element.name.toUpperCase()}`, chipText]);
  roundedBox(chipText, chip, categoryColors[element.category], [22, 10], 24);
  textBlock(clip.title, head, HEADLINE_FONT, 60, 'white', 900);
  textBlock(clip.fact, body, BODY_FONT, 46, '#ffffffe6', 900);
  // Stack chip, headline and fact left-aligned with breathing room between them.
  magick([chip, '-size', '1x26', 'xc:none', head, '-size', '1x22', 'xc:none', body, '-background', 'none', '-gravity', 'west', '-append', stack]);
  roundedBox(stack, out, `${INK}cc`, [48, 40], 36);
}

function renderMark(out: string) {
  const text = join(outRoot, '_mark-text.png');
  magick(['-background', 'none', '-fill', '#ffffffd9', '-font', BODY_FONT, '-pointsize', '36', 'label:periodictable.tech', text]);
  roundedBox(text, out, `${INK}99`, [30, 14], 40);
}

function renderCard(element: Element, kind: 'title' | 'end', count: number, out: string) {
  const color = categoryColors[element.category];
  const lines: string[] = kind === 'title'
    ? ['-font', HEADLINE_FONT, '-pointsize', '420', '-fill', color, '-annotate', '+0-260', element.symbol,
      '-font', HEADLINE_FONT, '-pointsize', '110', '-fill', 'white', '-annotate', '+0+110', element.name,
      '-font', BODY_FONT, '-pointsize', '56', '-fill', '#ffffffcc', '-annotate', '+0+230', `${count} quick facts · ${categoryLabels[element.category]}`]
    : ['-font', BODY_FONT, '-pointsize', '60', '-fill', '#ffffffcc', '-annotate', '+0-220', 'Every element has videos at',
      '-font', HEADLINE_FONT, '-pointsize', '96', '-fill', 'white', '-annotate', '+0-100', 'periodictable.tech',
      '-font', HEADLINE_FONT, '-pointsize', '150', '-fill', color, '-annotate', '+0+140', element.symbol,
      '-font', BODY_FONT, '-pointsize', '52', '-fill', '#ffffffcc', '-annotate', '+0+280', `Swipe through all ${count} ${element.name} shorts`];
  magick(['-size', `${W}x${H}`, `gradient:#182038-#05070d`, '-gravity', 'center', ...lines, out]);
}

const encode = ['-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-c:a', 'aac', '-b:a', '96k', '-ar', '48000', '-movflags', '+faststart'];
const silence = ['-f', 'lavfi', '-i', 'anullsrc=channel_layout=stereo:sample_rate=48000'];

function encodeShort(source: string, caption: string, mark: string, out: string) {
  run('ffmpeg', ['-y', '-loglevel', 'error', '-i', source, '-i', caption, '-i', mark, ...silence,
    '-filter_complex', `[0:v]scale=${W}:${H}:flags=lanczos,setsar=1[v0];[v0][1:v]overlay=(W-w)/2:${CAPTION_BOTTOM}-h[v1];[v1][2:v]overlay=(W-w)/2:${MARK_TOP}[v]`,
    '-map', '[v]', '-map', '3:a', '-shortest', ...encode, out]);
}

function encodeCard(png: string, seconds: number, out: string) {
  run('ffmpeg', ['-y', '-loglevel', 'error', '-loop', '1', '-t', String(seconds), '-i', png, ...silence,
    '-filter_complex', `[0:v]fade=t=in:d=0.3,fade=t=out:st=${seconds - 0.3}:d=0.3,setsar=1[v]`, '-map', '[v]', '-map', '1:a', '-shortest', ...encode, out]);
}

function concat(parts: string[], out: string) {
  const inputs = parts.flatMap(part => ['-i', part]);
  const chain = parts.map((_, i) => `[${i}:v][${i}:a]`).join('');
  run('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', `${chain}concat=n=${parts.length}:v=1:a=1[v][a]`, '-map', '[v]', '-map', '[a]', ...encode, out]);
}

const hashtags = (element: Element) => ['#' + element.name.toLowerCase(), '#chemistry', '#periodictable', '#sciencefacts', '#science', '#stem', '#learnontiktok'].join(' ');

function post(title: string, caption: string, element: Element, extra: string[]) {
  return [
    'TITLE (YouTube, under 100 characters)', title, '',
    'CAPTION (TikTok, Instagram, YouTube description)', caption, '',
    'HASHTAGS', hashtags(element), '',
    'UPLOAD SETTINGS',
    '- Label as AI-generated / altered content: YES. All footage is AI-generated.',
    '- Add a track from the platform music library; the file carries a silent audio track.',
    '- Format: 9:16, 1080x1920, H.264.',
    ...extra, '',
  ].join('\n');
}

function exportElement(element: Element, mark: string) {
  const shorts = getShorts(element);
  if (!shorts.length) return [];
  const dir = join(outRoot, element.symbol);
  const work = join(dir, '_work');
  mkdirSync(work, { recursive: true });
  const written: string[] = [];
  const parts: string[] = [];
  for (const clip of shorts) {
    const source = join(sourceDir, clip.filename);
    if (!existsSync(source)) { console.warn(`skip ${clip.slug}: ${source} is missing`); continue; }
    const mp4 = join(dir, `${clip.slug}.mp4`);
    parts.push(mp4);
    if (existsSync(mp4) && !force) continue;
    const caption = join(work, `${clip.slug}-caption.png`);
    renderCaption(element, clip, work, caption);
    encodeShort(source, caption, mark, mp4);
    writeFileSync(join(dir, `${clip.slug}.txt`), post(clip.title, [clip.fact, '',
      `Watch all ${shorts.length} ${element.name} shorts: ${SITE_ORIGIN}${clipPath(element, clip)}`,
      `Interactive periodic table: ${SITE_ORIGIN}/`].join('\n'), element, ['- Duration: 8 seconds. Loops cleanly.']));
    written.push(mp4);
    console.log(`  ${element.symbol}/${clip.slug}.mp4`);
  }
  if (parts.length < 2) return written;
  const compilation = join(dir, `${element.symbol}-shorts.mp4`);
  if (!existsSync(compilation) || force || written.length) {
    const titleCard = join(work, 'title.png'), endCard = join(work, 'end.png');
    const titleMp4 = join(work, 'title.mp4'), endMp4 = join(work, 'end.mp4');
    renderCard(element, 'title', parts.length, titleCard);
    renderCard(element, 'end', parts.length, endCard);
    encodeCard(titleCard, 2.5, titleMp4);
    encodeCard(endCard, 2.5, endMp4);
    concat([titleMp4, ...parts, endMp4], compilation);
    const seconds = Math.round(5 + parts.length * 8);
    writeFileSync(join(dir, `${element.symbol}-shorts.txt`), post(`${parts.length} ${element.name} facts in ${seconds} seconds`,
      [...shorts.map(clip => `• ${clip.fact}`), '', `Watch the ${element.name} reel: ${SITE_ORIGIN}${clipPath(element, shorts[0])}`,
        `Everything about ${element.name}: ${SITE_ORIGIN}${elementPath(element)}`].join('\n'), element, [`- Duration: ${seconds} seconds.`]));
    written.push(compilation);
    console.log(`  ${element.symbol}/${element.symbol}-shorts.mp4`);
  }
  return written;
}

mkdirSync(outRoot, { recursive: true });
const mark = join(outRoot, '_mark.png');
renderMark(mark);
const manifest: Record<string, string[]> = {};
for (const element of elements) {
  if (only && element.symbol !== only) continue;
  const files = exportElement(element, mark);
  if (files.length) manifest[element.symbol] = files.map(file => file.slice(outRoot.length + 1));
}
writeFileSync(join(outRoot, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(`wrote ${Object.values(manifest).flat().length} files to ${outRoot}`);
