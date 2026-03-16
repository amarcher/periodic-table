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

export const videoManifest: Partial<Record<number, VideoEntry>> = {
  10: {
    url: `${BASE_URL}/010-Ne-veo31fast.mp4`,
    poster: '',
    description: 'Neon gas discharge tube erupting with brilliant red-orange light',
  },
  11: {
    url: `${BASE_URL}/011-Na-veo31fast.mp4`,
    poster: '',
    description: 'Sodium metal reacting violently with water, producing bright yellow-orange flames',
  },
  35: {
    url: `${BASE_URL}/035-Br-veo31fast.mp4`,
    poster: '',
    description: 'Bromine liquid releasing dense reddish-brown vapor',
  },
  79: {
    url: `${BASE_URL}/079-Au-veo31fast.mp4`,
    poster: '',
    description: 'Gold being melted and poured as glowing molten liquid',
  },
  92: {
    url: `${BASE_URL}/092-U-veo31fast.mp4`,
    poster: '',
    description: 'Uranium glass glowing with intense green fluorescence under UV light',
  },
};

export function getVideoEntry(atomicNumber: number): VideoEntry | undefined {
  return videoManifest[atomicNumber];
}
