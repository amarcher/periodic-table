import { useEffect, lazy, Suspense } from 'react';
import type { Element } from '../types/element';
import type { VoiceStatus } from '../hooks/useElementConversation';
import { categoryColors, categoryLabels } from '../utils/colors';
import { VoiceAgent } from './VoiceAgent';
import { ElementPhoto } from './ElementPhoto';
import './ElementDetail.css';

const AtomVisualizer = lazy(() =>
  import('./AtomVisualizer').then((m) => ({ default: m.AtomVisualizer }))
);

interface ElementDetailProps {
  element: Element;
  onClose: () => void;
  voiceStatus: VoiceStatus;
  voiceIsSpeaking: boolean;
}

export function ElementDetail({ element, onClose, voiceStatus, voiceIsSpeaking }: ElementDetailProps) {
  // Any key press closes the modal
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const catColor = categoryColors[element.category];

  return (
    <div
      className="detail"
      style={{ '--cat-color': catColor } as React.CSSProperties}
    >
      <div className="detail__bg" />

      <button className="detail__close" onClick={onClose} aria-label="Close">
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
              catColor={catColor}
            />
          </div>
        </div>

        {/* RIGHT: stats + photo + facts */}
        <div className="detail__col-right">
          <div className="detail__stats detail__content">
            <div className="detail__stat">
              <span className="detail__stat-value">{element.atomicNumber}</span>
              <span className="detail__stat-label">Atomic #</span>
            </div>
            <div className="detail__stat">
              <span className="detail__stat-value">{element.atomicMass.toFixed(1)}</span>
              <span className="detail__stat-label">Mass</span>
            </div>
            {element.meltingPoint != null && (
              <div className="detail__stat">
                <span className="detail__stat-value">{Math.round(element.meltingPoint - 273)}°</span>
                <span className="detail__stat-label">Melts at</span>
              </div>
            )}
            {element.density != null && (
              <div className="detail__stat">
                <span className="detail__stat-value">{element.density}</span>
                <span className="detail__stat-label">Density</span>
              </div>
            )}
            {element.electronegativity != null && (
              <div className="detail__stat">
                <span className="detail__stat-value">{element.electronegativity}</span>
                <span className="detail__stat-label">Eneg.</span>
              </div>
            )}
          </div>

          <div className="detail__photo-zone detail__content">
            <ElementPhoto element={element} />
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

          <div className="detail__discoverer detail__content">
            Discovered by {element.discoveredBy} ({element.yearDiscovered})
          </div>
        </div>
      </div>
    </div>
  );
}
