export type ElementCategory =
  | 'alkali-metal'
  | 'alkaline-earth-metal'
  | 'transition-metal'
  | 'post-transition-metal'
  | 'metalloid'
  | 'nonmetal'
  | 'halogen'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide';

export interface Element {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: number;
  category: ElementCategory;
  electronConfiguration: string;
  gridRow: number;
  gridColumn: number;
  meltingPoint: number | null;
  boilingPoint: number | null;
  density: number | null;
  electronegativity: number | null;
  discoveredBy: string;
  yearDiscovered: number | string;
  appearance: string;
  summary: string;
  funFacts: string[];
}
