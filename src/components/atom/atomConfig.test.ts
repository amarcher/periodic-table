import { describe, it, expect } from 'vitest';
import {
  getAtomConfig,
  getValenceBoundingRadius,
  getValenceElectronCount,
  getHybridAxes,
  distributeHybridElectrons,
  HYBRIDIZABLE,
} from './atomConfig';

describe('HYBRIDIZABLE', () => {
  it('includes 2nd-period p-block B–F and 3rd-period Si–S', () => {
    for (const z of [5, 6, 7, 8, 9, 14, 15, 16]) {
      expect(HYBRIDIZABLE.has(z)).toBe(true);
    }
  });

  it('excludes H, He, alkali/alkaline-earth, noble gases, transition metals', () => {
    for (const z of [1, 2, 3, 4, 10, 11, 12, 13, 17, 18, 19, 20, 26, 30, 92]) {
      expect(HYBRIDIZABLE.has(z)).toBe(false);
    }
  });
});

describe('getValenceBoundingRadius', () => {
  it('returns the outermost subshell radius (× 1.15 pad)', () => {
    const cases = [1, 6, 26, 92];
    for (const z of cases) {
      const cfg = getAtomConfig(z);
      const outermost = Math.max(...cfg.subshells.map((s) => s.radius));
      expect(getValenceBoundingRadius(cfg.subshells)).toBeCloseTo(outermost * 1.15, 5);
    }
  });

  it('returns 2 when there are no subshells', () => {
    expect(getValenceBoundingRadius([])).toBe(2);
  });
});

describe('getValenceElectronCount', () => {
  it('counts electrons in the highest-n shell only', () => {
    expect(getValenceElectronCount(getAtomConfig(1).subshells)).toBe(1); // H: 1s¹
    expect(getValenceElectronCount(getAtomConfig(2).subshells)).toBe(2); // He: 1s²
    expect(getValenceElectronCount(getAtomConfig(6).subshells)).toBe(4); // C: 2s²2p²
    expect(getValenceElectronCount(getAtomConfig(10).subshells)).toBe(8); // Ne: 2s²2p⁶
  });
});

describe('getHybridAxes', () => {
  it('sp³ lobe unit vectors have pairwise dot product -1/3 (tetrahedral)', () => {
    const { hybrid } = getHybridAxes('sp3');
    expect(hybrid).toHaveLength(4);
    for (let i = 0; i < hybrid.length; i++) {
      for (let j = i + 1; j < hybrid.length; j++) {
        const [ax, ay, az] = hybrid[i];
        const [bx, by, bz] = hybrid[j];
        const dot = ax * bx + ay * by + az * bz;
        expect(dot).toBeCloseTo(-1 / 3, 5);
      }
    }
  });

  it('sp² hybrid lobes are coplanar (y=0) and 120° apart', () => {
    const { hybrid, pPairs } = getHybridAxes('sp2');
    expect(hybrid).toHaveLength(3);
    for (const [, y] of hybrid) expect(y).toBeCloseTo(0, 6);
    const dot01 = hybrid[0][0] * hybrid[1][0] + hybrid[0][2] * hybrid[1][2];
    expect(dot01).toBeCloseTo(-0.5, 5); // cos(120°)
    expect(pPairs).toHaveLength(1); // one unhybridized p dumbbell
  });

  it('sp hybrid lobes are axial with 2 unhybridized p-dumbbells', () => {
    const { hybrid, pPairs } = getHybridAxes('sp');
    expect(hybrid).toHaveLength(2);
    const dot = hybrid[0][0] * hybrid[1][0];
    expect(dot).toBeCloseTo(-1, 5); // antiparallel
    expect(pPairs).toHaveLength(2);
  });
});

describe('distributeHybridElectrons', () => {
  it("follows Hund's rule — singles first, then pairs", () => {
    expect(distributeHybridElectrons(4, 4)).toEqual([1, 1, 1, 1]); // C sp³
    expect(distributeHybridElectrons(4, 4 /* N-like extra */)).toEqual([1, 1, 1, 1]);
    expect(distributeHybridElectrons(5, 4)).toEqual([2, 1, 1, 1]); // N sp³: one lone pair
    expect(distributeHybridElectrons(6, 4)).toEqual([2, 2, 1, 1]); // O sp³: two lone pairs
    expect(distributeHybridElectrons(3, 3)).toEqual([1, 1, 1]); // B sp²
  });
});
