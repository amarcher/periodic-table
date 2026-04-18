import type { ElementCategory } from '../../types/element';

export type OrbitalType = 's' | 'p' | 'd' | 'f';

export interface SubshellConfig {
  /** Principal quantum number (1-7) */
  n: number;
  /** Orbital type */
  type: OrbitalType;
  /** How many electrons in this subshell (1 up to max) */
  electronCount: number;
  /** Max electrons for this subshell type */
  maxElectrons: number;
  /** Visual radius from nucleus */
  radius: number;
}

export interface AtomConfig {
  subshells: SubshellConfig[];
  nucleusRadius: number;
  showIndividualNucleons: boolean;
  protons: number;
}

// Aufbau filling order: [n, type, maxElectrons]
const fillingOrder: [number, OrbitalType, number][] = [
  [1, 's', 2],
  [2, 's', 2],
  [2, 'p', 6],
  [3, 's', 2],
  [3, 'p', 6],
  [4, 's', 2],
  [3, 'd', 10],
  [4, 'p', 6],
  [5, 's', 2],
  [4, 'd', 10],
  [5, 'p', 6],
  [6, 's', 2],
  [4, 'f', 14],
  [5, 'd', 10],
  [6, 'p', 6],
  [7, 's', 2],
  [5, 'f', 14],
  [6, 'd', 10],
  [7, 'p', 6],
];

export function getAtomConfig(atomicNumber: number): AtomConfig {
  const subshells: SubshellConfig[] = [];
  let remaining = atomicNumber;

  for (const [n, type, max] of fillingOrder) {
    if (remaining <= 0) break;
    const count = Math.min(remaining, max);
    remaining -= count;

    // Radius based on principal quantum number, offset by subshell type
    const typeOffset = type === 's' ? 0 : type === 'p' ? 0.3 : type === 'd' ? 0.6 : 0.9;
    const radius = 1.2 + (n - 1) * 0.9 + typeOffset;

    subshells.push({ n, type, electronCount: count, maxElectrons: max, radius });
  }

  const showIndividualNucleons = atomicNumber <= 4;
  const nucleusRadius = showIndividualNucleons
    ? 0.3 + atomicNumber * 0.1
    : 0.5 + Math.log(atomicNumber) * 0.2;

  return { subshells, nucleusRadius, showIndividualNucleons, protons: atomicNumber };
}

export type CategoryEffect = 'aura' | 'sparks' | 'metallic' | 'pulse' | 'shimmer' | 'none';

export function getCategoryEffect(category: ElementCategory): CategoryEffect {
  switch (category) {
    case 'noble-gas': return 'aura';
    case 'alkali-metal': return 'sparks';
    case 'transition-metal': return 'metallic';
    case 'halogen': return 'pulse';
    case 'alkaline-earth-metal': return 'shimmer';
    case 'post-transition-metal': return 'shimmer';
    case 'metalloid': return 'shimmer';
    case 'nonmetal': return 'shimmer';
    case 'lanthanide': return 'shimmer';
    case 'actinide': return 'shimmer';
    default: return 'none';
  }
}

export type OrbitalFilter = 's' | 'p' | 'd' | 'f' | null;

export type Hybridization = 'sp' | 'sp2' | 'sp3' | null;

export interface AtomViewMode {
  valenceOnly: boolean;
  orbitalFilter: OrbitalFilter;
  showUnfilled: boolean;
  hybridization: Hybridization;
}

export const DEFAULT_VIEW_MODE: AtomViewMode = {
  valenceOnly: false,
  orbitalFilter: null,
  showUnfilled: false,
  hybridization: null,
};

/**
 * Elements that get the sp/sp²/sp³ hybridization control. Limited to p-block
 * elements that meaningfully hybridize in covalent bonding: 2nd period B–F and
 * 3rd period Si–S. Deliberately excludes H/He, alkali/alkaline earth metals,
 * noble gases, transition metals, and post-transition metals where the concept
 * either doesn't apply or is pedagogically muddier.
 */
export const HYBRIDIZABLE = new Set<number>([5, 6, 7, 8, 9, 14, 15, 16]);

export interface HybridAxes {
  /** unit vectors along each hybrid lobe direction */
  hybrid: [number, number, number][];
  /** pairs of opposite unit vectors for each unhybridized p orbital (2 lobes) */
  pPairs: [[number, number, number], [number, number, number]][];
}

export function getHybridAxes(mode: Hybridization): HybridAxes {
  const SQRT3 = Math.sqrt(3);
  const INV_SQRT3 = 1 / SQRT3;
  switch (mode) {
    case 'sp3':
      return {
        hybrid: [
          [INV_SQRT3, INV_SQRT3, INV_SQRT3],
          [INV_SQRT3, -INV_SQRT3, -INV_SQRT3],
          [-INV_SQRT3, INV_SQRT3, -INV_SQRT3],
          [-INV_SQRT3, -INV_SQRT3, INV_SQRT3],
        ],
        pPairs: [],
      };
    case 'sp2':
      return {
        hybrid: [
          [1, 0, 0],
          [-0.5, 0, SQRT3 / 2],
          [-0.5, 0, -SQRT3 / 2],
        ],
        pPairs: [[[0, 1, 0], [0, -1, 0]]],
      };
    case 'sp':
      return {
        hybrid: [
          [1, 0, 0],
          [-1, 0, 0],
        ],
        pPairs: [
          [[0, 1, 0], [0, -1, 0]],
          [[0, 0, 1], [0, 0, -1]],
        ],
      };
    default:
      return { hybrid: [], pPairs: [] };
  }
}

/**
 * Distribute electrons across orbitals by Hund's rule — one electron per orbital
 * first, then pair up. Used for hybridization electron assignment.
 */
export function distributeHybridElectrons(totalElectrons: number, nOrbitals: number): number[] {
  const result = new Array(nOrbitals).fill(0);
  let rem = totalElectrons;
  for (let i = 0; i < nOrbitals && rem > 0; i++) { result[i] = 1; rem--; }
  for (let i = 0; i < nOrbitals && rem > 0; i++) { result[i] = 2; rem--; }
  return result;
}

/**
 * Number of electrons in the outermost (highest-n) shell — the count that gets
 * distributed into hybrid + unhybridized-p orbitals.
 */
export function getValenceElectronCount(subshells: SubshellConfig[]): number {
  if (subshells.length === 0) return 0;
  const maxN = Math.max(...subshells.map(s => s.n));
  return subshells
    .filter(s => s.n === maxN)
    .reduce((sum, s) => sum + s.electronCount, 0);
}

/**
 * Returns indices of valence subshells:
 * - All subshells at the highest principal quantum number n
 * - Any subshell that is not fully filled (incomplete d/f in transition metals)
 */
export function getValenceIndices(subshells: SubshellConfig[]): Set<number> {
  if (subshells.length === 0) return new Set();
  const maxN = Math.max(...subshells.map(s => s.n));
  const indices = new Set<number>();
  subshells.forEach((s, i) => {
    if (s.n === maxN || s.electronCount < s.maxElectrons) {
      indices.add(i);
    }
  });
  return indices;
}

/**
 * Radius of the sphere that tightly wraps every valence subshell. Used by the
 * camera to fly in when "Valence" is toggled. Pads lobe tips (p/d/f extend past
 * the nominal radius due to the petal floor).
 */
export function getValenceBoundingRadius(subshells: SubshellConfig[]): number {
  const valence = getValenceIndices(subshells);
  if (valence.size === 0) return 2;
  let maxR = 0;
  valence.forEach(i => {
    const r = subshells[i].radius;
    if (r > maxR) maxR = r;
  });
  return maxR * 1.15;
}

/**
 * Check whether any valence subshell has unfilled slots.
 */
export function hasUnfilledValence(subshells: SubshellConfig[]): boolean {
  const valence = getValenceIndices(subshells);
  for (const i of valence) {
    if (subshells[i].electronCount < subshells[i].maxElectrons) return true;
  }
  return false;
}

export type DetailLevel = 'high' | 'medium' | 'low';

export function getDetailLevel(atomicNumber: number): DetailLevel {
  if (atomicNumber <= 18) return 'high';
  if (atomicNumber <= 54) return 'medium';
  return 'low';
}
