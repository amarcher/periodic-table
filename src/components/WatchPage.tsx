import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { elements, getElementBySymbol } from '../data/elements';
import { getClips, getShorts, type Clip } from '../data/clips';
import { clipMedia } from '../data/videoManifest';
import { categoryColors } from '../utils/colors';
import { clipPath, elementPath } from '../utils/seo';
import { updateClipMetadata } from '../utils/pageMetadata';
import { trackEvent } from '../utils/analytics';
import { useReducedMotion, useSaveData } from '../hooks/useDisplayPreferences';
import './WatchPage.css';

/**
 * The reel: one full-viewport slide per clip, swiped vertically like a
 * short-form feed. The URL follows the active slide so every clip stays a
 * shareable, indexable page. Shorts (9:16) fill the frame; landscape clips
 * letterbox over a blurred poster. Only the active slide and its neighbours
 * carry a video source.
 */
export default function WatchPage() {
  const { symbol = '', slug = '' } = useParams();
  const navigate = useNavigate();
  const element = getElementBySymbol(symbol) ?? null;
  const clips = element ? getClips(element) : [];
  const urlIndex = clips.findIndex(clip => clip.slug === slug);
  const reducedMotion = useReducedMotion();
  const saveData = useSaveData();
  const autoplay = !reducedMotion && !saveData;
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(Math.max(0, urlIndex));
  const [paused, setPaused] = useState(!autoplay);
  // A refused play() (Low Power Mode, Data Saver, "never autoplay" settings) must
  // surface the play button rather than leave the poster looking frozen.
  const onBlocked = useCallback(() => setPaused(true), []);

  // A bad symbol or slug falls back to the element page, or the table.
  useEffect(() => {
    if (!element || urlIndex < 0) navigate(element ? elementPath(element) : '/', { replace: true });
  }, [element, urlIndex, navigate]);

  // Start on the slide the URL names, without animating there.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || urlIndex < 0) return;
    scroller.scrollTo({ top: urlIndex * scroller.clientHeight, behavior: 'instant' as ScrollBehavior });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element?.symbol]);

  // The slide covering most of the viewport is the active one.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index));
      }
    }, { root: scroller, threshold: 0.6 });
    scroller.querySelectorAll('[data-index]').forEach(slide => observer.observe(slide));
    return () => observer.disconnect();
  }, [clips.length]);

  // The URL, metadata and analytics follow the active slide.
  useEffect(() => {
    const clip = clips[active];
    if (!element || !clip) return;
    if (clip.slug !== slug) navigate(clipPath(element, clip), { replace: true });
    updateClipMetadata(element, clip);
    trackEvent('clip_view', { symbol: element.symbol, atomic_number: element.atomicNumber, clip: clip.slug });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, element?.symbol]);

  const scrollToSlide = useCallback((index: number) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const target = Math.max(0, Math.min(clips.length, index));
    scroller.scrollTo({ top: target * scroller.clientHeight, behavior: reducedMotion ? 'instant' as ScrollBehavior : 'smooth' });
  }, [clips.length, reducedMotion]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowDown' || event.key === 'j') { event.preventDefault(); scrollToSlide(active + 1); }
      if (event.key === 'ArrowUp' || event.key === 'k') { event.preventDefault(); scrollToSlide(active - 1); }
      if (event.key === ' ') { event.preventDefault(); setPaused(p => !p); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, scrollToSlide]);

  if (!element || urlIndex < 0) return null;
  const nextElement = elements.find(candidate => candidate.atomicNumber > element.atomicNumber && getShorts(candidate).length > 0)
    ?? elements[(element.atomicNumber) % elements.length];

  return (
    <main className="reel" style={{ '--cat-color': categoryColors[element.category] } as React.CSSProperties}>
      <div className="reel__scroller" ref={scrollerRef} aria-label={`${element.name} videos`}>
        {clips.map((clip, i) => (
          <ReelSlide key={clip.slug} element={element} clip={clip} index={i} count={clips.length}
            active={i === active} near={Math.abs(i - active) <= 1} paused={paused} onToggle={() => setPaused(p => !p)} onBlocked={onBlocked} />
        ))}
        <section className="reel__slide reel__slide--end" data-index={clips.length} aria-label="More to explore">
          <div className="reel__end">
            <p className="reel__end-symbol" aria-hidden="true">{element.symbol}</p>
            <h2>That's {element.name}.</h2>
            <Link to={elementPath(element)} className="reel__button">Explore {element.name}: facts, properties and a 3D atom</Link>
            {nextElement.symbol !== element.symbol && (
              <Link to={clipPath(nextElement, getClips(nextElement)[0])} className="reel__button reel__button--next">
                Next: {nextElement.name} ({nextElement.symbol})
              </Link>
            )}
            <Link to="/" className="reel__link">Back to the periodic table</Link>
          </div>
        </section>
      </div>
      <header className="reel__chrome">
        <Link to={elementPath(element)} className="reel__element" aria-label={`Back to ${element.name}`}>
          <span className="reel__symbol" aria-hidden="true">{element.symbol}</span>
          <span>{element.name}</span>
        </Link>
        <span className="reel__count" aria-live="polite">{Math.min(active + 1, clips.length)} / {clips.length}</span>
        <Link to={elementPath(element)} className="reel__close" aria-label="Close">×</Link>
      </header>
    </main>
  );
}

function ReelSlide({ element, clip, index, count, active, near, paused, onToggle, onBlocked }: {
  element: typeof elements[number]; clip: Clip; index: number; count: number;
  active: boolean; near: boolean; paused: boolean; onToggle: () => void; onBlocked: () => void;
}) {
  const media = clipMedia(clip);
  const videoRef = useRef<HTMLVideoElement>(null);
  const portrait = clip.aspect === '9:16';

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active && !paused) {
      // AbortError just means a swipe paused it mid-start; NotAllowedError means
      // the browser wants a tap first, so show the button and wait for one.
      video.play().catch((error: DOMException) => { if (error.name === 'NotAllowedError') onBlocked(); });
    } else { video.pause(); if (!active) video.currentTime = 0; }
  }, [active, paused, near, onBlocked]);

  return (
    <section className={`reel__slide${portrait ? '' : ' reel__slide--landscape'}`} data-index={index}
      aria-roledescription="slide" aria-label={`${index + 1} of ${count}: ${clip.title}`}>
      {!portrait && <div className="reel__backdrop" style={{ backgroundImage: `url(${media.poster})` }} aria-hidden="true" />}
      <video
        ref={videoRef}
        className="reel__video"
        src={near ? media.url : undefined}
        poster={media.poster}
        muted loop playsInline
        preload={active ? 'auto' : near ? 'metadata' : 'none'}
        aria-label={clip.fact}
        onClick={onToggle}
      />
      {active && paused && (
        <button className="reel__play" onClick={onToggle} aria-label="Play">
          <svg viewBox="0 0 24 24" width="36" height="36" fill="currentColor" aria-hidden="true"><path d="M7 4l13 8-13 8z" /></svg>
        </button>
      )}
      <div className="reel__caption">
        <h1 className="reel__title">{clip.title}</h1>
        <p className="reel__fact">{clip.fact}</p>
        <Link to={elementPath(element)} className="reel__more">More about {element.name} →</Link>
      </div>
    </section>
  );
}
