import { useState, useCallback, useEffect } from 'react';
import type { Element } from './types/element';
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

function App() {
  const [selected, setSelected] = useState<Element | null>(null);
  const voice = useElementConversation();

  const handleElementClick = useCallback((element: Element, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setClipVars(rect);
    viewTransition(() => setSelected(element), ['detail-open']);
  }, []);

  const handleClose = useCallback(() => {
    voice.notifyElementClosed();
    viewTransition(() => setSelected(null), ['detail-close']);
  }, [voice]); // eslint-disable-line react-hooks/exhaustive-deps

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

      {!selected && voice.agentId && (
        <div className="app__voice-float">
          <VoiceAgent status={voice.status} isSpeaking={voice.isSpeaking} />
        </div>
      )}

      {selected && (
        <ElementDetail
          element={selected}
          onClose={handleClose}
          voiceStatus={voice.status}
          voiceIsSpeaking={voice.isSpeaking}
        />
      )}
    </div>
  );
}

export default App;
