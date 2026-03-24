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
  1: {
    url: `${BASE_URL}/001-H-veo31fast.mp4`,
    poster: '',
    description: "H element visualization",
  },
  2: {
    url: `${BASE_URL}/002-He-veo31fast.mp4`,
    poster: '',
    description: "He element visualization",
  },
  3: {
    url: `${BASE_URL}/003-Li-veo31fast.mp4`,
    poster: '',
    description: "Li element visualization",
  },
  4: {
    url: `${BASE_URL}/004-Be-veo31fast.mp4`,
    poster: '',
    description: "Be element visualization",
  },
  5: {
    url: `${BASE_URL}/005-B-veo31fast.mp4`,
    poster: '',
    description: "B element visualization",
  },
  6: {
    url: `${BASE_URL}/006-C-veo31fast.mp4`,
    poster: '',
    description: "C element visualization",
  },
  7: {
    url: `${BASE_URL}/007-N-veo31fast.mp4`,
    poster: '',
    description: "N element visualization",
  },
  8: {
    url: `${BASE_URL}/008-O-veo31fast.mp4`,
    poster: '',
    description: "O element visualization",
  },
  9: {
    url: `${BASE_URL}/009-F-veo31fast.mp4`,
    poster: '',
    description: "F element visualization",
  },
  10: {
    url: `${BASE_URL}/010-Ne-veo31fast.mp4`,
    poster: '',
    description: "Neon gas discharge tube erupting with brilliant red-orange light",
  },
  11: {
    url: `${BASE_URL}/011-Na-veo31fast.mp4`,
    poster: '',
    description: "Sodium metal reacting violently with water, producing bright yellow-orange flames",
  },
  12: {
    url: `${BASE_URL}/012-Mg-veo31fast.mp4`,
    poster: '',
    description: "Mg element visualization",
  },
  13: {
    url: `${BASE_URL}/013-Al-veo31fast.mp4`,
    poster: '',
    description: "Al element visualization",
  },
  14: {
    url: `${BASE_URL}/014-Si-veo31fast.mp4`,
    poster: '',
    description: "Si element visualization",
  },
  15: {
    url: `${BASE_URL}/015-P-veo31fast.mp4`,
    poster: '',
    description: "P element visualization",
  },
  16: {
    url: `${BASE_URL}/016-S-veo31fast.mp4`,
    poster: '',
    description: "S element visualization",
  },
  17: {
    url: `${BASE_URL}/017-Cl-veo31fast.mp4`,
    poster: '',
    description: "Cl element visualization",
  },
  18: {
    url: `${BASE_URL}/018-Ar-veo31fast.mp4`,
    poster: '',
    description: "Ar element visualization",
  },
  19: {
    url: `${BASE_URL}/019-K-veo31fast.mp4`,
    poster: '',
    description: "K element visualization",
  },
  20: {
    url: `${BASE_URL}/020-Ca-veo31fast.mp4`,
    poster: '',
    description: "Ca element visualization",
  },
  21: {
    url: `${BASE_URL}/021-Sc-veo31fast.mp4`,
    poster: '',
    description: "Sc element visualization",
  },
  22: {
    url: `${BASE_URL}/022-Ti-veo31fast.mp4`,
    poster: '',
    description: "Ti element visualization",
  },
  23: {
    url: `${BASE_URL}/023-V-veo31fast.mp4`,
    poster: '',
    description: "V element visualization",
  },
  24: {
    url: `${BASE_URL}/024-Cr-veo31fast.mp4`,
    poster: '',
    description: "Cr element visualization",
  },
  25: {
    url: `${BASE_URL}/025-Mn-veo31fast.mp4`,
    poster: '',
    description: "Mn element visualization",
  },
  26: {
    url: `${BASE_URL}/026-Fe-veo31fast.mp4`,
    poster: '',
    description: "Fe element visualization",
  },
  27: {
    url: `${BASE_URL}/027-Co-veo31fast.mp4`,
    poster: '',
    description: "Co element visualization",
  },
  28: {
    url: `${BASE_URL}/028-Ni-veo31fast.mp4`,
    poster: '',
    description: "Ni element visualization",
  },
  29: {
    url: `${BASE_URL}/029-Cu-veo31fast.mp4`,
    poster: '',
    description: "Cu element visualization",
  },
  30: {
    url: `${BASE_URL}/030-Zn-veo31fast.mp4`,
    poster: '',
    description: "Zn element visualization",
  },
  31: {
    url: `${BASE_URL}/031-Ga-veo31fast.mp4`,
    poster: '',
    description: "Ga element visualization",
  },
  32: {
    url: `${BASE_URL}/032-Ge-veo31fast.mp4`,
    poster: '',
    description: "Ge element visualization",
  },
  33: {
    url: `${BASE_URL}/033-As-veo31fast.mp4`,
    poster: '',
    description: "As element visualization",
  },
  34: {
    url: `${BASE_URL}/034-Se-veo31fast.mp4`,
    poster: '',
    description: "Se element visualization",
  },
  35: {
    url: `${BASE_URL}/035-Br-veo31fast.mp4`,
    poster: '',
    description: "Bromine liquid releasing dense reddish-brown vapor",
  },
  36: {
    url: `${BASE_URL}/036-Kr-veo31fast.mp4`,
    poster: '',
    description: "Kr element visualization",
  },
  37: {
    url: `${BASE_URL}/037-Rb-veo31fast.mp4`,
    poster: '',
    description: "Rb element visualization",
  },
  38: {
    url: `${BASE_URL}/038-Sr-veo31fast.mp4`,
    poster: '',
    description: "Sr element visualization",
  },
  39: {
    url: `${BASE_URL}/039-Y-veo31fast.mp4`,
    poster: '',
    description: "Y element visualization",
  },
  40: {
    url: `${BASE_URL}/040-Zr-veo31fast.mp4`,
    poster: '',
    description: "Zr element visualization",
  },
  41: {
    url: `${BASE_URL}/041-Nb-veo31fast.mp4`,
    poster: '',
    description: "Nb element visualization",
  },
  42: {
    url: `${BASE_URL}/042-Mo-veo31fast.mp4`,
    poster: '',
    description: "Mo element visualization",
  },
  43: {
    url: `${BASE_URL}/043-Tc-veo31fast.mp4`,
    poster: '',
    description: "Tc element visualization",
  },
  44: {
    url: `${BASE_URL}/044-Ru-veo31fast.mp4`,
    poster: '',
    description: "Ru element visualization",
  },
  45: {
    url: `${BASE_URL}/045-Rh-veo31fast.mp4`,
    poster: '',
    description: "Rh element visualization",
  },
  46: {
    url: `${BASE_URL}/046-Pd-veo31fast.mp4`,
    poster: '',
    description: "Pd element visualization",
  },
  47: {
    url: `${BASE_URL}/047-Ag-veo31fast.mp4`,
    poster: '',
    description: "Ag element visualization",
  },
  48: {
    url: `${BASE_URL}/048-Cd-veo31fast.mp4`,
    poster: '',
    description: "Cd element visualization",
  },
  49: {
    url: `${BASE_URL}/049-In-veo31fast.mp4`,
    poster: '',
    description: "In element visualization",
  },
  50: {
    url: `${BASE_URL}/050-Sn-veo31fast.mp4`,
    poster: '',
    description: "Sn element visualization",
  },
  51: {
    url: `${BASE_URL}/051-Sb-veo31fast.mp4`,
    poster: '',
    description: "Sb element visualization",
  },
  52: {
    url: `${BASE_URL}/052-Te-veo31fast.mp4`,
    poster: '',
    description: "Te element visualization",
  },
  53: {
    url: `${BASE_URL}/053-I-veo31fast.mp4`,
    poster: '',
    description: "I element visualization",
  },
  54: {
    url: `${BASE_URL}/054-Xe-veo31fast.mp4`,
    poster: '',
    description: "Xe element visualization",
  },
  55: {
    url: `${BASE_URL}/055-Cs-veo31fast.mp4`,
    poster: '',
    description: "Cs element visualization",
  },
  56: {
    url: `${BASE_URL}/056-Ba-veo31fast.mp4`,
    poster: '',
    description: "Ba element visualization",
  },
  57: {
    url: `${BASE_URL}/057-La-veo31fast.mp4`,
    poster: '',
    description: "La element visualization",
  },
  58: {
    url: `${BASE_URL}/058-Ce-veo31fast.mp4`,
    poster: '',
    description: "Ce element visualization",
  },
  59: {
    url: `${BASE_URL}/059-Pr-veo31fast.mp4`,
    poster: '',
    description: "Pr element visualization",
  },
  60: {
    url: `${BASE_URL}/060-Nd-veo31fast.mp4`,
    poster: '',
    description: "Nd element visualization",
  },
  61: {
    url: `${BASE_URL}/061-Pm-veo31fast.mp4`,
    poster: '',
    description: "Pm element visualization",
  },
  62: {
    url: `${BASE_URL}/062-Sm-veo31fast.mp4`,
    poster: '',
    description: "Sm element visualization",
  },
  63: {
    url: `${BASE_URL}/063-Eu-veo31fast.mp4`,
    poster: '',
    description: "Eu element visualization",
  },
  64: {
    url: `${BASE_URL}/064-Gd-veo31fast.mp4`,
    poster: '',
    description: "Gd element visualization",
  },
  65: {
    url: `${BASE_URL}/065-Tb-veo31fast.mp4`,
    poster: '',
    description: "Tb element visualization",
  },
  66: {
    url: `${BASE_URL}/066-Dy-veo31fast.mp4`,
    poster: '',
    description: "Dy element visualization",
  },
  67: {
    url: `${BASE_URL}/067-Ho-veo31fast.mp4`,
    poster: '',
    description: "Ho element visualization",
  },
  68: {
    url: `${BASE_URL}/068-Er-veo31fast.mp4`,
    poster: '',
    description: "Er element visualization",
  },
  69: {
    url: `${BASE_URL}/069-Tm-veo31fast.mp4`,
    poster: '',
    description: "Tm element visualization",
  },
  70: {
    url: `${BASE_URL}/070-Yb-veo31fast.mp4`,
    poster: '',
    description: "Yb element visualization",
  },
  71: {
    url: `${BASE_URL}/071-Lu-veo31fast.mp4`,
    poster: '',
    description: "Lu element visualization",
  },
  72: {
    url: `${BASE_URL}/072-Hf-veo31fast.mp4`,
    poster: '',
    description: "Hf element visualization",
  },
  73: {
    url: `${BASE_URL}/073-Ta-veo31fast.mp4`,
    poster: '',
    description: "Ta element visualization",
  },
  75: {
    url: `${BASE_URL}/075-Re-veo31fast.mp4`,
    poster: '',
    description: "Re element visualization",
  },
  76: {
    url: `${BASE_URL}/076-Os-veo31fast.mp4`,
    poster: '',
    description: "Os element visualization",
  },
  77: {
    url: `${BASE_URL}/077-Ir-veo31fast.mp4`,
    poster: '',
    description: "Ir element visualization",
  },
  78: {
    url: `${BASE_URL}/078-Pt-veo31fast.mp4`,
    poster: '',
    description: "Pt element visualization",
  },
  79: {
    url: `${BASE_URL}/079-Au-veo31fast.mp4`,
    poster: '',
    description: "Gold being melted and poured as glowing molten liquid",
  },
  80: {
    url: `${BASE_URL}/080-Hg-veo31fast.mp4`,
    poster: '',
    description: "Hg element visualization",
  },
  81: {
    url: `${BASE_URL}/081-Tl-veo31fast.mp4`,
    poster: '',
    description: "Tl element visualization",
  },
  82: {
    url: `${BASE_URL}/082-Pb-veo31fast.mp4`,
    poster: '',
    description: "Pb element visualization",
  },
  83: {
    url: `${BASE_URL}/083-Bi-veo31fast.mp4`,
    poster: '',
    description: "Bi element visualization",
  },
  84: {
    url: `${BASE_URL}/084-Po-veo31fast.mp4`,
    poster: '',
    description: "Po element visualization",
  },
  92: {
    url: `${BASE_URL}/092-U-veo31fast.mp4`,
    poster: '',
    description: "Uranium glass glowing with intense green fluorescence under UV light",
  },
};

export function getVideoEntry(atomicNumber: number): VideoEntry | undefined {
  return videoManifest[atomicNumber];
}
