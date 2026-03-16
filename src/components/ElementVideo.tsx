import { useState, useEffect, useRef, useCallback } from 'react';
import type { Element } from '../types/element';
import { getVideoEntry } from '../data/videoManifest';
import './ElementVideo.css';

interface ElementVideoProps {
  element: Element;
}

export function ElementVideo({ element }: ElementVideoProps) {
  const entry = getVideoEntry(element.atomicNumber);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Sync play/pause state with video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) {
      video.play().catch(() => setIsPlaying(false));
    } else {
      video.pause();
    }
  }, [isPlaying]);

  const handleToggle = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  if (!entry) {
    return null;
  }

  // Reduced-motion: show poster as a static image instead of video
  if (reducedMotion) {
    return (
      <div className="element-video">
        <img
          className="element-video__poster"
          src={entry.poster}
          alt={entry.description}
        />
        <span className="element-video__caption">{entry.description}</span>
      </div>
    );
  }

  return (
    <div className="element-video">
      <div className="element-video__player-wrap">
        <video
          ref={videoRef}
          className="element-video__player"
          src={entry.url}
          poster={entry.poster}
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          aria-label={entry.description}
        />
        <button
          className="element-video__toggle"
          onClick={handleToggle}
          aria-label={isPlaying ? 'Pause video' : 'Play video'}
        >
          {isPlaying ? (
            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
              <rect x="3" y="2" width="3" height="12" rx="1" />
              <rect x="10" y="2" width="3" height="12" rx="1" />
            </svg>
          ) : (
            <svg viewBox="0 0 16 16" width="12" height="12" fill="currentColor" aria-hidden="true">
              <path d="M4 2.5l10 5.5-10 5.5V2.5z" />
            </svg>
          )}
        </button>
      </div>
      <span className="element-video__caption">{entry.description}</span>
    </div>
  );
}
