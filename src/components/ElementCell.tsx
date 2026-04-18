import { memo, useRef, useCallback, useState } from 'react';
import type { Element } from '../types/element';
import { categoryColors } from '../utils/colors';
import { getVideoEntry } from '../data/videoManifest';
import './ElementCell.css';

interface ElementCellProps {
  element: Element;
  onClick: (element: Element, e: React.MouseEvent) => void;
  tabIndex?: number;
}

export const ElementCell = memo(function ElementCell({ element, onClick, tabIndex = -1 }: ElementCellProps) {
  const color = categoryColors[element.category];
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preloadLinkRef = useRef<HTMLLinkElement | null>(null);
  const [hasBeenHovered, setHasBeenHovered] = useState(false);
  const entry = getVideoEntry(element.atomicNumber);

  const handleMouseEnter = useCallback(() => {
    setHasBeenHovered(true);
    hoverTimerRef.current = setTimeout(() => {
      if (entry && !preloadLinkRef.current) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'video';
        link.href = entry.url;
        document.head.appendChild(link);
        preloadLinkRef.current = link;
      }
    }, 300);
  }, [entry]);

  const handleMouseLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);

  return (
    <button
      className="element-cell"
      onClick={(e) => onClick(element, e)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={tabIndex}
      data-row={element.gridRow}
      data-col={element.gridColumn}
      style={{
        gridRow: element.gridRow,
        gridColumn: element.gridColumn,
        '--cat-color': color,
        '--vt-name': `hero-${element.symbol}`,
      } as React.CSSProperties}
    >
      {hasBeenHovered && entry && (
        <img
          className="element-cell__poster"
          src={entry.poster}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
        />
      )}
      <span className="element-cell__number">{element.atomicNumber}</span>
      <span className="element-cell__symbol">{element.symbol}</span>
      <span className="element-cell__name">{element.name}</span>
      <span className="element-cell__mass">{element.atomicMass.toFixed(2)}</span>
    </button>
  );
}, (prev, next) =>
  prev.element.atomicNumber === next.element.atomicNumber &&
  prev.onClick === next.onClick &&
  prev.tabIndex === next.tabIndex
);
