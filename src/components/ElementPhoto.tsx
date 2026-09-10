import { useState, useEffect } from 'react';
import type { Element } from '../types/element';
import './ElementPhoto.css';
import { trackDiagnostic } from '../utils/analytics';

interface ElementPhotoProps {
  element: Element;
}

interface WikiSummary {
  thumbnail?: {
    source: string;
    width: number;
    height: number;
  };
  originalimage?: {
    source: string;
  };
}

function Photo({ element }: ElementPhotoProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    let image: HTMLImageElement | undefined;

    fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(element.name)}`,
      { signal: controller.signal }
    )
      .then((res) => { if (!res.ok) throw new Error('Image request failed'); return res.json(); })
      .then((data: WikiSummary) => {
        const url = data.thumbnail?.source || data.originalimage?.source;
        if (url) {
          // Pre-load the image so it reveals instantly, no progressive paint
          const img = new Image();
          image = img;
          img.onload = () => { if (!controller.signal.aborted) setImageUrl(url); };
          img.onerror = () => { if (!controller.signal.aborted) { setError(true); trackDiagnostic('image_error', { symbol: element.symbol }); } };
          img.src = url;
        } else {
          setError(true);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(true);
          trackDiagnostic('image_error', { symbol: element.symbol });
        }
      });

    return () => {
      controller.abort();
      if (image) { image.onload = null; image.onerror = null; image.src = ''; }
    };
  }, [element]);

  // No photo available (synthetic elements often have no Wikipedia image):
  // render a designed stage instead of collapsing, so the hero layout and
  // scroll choreography stay consistent with elements that have media.
  if (error) {
    return (
      <div className="element-photo element-photo--fallback">
        <span className="element-photo__fallback-symbol">{element.symbol}</span>
        <span className="element-photo__caption">
          {element.name} — {element.appearance || 'made atom-by-atom in a lab, too rare to photograph!'}
        </span>
      </div>
    );
  }

  return (
    <div className="element-photo">
      {imageUrl ? (
        <>
          <div className="element-photo__img-wrap">
            <div
              className="element-photo__backdrop"
              style={{ backgroundImage: `url(${imageUrl})` }}
              aria-hidden="true"
            />
            <img
              className="element-photo__img"
              src={imageUrl}
              alt={`${element.name} in its natural form`}
            />
          </div>
          <span className="element-photo__caption">
            {element.name} — {element.appearance || 'appearance unknown'}
          </span>
        </>
      ) : (
        <div className="element-photo__skeleton" />
      )}
    </div>
  );
}

export function ElementPhoto({ element }: ElementPhotoProps) {
  return <Photo key={element.atomicNumber} element={element} />;
}
