import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getElementBySymbol } from '../src/data/elements.js';
import { VIDEO_DATA } from '../src/data/videoData.js';

const SITE_ORIGIN = 'https://www.periodictable.tech';
const DEFAULT_VIDEO_CDN = 'https://pub-31265833619c4b07a0d5cae75480e369.r2.dev';
const FALLBACK_OG_IMAGE = `${SITE_ORIGIN}/og-image.png`;

function videoCdn(): string {
  return process.env.VIDEO_CDN_URL || DEFAULT_VIDEO_CDN;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…';
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  // Prefer the path from the original /element/:symbol URL (when invoked via
  // the crawler rewrite). Fall back to a ?symbol=... query param for direct
  // testing and for `vercel dev`, which ignores `has` rewrites.
  const pathMatch = (req.url || '').match(/\/element\/([^?#/]+)/);
  const querySymbol = typeof req.query?.symbol === 'string' ? req.query.symbol : undefined;
  const rawSymbol = pathMatch ? decodeURIComponent(pathMatch[1]) : querySymbol ?? '';
  const element = rawSymbol ? getElementBySymbol(rawSymbol) : undefined;

  if (!element) {
    res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(
      `<!DOCTYPE html><html><head><title>Element not found — Periodic Table</title><meta name="robots" content="noindex"></head><body>Not found</body></html>`
    );
    return;
  }

  const canonicalUrl = `${SITE_ORIGIN}/element/${element.symbol}`;
  const title = `${element.name} (${element.symbol}) — Periodic Table`;
  const description = truncate(element.summary, 200);

  const video = VIDEO_DATA[element.atomicNumber];
  const cdn = videoCdn();
  const videoUrl = video ? `${cdn}/${video.filename}` : null;
  const posterUrl = video ? `${cdn}/${video.filename.replace(/\.mp4$/i, '.jpg')}` : null;
  const ogImage = posterUrl || FALLBACK_OG_IMAGE;
  const ogDescription = video ? `${description} — ${video.description}` : description;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(truncate(ogDescription, 200))}">
  <link rel="canonical" href="${canonicalUrl}">
  <link rel="icon" type="image/svg+xml" href="${SITE_ORIGIN}/favicon.svg">
  <link rel="icon" type="image/png" sizes="32x32" href="${SITE_ORIGIN}/favicon-32x32.png">
  <link rel="apple-touch-icon" sizes="180x180" href="${SITE_ORIGIN}/apple-touch-icon.png">

  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Periodic Table">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(truncate(ogDescription, 200))}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${escapeHtml(element.name)} — element ${element.atomicNumber}">
${
  videoUrl
    ? `  <meta property="og:video" content="${videoUrl}">
  <meta property="og:video:secure_url" content="${videoUrl}">
  <meta property="og:video:type" content="video/mp4">
  <meta property="og:video:width" content="1280">
  <meta property="og:video:height" content="720">
`
    : ''
}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(truncate(ogDescription, 200))}">
  <meta name="twitter:image" content="${ogImage}">
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(description)}</p>
  <p><a href="${canonicalUrl}">View on the interactive periodic table</a></p>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400');
  res.status(200).send(html);
}
