import { useState, useCallback, useEffect, useRef } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import type { Element } from './types/element';
import { DEFAULT_VIEW_MODE, type AtomViewMode } from './components/atom/atomConfig';
import { PeriodicTable } from './components/PeriodicTable';
import { ElementDetail } from './components/ElementDetail';
import { CategoryLegend } from './components/CategoryLegend';
import { VoiceAgent } from './components/VoiceAgent';
import { useElementConversation } from './hooks/useElementConversation';
import './App.css';

function setClipVars(rect: DOMRect) {
  const s = document.documentElement.style;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  s.setProperty('--clip-top', `${(rect.top / vh) * 100}%`);
  s.setProperty('--clip-right', `${((vw - rect.right) / vw) * 100}%`);
  s.setProperty('--clip-bottom', `${((vh - rect.bottom) / vh) * 100}%`);
  s.setProperty('--clip-left', `${(rect.left / vw) * 100}%`);
  s.setProperty('--clip-radius', `${Math.max(rect.width, rect.height) * 0.12}px`);
}

function viewTransition(update: () => void, types: string[]) {
  if (!document.startViewTransition) {
    update();
    return;
  }
  // Chrome 125+ supports { update, types }
  (document as any).startViewTransition({ update, types });
}

function findCellForElement(element: Element): HTMLElement | null {
  return document.querySelector(
    `.element-cell[style*="grid-row: ${element.gridRow}"][style*="grid-column: ${element.gridColumn}"]`
  );
}

function App() {
  const [selected, setSelected] = useState<Element | null>(null);
  const [atomViewMode, setAtomViewMode] = useState<AtomViewMode>(DEFAULT_VIEW_MODE);
  const originCellRef = useRef<HTMLElement | null>(null);

  const openElement = useCallback((element: Element, originCell: HTMLElement | null) => {
    originCellRef.current = originCell;
    setAtomViewMode(DEFAULT_VIEW_MODE);
    if (originCell) setClipVars(originCell.getBoundingClientRect());
    viewTransition(() => setSelected(element), ['detail-open']);
  }, []);

  const closeDetail = useCallback(() => {
    const cell = originCellRef.current;
    if (cell) setClipVars(cell.getBoundingClientRect());
    viewTransition(() => setSelected(null), ['detail-close']);
    // Restore focus to originating cell after transition
    if (cell) requestAnimationFrame(() => cell.focus());
  }, []);

  const handleVoiceNavigate = useCallback((element: Element) => {
    openElement(element, findCellForElement(element));
  }, [openElement]);

  const handleVoiceGoBack = useCallback(() => {
    closeDetail();
  }, [closeDetail]);

  const voice = useElementConversation({
    onNavigate: handleVoiceNavigate,
    onGoBack: handleVoiceGoBack,
    onSetAtomViewMode: setAtomViewMode,
  });

  const handleElementClick = useCallback((element: Element, e: React.MouseEvent) => {
    openElement(element, e.currentTarget as HTMLElement);
  }, [openElement]);

  const handleClose = useCallback(() => {
    voice.notifyElementClosed();
    closeDetail();
  }, [voice, closeDetail]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selected) {
      voice.notifyElementChange(selected);
    }
  }, [selected]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">The Periodic Table</h1>
        <p className="app-subtitle">Click any element to explore</p>
      </header>

      <PeriodicTable onElementClick={handleElementClick} />
      <CategoryLegend />

      {voice.agentId && (
        <div className="app__voice-float">
          <VoiceAgent
            status={voice.status}
            isSpeaking={voice.isSpeaking}
            onToggle={voice.toggle}
            micError={voice.micError}
            onDismissError={voice.clearMicError}
          />
        </div>
      )}

      {selected && (
        <ElementDetail
          element={selected}
          onClose={handleClose}
          atomViewMode={atomViewMode}
          onAtomViewModeChange={setAtomViewMode}
        />
      )}
      <Analytics />
      <SpeedInsights />
    </div>
  );
}

export default App;
