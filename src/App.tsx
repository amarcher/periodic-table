import { useCallback, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { useNavigate, useParams } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import type { Element } from './types/element';
import { getElementBySymbol } from './data/elements';
import { DEFAULT_VIEW_MODE, type AtomViewMode } from './components/atom/atomConfig';
import { PeriodicTable } from './components/PeriodicTable';
import { ElementDetail } from './components/ElementDetail';
import { CategoryLegend } from './components/CategoryLegend';
import { VoiceAgent } from './components/VoiceAgent';
import { useElementConversation } from './hooks/useElementConversation';
import { trackElementOpened, trackElementClosed } from './utils/analytics';
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

function viewTransition(update: () => void, types: string[], onFinish?: () => void) {
  if (!document.startViewTransition) {
    update();
    onFinish?.();
    return;
  }
  // Chrome 125+ supports { update, types }
  const vt = (document as any).startViewTransition({ update, types });
  // All three ViewTransition promises can reject if the transition is
  // skipped, aborted, or the update callback throws. Swallow each one so
  // we don't emit unhandled-promise errors.
  vt?.ready?.catch(() => {});
  vt?.updateCallbackDone?.catch(() => {});
  const done: Promise<unknown> = vt?.finished ?? Promise.resolve();
  done.catch(() => {}).finally(() => onFinish?.());
}

function clearVtActive() {
  document
    .querySelectorAll<HTMLElement>('.element-cell.vt-active')
    .forEach((el) => el.classList.remove('vt-active'));
}

function findCellForElement(element: Element): HTMLElement | null {
  return document.querySelector(
    `.element-cell[style*="grid-row: ${element.gridRow}"][style*="grid-column: ${element.gridColumn}"]`
  );
}

function App() {
  const navigate = useNavigate();
  const { symbol } = useParams<{ symbol: string }>();
  const selected = symbol ? getElementBySymbol(symbol) ?? null : null;
  const [atomViewMode, setAtomViewMode] = useState<AtomViewMode>(DEFAULT_VIEW_MODE);
  const originCellRef = useRef<HTMLElement | null>(null);
  const openTimeRef = useRef<number>(0);

  // If the URL has a bogus symbol, bounce back to the root.
  useEffect(() => {
    if (symbol && !selected) navigate('/', { replace: true });
  }, [symbol, selected, navigate]);

  const openElement = useCallback(
    (element: Element, originCell: HTMLElement | null) => {
      originCellRef.current = originCell;
      openTimeRef.current = Date.now();
      setAtomViewMode(DEFAULT_VIEW_MODE);
      trackElementOpened(element.symbol, element.atomicNumber);
      clearVtActive();
      if (originCell) {
        setClipVars(originCell.getBoundingClientRect());
        // Name the cell BEFORE the OLD capture so it's snapshotted as hero-<sym>.
        originCell.classList.add('vt-active');
      }
      viewTransition(
        () => {
          flushSync(() => {
            navigate(`/element/${element.symbol}`);
          });
          // Detail is now in the DOM with hero-<sym> on the media-zone.
          // Strip the name from the live cell so NEW capture only sees
          // hero-<sym> on the media-zone (not both).
          originCell?.classList.remove('vt-active');
        },
        ['detail-open'],
      );
    },
    [navigate],
  );

  const closeDetail = useCallback(() => {
    const cell = originCellRef.current;
    if (cell) setClipVars(cell.getBoundingClientRect());
    viewTransition(
      () => {
        flushSync(() => {
          navigate('/');
        });
        // React Router v7's useSyncExternalStore doesn't always commit the
        // unmount synchronously inside flushSync, so `.detail__media-zone`
        // may briefly linger with its hero-<sym> name. Clear any lingering
        // name before handing hero-<sym> to the cell for NEW capture.
        document.querySelectorAll<HTMLElement>('.detail__media-zone').forEach((el) => {
          el.style.viewTransitionName = 'none';
        });
        cell?.classList.add('vt-active');
      },
      ['detail-close'],
      () => {
        cell?.classList.remove('vt-active');
      },
    );
    if (cell) requestAnimationFrame(() => cell.focus());
  }, [navigate]);

  const handleVoiceNavigate = useCallback(
    (element: Element) => {
      openElement(element, findCellForElement(element));
    },
    [openElement]
  );

  const handleVoiceGoBack = useCallback(() => {
    closeDetail();
  }, [closeDetail]);

  const voice = useElementConversation({
    onNavigate: handleVoiceNavigate,
    onGoBack: handleVoiceGoBack,
    onSetAtomViewMode: setAtomViewMode,
  });

  const handleElementClick = useCallback(
    (element: Element, e: React.MouseEvent) => {
      openElement(element, e.currentTarget as HTMLElement);
    },
    [openElement]
  );

  const handleClose = useCallback(() => {
    if (selected) {
      trackElementClosed(selected.symbol, selected.atomicNumber, Date.now() - openTimeRef.current);
    }
    voice.notifyElementClosed();
    closeDetail();
  }, [voice, closeDetail, selected]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keep the voice agent's context in sync with the URL regardless of how
  // the user navigated (click, voice, paste, back button).
  useEffect(() => {
    if (selected) {
      voice.notifyElementChange(selected);
    }
  }, [selected?.atomicNumber]); // eslint-disable-line react-hooks/exhaustive-deps

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
