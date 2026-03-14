import { useState, useEffect } from 'react';
import type { Element } from '../types/element';
import './ElementPhoto.css';

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

export function ElementPhoto({ element }: ElementPhotoProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    setError(false);
    setImageUrl(null);

    const controller = new AbortController();

    fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(element.name)}`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data: WikiSummary) => {
        const url = data.originalimage?.source || data.thumbnail?.source;
        if (url) {
          // Pre-load the image so it reveals instantly, no progressive paint
          const img = new Image();
          img.onload = () => setImageUrl(url);
          img.onerror = () => setError(true);
          img.src = url;
        } else {
          setError(true);
        }
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(true);
        }
      });

    return () => controller.abort();
  }, [element.name]);

  if (error) return null;

  return (
    <div className="element-photo">
      {imageUrl ? (
        <>
          <img
            className="element-photo__img"
            src={imageUrl}
            alt={`${element.name} in its natural form`}
          />
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
