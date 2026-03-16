import type { Element } from '../../types/element';

export type Phase = 'solid' | 'liquid' | 'gas' | 'plasma';

export interface PhasePoint {
  t: number; // Kelvin
  p: number; // atm
}

export interface PhaseDiagramData {
  triplePoint: PhasePoint;
  criticalPoint: PhasePoint;
  solidLiquidCurve: PhasePoint[];
  liquidGasCurve: PhasePoint[];
  solidGasCurve: PhasePoint[];
  tRange: [number, number];
  pRange: [number, number];
  isHelium: boolean;
  hasEstimatedBp: boolean;
}

// Element-specific overrides for well-known phase diagram features
const PHASE_OVERRIDES: Record<number, Partial<{
  triplePointP: number;
  criticalPointT: number;
  criticalPointP: number;
  solidLiquidSlope: number; // negative for water/bismuth (expand on freezing)
}>> = {
  // Hydrogen (H)
  1: { triplePointP: 0.07, criticalPointT: 33, criticalPointP: 12.8 },
  // Helium (He) — special case, handled separately
  2: { criticalPointT: 5.2, criticalPointP: 2.24 },
  // Nitrogen (N)
  7: { triplePointP: 0.125, criticalPointT: 126.2, criticalPointP: 33.5 },
  // Oxygen (O)
  8: { triplePointP: 0.0015, criticalPointT: 154.6, criticalPointP: 50.4 },
  // Bismuth (Bi) — expands on freezing
  83: { solidLiquidSlope: -40, triplePointP: 0.008 },
  // Mercury (Hg)
  80: { triplePointP: 0.000000013, criticalPointT: 1750, criticalPointP: 1587 },
  // Iron (Fe)
  26: { triplePointP: 0.00005, criticalPointT: 9250, criticalPointP: 8700 },
  // Tungsten (W)
  74: { triplePointP: 0.00001, criticalPointT: 13000, criticalPointP: 10000 },
  // Carbon (C) — sublimes at 1 atm
  6: { triplePointP: 108, criticalPointT: 6810, criticalPointP: 2300 },
  // Gallium (Ga) — expands on freezing like water
  31: { solidLiquidSlope: -80 },
};

/**
 * Generate approximate phase diagram data for an element.
 * Returns null if meltingPoint is null.
 */
export function getPhaseData(element: Element): PhaseDiagramData | null {
  if (element.meltingPoint == null) return null;

  const mp = element.meltingPoint;
  const isHelium = element.atomicNumber === 2;
  const overrides = PHASE_OVERRIDES[element.atomicNumber] ?? {};

  // Estimate boiling point if null
  const hasEstimatedBp = element.boilingPoint == null;
  const bp = element.boilingPoint ?? mp * 2.5;

  if (isHelium) {
    return getHeliumData(overrides);
  }

  // Triple point
  const tpT = mp;
  const tpP = overrides.triplePointP ?? 0.006;

  // Critical point
  const cpT = overrides.criticalPointT ?? Math.min(bp * 1.5, 20000);
  const cpP = overrides.criticalPointP ?? 50;

  // Solid-liquid curve: near-vertical from triple point upward
  const slSlope = overrides.solidLiquidSlope ?? 130; // dT/dP in K/atm (positive = normal)
  const solidLiquidCurve = generateSolidLiquidCurve(tpT, tpP, slSlope, cpP * 3);

  // Liquid-gas curve: Clausius-Clapeyron from triple point to critical point
  const liquidGasCurve = generateLiquidGasCurve(tpT, tpP, cpT, cpP);

  // Sublimation curve: from near-zero to triple point
  const solidGasCurve = generateSublimationCurve(tpT, tpP);

  // Axis ranges — always start from absolute zero
  const tMin = 0;
  const tMax = cpT * 1.3;
  const pMin = 0.001;
  const pMax = cpP * 3;

  return {
    triplePoint: { t: tpT, p: tpP },
    criticalPoint: { t: cpT, p: cpP },
    solidLiquidCurve,
    liquidGasCurve,
    solidGasCurve,
    tRange: [tMin, tMax],
    pRange: [pMin, pMax],
    isHelium,
    hasEstimatedBp,
  };
}

function getHeliumData(overrides: Partial<{ criticalPointT: number; criticalPointP: number }>): PhaseDiagramData {
  // Helium has no standard triple point — lambda point at ~2.17K
  // Simplified: just liquid-gas boundary
  const cpT = overrides.criticalPointT ?? 5.2;
  const cpP = overrides.criticalPointP ?? 2.24;

  const liquidGasCurve: PhasePoint[] = [];
  // Approximate He liquid-gas boundary from ~1K to critical point
  const startT = 1;
  for (let i = 0; i <= 20; i++) {
    const frac = i / 20;
    const t = startT + frac * (cpT - startT);
    // Rough Clausius-Clapeyron fit
    const lnP = Math.log(cpP) * (1 - (cpT - t) / (cpT - startT) * 0.95);
    liquidGasCurve.push({ t, p: Math.exp(lnP) });
  }

  return {
    triplePoint: { t: 2.17, p: 0.05 }, // lambda point approximation
    criticalPoint: { t: cpT, p: cpP },
    solidLiquidCurve: [], // He doesn't have normal solid-liquid at low P
    liquidGasCurve,
    solidGasCurve: [],
    tRange: [0, cpT * 1.5],
    pRange: [0.01, cpP * 3],
    isHelium: true,
    hasEstimatedBp: false,
  };
}

function generateSolidLiquidCurve(
  tpT: number, tpP: number, slope: number, maxP: number
): PhasePoint[] {
  const points: PhasePoint[] = [];
  const steps = 15;
  for (let i = 0; i <= steps; i++) {
    const frac = i / steps;
    const p = tpP + frac * (maxP - tpP);
    // T = T_tp + (P - P_tp) / slope
    const t = tpT + (p - tpP) / slope;
    points.push({ t, p });
  }
  return points;
}

function generateLiquidGasCurve(
  tpT: number, tpP: number, cpT: number, cpP: number
): PhasePoint[] {
  // Clausius-Clapeyron: ln(P) = A - B/T
  // Fit through triple point and critical point
  const B = (Math.log(cpP) - Math.log(tpP)) / (1 / tpT - 1 / cpT);
  const A = Math.log(tpP) + B / tpT;

  const points: PhasePoint[] = [];
  const steps = 25;
  for (let i = 0; i <= steps; i++) {
    const frac = i / steps;
    const t = tpT + frac * (cpT - tpT);
    const p = Math.exp(A - B / t);
    points.push({ t, p });
  }
  return points;
}

function generateSublimationCurve(tpT: number, tpP: number): PhasePoint[] {
  // Sublimation curve from near absolute zero to triple point
  // Steeper Clausius-Clapeyron (higher latent heat for sublimation)
  const startT = Math.max(tpT * 0.05, 1);
  const startP = tpP * 1e-8;

  const B = (Math.log(tpP) - Math.log(startP)) / (1 / startT - 1 / tpT);
  const A = Math.log(tpP) + B / tpT;

  const points: PhasePoint[] = [];
  const steps = 16;
  for (let i = 0; i <= steps; i++) {
    const frac = i / steps;
    const t = startT + frac * (tpT - startT);
    const p = Math.exp(A - B / t);
    points.push({ t, p });
  }
  return points;
}

/**
 * Determine what phase an element is in at given T and P.
 */
export function getPhaseAtPoint(data: PhaseDiagramData, t: number, p: number): Phase {
  if (data.isHelium) {
    return getHeliumPhase(data, t, p);
  }

  const { triplePoint: tp, criticalPoint: cp } = data;

  // Above critical point: supercritical (show as gas)
  if (t >= cp.t && p >= cp.p) return 'gas';

  // Above critical temperature: always gas
  if (t >= cp.t) return 'gas';

  // Below triple point temperature: solid or gas (sublimation region)
  if (t <= tp.t) {
    // Find sublimation pressure at this temperature
    const subP = interpolateCurveP(data.solidGasCurve, t);
    if (subP == null) return p > tp.p ? 'solid' : 'gas';
    return p >= subP ? 'solid' : 'gas';
  }

  // Between triple and critical temperature
  // Check solid-liquid boundary
  const slT = interpolateCurveT(data.solidLiquidCurve, p);
  if (slT != null && t <= slT) return 'solid';

  // Check liquid-gas boundary
  const lgP = interpolateCurveP(data.liquidGasCurve, t);
  if (lgP != null && p >= lgP) return 'liquid';

  return 'gas';
}

function getHeliumPhase(data: PhaseDiagramData, t: number, p: number): Phase {
  // Simplified: above liquid-gas curve = liquid, below = gas
  const lgP = interpolateCurveP(data.liquidGasCurve, t);
  if (t > data.criticalPoint.t) return 'gas';
  if (lgP != null && p >= lgP) return 'liquid';
  return 'gas';
}

/** Interpolate pressure on a curve at a given temperature */
function interpolateCurveP(curve: PhasePoint[], t: number): number | null {
  if (curve.length < 2) return null;
  for (let i = 0; i < curve.length - 1; i++) {
    const a = curve[i], b = curve[i + 1];
    const tMin = Math.min(a.t, b.t), tMax = Math.max(a.t, b.t);
    if (t >= tMin && t <= tMax) {
      const frac = (t - a.t) / (b.t - a.t);
      return a.p + frac * (b.p - a.p);
    }
  }
  return null;
}

/** Interpolate temperature on a curve at a given pressure */
function interpolateCurveT(curve: PhasePoint[], p: number): number | null {
  if (curve.length < 2) return null;
  for (let i = 0; i < curve.length - 1; i++) {
    const a = curve[i], b = curve[i + 1];
    const pMin = Math.min(a.p, b.p), pMax = Math.max(a.p, b.p);
    if (p >= pMin && p <= pMax) {
      const frac = (p - a.p) / (b.p - a.p);
      return a.t + frac * (b.t - a.t);
    }
  }
  return null;
}

/**
 * Get approximate centroid of a phase region for preview placement.
 * Returns coordinates in T/P space.
 */
export function getRegionCentroid(data: PhaseDiagramData, phase: Phase): PhasePoint {
  const { triplePoint: tp, criticalPoint: cp, tRange, pRange } = data;

  switch (phase) {
    case 'solid':
      return {
        t: tp.t * 0.65,
        p: Math.sqrt(pRange[0] * pRange[1]) * 5,
      };
    case 'liquid':
      return {
        t: (tp.t + cp.t) * 0.5,
        p: Math.sqrt(tp.p * cp.p) * 1.5,
      };
    case 'gas':
      return {
        t: cp.t * 0.8,
        p: Math.sqrt(pRange[0] * tp.p) * 0.5,
      };
    case 'plasma':
      return {
        t: tRange[1] * 0.85,
        p: pRange[1] * 0.5,
      };
  }
}
