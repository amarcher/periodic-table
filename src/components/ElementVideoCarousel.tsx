import { useEffect, useRef, useState } from 'react';
import type { Element } from '../types/element';
import { getLandscapeClips } from '../data/clips';
import { ElementVideo } from './ElementVideo';
import { trackEvent } from '../utils/analytics';
import './ElementVideoCarousel.css';

/**
 * The element page's landscape clips in a horizontal snap carousel: the hero
 * video first, then the authored 16:9 clips. Each slide is an ElementVideo,
 * which already pauses itself when scrolled out of view and loads nothing
 * until it plays, so off-screen slides cost no bandwidth.
 */
export function ElementVideoCarousel({ element }: { element: Element }) {
  const clips = getLandscapeClips(element);
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setIndex(Math.round(track.scrollLeft / track.clientWidth)));
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => { track.removeEventListener('scroll', onScroll); cancelAnimationFrame(frame); };
  }, []);

  useEffect(() => {
    if (index > 0) trackEvent('clip_carousel_view', { symbol: element.symbol, atomic_number: element.atomicNumber, clip: clips[index]?.slug ?? '' });
  }, [index, element, clips]);

  const goTo = (next: number) => {
    const track = trackRef.current;
    if (!track) return;
    const target = Math.max(0, Math.min(clips.length - 1, next));
    track.scrollTo({ left: target * track.clientWidth, behavior: 'smooth' });
  };

  if (clips.length <= 1) return <ElementVideo element={element} />;
  return (
    <div className="clip-carousel" role="region" aria-roledescription="carousel" aria-label={`${element.name} videos`}>
      <div className="clip-carousel__track" ref={trackRef}>
        {clips.map((clip, i) => (
          <div key={clip.slug} className="clip-carousel__slide" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${clips.length}: ${clip.title}`}>
            {i === 0 ? <ElementVideo element={element} /> : <ElementVideo element={element} clip={clip} />}
          </div>
        ))}
      </div>
      <div className="clip-carousel__dots" role="tablist" aria-label="Choose a video">
        {clips.map((clip, i) => (
          <button key={clip.slug} role="tab" aria-selected={i === index} aria-label={clip.title}
            className={`clip-carousel__dot${i === index ? ' clip-carousel__dot--active' : ''}`} onClick={() => goTo(i)} />
        ))}
        <span className="clip-carousel__count" aria-hidden="true">{index + 1}/{clips.length}</span>
      </div>
      <button className="clip-carousel__arrow clip-carousel__arrow--prev" onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous video">‹</button>
      <button className="clip-carousel__arrow clip-carousel__arrow--next" onClick={() => goTo(index + 1)} disabled={index === clips.length - 1} aria-label="Next video">›</button>
    </div>
  );
}
