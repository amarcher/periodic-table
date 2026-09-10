import { useState, useEffect, useRef } from 'react';
import type { Element } from '../types/element';
import { getVideoEntry } from '../data/videoManifest';
import { trackDiagnostic, trackEvent, trackVideoPlayToggle, trackVideoLoop } from '../utils/analytics';
import { VideoPlaybackTracker } from '../utils/mediaTracking';
import { useMediaVisible, useReducedMotion, useSaveData } from '../hooks/useDisplayPreferences';
import './ElementVideo.css';

export function ElementVideo({ element }: { element: Element }) {
  const entry = getVideoEntry(element.atomicNumber);
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const visible = useMediaVisible(wrapperRef);
  const reducedMotion = useReducedMotion();
  const saveData = useSaveData();
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null);
  const wantsPlayback = userPlaying ?? (!reducedMotion && !saveData);
  const shouldPlay = wantsPlayback && visible;
  const [failed, setFailed] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const tracker = useRef(new VideoPlaybackTracker());
  const started = useRef(false);
  const loadedAt = useRef(0);
  const props = { symbol: element.symbol, atomic_number: element.atomicNumber };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || failed) return;
    if (shouldPlay) video.play().catch(() => setIsPlaying(false));
    else {
      video.pause();
      tracker.current.sample(0, 0, false, false);
    }
  }, [shouldPlay, failed]);

  useEffect(() => {
    const playback = tracker.current;
    const flush = () => {
      const watched = playback.takeWatchedMs();
      if (watched > 0) trackEvent('video_engagement', { symbol: element.symbol, atomic_number: element.atomicNumber, watched_ms: watched });
    };
    const hide = () => { if (document.hidden) flush(); };
    const timer = setInterval(flush, 30_000);
    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', hide);
    return () => {
      clearInterval(timer);
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', hide);
      flush();
    };
  }, [element]);

  const sampleVideo = (video: HTMLVideoElement) => {
    if (tracker.current.sample(video.currentTime, video.duration, !video.paused && visible && !document.hidden, video.seeking)) {
      trackVideoLoop(element.symbol, element.atomicNumber, tracker.current.loopCount);
    }
  };

  if (!entry) return null;
  return <div className="element-video" ref={wrapperRef}>
    <div className="element-video__player-wrap">
      <div className="element-video__backdrop" style={{ backgroundImage: `url(${entry.poster})` }} aria-hidden="true" />
      {failed ? <img className="element-video__poster" src={entry.poster} alt={entry.description} /> : <video
        ref={videoRef}
        className="element-video__player"
        src={userPlaying !== null || (!reducedMotion && !saveData) ? entry.url : undefined}
        poster={entry.poster}
        autoPlay={shouldPlay}
        muted loop playsInline preload="none"
        aria-label={entry.description}
        onLoadStart={() => { loadedAt.current = performance.now(); }}
        onLoadedData={() => trackDiagnostic('video_loaded', { ...props, load_ms: Math.round(performance.now() - loadedAt.current) })}
        onPlaying={() => {
          setIsPlaying(true);
          if (!started.current) { started.current = true; trackEvent('video_started', props); }
        }}
        onPause={() => { setIsPlaying(false); tracker.current.sample(0, 0, false, false); }}
        onSeeking={e => sampleVideo(e.currentTarget)}
        onTimeUpdate={e => sampleVideo(e.currentTarget)}
        onWaiting={() => { if (started.current && shouldPlay) trackDiagnostic('video_stalled', props); }}
        onError={e => {
          // Removing a source to honor pause/save-data is not a failed video load.
          if (!e.currentTarget.getAttribute('src')) return;
          setFailed(true);
          trackDiagnostic('video_error', { ...props, code: e.currentTarget.error?.code ?? 0 });
        }}
      />}
      {!failed && <button className="element-video__toggle" onClick={() => {
        const next = !isPlaying;
        setUserPlaying(next);
        trackVideoPlayToggle(element.symbol, element.atomicNumber, next);
        // Also retry playback after a browser autoplay rejection.
        if (next) videoRef.current?.play().catch(() => setIsPlaying(false));
      }} aria-label={isPlaying ? 'Pause video' : 'Play video'}>
        {isPlaying ? <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true"><rect x="3" y="2" width="3" height="12" /><rect x="10" y="2" width="3" height="12" /></svg>
          : <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M4 2.5l10 5.5-10 5.5V2.5z" /></svg>}
      </button>}
    </div>
    <span className="element-video__caption">{entry.description}</span>
    {failed && <p role="status">Video unavailable. You can still explore the element’s properties and facts.</p>}
  </div>;
}
