import { Component, lazy, Suspense, useState } from 'react';
import type { ReactNode } from 'react';
import type { Element } from '../types/element';
import type { AtomViewMode } from './atom/atomConfig';
import { useReducedMotion } from '../hooks/useDisplayPreferences';
import { trackDiagnostic, trackEvent } from '../utils/analytics';
import './AtomVisualizer.css';

const AtomVisualizer = lazy(() => import('./AtomVisualizer').then(m => ({ default: m.AtomVisualizer })));

function StaticAtom({ element }: { element: Element }) {
  return <figure className="atom-static" aria-label={`${element.name} atom summary`}>
    <svg viewBox="0 -25 240 180" aria-hidden="true">
      <g fill="none" stroke="currentColor" opacity="0.5">
        <ellipse cx="120" cy="65" rx="83" ry="28" />
        <ellipse cx="120" cy="65" rx="83" ry="28" transform="rotate(60 120 65)" />
        <ellipse cx="120" cy="65" rx="83" ry="28" transform="rotate(-60 120 65)" />
      </g>
      <text x="120" y="72" textAnchor="middle" fill="currentColor" fontSize="24">{element.symbol}</text>
    </svg>
    <figcaption>Protons: {element.atomicNumber} · Electrons: {element.atomicNumber}<br />
      Electron configuration: {element.electronConfiguration}</figcaption>
  </figure>;
}

class GraphicsBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { trackDiagnostic('atom_fallback', { reason: 'render_error' }); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export function AtomDisplay({ element, viewMode, onViewModeChange }: {
  element: Element; viewMode: AtomViewMode; onViewModeChange: (mode: AtomViewMode) => void;
}) {
  const reducedMotion = useReducedMotion();
  const [simple, setSimple] = useState<boolean | null>(null);
  const [contextLost, setContextLost] = useState(false);
  const showStatic = contextLost || (simple ?? reducedMotion);
  const fallback = <StaticAtom element={element} />;
  return <div className="atom-display">
    {showStatic ? fallback : <GraphicsBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        <AtomVisualizer element={element} viewMode={viewMode} onViewModeChange={onViewModeChange}
          onContextLost={() => { setContextLost(true); trackDiagnostic('atom_fallback', { reason: 'context_lost' }); }} />
      </Suspense>
    </GraphicsBoundary>}
    {!contextLost && <button className="atom-display__toggle" onClick={() => {
      const next = !showStatic;
      setSimple(next);
      trackEvent('atom_display_changed', { mode: next ? 'static' : '3d', symbol: element.symbol });
    }}>{showStatic ? 'Explore in 3D' : 'Use still view'}</button>}
  </div>;
}
