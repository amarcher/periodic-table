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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(false);
    setImageUrl(null);

    const controller = new AbortController();

    // Fetch element image from Wikipedia REST API
    fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(element.name)}`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data: WikiSummary) => {
        const url = data.originalimage?.source || data.thumbnail?.source;
        if (url) {
          setImageUrl(url);
        } else {
          setError(true);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(true);
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [element.name]);

  if (error || (!loading && !imageUrl)) {
    return null;
  }

  return (
    <div className="element-photo">
      {loading ? (
        <div className="element-photo__skeleton" />
      ) : (
        <img
          className="element-photo__img"
          src={imageUrl!}
          alt={`${element.name} in its natural form`}
          loading="lazy"
          onError={() => setError(true)}
        />
      )}
      <span className="element-photo__caption">
        {element.name} — {element.appearance || 'appearance unknown'}
      </span>
    </div>
  );
}
