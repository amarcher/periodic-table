import { useEffect, useRef, lazy, Suspense } from 'react';
import type { Element } from '../types/element';
import type { AtomViewMode } from './atom/atomConfig';
import { categoryColors, categoryLabels } from '../utils/colors';
import { getVideoEntry } from '../data/videoManifest';
import { ElementVideo } from './ElementVideo';
import { ElementPhoto } from './ElementPhoto';
import { DensityViz } from './viz/DensityViz';
import { PhaseDiagramViz } from './viz/PhaseDiagramViz';
import { RadioactivityViz } from './viz/RadioactivityViz';
import { ReactivityViz } from './viz/ReactivityViz';
import './ElementDetail.css';

const AtomVisualizer = lazy(() =>
  import('./AtomVisualizer').then((m) => ({ default: m.AtomVisualizer }))
);

interface ElementDetailProps {
  element: Element;
  onClose: () => void;
  atomViewMode: AtomViewMode;
  onAtomViewModeChange: (mode: AtomViewMode) => void;
}

export function ElementDetail({ element, onClose, atomViewMode, onAtomViewModeChange }: ElementDetailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Focus close button on mount
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Escape closes the modal
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Focus trap — cycle Tab within the modal
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    container.addEventListener('keydown', handleTab);
    return () => container.removeEventListener('keydown', handleTab);
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const catColor = categoryColors[element.category];
  const hasVideo = !!getVideoEntry(element.atomicNumber);

  return (
    <div
      ref={containerRef}
      className="detail"
      role="dialog"
      aria-modal="true"
      aria-label={`Details for ${element.name}`}
      style={{ '--cat-color': catColor } as React.CSSProperties}
    >
      <div className="detail__bg" />

      <button ref={closeRef} className="detail__close" onClick={onClose} aria-label="Close">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
        </svg>
      </button>

      <div className="detail__layout">
        {/* LEFT: atom + identity + phase diagram */}
        <div className="detail__col-left">
          <div
            className="detail__top-row"
            style={{ '--vt-name': 'detail-identity' } as React.CSSProperties}
          >
            <div className="detail__atom-zone">
              <Suspense fallback={<div className="detail__atom-loading">Loading...</div>}>
                <AtomVisualizer element={element} viewMode={atomViewMode} onViewModeChange={onAtomViewModeChange} />
              </Suspense>
            </div>

            <div className="detail__identity">
              <span className="detail__number">#{element.atomicNumber}</span>
              <span className="detail__symbol">{element.symbol}</span>
              <span className="detail__name">{element.name}</span>
              <span className="detail__category">
                {categoryLabels[element.category]}
              </span>
              <span className="detail__mass">{element.atomicMass.toFixed(2)} u</span>
            </div>
          </div>

          {element.meltingPoint != null && (
            <div
              className="detail__phase-zone"
              style={{ '--vt-name': 'detail-phase' } as React.CSSProperties}
            >
              <PhaseDiagramViz element={element} catColor={catColor} />
            </div>
          )}

        </div>

        {/* RIGHT: photo/video + viz cards + fun facts */}
        <div className="detail__col-right">
          <div
            className="detail__media-zone"
            style={{ '--vt-name': `hero-${element.symbol}` } as React.CSSProperties}
          >
            {hasVideo ? (
              <ElementVideo element={element} />
            ) : (
              <ElementPhoto element={element} />
            )}
          </div>

          <div
            className="detail__viz-row"
            style={{ '--vt-name': 'detail-viz' } as React.CSSProperties}
          >
            {element.density != null && <DensityViz element={element} catColor={catColor} />}
            <RadioactivityViz element={element} catColor={catColor} />
            <ReactivityViz element={element} catColor={catColor} />
          </div>

          <div
            className="detail__facts"
            style={{ '--vt-name': 'detail-facts' } as React.CSSProperties}
          >
            {element.funFacts.map((fact, i) => (
              <div key={i} className="detail__fact-card">
                <span className="detail__fact-icon">
                  {['\u2726', '\u26A1', '\uD83D\uDD2C', '\uD83D\uDCA1'][i % 4]}
                </span>
                <span className="detail__fact-text">{fact}</span>
              </div>
            ))}
          </div>

          <div
            className="detail__meta"
            style={{ '--vt-name': 'detail-meta' } as React.CSSProperties}
          >
            {element.electronegativity != null && `Electronegativity ${element.electronegativity} · `}
            Discovered by {element.discoveredBy} ({element.yearDiscovered})
          </div>
        </div>
      </div>
    </div>
  );
}
