import { useEffect, useRef, useState, useCallback } from 'react';
import type { Element } from '../../types/element';
import './MeltingPointViz.css';

interface Props {
  element: Element;
  catColor: string;
}

type Phase = 'solid' | 'melting' | 'liquid' | 'boiling' | 'gas';

const CYCLE_MS = 8000;
const PAUSE_MS = 2000;

export function MeltingPointViz({ element, catColor }: Props) {
  const mp = element.meltingPoint!;
  const bp = element.boilingPoint;
  const sublimes = bp == null || bp <= mp;

  const minTemp = Math.max(50, mp * 0.4);
  const maxTemp = sublimes ? mp * 1.3 : Math.min(bp! * 1.2, 7000);

  const sceneRef = useRef<HTMLDivElement>(null);
  const tempRef = useRef<HTMLSpanElement>(null);
  const rafRef = useRef(0);
  const startRef = useRef(0);
  const phaseRef = useRef<Phase>('solid');
  const [phase, setPhase] = useState<Phase>('solid');

  const computePhase = useCallback((temp: number): Phase => {
    if (sublimes) {
      if (temp >= mp * 1.02) return 'gas';
      if (temp >= mp * 0.92) return 'melting';
      return 'solid';
    }
    if (bp != null && temp >= bp) return 'gas';
    if (bp != null && temp >= bp * 0.88) return 'boiling';
    if (temp >= mp * 1.05) return 'liquid';
    if (temp >= mp * 0.92) return 'melting';
    return 'solid';
  }, [mp, bp, sublimes]);

  const tick = useCallback((ts: number) => {
    if (!startRef.current) startRef.current = ts;
    const elapsed = ts - startRef.current;
    const total = CYCLE_MS + PAUSE_MS;
    const pos = elapsed % total;
    const raw = Math.min(pos / CYCLE_MS, 1);

    // Ease in-out for natural pacing
    const p = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;

    const temp = minTemp + p * (maxTemp - minTemp);
    const celsius = Math.round(temp - 273);

    if (tempRef.current) tempRef.current.textContent = `${celsius}°C`;

    const frac = (temp - minTemp) / (maxTemp - minTemp);
    const scene = sceneRef.current;
    if (scene) {
      scene.style.setProperty('--frac', frac.toFixed(3));
    }

    // Fade overlay for clean looping
    let fade = 0;
    if (pos > CYCLE_MS + PAUSE_MS * 0.5) {
      fade = (pos - CYCLE_MS - PAUSE_MS * 0.5) / (PAUSE_MS * 0.5);
    } else if (pos < CYCLE_MS * 0.04) {
      fade = 1 - pos / (CYCLE_MS * 0.04);
    }
    if (scene) scene.style.setProperty('--fade', fade.toFixed(2));

    const newPhase = computePhase(temp);
    if (newPhase !== phaseRef.current) {
      phaseRef.current = newPhase;
      setPhase(newPhase);
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [minTemp, maxTemp, computePhase]);

  useEffect(() => {
    startRef.current = 0;
    phaseRef.current = 'solid';
    setPhase('solid');
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  const restart = () => {
    cancelAnimationFrame(rafRef.current);
    startRef.current = 0;
    phaseRef.current = 'solid';
    setPhase('solid');
    rafRef.current = requestAnimationFrame(tick);
  };

  const mpC = Math.round(mp - 273);
  const bpC = bp != null && !sublimes ? Math.round(bp - 273) : null;

  return (
    <div
      className="mpviz"
      style={{ '--cat-color': catColor } as React.CSSProperties}
      onClick={restart}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); restart(); } }}
      role="button"
      tabIndex={0}
      aria-label={`Phase transition animation for ${element.name}. Click to replay.`}
    >
      <div className="mpviz__header">
        <span className="mpviz__label">
          {sublimes ? 'Sublimes' : 'Melts'} {mpC}°C
          {bpC != null && ` · Boils ${bpC}°C`}
        </span>
        <span className="mpviz__temp" ref={tempRef}>{Math.round(minTemp - 273)}°C</span>
      </div>

      <div
        className="mpviz__scene"
        ref={sceneRef}
        style={{ '--frac': '0', '--fade': '0' } as React.CSSProperties}
      >
        {/* Fade overlay for clean looping */}
        <div className="mpviz__fade" />

        {/* Flames at bottom */}
        <div className="mpviz__flames">
          <div className="mpviz__flame mpviz__flame--l" />
          <div className="mpviz__flame mpviz__flame--c" />
          <div className="mpviz__flame mpviz__flame--r" />
        </div>

        {/* Element shape — morphs via phase class */}
        <div className={`mpviz__block mpviz__block--${phase}`} />

        {/* Element symbol — positioned independently */}
        <span className={`mpviz__sym mpviz__sym--${phase}`}>{element.symbol}</span>

        {/* Puddle appears when melting */}
        <div className={`mpviz__puddle mpviz__puddle--${phase}`} />

        {/* Boil bubbles */}
        {(phase === 'boiling' || phase === 'liquid') && phase === 'boiling' && (
          <>
            <div className="mpviz__bub mpviz__bub--1" />
            <div className="mpviz__bub mpviz__bub--2" />
            <div className="mpviz__bub mpviz__bub--3" />
            <div className="mpviz__bub mpviz__bub--4" />
          </>
        )}

        {/* Gas/steam particles */}
        {phase === 'gas' && (
          <>
            <div className="mpviz__puff mpviz__puff--1" />
            <div className="mpviz__puff mpviz__puff--2" />
            <div className="mpviz__puff mpviz__puff--3" />
            <div className="mpviz__puff mpviz__puff--4" />
            <div className="mpviz__puff mpviz__puff--5" />
          </>
        )}

        {/* Phase label overlay */}
        <span className={`mpviz__phase mpviz__phase--${phase}`}>
          {phase === 'solid' && 'Solid'}
          {phase === 'melting' && (sublimes ? 'Subliming!' : 'Melting!')}
          {phase === 'liquid' && 'Liquid'}
          {phase === 'boiling' && 'Boiling!'}
          {phase === 'gas' && 'Gas'}
        </span>
      </div>
    </div>
  );
}
