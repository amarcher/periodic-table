import { VIDEO_DATA } from './videoData';

export interface VideoEntry {
  url: string;
  poster: string;
  description: string;
}

// In dev, videos are served from public/element-videos/
// In production, they're served from Cloudflare R2.
// Set VITE_VIDEO_CDN_URL in your .env (or Vercel environment variables) to
// the R2 public URL, e.g. https://pub-abc123.r2.dev
const BASE_URL = import.meta.env.VITE_VIDEO_CDN_URL || '/element-videos';

function posterFilename(videoFilename: string): string {
  return videoFilename.replace(/\.mp4$/i, '.jpg');
}

export const videoManifest: Partial<Record<number, VideoEntry>> = Object.fromEntries(
  Object.entries(VIDEO_DATA).map(([atomicNumber, entry]) => [
    atomicNumber,
    entry
      ? {
          url: `${BASE_URL}/${entry.filename}`,
          poster: `${BASE_URL}/${posterFilename(entry.filename)}`,
          description: entry.description,
        }
      : undefined,
  ])
);

export function getVideoEntry(atomicNumber: number): VideoEntry | undefined {
  return videoManifest[atomicNumber];
}
