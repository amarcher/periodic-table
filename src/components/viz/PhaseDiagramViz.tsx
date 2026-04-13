import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { Element } from '../../types/element';
import { getPhaseData, getPhaseAtPoint } from './phase-data';
import type { PhaseDiagramData, PhasePoint } from './phase-data';
import { trackPhaseDiagramUsed } from '../../utils/analytics';
import './PhaseDiagramViz.css';

interface Props {
  element: Element;
  catColor: string;
}

const SVG_W = 300;
const SVG_H = 200;
const PAD = { top: 8, right: 8, bottom: 4, left: 4 };
const xMin = PAD.left;
const xMax = SVG_W - PAD.right;
const yMin = PAD.top;
const yMax = SVG_H - PAD.bottom;

const PHASE_LABELS: Record<string, string> = {
  solid: 'Solid',
  liquid: 'Liquid',
  gas: 'Gas',
  plasma: 'Plasma',
};

type TempUnit = 'C' | 'F';

function kelvinToDisplay(k: number, unit: TempUnit): string {
  if (unit === 'F') return `${Math.round(k * 9 / 5 - 459.67)}°F`;
  return `${Math.round(k - 273)}°C`;
}

/** Parse catColor (hsl string) into [h, s, l] numbers */
function parseHSL(hsl: string): [number, number, number] {
  const m = hsl.match(/hsl\(\s*(\d+),\s*(\d+)%?,\s*(\d+)%?\)/);
  if (!m) return [210, 60, 55];
  return [parseInt(m[1]), parseInt(m[2]), parseInt(m[3])];
}

export function PhaseDiagramViz({ element, catColor }: Props) {
  const uid = useId();
  const data = useMemo(() => getPhaseData(element), [element]);
  const [temp, setTemp] = useState(293);
  const [pressure, setPressure] = useState(1);
  const [tempUnit, setTempUnit] = useState<TempUnit>('C');
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const hasInteracted = useRef(false);

  // Track phase diagram interaction on unmount
  useEffect(() => {
    const el = element;
    return () => {
      if (hasInteracted.current) {
        trackPhaseDiagramUsed(el.symbol, el.atomicNumber);
      }
    };
  }, [element]);

  const tToX = useCallback((t: number) => {
    if (!data) return 0;
    const [tMin, tMax] = data.tRange;
    return PAD.left + ((t - tMin) / (tMax - tMin)) * (SVG_W - PAD.left - PAD.right);
  }, [data]);

  const pToY = useCallback((p: number) => {
    if (!data) return 0;
    const [pMin, pMax] = data.pRange;
    const logMin = Math.log10(pMin);
    const logMax = Math.log10(pMax);
    const logP = Math.log10(Math.max(p, pMin));
    return PAD.top + (1 - (logP - logMin) / (logMax - logMin)) * (SVG_H - PAD.top - PAD.bottom);
  }, [data]);

  const xToT = useCallback((x: number) => {
    if (!data) return 293;
    const [tMin, tMax] = data.tRange;
    const frac = (x - PAD.left) / (SVG_W - PAD.left - PAD.right);
    return tMin + Math.max(0, Math.min(1, frac)) * (tMax - tMin);
  }, [data]);

  const yToP = useCallback((y: number) => {
    if (!data) return 1;
    const [pMin, pMax] = data.pRange;
    const logMin = Math.log10(pMin);
    const logMax = Math.log10(pMax);
    const frac = 1 - (y - PAD.top) / (SVG_H - PAD.top - PAD.bottom);
    const logP = logMin + Math.max(0, Math.min(1, frac)) * (logMax - logMin);
    return Math.pow(10, logP);
  }, [data]);

  const pointerToTP = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const ctm = svg.getScreenCTM();
    if (!ctm) return null;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgPt = pt.matrixTransform(ctm.inverse());
    return { t: xToT(svgPt.x), p: yToP(svgPt.y) };
  }, [xToT, yToP]);

  const handlePointerDown = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    dragging.current = true;
    hasInteracted.current = true;
    (e.target as SVGElement).setPointerCapture(e.pointerId);
    const tp = pointerToTP(e);
    if (tp) { setTemp(tp.t); setPressure(tp.p); }
  }, [pointerToTP]);

  const handlePointerMove = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const tp = pointerToTP(e);
    if (tp) { setTemp(tp.t); setPressure(tp.p); }
  }, [pointerToTP]);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!data) return;
    const [tMin, tMax] = data.tRange;
    const [pMin, pMax] = data.pRange;
    const tStep = (tMax - tMin) / 40;
    const pFactor = 1.15;
    let handled = true;
    hasInteracted.current = true;
    switch (e.key) {
      case 'ArrowRight': setTemp(t => Math.min(t + tStep, tMax)); break;
      case 'ArrowLeft': setTemp(t => Math.max(t - tStep, tMin)); break;
      case 'ArrowUp': setPressure(p => Math.min(p * pFactor, pMax)); break;
      case 'ArrowDown': setPressure(p => Math.max(p / pFactor, pMin)); break;
      default: handled = false;
    }
    if (handled) e.preventDefault();
  }, [data]);

  // Build region polygon paths
  const regionPaths = useMemo(() => {
    if (!data) return { solid: '', liquid: '', gas: '' };
    return buildRegionPaths(data, tToX, pToY);
  }, [data, tToX, pToY]);

  if (!data) return null;

  const phase = getPhaseAtPoint(data, temp, pressure);
  const cx = tToX(temp);
  const cy = pToY(pressure);

  const [h, s, l] = parseHSL(catColor);
  // Phase-specific fills: tinted by element color
  const solidFill = `hsla(${(h + 220) * 0.5 | 0}, ${Math.min(s + 10, 80)}%, ${l - 5}%, 0.22)`;
  const liquidFill = `hsla(${(h + 195) * 0.5 | 0}, ${Math.min(s + 5, 75)}%, ${l}%, 0.18)`;
  const gasFill = `hsla(${(h + 40) * 0.5 | 0}, ${Math.min(s - 5, 70)}%, ${l + 8}%, 0.12)`;

  const mpDisplay = kelvinToDisplay(element.meltingPoint!, tempUnit);
  const bpDisplay = element.boilingPoint != null ? kelvinToDisplay(element.boilingPoint, tempUnit) : null;
  const tempDisplay = kelvinToDisplay(temp, tempUnit);

  const roomX = tToX(293);
  const roomY = pToY(1);

  // Gradient IDs unique per instance
  const solidGradId = `solid-grad-${uid}`;
  const liquidGradId = `liquid-grad-${uid}`;
  const gasGradId = `gas-grad-${uid}`;
  const solidPatId = `solid-pat-${uid}`;
  const liquidPatId = `liquid-pat-${uid}`;
  const gasPatId = `gas-pat-${uid}`;

  return (
    <div
      className="pdviz"
      style={{ '--cat-color': catColor } as React.CSSProperties}
    >
      <div className="pdviz__header">
        <span className="pdviz__label">Phase Diagram</span>
        <div className="pdviz__controls">
          {(temp !== 293 || pressure !== 1) && (
            <button
              className="pdviz__reset"
              onClick={() => { setTemp(293); setPressure(1); }}
              aria-label="Reset to room temperature and pressure"
            >
              Reset
            </button>
          )}
          <button
            className="pdviz__unit-toggle"
            onClick={() => setTempUnit(u => u === 'C' ? 'F' : 'C')}
            aria-label={`Switch to degrees ${tempUnit === 'C' ? 'Fahrenheit' : 'Celsius'}`}
          >
            °{tempUnit}
          </button>
          <span className="pdviz__readout">
            {tempDisplay} · {formatPressure(pressure)}
          </span>
        </div>
      </div>

      <div className="pdviz__chart-area">
        <input
          type="range"
          className="pdviz__slider-y"
          min={Math.log10(data.pRange[0])}
          max={Math.log10(data.pRange[1])}
          step={0.01}
          value={Math.log10(pressure)}
          onChange={e => { hasInteracted.current = true; setPressure(Math.pow(10, parseFloat(e.target.value))); }}
          aria-label="Pressure"
        />

        <div className="pdviz__chart">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            role="application"
            aria-label={`Phase diagram for ${element.name}. Use arrow keys or drag to explore temperature and pressure.`}
            tabIndex={0}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={handleKeyDown}
          >
            <defs>
              {/* Solid: crystalline texture gradient */}
              <linearGradient id={solidGradId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={solidFill} />
                <stop offset="40%" stopColor={solidFill.replace(/[\d.]+\)$/, '0.30)')} />
                <stop offset="60%" stopColor={solidFill.replace(/[\d.]+\)$/, '0.16)')} />
                <stop offset="100%" stopColor={solidFill.replace(/[\d.]+\)$/, '0.28)')} />
              </linearGradient>
              {/* Solid: crystalline lattice pattern */}
              <pattern id={solidPatId} width="12" height="12" patternUnits="userSpaceOnUse">
                <rect width="12" height="12" fill={`url(#${solidGradId})`} />
                <rect x="1" y="1" width="5" height="5" rx="1" fill="rgba(255,255,255,0.06)" />
                <rect x="6" y="6" width="5" height="5" rx="1" fill="rgba(255,255,255,0.04)" />
              </pattern>

              {/* Liquid: flowing wave gradient */}
              <linearGradient id={liquidGradId} x1="0" y1="0" x2="0.3" y2="1">
                <stop offset="0%" stopColor={liquidFill.replace(/[\d.]+\)$/, '0.28)')} />
                <stop offset="30%" stopColor={liquidFill} />
                <stop offset="50%" stopColor={liquidFill.replace(/[\d.]+\)$/, '0.25)')} />
                <stop offset="70%" stopColor={liquidFill} />
                <stop offset="100%" stopColor={liquidFill.replace(/[\d.]+\)$/, '0.22)')} />
              </linearGradient>
              {/* Liquid: wavy stripes pattern */}
              <pattern id={liquidPatId} width="40" height="10" patternUnits="userSpaceOnUse">
                <rect width="40" height="10" fill={`url(#${liquidGradId})`} />
                <path d="M0,5 Q10,2 20,5 Q30,8 40,5" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" fill="none" />
              </pattern>

              {/* Gas: dispersed particle pattern */}
              <radialGradient id={gasGradId} cx="0.6" cy="0.5" r="0.7">
                <stop offset="0%" stopColor={gasFill.replace(/[\d.]+\)$/, '0.04)')} />
                <stop offset="100%" stopColor={gasFill} />
              </radialGradient>
              <pattern id={gasPatId} width="18" height="18" patternUnits="userSpaceOnUse">
                <rect width="18" height="18" fill={`url(#${gasGradId})`} />
                <circle cx="5" cy="4" r="1.5" fill="rgba(255,255,255,0.04)" />
                <circle cx="14" cy="10" r="1" fill="rgba(255,255,255,0.03)" />
                <circle cx="9" cy="15" r="1.2" fill="rgba(255,255,255,0.035)" />
              </pattern>
            </defs>

            {/* Phase region fills — clipped to boundary polygons */}
            {regionPaths.solid && (
              <path d={regionPaths.solid} fill={`url(#${solidPatId})`} className="pdviz__region pdviz__region--solid" />
            )}
            {regionPaths.liquid && (
              <path d={regionPaths.liquid} fill={`url(#${liquidPatId})`} className="pdviz__region pdviz__region--liquid" />
            )}
            {regionPaths.gas && (
              <path d={regionPaths.gas} fill={`url(#${gasPatId})`} className="pdviz__region pdviz__region--gas" />
            )}

            {/* Phase region labels */}
            <PhaseRegionLabels data={data} tToX={tToX} pToY={pToY} />

            {/* Boundary curves */}
            <CurvePath points={data.solidGasCurve} tToX={tToX} pToY={pToY} className="pdviz__curve pdviz__curve--sublimation" />
            <CurvePath points={data.liquidGasCurve} tToX={tToX} pToY={pToY} className="pdviz__curve pdviz__curve--vaporization" />
            {data.solidLiquidCurve.length > 0 && (
              <CurvePath points={data.solidLiquidCurve} tToX={tToX} pToY={pToY} className="pdviz__curve pdviz__curve--fusion" />
            )}

            {/* Triple point */}
            {!data.isHelium && (
              <g className="pdviz__point pdviz__point--triple">
                <circle cx={tToX(data.triplePoint.t)} cy={pToY(data.triplePoint.p)} r={4} />
                <text x={tToX(data.triplePoint.t) + 7} y={pToY(data.triplePoint.p) - 6} className="pdviz__point-label">
                  Triple pt
                </text>
              </g>
            )}

            {/* Critical point */}
            <g className="pdviz__point pdviz__point--critical">
              <circle cx={tToX(data.criticalPoint.t)} cy={pToY(data.criticalPoint.p)} r={4} />
              <text x={tToX(data.criticalPoint.t) + 7} y={pToY(data.criticalPoint.p) - 6} className="pdviz__point-label">
                Critical pt
              </text>
            </g>

            {/* "You are here" marker */}
            {isInRange(293, data.tRange) && isInRange(1, data.pRange) && (
              <g className="pdviz__room">
                <circle cx={roomX} cy={roomY} r={5} />
                <text x={roomX + 8} y={roomY + 4} className="pdviz__room-label">
                  Room
                </text>
              </g>
            )}

            {/* Crosshair */}
            <line x1={cx} y1={yMin} x2={cx} y2={yMax} className="pdviz__crosshair-line" />
            <line x1={xMin} y1={cy} x2={xMax} y2={cy} className="pdviz__crosshair-line" />
            <circle cx={cx} cy={cy} r={6} className="pdviz__crosshair" />
          </svg>
        </div>
      </div>

      <input
        type="range"
        className="pdviz__slider-x"
        min={data.tRange[0]}
        max={data.tRange[1]}
        step={(data.tRange[1] - data.tRange[0]) / 200}
        value={temp}
        onChange={e => { hasInteracted.current = true; setTemp(parseFloat(e.target.value)); }}
        aria-label="Temperature"
      />

      <div className="pdviz__footer">
        <span className={`pdviz__phase-badge pdviz__phase-badge--${phase}`} aria-live="polite">
          {PHASE_LABELS[phase]}
        </span>
        <span className="pdviz__ref">
          Melts {mpDisplay}{bpDisplay != null && ` · Boils ${bpDisplay}`}
          {data.hasEstimatedBp && ' (est.)'}
        </span>
        {data.isHelium && (
          <span className="pdviz__note">Helium has no standard triple point</span>
        )}
      </div>
    </div>
  );
}

/* ---- Region polygon builder ---- */

function buildRegionPaths(
  data: PhaseDiagramData,
  tToX: (t: number) => number,
  pToY: (p: number) => number,
): { solid: string; liquid: string; gas: string } {
  const toSVG = (pt: PhasePoint) => ({ x: tToX(pt.t), y: pToY(pt.p) });

  if (data.isHelium) {
    // Helium: just liquid (above LG curve) and gas (below)
    const lgSVG = data.liquidGasCurve.map(toSVG);
    const cpSVG = toSVG(data.criticalPoint);

    const liquid = pathStr([
      { x: xMin, y: yMin },
      { x: cpSVG.x, y: yMin },
      ...lgSVG.slice().reverse(),
      { x: xMin, y: lgSVG[0].y },
    ]);

    const gas = pathStr([
      ...lgSVG,
      { x: cpSVG.x, y: cpSVG.y },
      { x: xMax, y: cpSVG.y },
      { x: xMax, y: yMax },
      { x: xMin, y: yMax },
      { x: xMin, y: lgSVG[0].y },
    ]);

    return { solid: '', liquid, gas };
  }

  const slSVG = data.solidLiquidCurve.map(toSVG); // [0]=TP, [last]=high P (top)
  const lgSVG = data.liquidGasCurve.map(toSVG);   // [0]=TP, [last]=CP
  const subSVG = data.solidGasCurve.map(toSVG);    // [0]=start (low T), [last]=TP

  const slTop = slSVG[slSVG.length - 1]; // top of solid-liquid curve
  const cpSVG = lgSVG[lgSVG.length - 1]; // critical point

  // Solid region: top-left → SL curve top → SL curve down to TP → sublimation back to start → left edge
  const solid = pathStr([
    { x: xMin, y: yMin },
    { x: slTop.x, y: yMin },
    ...slSVG.slice().reverse(), // top → TP
    ...subSVG.slice().reverse(), // TP → sublimation start
    { x: xMin, y: subSVG[0].y },
  ]);

  // Liquid region: SL top → above CP → CP → LG curve back to TP → SL curve up
  const liquid = pathStr([
    { x: slTop.x, y: yMin },
    { x: cpSVG.x, y: yMin },
    ...lgSVG.slice().reverse(), // CP → TP
    ...slSVG, // TP → SL top
  ]);

  // Gas region: sublimation start → sub curve → TP → LG curve → CP → top-right → bottom-right → bottom-left → left edge
  const gas = pathStr([
    ...subSVG, // sublimation start → TP
    ...lgSVG, // TP → CP
    { x: cpSVG.x, y: yMin },
    { x: xMax, y: yMin },
    { x: xMax, y: yMax },
    { x: xMin, y: yMax },
    { x: xMin, y: subSVG[0].y },
  ]);

  return { solid, liquid, gas };
}

function pathStr(points: { x: number; y: number }[]): string {
  return points
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(' ') + ' Z';
}

/* ---- Helper sub-components ---- */

function CurvePath({
  points, tToX, pToY, className,
}: {
  points: PhasePoint[];
  tToX: (t: number) => number;
  pToY: (p: number) => number;
  className: string;
}) {
  if (points.length < 2) return null;
  const d = points
    .map((pt, i) => `${i === 0 ? 'M' : 'L'}${tToX(pt.t).toFixed(1)},${pToY(pt.p).toFixed(1)}`)
    .join(' ');
  return <path d={d} className={className} />;
}

function PhaseRegionLabels({
  data, tToX, pToY,
}: {
  data: PhaseDiagramData;
  tToX: (t: number) => number;
  pToY: (p: number) => number;
}) {
  const { triplePoint: tp, criticalPoint: cp, pRange, isHelium } = data;

  if (isHelium) {
    return (
      <>
        <text x={tToX(cp.t * 0.5)} y={pToY(cp.p * 1.2)} className="pdviz__region-label">Liquid</text>
        <text x={tToX(cp.t * 0.8)} y={pToY(pRange[0] * 3)} className="pdviz__region-label">Gas</text>
      </>
    );
  }

  return (
    <>
      <text x={tToX(tp.t * 0.55)} y={pToY(Math.sqrt(tp.p * pRange[1]) * 0.8)} className="pdviz__region-label">Solid</text>
      <text x={tToX((tp.t + cp.t) * 0.48)} y={pToY(Math.sqrt(tp.p * cp.p) * 1.2)} className="pdviz__region-label">Liquid</text>
      <text x={tToX(cp.t * 0.75)} y={pToY(pRange[0] * 3)} className="pdviz__region-label">Gas</text>
    </>
  );
}

/* ---- Utilities ---- */

function isInRange(val: number, [min, max]: [number, number]): boolean {
  return val >= min && val <= max;
}

function formatPressure(p: number): string {
  if (p >= 100) return `${Math.round(p)} atm`;
  if (p >= 1) return `${p.toFixed(1)} atm`;
  if (p >= 0.01) return `${p.toFixed(3)} atm`;
  return `${p.toExponential(1)} atm`;
}
