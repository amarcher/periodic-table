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

export interface AtomViewMode {
  valenceOnly: boolean;
  orbitalFilter: OrbitalFilter;
  showUnfilled: boolean;
}

export const DEFAULT_VIEW_MODE: AtomViewMode = {
  valenceOnly: false,
  orbitalFilter: null,
  showUnfilled: false,
};

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
