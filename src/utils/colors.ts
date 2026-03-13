import type { ElementCategory } from '../types/element';

export const categoryColors: Record<ElementCategory, string> = {
  'alkali-metal': 'hsl(15, 85%, 55%)',
  'alkaline-earth-metal': 'hsl(40, 85%, 55%)',
  'transition-metal': 'hsl(210, 60%, 55%)',
  'post-transition-metal': 'hsl(170, 50%, 50%)',
  'metalloid': 'hsl(145, 55%, 48%)',
  'nonmetal': 'hsl(55, 80%, 50%)',
  'halogen': 'hsl(330, 70%, 58%)',
  'noble-gas': 'hsl(270, 65%, 60%)',
  'lanthanide': 'hsl(195, 70%, 52%)',
  'actinide': 'hsl(350, 60%, 50%)',
};

export const categoryLabels: Record<ElementCategory, string> = {
  'alkali-metal': 'Alkali Metal',
  'alkaline-earth-metal': 'Alkaline Earth Metal',
  'transition-metal': 'Transition Metal',
  'post-transition-metal': 'Post-Transition Metal',
  'metalloid': 'Metalloid',
  'nonmetal': 'Nonmetal',
  'halogen': 'Halogen',
  'noble-gas': 'Noble Gas',
  'lanthanide': 'Lanthanide',
  'actinide': 'Actinide',
};
