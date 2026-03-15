import { useState } from 'react';
import type { Element } from '../../types/element';
import { getRadioactivity } from '../../utils/elementDerived';
import './RadioactivityViz.css';

interface Props {
  element: Element;
  catColor: string;
}

const LABELS = {
  stable: 'Stable',
  mildly: 'Radioactive',
  highly: 'Highly Radioactive',
};

const DESCRIPTIONS = {
  stable: 'This element has stable atoms that stay together',
  mildly: 'Some atoms slowly break apart over time',
  highly: 'Atoms are very unstable and break apart quickly',
};

export function RadioactivityViz({ element, catColor }: Props) {
  const { level } = getRadioactivity(element);
  const [active, setActive] = useState(true);

  const handleClick = () => {
    setActive(false);
    requestAnimationFrame(() => setActive(true));
  };

  return (
    <div
      className={`raviz raviz--${level}`}
      style={{ '--cat-color': catColor } as React.CSSProperties}
      onClick={handleClick}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(); } }}
      role="button"
      tabIndex={0}
      aria-label={`${element.name} stability: ${LABELS[level]}. Click to replay.`}
    >
      <div className="raviz__header">
        <span className="raviz__label">Stability</span>
        <span className="raviz__value">{LABELS[level]}</span>
      </div>

      <div className={`raviz__scene raviz__scene--${level}`}>
        {/* Background rings for radioactive elements */}
        {level !== 'stable' && (
          <div className="raviz__rings">
            <div className="raviz__ring raviz__ring--1" />
            <div className="raviz__ring raviz__ring--2" />
            <div className="raviz__ring raviz__ring--3" />
          </div>
        )}

        {/* Central atom */}
        <div className="raviz__atom">
          {/* Outer glow */}
          <div className="raviz__glow" />

          {/* Nucleus */}
          <div className="raviz__nucleus">
            <span className="raviz__sym">{element.symbol}</span>
          </div>

          {/* Orbital rings */}
          <div className="raviz__orbit raviz__orbit--1" />
          <div className="raviz__orbit raviz__orbit--2" />
          {level !== 'stable' && <div className="raviz__orbit raviz__orbit--3" />}
        </div>

        {/* Stable: shield + checkmark */}
        {level === 'stable' && (
          <div className="raviz__shield">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 15l-4-4 1.41-1.41L10 13.17l6.59-6.59L18 8l-8 8z" />
            </svg>
          </div>
        )}

        {/* Mildly radioactive: particles with trails */}
        {level === 'mildly' && active && (
          <div className="raviz__particles">
            <div className="raviz__particle raviz__particle--a1">
              <div className="raviz__trail" />
            </div>
            <div className="raviz__particle raviz__particle--a2">
              <div className="raviz__trail" />
            </div>
            <div className="raviz__particle raviz__particle--a3">
              <div className="raviz__trail" />
            </div>
            <div className="raviz__particle raviz__particle--a4">
              <div className="raviz__trail" />
            </div>
          </div>
        )}

        {/* Highly radioactive: many fast particles + decay + trefoil */}
        {level === 'highly' && active && (
          <>
            <div className="raviz__particles raviz__particles--fast">
              <div className="raviz__particle raviz__particle--h1"><div className="raviz__trail" /></div>
              <div className="raviz__particle raviz__particle--h2"><div className="raviz__trail" /></div>
              <div className="raviz__particle raviz__particle--h3"><div className="raviz__trail" /></div>
              <div className="raviz__particle raviz__particle--h4"><div className="raviz__trail" /></div>
              <div className="raviz__particle raviz__particle--h5"><div className="raviz__trail" /></div>
              <div className="raviz__particle raviz__particle--h6"><div className="raviz__trail" /></div>
              <div className="raviz__particle raviz__particle--h7"><div className="raviz__trail" /></div>
              <div className="raviz__particle raviz__particle--h8"><div className="raviz__trail" /></div>
            </div>

            {/* Decay flash pulses */}
            <div className="raviz__flash raviz__flash--1" />
            <div className="raviz__flash raviz__flash--2" />
            <div className="raviz__flash raviz__flash--3" />

            {/* Trefoil warning */}
            <div className="raviz__trefoil">
              <svg viewBox="0 0 100 100" width="22" height="22">
                <circle cx="50" cy="50" r="8" fill="currentColor" />
                <path d="M50 10 a25 25 0 0 1 21.65 37.5 L58 42 a8 8 0 0 0-16 0 L28.35 47.5 A25 25 0 0 1 50 10z" fill="currentColor" />
                <path d="M71.65 47.5 a25 25 0 0 1-43.3 0 L42 42 a8 8 0 0 0 16 0 z" fill="currentColor" transform="rotate(120 50 50)" />
                <path d="M71.65 47.5 a25 25 0 0 1-43.3 0 L42 42 a8 8 0 0 0 16 0 z" fill="currentColor" transform="rotate(240 50 50)" />
              </svg>
            </div>
          </>
        )}

        {/* Geiger counter flashes for radioactive */}
        {level !== 'stable' && (
          <div className="raviz__geiger">
            <div className="raviz__tick raviz__tick--1" />
            <div className="raviz__tick raviz__tick--2" />
            <div className="raviz__tick raviz__tick--3" />
            <div className="raviz__tick raviz__tick--4" />
            {level === 'highly' && (
              <>
                <div className="raviz__tick raviz__tick--5" />
                <div className="raviz__tick raviz__tick--6" />
                <div className="raviz__tick raviz__tick--7" />
              </>
            )}
          </div>
        )}
      </div>

      <span className="raviz__context">{DESCRIPTIONS[level]}</span>
    </div>
  );
}
