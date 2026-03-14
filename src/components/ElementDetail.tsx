import { useEffect, useRef, lazy, Suspense } from 'react';
import type { Element } from '../types/element';
import type { VoiceStatus } from '../hooks/useElementConversation';
import { categoryColors, categoryLabels } from '../utils/colors';
import { VoiceAgent } from './VoiceAgent';
import { ElementPhoto } from './ElementPhoto';
import './ElementDetail.css';

const AtomVisualizer = lazy(() =>
  import('./AtomVisualizer').then((m) => ({ default: m.AtomVisualizer }))
);

// sqrt scale: gives better visual spread across large ranges
function sqrtScale(value: number, max: number): number {
  return Math.max(0, Math.min(100, Math.sqrt(Math.max(0, value) / max) * 100));
}

function getMeltContext(celsius: number): string {
  if (celsius < -40) return 'Stays liquid in the deep cold!';
  if (celsius < 0) return 'Liquid below freezing!';
  if (celsius <= 40) return 'Would melt in your hand!';
  if (celsius <= 100) return 'Melts below boiling water';
  if (celsius <= 300) return 'An oven could melt it';
  if (celsius <= 1000) return 'Needs a furnace to melt';
  if (celsius <= 2000) return 'Takes extreme heat to melt';
  return 'One of the toughest to melt!';
}

function getDensityContext(density: number): { text: string; floats: boolean } {
  if (density < 1) return { text: 'Floats on water!', floats: true };
  if (density < 3) return { text: 'A bit heavier than water', floats: false };
  if (density < 8) return { text: 'About as dense as common metals', floats: false };
  if (density < 12) return { text: 'Heavier than iron!', floats: false };
  if (density < 18) return { text: 'Heavier than lead!', floats: false };
  return { text: 'One of the densest things on Earth!', floats: false };
}

// Reference positions (sqrt scale)
const REF_ICE = sqrtScale(273, 3773);       // 0°C in the -273..3500 range
const REF_IRON = sqrtScale(1811, 3773);     // 1538°C
const REF_WATER_D = sqrtScale(1, 23);       // water density
const REF_IRON_D = sqrtScale(7.87, 23);     // iron density

function MeltingPointCard({ kelvin }: { kelvin: number }) {
  const celsius = Math.round(kelvin - 273);
  const pct = sqrtScale(celsius + 273, 3773);

  return (
    <div className="viz-card">
      <div className="viz-card__header">
        <span className="viz-card__label">Melting Point</span>
        <span className="viz-card__value">{celsius}°C</span>
      </div>
      <div className="viz-card__bar">
        <div className="viz-card__track viz-card__track--temp">
          <div className="viz-card__fill viz-card__fill--temp" style={{ width: `${pct}%` }} />
        </div>
        <div className="viz-card__refs">
          <span className="viz-card__ref" style={{ left: `${REF_ICE}%` }}>Ice 0°</span>
          <span className="viz-card__ref" style={{ left: `${REF_IRON}%` }}>Iron 1538°</span>
        </div>
      </div>
      <span className="viz-card__context">{getMeltContext(celsius)}</span>
    </div>
  );
}

function DensityCard({ density }: { density: number }) {
  const pct = sqrtScale(density, 23);
  const { text, floats } = getDensityContext(density);

  return (
    <div className="viz-card">
      <div className="viz-card__header">
        <span className="viz-card__label">Density</span>
        <span className="viz-card__value">{density} g/cm³</span>
      </div>
      <div className="viz-card__bar">
        <div className="viz-card__track viz-card__track--density">
          <div className="viz-card__fill viz-card__fill--density" style={{ width: `${pct}%` }} />
        </div>
        <div className="viz-card__refs">
          <span className="viz-card__ref" style={{ left: `${REF_WATER_D}%` }}>Water</span>
          <span className="viz-card__ref" style={{ left: `${REF_IRON_D}%` }}>Iron</span>
        </div>
      </div>
      <span className={`viz-card__badge ${floats ? 'viz-card__badge--float' : 'viz-card__badge--sink'}`}>
        {text}
      </span>
    </div>
  );
}

interface ElementDetailProps {
  element: Element;
  onClose: () => void;
  voiceStatus: VoiceStatus;
  voiceIsSpeaking: boolean;
  onVoiceToggle: () => void;
}

export function ElementDetail({ element, onClose, voiceStatus, voiceIsSpeaking, onVoiceToggle }: ElementDetailProps) {
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
        {/* LEFT: 3D atom + identity + voice */}
        <div className="detail__col-left">
          <div className="detail__atom-zone detail__content">
            <Suspense fallback={<div className="detail__atom-loading">Loading...</div>}>
              <AtomVisualizer element={element} />
            </Suspense>
          </div>

          <div className="detail__identity detail__content">
            <span className="detail__symbol">{element.symbol}</span>
            <span className="detail__name">{element.name}</span>
            <span className="detail__category">
              {categoryLabels[element.category]}
            </span>
          </div>

          <div className="detail__voice-zone detail__content">
            <VoiceAgent
              status={voiceStatus}
              isSpeaking={voiceIsSpeaking}
              onToggle={onVoiceToggle}
              catColor={catColor}
            />
          </div>
        </div>

        {/* RIGHT: photo + visual stats + facts */}
        <div className="detail__col-right">
          <div className="detail__photo-zone detail__content">
            <ElementPhoto element={element} />
          </div>

          <div className="detail__viz detail__content">
            {element.meltingPoint != null && (
              <MeltingPointCard kelvin={element.meltingPoint} />
            )}
            {element.density != null && (
              <DensityCard density={element.density} />
            )}
          </div>

          <div className="detail__facts detail__content">
            {element.funFacts.map((fact, i) => (
              <div key={i} className="detail__fact-card">
                <span className="detail__fact-icon">
                  {['\u2726', '\u26A1', '\uD83D\uDD2C', '\uD83D\uDCA1'][i % 4]}
                </span>
                <span className="detail__fact-text">{fact}</span>
              </div>
            ))}
          </div>

          <div className="detail__meta detail__content">
            #{element.atomicNumber} · {element.atomicMass.toFixed(1)} u
            {element.electronegativity != null && ` · Electronegativity ${element.electronegativity}`}
            {' · '}Discovered by {element.discoveredBy} ({element.yearDiscovered})
          </div>
        </div>
      </div>
    </div>
  );
}
