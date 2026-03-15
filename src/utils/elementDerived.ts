import type { Element } from '../types/element';

export interface RadioactivityInfo {
  isRadioactive: boolean;
  level: 'stable' | 'mildly' | 'highly';
}

/**
 * Derive radioactivity/stability from atomic number.
 * - Tc (43) and Pm (61) are the only elements below 84 with no stable isotopes
 * - Elements 84-92 are naturally radioactive
 * - Elements 93+ are all synthetic/highly radioactive
 */
export function getRadioactivity(element: Element): RadioactivityInfo {
  const z = element.atomicNumber;
  if (z >= 93) return { isRadioactive: true, level: 'highly' };
  if (z >= 84 || z === 43 || z === 61) return { isRadioactive: true, level: 'mildly' };
  return { isRadioactive: false, level: 'stable' };
}

export interface ReactivityInfo {
  level: number; // 0-5
  label: string;
  description: string;
}

/**
 * Derive chemical reactivity from category + electronegativity.
 * Returns 0-5 scale where 0 = inert, 5 = explosive.
 */
export function getReactivity(element: Element): ReactivityInfo {
  const { category, electronegativity } = element;

  if (category === 'noble-gas') {
    return { level: 0, label: 'Inert', description: 'Noble gases almost never react' };
  }

  if (category === 'alkali-metal') {
    return { level: 5, label: 'Explosive!', description: 'Reacts violently with water!' };
  }

  if (category === 'halogen') {
    return { level: 4, label: 'Very Reactive', description: 'Halogens grab electrons aggressively' };
  }

  if (category === 'alkaline-earth-metal') {
    return { level: 3, label: 'Reactive', description: 'Reacts with water and acids' };
  }

  if (category === 'nonmetal') {
    const en = electronegativity ?? 2.5;
    if (en >= 3.0) return { level: 4, label: 'Very Reactive', description: 'Highly electronegative and reactive' };
    return { level: 2, label: 'Moderate', description: 'Reacts under the right conditions' };
  }

  if (category === 'actinide') {
    return { level: 3, label: 'Reactive', description: 'Radioactive metals that react with air and water' };
  }

  if (category === 'lanthanide') {
    return { level: 2, label: 'Moderate', description: 'Slowly reacts with air and water' };
  }

  if (category === 'transition-metal') {
    const en = electronegativity ?? 1.5;
    if (en <= 1.3) return { level: 2, label: 'Moderate', description: 'Can react with acids' };
    return { level: 1, label: 'Low', description: 'Mostly stable and resistant' };
  }

  if (category === 'post-transition-metal') {
    return { level: 1, label: 'Low', description: 'Generally stable metals' };
  }

  if (category === 'metalloid') {
    return { level: 1, label: 'Low', description: 'Behaves between metals and nonmetals' };
  }

  return { level: 1, label: 'Low', description: 'Relatively stable' };
}
