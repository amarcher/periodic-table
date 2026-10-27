import { useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getElementBySymbol } from '../data/elements';
import { getClips, type Clip } from '../data/clips';
import { categoryColors, categoryLabels } from '../utils/colors';
import { clipPath, elementPath, posterFilename } from '../utils/seo';
import { updateClipMetadata } from '../utils/pageMetadata';
import { trackEvent } from '../utils/analytics';
import { useReducedMotion, useSaveData } from '../hooks/useDisplayPreferences';
import './WatchPage.css';

const BASE_URL = import.meta.env.VITE_VIDEO_CDN_URL || '/element-videos';
const videoUrl = (clip: Clip) => `${BASE_URL}/${clip.filename}`;
const posterUrl = (clip: Clip) => `${BASE_URL}/${posterFilename(clip.filename)}`;

/**
 * One clip per page, captioned with the fact it shows, with the element's
 * other clips as a channel underneath. Keyboard arrows move between clips.
 */
export default function WatchPage() {
  const { symbol = '', slug = '' } = useParams();
  const navigate = useNavigate();
  const element = getElementBySymbol(symbol) ?? null;
  const clips = element ? getClips(element) : [];
  const index = clips.findIndex(clip => clip.slug === slug);
  const clip = index >= 0 ? clips[index] : undefined;
  const previous = index > 0 ? clips[index - 1] : undefined;
  const next = index >= 0 ? clips[index + 1] : undefined;
  const reducedMotion = useReducedMotion();
  const saveData = useSaveData();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!element || !clip) navigate(element ? elementPath(element) : '/', { replace: true });
  }, [element, clip, navigate]);

  useEffect(() => {
    if (!element || !clip) return;
    updateClipMetadata(element, clip);
    trackEvent('clip_view', { symbol: element.symbol, atomic_number: element.atomicNumber, clip: clip.slug });
    window.scrollTo(0, 0);
  }, [element, clip]);

  useEffect(() => {
    if (!element) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === 'ArrowRight' && next) navigate(clipPath(element, next));
      if (event.key === 'ArrowLeft' && previous) navigate(clipPath(element, previous));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [element, next, previous, navigate]);

  if (!element || !clip) return null;
  const autoplay = !reducedMotion && !saveData;

  return (
    <main className="watch" style={{ '--cat-color': categoryColors[element.category] } as React.CSSProperties}>
      <header className="watch__header">
        <Link to={elementPath(element)} className="watch__element">
          <span className="watch__symbol" aria-hidden="true">{element.symbol}</span>
          <span className="watch__element-name">{element.name}<small>{categoryLabels[element.category]} · element {element.atomicNumber}</small></span>
        </Link>
        <Link to="/" className="watch__home">Periodic table</Link>
      </header>

      <figure className="watch__stage">
        <video
          key={clip.slug}
          ref={videoRef}
          className="watch__video"
          src={videoUrl(clip)}
          poster={posterUrl(clip)}
          width={1280}
          height={720}
          controls
          muted
          loop
          playsInline
          autoPlay={autoplay}
          preload="metadata"
          aria-label={clip.fact}
        />
        <figcaption className="watch__caption">{clip.fact}</figcaption>
      </figure>

      <h1 className="watch__title">{clip.title}</h1>

      <nav className="watch__pager" aria-label="Previous and next video">
        {previous ? <Link to={clipPath(element, previous)} className="watch__pager-link" rel="prev">
          <span aria-hidden="true">←</span> <span className="watch__pager-label">Previous</span>
        </Link> : <span />}
        <span className="watch__count">{index + 1} of {clips.length}</span>
        {next ? <Link to={clipPath(element, next)} className="watch__pager-link watch__pager-link--next" rel="next">
          <span className="watch__pager-label">Next</span> <span aria-hidden="true">→</span>
        </Link> : <span />}
      </nav>

      {clips.length > 1 && (
        <section className="watch__channel" aria-labelledby="watch-channel-heading">
          <h2 id="watch-channel-heading">More {element.name} videos</h2>
          <ul className="watch__list">
            {clips.map((item, i) => (
              <li key={item.slug}>
                <Link
                  to={clipPath(element, item)}
                  className={`watch__item${i === index ? ' watch__item--current' : ''}`}
                  aria-current={i === index ? 'page' : undefined}
                >
                  <img src={posterUrl(item)} alt="" width={160} height={90} loading="lazy" decoding="async" />
                  <span className="watch__item-title">{item.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="watch__about">
        <Link to={elementPath(element)}>Explore {element.name}: facts, properties and a 3D atom →</Link>
      </p>
    </main>
  );
}
