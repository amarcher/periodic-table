import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import type { Element } from './types/element';
import { getElementBySymbol } from './data/elements';
import { DEFAULT_VIEW_MODE, type AtomViewMode } from './components/atom/atomConfig';
import { PeriodicTable } from './components/PeriodicTable';
import { ElementDetail } from './components/ElementDetail';
import { CategoryLegend } from './components/CategoryLegend';
import { trackDiagnostic, trackElementRoute } from './utils/analytics';
import { updatePageMetadata } from './utils/pageMetadata';
import './App.css';

const VoiceExperience = lazy(() => import('./components/VoiceExperience'));

class VoiceBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { trackDiagnostic('voice_unavailable', { reason: 'load_or_render_error' }); }
  render() {
    return this.state.failed
      ? <span role="status">Voice is unavailable. You can keep exploring.</span>
      : this.props.children;
  }
}

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

function viewTransition(
  update: () => void | Promise<void>,
  types: string[],
  onFinish?: () => void,
) {
  if (!document.startViewTransition) {
    Promise.resolve(update()).finally(() => onFinish?.());
    return;
  }
  // Chrome 125+ supports { update, types }
  const vt = (document as Document & { startViewTransition: (options: { update: () => void | Promise<void>; types: string[] }) => ViewTransition }).startViewTransition({ update, types });
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
  const { pathname } = useLocation();
  const symbol = /^\/element\/([A-Za-z]{1,3})\/?$/.exec(pathname)?.[1];
  const selected = symbol ? getElementBySymbol(symbol) ?? null : null;
  useEffect(() => { updatePageMetadata(selected); }, [selected]);
  useEffect(() => { trackElementRoute(selected); }, [selected]);
  const [atomViewMode, setAtomViewMode] = useState<AtomViewMode>(DEFAULT_VIEW_MODE);
  const originCellRef = useRef<HTMLElement | null>(null);

  // If the URL has a bogus symbol, bounce back to the root.
  useEffect(() => {
    if (symbol && !selected) navigate('/', { replace: true });
  }, [symbol, selected, navigate]);

  const openElement = useCallback(
    (element: Element, originCell: HTMLElement | null) => {
      originCellRef.current = originCell;
      setAtomViewMode(DEFAULT_VIEW_MODE);
      updatePageMetadata(element);
      clearVtActive();
      if (originCell) {
        setClipVars(originCell.getBoundingClientRect());
        // Name the cell BEFORE the OLD capture so it's snapshotted as hero-<sym>.
        originCell.classList.add('vt-active');
      }
      viewTransition(
        async () => {
          // React Router v7 wraps navigate state updates in
          // React.startTransition by default, which `flushSync` from
          // react-dom cannot pierce. Passing `{ flushSync: true }` makes
          // RR use ReactDOM.flushSync directly so the mount/unmount
          // commits before the browser captures the NEW snapshot.
          await navigate(`/element/${element.symbol}`, { flushSync: true });
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
    updatePageMetadata(null);
    const cell = originCellRef.current;
    if (cell) setClipVars(cell.getBoundingClientRect());
    viewTransition(
      async () => {
        // `{ flushSync: true }` opts out of RR's default startTransition
        // wrapper so the detail actually unmounts before the browser
        // captures the NEW snapshot — without this the close-morph
        // animates detail→detail and no transition is visible.
        await navigate('/', { flushSync: true });
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

  const handleElementClick = useCallback(
    (element: Element, e: React.MouseEvent) => {
      openElement(element, e.currentTarget as HTMLElement);
    },
    [openElement]
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">The Periodic Table</h1>
        <p className="app-subtitle">Click any element to explore</p>
      </header>

      <PeriodicTable onElementClick={handleElementClick} />
      <CategoryLegend />

      {import.meta.env.VITE_ELEVENLABS_AGENT_ID && (
        <div className="app__voice-float">
          <VoiceBoundary>
            <Suspense fallback={<span role="status">Loading voice guide…</span>}>
              <VoiceExperience selected={selected} onNavigate={handleVoiceNavigate}
                onGoBack={handleVoiceGoBack} onSetAtomViewMode={setAtomViewMode} />
            </Suspense>
          </VoiceBoundary>
        </div>
      )}

      {selected && (
        <ElementDetail
          key={selected.symbol}
          element={selected}
          onClose={closeDetail}
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
