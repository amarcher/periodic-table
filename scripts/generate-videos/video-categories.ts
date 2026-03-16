import type { ElementCategory } from '../../src/types/element.ts';

export type VideoType =
  | 'water-reaction'
  | 'flame-test'
  | 'metal-property'
  | 'phase-transition'
  | 'crystal-structure'
  | 'signature-reaction'
  | 'gas-volatility'
  | 'discharge-glow'
  | 'magnetic-luminescent'
  | 'radioactive-decay';

export interface VideoCategory {
  videoType: VideoType;
  promptTemplate: string;
}

export const VIDEO_CATEGORIES: Record<ElementCategory, VideoCategory> = {
  'alkali-metal': {
    videoType: 'water-reaction',
    promptTemplate:
      'Extreme close-up slow-motion of a chunk of {name} metal dropping into water and reacting violently. The metal ignites on contact, skittering across the surface with intense {flameColor} flames, hissing, bubbling furiously, and shooting sparks. The reaction is explosive and dramatic. Water splashes upward. Contained inside a clear glass bowl on a dark laboratory bench. Moody cinematic lighting, dark background.',
  },
  'alkaline-earth-metal': {
    videoType: 'flame-test',
    promptTemplate:
      'A Bunsen burner flame erupting into a vivid, intense {flameColor} color as {name} ({symbol}) is introduced. The entire flame transforms dramatically, the {flameColor} light illuminating the surrounding glass and casting colored reflections. The flame dances and flickers intensely. Extreme close-up, dark background, cinematic macro lens.',
  },
  'transition-metal': {
    videoType: 'metal-property',
    promptTemplate:
      'Dramatic cinematic close-up of {name} ({symbol}), {appearance}, {propertyAction}. Vivid detail, dynamic motion, soft reflections, dark laboratory background, macro lens with shallow depth of field.',
  },
  'post-transition-metal': {
    videoType: 'phase-transition',
    promptTemplate:
      'Mesmerizing close-up of {name} ({symbol}), {appearance}, {transitionAction}. The transformation is clearly visible and dramatic. Clean dark laboratory setting, macro lens, soft cinematic lighting.',
  },
  metalloid: {
    videoType: 'crystal-structure',
    promptTemplate:
      'A stunning crystalline structure of {name} ({symbol}) rotating under carefully positioned lighting that catches every facet, revealing its {appearance} surface with brilliant reflections and refractions. Extreme microscopic detail, dark background, cinematic macro lens with bokeh.',
  },
  nonmetal: {
    videoType: 'signature-reaction',
    promptTemplate:
      '{reactionDescription}. The reaction is vivid, dramatic, and clearly visible. Dark laboratory background, cinematic lighting, extreme close-up.',
  },
  halogen: {
    videoType: 'gas-volatility',
    promptTemplate:
      '{volatilityDescription}. The colors are vivid and saturated, with visible motion and turbulence. Dark background, cinematic macro lens, dramatic laboratory lighting.',
  },
  'noble-gas': {
    videoType: 'discharge-glow',
    promptTemplate:
      'A glass discharge tube in a dark room, electricity surging through {name} gas. The tube erupts with brilliant, intense {glowColor} light that illuminates the entire scene, flickering and pulsing with energy. The glow is vivid and saturated, casting {glowColor} reflections on the surrounding glass and surfaces. Extreme close-up, dark background, cinematic lens.',
  },
  lanthanide: {
    videoType: 'magnetic-luminescent',
    promptTemplate:
      'Dramatic close-up of {name} ({symbol}) displaying {lanthanideProperty}. The effect is vivid and visually striking. Dark laboratory background, cinematic lighting, macro lens with shallow depth of field.',
  },
  actinide: {
    videoType: 'radioactive-decay',
    promptTemplate:
      'A dramatic visualization of {name} ({symbol}): {actinideProperty}. Bright, vivid glowing particles and light emanating from {aAppearance} sample. The radioactive energy is palpable and visually intense. Dark background, cinematic volumetric lighting.',
  },
};
