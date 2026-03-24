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
    description: 'Hydrogen-filled soap bubbles igniting in chain-reaction fireballs',
  },
  2: {
    url: `${BASE_URL}/002-He-veo31fast.mp4`,
    poster: '',
    description: 'Superfluid liquid helium creeping up and over the walls of a glass beaker',
  },
  3: {
    url: `${BASE_URL}/003-Li-veo31fast.mp4`,
    poster: '',
    description: 'Lithium metal reacting with water, producing a deep crimson-red flame',
  },
  4: {
    url: `${BASE_URL}/004-Be-veo31fast.mp4`,
    poster: '',
    description: 'Beryllium producing an intense white flame in a Bunsen burner',
  },
  5: {
    url: `${BASE_URL}/005-B-veo31fast.mp4`,
    poster: '',
    description: 'Boron powder igniting into spectacular brilliant green flames',
  },
  6: {
    url: `${BASE_URL}/006-C-veo31fast.mp4`,
    poster: '',
    description: 'A diamond burning white-hot in liquid oxygen, consumed by combustion',
  },
  7: {
    url: `${BASE_URL}/007-N-veo31fast.mp4`,
    poster: '',
    description: 'Liquid nitrogen flash-boiling in warm water, producing cascading white fog',
  },
  8: {
    url: `${BASE_URL}/008-O-veo31fast.mp4`,
    poster: '',
    description: 'Blue liquid oxygen suspended between magnet poles by magnetic force',
  },
  9: {
    url: `${BASE_URL}/009-F-veo31fast.mp4`,
    poster: '',
    description: 'Steel wool erupting into white-hot sparks when exposed to fluorine gas',
  },
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
  12: {
    url: `${BASE_URL}/012-Mg-veo31fast.mp4`,
    poster: '',
    description: 'Magnesium ribbon burning with a blindingly bright white flame',
  },
  13: {
    url: `${BASE_URL}/013-Al-veo31fast.mp4`,
    poster: '',
    description: 'Molten aluminum being poured as a shimmering silvery liquid glowing orange',
  },
  14: {
    url: `${BASE_URL}/014-Si-veo31fast.mp4`,
    poster: '',
    description: 'A pure silicon crystal being pulled from glowing molten silicon in the Czochralski process',
  },
  15: {
    url: `${BASE_URL}/015-P-veo31fast.mp4`,
    poster: '',
    description: 'White phosphorus glowing with an eerie green-blue light before self-igniting into fierce white flames',
  },
  16: {
    url: `${BASE_URL}/016-S-veo31fast.mp4`,
    poster: '',
    description: 'Sulfur crystals melting from golden liquid to blood-red syrup, then igniting with an electric blue flame',
  },
  17: {
    url: `${BASE_URL}/017-Cl-veo31fast.mp4`,
    poster: '',
    description: 'Pale yellow-green chlorine gas swirling in a glass flask, reacting with metals',
  },
  18: {
    url: `${BASE_URL}/018-Ar-veo31fast.mp4`,
    poster: '',
    description: 'Argon gas discharge tube glowing with a soft lavender-purple light',
  },
  19: {
    url: `${BASE_URL}/019-K-veo31fast.mp4`,
    poster: '',
    description: 'Potassium metal dropped into water, exploding with a bright violet-pink flame',
  },
  20: {
    url: `${BASE_URL}/020-Ca-veo31fast.mp4`,
    poster: '',
    description: 'Calcium metal reacting with water, producing hydrogen bubbles and milky white calcium hydroxide clouds',
  },
  21: {
    url: `${BASE_URL}/021-Sc-veo31fast.mp4`,
    poster: '',
    description: 'Silvery-white scandium metal surface gleaming under soft light',
  },
  22: {
    url: `${BASE_URL}/022-Ti-veo31fast.mp4`,
    poster: '',
    description: 'Titanium rod pressed against a spinning grinding wheel, throwing bright white sparks',
  },
  23: {
    url: `${BASE_URL}/023-V-veo31fast.mp4`,
    poster: '',
    description: 'Four flasks of vanadium solutions in different brilliant colors showing its oxidation states',
  },
  24: {
    url: `${BASE_URL}/024-Cr-veo31fast.mp4`,
    poster: '',
    description: 'A perfectly polished block of chromium with a flawless mirror finish',
  },
  25: {
    url: `${BASE_URL}/025-Mn-veo31fast.mp4`,
    poster: '',
    description: 'Purple potassium permanganate crystals dissolving into water, creating swirling violet clouds',
  },
  26: {
    url: `${BASE_URL}/026-Fe-veo31fast.mp4`,
    poster: '',
    description: 'Steel wool burning brilliantly in a jar of pure oxygen, showering orange-white sparks',
  },
  27: {
    url: `${BASE_URL}/027-Co-veo31fast.mp4`,
    poster: '',
    description: 'Molten cobalt-blue glass on a glassblowing rod, glowing with intense deep blue color',
  },
  28: {
    url: `${BASE_URL}/028-Ni-veo31fast.mp4`,
    poster: '',
    description: 'A highly polished nickel sphere with a warm silvery-gold luster',
  },
  29: {
    url: `${BASE_URL}/029-Cu-veo31fast.mp4`,
    poster: '',
    description: 'Copper wire held in a Bunsen burner flame, producing a vivid green-blue flame',
  },
  30: {
    url: `${BASE_URL}/030-Zn-veo31fast.mp4`,
    poster: '',
    description: 'Zinc metal reacting with hydrochloric acid, releasing rapid streams of hydrogen bubbles',
  },
  31: {
    url: `${BASE_URL}/031-Ga-veo31fast.mp4`,
    poster: '',
    description: 'Solid gallium melting into a mirror-like liquid puddle from body heat alone',
  },
  32: {
    url: `${BASE_URL}/032-Ge-veo31fast.mp4`,
    poster: '',
    description: 'A polished germanium crystal with a dark mirror-like metallic luster',
  },
  33: {
    url: `${BASE_URL}/033-As-veo31fast.mp4`,
    poster: '',
    description: 'Crystalline arsenic sublimating into yellowish vapor and re-depositing inside a sealed glass tube',
  },
  34: {
    url: `${BASE_URL}/034-Se-veo31fast.mp4`,
    poster: '',
    description: 'Vivid red selenium powder heated through dramatic color changes to metallic gray',
  },
  35: {
    url: `${BASE_URL}/035-Br-veo31fast.mp4`,
    poster: '',
    description: 'Bromine liquid releasing dense reddish-brown vapor',
  },
  36: {
    url: `${BASE_URL}/036-Kr-veo31fast.mp4`,
    poster: '',
    description: 'Krypton gas discharge tube glowing with a haunting greenish-white light',
  },
  37: {
    url: `${BASE_URL}/037-Rb-veo31fast.mp4`,
    poster: '',
    description: 'Rubidium metal exploding violently in water with reddish-purple flames',
  },
  38: {
    url: `${BASE_URL}/038-Sr-veo31fast.mp4`,
    poster: '',
    description: 'Strontium metal burning with an intensely brilliant crimson-red flame',
  },
  39: {
    url: `${BASE_URL}/039-Y-veo31fast.mp4`,
    poster: '',
    description: 'Yttrium metal turnings igniting into a blinding white-hot fire',
  },
  40: {
    url: `${BASE_URL}/040-Zr-veo31fast.mp4`,
    poster: '',
    description: 'Zirconium powder igniting into a dazzling white-hot spark fountain',
  },
  41: {
    url: `${BASE_URL}/041-Nb-veo31fast.mp4`,
    poster: '',
    description: 'Niobium disc anodizing through a rainbow of colors as voltage is applied',
  },
  42: {
    url: `${BASE_URL}/042-Mo-veo31fast.mp4`,
    poster: '',
    description: 'Molybdenum rod glowing white-hot in a vacuum chamber, remaining solid at extreme temperature',
  },
  43: {
    url: `${BASE_URL}/043-Tc-veo31fast.mp4`,
    poster: '',
    description: 'Technetium metal tarnishing in time-lapse inside a sealed ampoule with a faint Cherenkov-blue shimmer',
  },
  44: {
    url: `${BASE_URL}/044-Ru-veo31fast.mp4`,
    poster: '',
    description: 'Polished ruthenium metal oxidizing from mirror-bright silver to deep matte black at high temperature',
  },
  45: {
    url: `${BASE_URL}/045-Rh-veo31fast.mp4`,
    poster: '',
    description: 'Molten rhodium cooling from white-hot liquid to a flawless mirror-finish solid',
  },
  46: {
    url: `${BASE_URL}/046-Pd-veo31fast.mp4`,
    poster: '',
    description: 'Palladium foil absorbing and releasing hydrogen gas, visibly swelling and contracting',
  },
  47: {
    url: `${BASE_URL}/047-Ag-veo31fast.mp4`,
    poster: '',
    description: 'Molten silver poured in a glowing stream, cooling to a brilliant mirror finish',
  },
  48: {
    url: `${BASE_URL}/048-Cd-veo31fast.mp4`,
    poster: '',
    description: 'Cadmium metal melting and releasing thick, vivid yellow vapor',
  },
  49: {
    url: `${BASE_URL}/049-In-veo31fast.mp4`,
    poster: '',
    description: 'Soft indium metal bending like putty, then melting into a shimmering liquid pool',
  },
  50: {
    url: `${BASE_URL}/050-Sn-veo31fast.mp4`,
    poster: '',
    description: 'Polished tin disintegrating into grey powder as tin pest spreads across its surface',
  },
  51: {
    url: `${BASE_URL}/051-Sb-veo31fast.mp4`,
    poster: '',
    description: 'Antimony metal shattering like glass under a hammer, revealing crystalline layers',
  },
  52: {
    url: `${BASE_URL}/052-Te-veo31fast.mp4`,
    poster: '',
    description: 'Crystalline tellurium burning with a vivid blue-green flame and billowing white smoke',
  },
  53: {
    url: `${BASE_URL}/053-I-veo31fast.mp4`,
    poster: '',
    description: 'Iodine crystals sublimating into rich purple-violet vapor that fills a glass flask',
  },
  54: {
    url: `${BASE_URL}/054-Xe-veo31fast.mp4`,
    poster: '',
    description: 'Xenon gas discharge tube erupting with an intense blue-lavender plasma glow',
  },
  55: {
    url: `${BASE_URL}/055-Cs-veo31fast.mp4`,
    poster: '',
    description: 'Cesium metal exploding violently on contact with water in a brilliant white-hot flash',
  },
  56: {
    url: `${BASE_URL}/056-Ba-veo31fast.mp4`,
    poster: '',
    description: 'Barium chloride producing a vivid emerald green flame in a Bunsen burner',
  },
  57: {
    url: `${BASE_URL}/057-La-veo31fast.mp4`,
    poster: '',
    description: 'Pyrophoric lanthanum filings self-igniting into a shower of white-hot sparks mid-air',
  },
  58: {
    url: `${BASE_URL}/058-Ce-veo31fast.mp4`,
    poster: '',
    description: 'Ferrocerium rod struck by steel, erupting in a cascade of brilliant white-hot sparks',
  },
  59: {
    url: `${BASE_URL}/059-Pr-veo31fast.mp4`,
    poster: '',
    description: 'Freshly cut praseodymium rapidly developing a vivid green oxide layer in time-lapse',
  },
  60: {
    url: `${BASE_URL}/060-Nd-veo31fast.mp4`,
    poster: '',
    description: 'Two powerful neodymium magnets crushing an apple between them with explosive force',
  },
  61: {
    url: `${BASE_URL}/061-Pm-veo31fast.mp4`,
    poster: '',
    description: 'Promethium salt crystals glowing with an eerie pale blue-green radioactive luminescence',
  },
  62: {
    url: `${BASE_URL}/062-Sm-veo31fast.mp4`,
    poster: '',
    description: 'Red-hot samarium-cobalt magnet still attracting iron filings at extreme temperature',
  },
  63: {
    url: `${BASE_URL}/063-Eu-veo31fast.mp4`,
    poster: '',
    description: 'Europium oxide erupting with brilliant red phosphorescence under UV light',
  },
  64: {
    url: `${BASE_URL}/064-Gd-veo31fast.mp4`,
    poster: '',
    description: 'Gadolinium releasing from a magnet as gentle warmth switches off its ferromagnetism',
  },
  65: {
    url: `${BASE_URL}/065-Tb-veo31fast.mp4`,
    poster: '',
    description: 'Terbium-doped material erupting with intense electric green fluorescence under UV light',
  },
  66: {
    url: `${BASE_URL}/066-Dy-veo31fast.mp4`,
    poster: '',
    description: 'Dysprosium alloy rod visibly stretching and contracting with magnetic pulses',
  },
  67: {
    url: `${BASE_URL}/067-Ho-veo31fast.mp4`,
    poster: '',
    description: 'Rich brownish-pink holmium chloride solution poured between beakers',
  },
  68: {
    url: `${BASE_URL}/068-Er-veo31fast.mp4`,
    poster: '',
    description: 'Rose-pink erbium-doped glass erupting with pink fluorescence from a green laser beam',
  },
  69: {
    url: `${BASE_URL}/069-Tm-veo31fast.mp4`,
    poster: '',
    description: 'Thulium-doped material glowing ice-blue under UV alongside red europium and green terbium',
  },
  72: {
    url: `${BASE_URL}/072-Hf-veo31fast.mp4`,
    poster: '',
    description: 'Pyrophoric hafnium powder igniting spontaneously into white-hot sparks and flames',
  },
  73: {
    url: `${BASE_URL}/073-Ta-veo31fast.mp4`,
    poster: '',
    description: 'Polished tantalum bar sitting untouched in fuming concentrated hydrochloric acid',
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
