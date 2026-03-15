import { useState } from 'react';
import type { Element } from '../../types/element';
import { getReactivity } from '../../utils/elementDerived';
import './ReactivityViz.css';

interface Props {
  element: Element;
  catColor: string;
}

const SEGMENT_COLORS = [
  'hsla(130, 50%, 50%, 0.7)',
  'hsla(80, 55%, 50%, 0.7)',
  'hsla(50, 65%, 52%, 0.7)',
  'hsla(30, 75%, 52%, 0.7)',
  'hsla(8, 85%, 52%, 0.7)',
];

function getReactsWith(level: number, category: string): string {
  if (level === 0) return 'Almost nothing';
  if (category === 'alkali-metal') return 'Water, air, halogens';
  if (category === 'halogen') return 'Metals, hydrogen';
  if (category === 'alkaline-earth-metal') return 'Water, acids';
  if (level >= 3) return 'Water and acids';
  if (level >= 2) return 'Acids, some metals';
  return 'Strong acids only';
}

export function ReactivityViz({ element, catColor }: Props) {
  const { level, label, description } = getReactivity(element);
  const isAlkali = level === 5;
  const [active, setActive] = useState(true);

  const handleClick = () => {
    setActive(false);
    requestAnimationFrame(() => setActive(true));
  };

  const reactsWith = getReactsWith(level, element.category);

  return (
    <div
      className={`rxviz rxviz--level-${level}`}
      style={{ '--cat-color': catColor } as React.CSSProperties}
      onClick={handleClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
      role="button"
      tabIndex={0}
      aria-label={`${element.name} reactivity: ${label}. Click to replay.`}
    >
      <div className="rxviz__header">
        <span className="rxviz__label">Reactivity</span>
        <span className="rxviz__value">{label}</span>
      </div>

      <div className={`rxviz__scene rxviz__scene--level-${level}`}>
        {/* Meter bar */}
        <div className="rxviz__meter">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`rxviz__seg ${i < level ? 'rxviz__seg--on' : ''}`}
              style={{
                background: i < level ? SEGMENT_COLORS[i] : undefined,
                animationDelay: `${0.3 + i * 0.1}s`,
              }}
            />
          ))}
        </div>

        {/* Level 0: sleeping noble gas */}
        {level === 0 && (
          <div className="rxviz__sleep">
            <div className="rxviz__sleep-face">
              <span className="rxviz__sleep-sym">{element.symbol}</span>
            </div>
            <div className="rxviz__zzz">
              <span className="rxviz__z rxviz__z--1">z</span>
              <span className="rxviz__z rxviz__z--2">z</span>
              <span className="rxviz__z rxviz__z--3">Z</span>
            </div>
          </div>
        )}

        {/* Levels 1-4: multi-layered flame */}
        {level >= 1 && level <= 4 && active && (
          <div className="rxviz__flame-zone">
            <div className={`rxviz__flame rxviz__flame--${level}`}>
              <div className="rxviz__flame-core" />
              <div className="rxviz__flame-mid" />
              <div className="rxviz__flame-outer" />
              {level >= 2 && <div className="rxviz__flame-tip" />}
            </div>

            {/* Sparks */}
            {level >= 2 && (
              <div className="rxviz__sparks">
                <div className="rxviz__spark rxviz__spark--1" />
                <div className="rxviz__spark rxviz__spark--2" />
                {level >= 3 && <div className="rxviz__spark rxviz__spark--3" />}
                {level >= 3 && <div className="rxviz__spark rxviz__spark--4" />}
                {level >= 4 && <div className="rxviz__spark rxviz__spark--5" />}
                {level >= 4 && <div className="rxviz__spark rxviz__spark--6" />}
              </div>
            )}

            {/* Heat shimmer for level 3+ */}
            {level >= 3 && (
              <div className="rxviz__shimmer" />
            )}
          </div>
        )}

        {/* Level 5: alkali + water explosion */}
        {isAlkali && active && (
          <div className="rxviz__explosion">
            {/* Water surface */}
            <div className="rxviz__water">
              <div className="rxviz__water-body" />
              <div className="rxviz__water-surface" />
            </div>

            {/* Element block dropping in */}
            <div className="rxviz__drop-block">
              <span className="rxviz__drop-sym">{element.symbol}</span>
            </div>

            {/* Explosion effects */}
            <div className="rxviz__blast" />
            <div className="rxviz__blast-ring" />

            {/* Water splash */}
            <div className="rxviz__splash rxviz__splash--l" />
            <div className="rxviz__splash rxviz__splash--r" />

            {/* Explosion sparks */}
            <div className="rxviz__xspark rxviz__xspark--1" />
            <div className="rxviz__xspark rxviz__xspark--2" />
            <div className="rxviz__xspark rxviz__xspark--3" />
            <div className="rxviz__xspark rxviz__xspark--4" />
            <div className="rxviz__xspark rxviz__xspark--5" />
            <div className="rxviz__xspark rxviz__xspark--6" />
            <div className="rxviz__xspark rxviz__xspark--7" />
            <div className="rxviz__xspark rxviz__xspark--8" />

            {/* Fire burst */}
            <div className="rxviz__fireball" />
          </div>
        )}
      </div>

      {/* Footer info */}
      <div className="rxviz__footer">
        <span className="rxviz__desc">{description}</span>
        <span className="rxviz__reacts">Reacts with: {reactsWith}</span>
      </div>
    </div>
  );
}
